#!/usr/bin/env bash
#
# Restore a client's database from a backup, or verify that a backup is
# restorable without touching the live instance.
#
#   ./restore.sh --verify acme-corp            # prove the newest backup loads
#   ./restore.sh acme-corp                     # restore the newest backup (destructive)
#   ./restore.sh acme-corp path/to/archive     # restore a specific archive
#
# --verify restores into a throwaway copy, counts the rows it finds, and
# discards it. The live database is never touched. Run it on a schedule: this
# is the only thing that turns a directory of backup files into an actual
# recovery capability.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENTS_DIR="$HERE/clients"
BACKUP_ROOT="${BLACKLABS_BACKUP_DIR:-$HERE/backups}"

die() { echo "error: $*" >&2; exit 1; }

VERIFY=0
if [[ "${1:-}" == "--verify" ]]; then VERIFY=1; shift; fi
[[ $# -ge 1 ]] || die "usage: restore.sh [--verify] <client-slug> [archive]"

SLUG="$1"
ARCHIVE="${2:-}"

ENV_FILE="$CLIENTS_DIR/$SLUG/.env"
[[ -f "$ENV_FILE" ]] || die "no such client: $SLUG"
# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a
ENGINE="${ENGINE:-sqlite}"

if [[ -z "$ARCHIVE" ]]; then
  ARCHIVE="$(ls -1t "$BACKUP_ROOT/$SLUG"/* 2>/dev/null | head -1 || true)"
  [[ -n "$ARCHIVE" ]] || die "no backups found for $SLUG in $BACKUP_ROOT/$SLUG"
fi
[[ -f "$ARCHIVE" ]] || die "archive not found: $ARCHIVE"

echo "==> Client   $SLUG ($ENGINE)"
echo "==> Archive  $ARCHIVE ($(du -h "$ARCHIVE" | cut -f1))"

BACKEND="${SLUG}-backend"
SQLITE_PATH="${BLACKLABS_SQLITE_PATH:-/data/invoicing.sqlite}"

row_counts_sqlite() {
  local path="$1"
  docker exec "$BACKEND" sqlite3 "$path" \
    "SELECT 'invoices  ' || count(*) FROM invoices;
     SELECT 'clients   ' || count(*) FROM clients;
     SELECT 'businesses' || ' ' || count(*) FROM businesses;
     SELECT 'items     ' || count(*) FROM items;" | sed 's/^/    /'
}

# ---------------------------------------------------------------- verify ----
if [[ "$VERIFY" -eq 1 ]]; then
  if [[ "$ENGINE" == "sqlite" ]]; then
    echo "==> Verifying into a scratch copy inside $BACKEND (live data untouched)"
    docker inspect "$BACKEND" >/dev/null 2>&1 || die "container $BACKEND is not running"

    gunzip -c "$ARCHIVE" | docker exec -i "$BACKEND" sh -c 'cat > /tmp/verify.sqlite'
    # integrity_check reads every page; a truncated or corrupt file fails here
    # rather than silently restoring short.
    result="$(docker exec "$BACKEND" sqlite3 /tmp/verify.sqlite 'PRAGMA integrity_check;')"
    [[ "$result" == "ok" ]] || { docker exec "$BACKEND" rm -f /tmp/verify.sqlite; die "integrity check failed: $result"; }

    echo "==> Row counts in the restored copy:"
    row_counts_sqlite /tmp/verify.sqlite
    docker exec "$BACKEND" rm -f /tmp/verify.sqlite
  else
    DB="${SLUG}-db"
    SCRATCH="verify_$(date -u +%Y%m%d%H%M%S)"
    echo "==> Verifying into scratch database $SCRATCH (live data untouched)"
    cleanup() {
      docker exec -i -e PGPASSWORD="$PGPASSWORD" "$DB" \
        psql -U "$PGUSER" -d postgres -q -c "DROP DATABASE IF EXISTS \"$SCRATCH\";" >/dev/null 2>&1 || true
    }
    trap cleanup EXIT
    docker exec -i -e PGPASSWORD="$PGPASSWORD" "$DB" psql -U "$PGUSER" -d postgres -q -c "CREATE DATABASE \"$SCRATCH\";"
    docker exec -i -e PGPASSWORD="$PGPASSWORD" "$DB" pg_restore -U "$PGUSER" -d "$SCRATCH" --no-owner --no-privileges < "$ARCHIVE"
    echo "==> Row counts in the restored copy:"
    docker exec -i -e PGPASSWORD="$PGPASSWORD" "$DB" psql -U "$PGUSER" -d "$SCRATCH" -q -A -F' ' -t -c "
      SELECT 'invoices', count(*) FROM invoices
      UNION ALL SELECT 'clients', count(*) FROM clients
      UNION ALL SELECT 'businesses', count(*) FROM businesses
      UNION ALL SELECT 'items', count(*) FROM items;" | sed 's/^/    /'
  fi

  echo "==> Verification passed."
  exit 0
fi

# --------------------------------------------------------------- restore ----
cat <<EOF

This OVERWRITES the live database for '$SLUG'.
Everything currently in it will be replaced by the archive above.

EOF
read -r -p "Type the client slug to confirm: " confirm
[[ "$confirm" == "$SLUG" ]] || die "confirmation did not match; nothing changed"

# Take a safety copy first. Restoring the wrong archive is a normal mistake and
# should not be terminal.
mkdir -p "$BACKUP_ROOT/$SLUG"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

if [[ "$ENGINE" == "sqlite" ]]; then
  SAFETY="$BACKUP_ROOT/$SLUG/pre-restore-${STAMP}.sqlite.gz"
  echo "==> Saving current state to $SAFETY"
  docker exec "$BACKEND" sqlite3 "$SQLITE_PATH" ".backup /tmp/pre-restore.sqlite"
  docker exec "$BACKEND" gzip -9 -c /tmp/pre-restore.sqlite > "$SAFETY"
  docker exec "$BACKEND" rm -f /tmp/pre-restore.sqlite
  [[ -s "$SAFETY" ]] || die "safety copy is empty; refusing to restore over live data"

  echo "==> Stopping the application so nothing writes mid-restore"
  docker stop "$BACKEND" "${SLUG}-frontend" >/dev/null

  # The backend is stopped, so write through a throwaway container that mounts
  # the same volume rather than through the stopped container.
  echo "==> Restoring"
  gunzip -c "$ARCHIVE" | docker run --rm -i -v "${SLUG}-data:/data" alpine:3 \
    sh -c "cat > $SQLITE_PATH"

  echo "==> Restarting the application"
  docker start "$BACKEND" "${SLUG}-frontend" >/dev/null
else
  DB="${SLUG}-db"
  SAFETY="$BACKUP_ROOT/$SLUG/pre-restore-${STAMP}.dump"
  echo "==> Saving current state to $SAFETY"
  docker exec -i -e PGPASSWORD="$PGPASSWORD" "$DB" \
    pg_dump -U "$PGUSER" -d "$PGDATABASE" --format=custom --compress=9 > "$SAFETY"

  echo "==> Stopping the application so nothing writes mid-restore"
  docker stop "$BACKEND" "${SLUG}-frontend" >/dev/null

  echo "==> Recreating $PGDATABASE"
  docker exec -i -e PGPASSWORD="$PGPASSWORD" "$DB" psql -U "$PGUSER" -d postgres -q -c "DROP DATABASE IF EXISTS \"$PGDATABASE\";"
  docker exec -i -e PGPASSWORD="$PGPASSWORD" "$DB" psql -U "$PGUSER" -d postgres -q -c "CREATE DATABASE \"$PGDATABASE\";"

  echo "==> Restoring"
  docker exec -i -e PGPASSWORD="$PGPASSWORD" "$DB" pg_restore -U "$PGUSER" -d "$PGDATABASE" --no-owner --no-privileges < "$ARCHIVE"

  echo "==> Restarting the application"
  docker start "$BACKEND" "${SLUG}-frontend" >/dev/null
fi

echo
echo "Restore complete. Previous state saved at:"
echo "  $SAFETY"
