#!/usr/bin/env bash
#
# Provision one isolated BlackLabs Invoicing instance for one client.
#
#   ./provision.sh acme-corp invoices.acme.com
#
# Creates deploy/clients/<slug>/ holding the instance's .env, builds a
# per-client image carrying that client's branding, and starts the stack.
# Re-running against an existing client rebuilds and restarts it in place;
# the database volume is never touched.
#
# Safe to run repeatedly. It provisions the application only — the
# authenticating proxy and DNS are separate, deliberately: see README.md.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/.." && pwd)"
CLIENTS_DIR="$HERE/clients"

die() { echo "error: $*" >&2; exit 1; }

usage() {
  cat >&2 <<'USAGE'
usage: provision.sh <client-slug> <hostname> [options]

  client-slug   lowercase letters, digits and hyphens; identifies the stack
  hostname      the hostname the client will use, e.g. invoices.acme.com

options:
  --brand-name NAME     product name shown in the app  (default: BlackLabs Invoicing)
  --support-url URL     support link in the settings menu
  --docs-url URL        documentation link
  --port PORT           loopback port to bind (default: first free from 8100)
  --engine ENGINE       sqlite (default) or postgres. Postgres is NOT usable
                        yet — see docs/POSTGRES-STATUS.md.
  --no-start            write config and build the image, but do not start
USAGE
  exit 2
}

[[ $# -ge 2 ]] || usage

SLUG="$1"; shift
HOSTNAME_ARG="$1"; shift

[[ "$SLUG" =~ ^[a-z0-9][a-z0-9-]*$ ]] \
  || die "client-slug must be lowercase letters, digits and hyphens: got '$SLUG'"

BRAND_NAME="BlackLabs Invoicing"
SUPPORT_URL=""
DOCS_URL=""
HOST_PORT=""
ENGINE="sqlite"
START=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --brand-name)  BRAND_NAME="${2:?--brand-name needs a value}"; shift 2 ;;
    --support-url) SUPPORT_URL="${2:?--support-url needs a value}"; shift 2 ;;
    --docs-url)    DOCS_URL="${2:?--docs-url needs a value}"; shift 2 ;;
    --port)        HOST_PORT="${2:?--port needs a value}"; shift 2 ;;
    --engine)      ENGINE="${2:?--engine needs a value}"; shift 2 ;;
    --no-start)    START=0; shift ;;
    *) die "unknown option: $1" ;;
  esac
done

case "$ENGINE" in
  sqlite) ;;
  postgres)
    cat >&2 <<'WARN'
warning: the Postgres migration chain does not complete — an instance
         provisioned with --engine postgres will fail to boot.
         See docs/POSTGRES-STATUS.md before using this.
WARN
    ;;
  *) die "--engine must be 'sqlite' or 'postgres', got '$ENGINE'" ;;
esac

command -v docker >/dev/null || die "docker is not installed"
docker compose version >/dev/null 2>&1 || die "docker compose v2 is required"

CLIENT_DIR="$CLIENTS_DIR/$SLUG"
ENV_FILE="$CLIENT_DIR/.env"
mkdir -p "$CLIENT_DIR"

# Postgres identifiers permit only [A-Za-z0-9_], and the app enforces that too.
PG_IDENT="$(echo "$SLUG" | tr '-' '_')"

pick_free_port() {
  local port=8100
  while [[ $port -lt 8600 ]]; do
    if ! lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
      echo "$port"; return 0
    fi
    port=$((port + 1))
  done
  die "no free port found in 8100-8599"
}

if [[ -f "$ENV_FILE" ]]; then
  # Reprovision. Credentials, port and engine are load-bearing — the volume,
  # the proxy config and any DNS already point at them — so they always come
  # from the existing file. Branding is cosmetic and rebuilt from scratch, so
  # a flag passed now should win over what is on disk.
  echo "==> Existing client '$SLUG' — reusing its credentials, port and engine"
  cli_brand="$BRAND_NAME"; cli_support="$SUPPORT_URL"; cli_docs="$DOCS_URL"

  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a

  [[ "$cli_brand" != "BlackLabs Invoicing" ]] && BRAND_NAME="$cli_brand"
  [[ -n "$cli_support" ]] && SUPPORT_URL="$cli_support"
  [[ -n "$cli_docs" ]] && DOCS_URL="$cli_docs"

  # Persist the overrides, so the next reprovision without flags does not
  # silently revert the branding to what was there before.
  tmp="$(mktemp)"
  grep -v -E '^(BRAND_NAME|SUPPORT_URL|DOCS_URL)=' "$ENV_FILE" > "$tmp"
  {
    echo "BRAND_NAME=$BRAND_NAME"
    echo "SUPPORT_URL=$SUPPORT_URL"
    echo "DOCS_URL=$DOCS_URL"
  } >> "$tmp"
  mv "$tmp" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
else
  [[ -n "$HOST_PORT" ]] || HOST_PORT="$(pick_free_port)"
  PGPASSWORD="$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 40)"

  cat > "$ENV_FILE" <<EOF
# BlackLabs Invoicing — instance configuration for $SLUG
# Generated $(date -u +%Y-%m-%dT%H:%M:%SZ). Contains a database password:
# keep this file out of version control and back it up with the database.

CLIENT_SLUG=$SLUG
PUBLIC_URL=https://$HOSTNAME_ARG
HOST_PORT=$HOST_PORT
IMAGE=blacklabs-invoicing:$SLUG
ENGINE=$ENGINE
SEED_LOCALE=us

# Used only when ENGINE=postgres.
PGUSER=${PG_IDENT}_app
PGPASSWORD=$PGPASSWORD
PGDATABASE=${PG_IDENT}_invoicing

BRAND_NAME=$BRAND_NAME
SUPPORT_URL=$SUPPORT_URL
DOCS_URL=$DOCS_URL
EOF
  chmod 600 "$ENV_FILE"
  echo "==> Wrote $ENV_FILE"
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
fi

echo "==> Building image $IMAGE"
docker build \
  --build-arg VITE_MANAGED_MODE=true \
  --build-arg VITE_BRAND_NAME="$BRAND_NAME" \
  --build-arg VITE_BRAND_SUPPORT_URL="$SUPPORT_URL" \
  --build-arg VITE_BRAND_DOCS_URL="$DOCS_URL" \
  --build-arg VITE_BRAND_WEBSITE_URL="$PUBLIC_URL" \
  -t "$IMAGE" \
  "$REPO"

if [[ "$START" -eq 0 ]]; then
  echo "==> --no-start given; not starting the stack"
  exit 0
fi

COMPOSE_FILE="$HERE/docker-compose.managed.yml"
[[ "$ENGINE" == "postgres" ]] && COMPOSE_FILE="$HERE/docker-compose.postgres.yml"

echo "==> Starting stack ($ENGINE)"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d

echo "==> Waiting for the backend to report healthy"
for _ in $(seq 1 60); do
  status="$(docker inspect -f '{{.State.Health.Status}}' "${SLUG}-backend" 2>/dev/null || echo starting)"
  [[ "$status" == "healthy" ]] && break
  [[ "$status" == "unhealthy" ]] && die "backend is unhealthy — docker logs ${SLUG}-backend"
  sleep 2
done
[[ "$status" == "healthy" ]] || die "backend did not become healthy — docker logs ${SLUG}-backend"

cat <<EOF

Instance '$SLUG' is running.

  Listening on   127.0.0.1:$HOST_PORT   (loopback only, by design)
  Intended URL   https://$HOSTNAME_ARG
  Engine         $ENGINE

Remaining steps, which this script deliberately does not do for you:

  1. Point $HOSTNAME_ARG at this host in DNS.
  2. Put the authenticating proxy in front of 127.0.0.1:$HOST_PORT.
     See deploy/README.md — the application has no login of its own, so
     until the proxy is in place this instance must not be reachable
     from the internet.
  3. Add this client to the backup schedule:
     deploy/backup.sh $SLUG

EOF
