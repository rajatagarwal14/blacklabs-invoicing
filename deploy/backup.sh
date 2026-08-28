#!/usr/bin/env bash
#
# Back up one client's database, or every provisioned client.
#
#   ./backup.sh acme-corp        # one client
#   ./backup.sh --all            # every client under deploy/clients/
#
# Handles both engines, chosen per client by ENGINE in its .env:
#
#   sqlite   — `sqlite3 .backup`, which takes a consistent copy of a live
#              database. Never `cp` a SQLite file that is being written to:
#              the copy can land mid-transaction and restore as corrupt.
#   postgres — pg_dump in custom format, which restores selectively and in
#              parallel.
#
# A backup you have never restored is a hypothesis, not a backup. restore.sh
# has a --verify mode that proves one of these files still loads; run it on a
# schedule, not just when something has already gone wrong.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENTS_DIR="$HERE/clients"
BACKUP_ROOT="${BLACKLABS_BACKUP_DIR:-$HERE/backups}"
RETAIN_DAYS="${BLACKLABS_BACKUP_RETAIN_DAYS:-30}"

die() { echo "error: $*" >&2; exit 1; }

backup_sqlite() {
  local slug="$1" out="$2"
  local container="${slug}-backend"
  docker inspect "$container" >/dev/null 2>&1 || die "container $container is not running"

  # .backup runs through SQLite's backup API and is safe against a live writer.
  docker exec "$container" sh -c \
    'command -v sqlite3 >/dev/null 2>&1 && sqlite3 "${BLACKLABS_SQLITE_PATH:-/data/invoicing.sqlite}" ".backup /tmp/backup.sqlite"' \
    || die "sqlite3 is not available inside $container (add it to the runtime image)"

  docker cp "$container:/tmp/backup.sqlite" "$out.partial" >/dev/null
  docker exec "$container" rm -f /tmp/backup.sqlite || true
  gzip -9 < "$out.partial" > "$out" && rm -f "$out.partial"
}

backup_postgres() {
  local slug="$1" out="$2"
  local container="${slug}-db"
  docker inspect "$container" >/dev/null 2>&1 || die "container $container is not running"

  docker exec -e PGPASSWORD="$PGPASSWORD" "$container" \
    pg_dump -U "$PGUSER" -d "$PGDATABASE" --format=custom --compress=9 > "$out.partial"
  mv "$out.partial" "$out"
}

backup_one() {
  local slug="$1"
  local env_file="$CLIENTS_DIR/$slug/.env"
  [[ -f "$env_file" ]] || die "no such client: $slug (expected $env_file)"

  # shellcheck disable=SC1090
  set -a; source "$env_file"; set +a
  local engine="${ENGINE:-sqlite}"

  local dest="$BACKUP_ROOT/$slug"
  mkdir -p "$dest"
  local stamp; stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  local ext; [[ "$engine" == "postgres" ]] && ext="dump" || ext="sqlite.gz"
  local out="$dest/${slug}-${stamp}.${ext}"

  echo "==> Backing up $slug ($engine) -> $out"

  # Write to .partial first so an interrupted run cannot leave a truncated file
  # that looks like a valid backup.
  if ! "backup_${engine}" "$slug" "$out"; then
    rm -f "$out" "$out.partial"
    return 1
  fi

  echo "    ok ($(du -h "$out" | cut -f1))"

  # Prune old archives, but never the most recent one — if backups have been
  # failing silently for longer than the retention window, expiry would
  # otherwise delete the last good copy.
  local newest; newest="$(ls -1t "$dest"/*."$ext" 2>/dev/null | head -1 || true)"
  find "$dest" -name "*.${ext}" -type f -mtime "+$RETAIN_DAYS" ! -path "$newest" -print -delete \
    | sed 's/^/    pruned /' || true
}

main() {
  [[ $# -ge 1 ]] || die "usage: backup.sh <client-slug> | --all"
  command -v docker >/dev/null || die "docker is not installed"

  if [[ "$1" == "--all" ]]; then
    local failed=0 found=0
    for dir in "$CLIENTS_DIR"/*/; do
      [[ -f "$dir/.env" ]] || continue
      found=1
      backup_one "$(basename "$dir")" || { failed=1; echo "    FAILED" >&2; }
    done
    [[ "$found" -eq 1 ]] || die "no provisioned clients found in $CLIENTS_DIR"
    # Non-zero exit so a cron wrapper or monitor actually notices a failure.
    [[ "$failed" -eq 0 ]] || die "one or more backups failed"
  else
    backup_one "$1"
  fi
}

main "$@"
