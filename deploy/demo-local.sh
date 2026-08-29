#!/usr/bin/env bash
#
# Run a branded managed instance locally, without Docker, for a demo.
#
#   ./demo-local.sh                     # start
#   ./demo-local.sh --reset             # start from an empty database
#   ./demo-local.sh --brand-name "Acme Billing"
#   ./demo-local.sh --stop
#
# This is the same application and the same managed mode a client instance
# runs. What differs is only the packaging: node processes instead of
# containers, and scripts/demo-proxy.cjs standing in for the nginx container.
#
# DEMO ONLY. Everything binds to 127.0.0.1 and there is no authentication —
# the app has none, and no proxy gate is set up here. Do not expose these
# ports.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/.." && pwd)"
DEMO_DIR="$REPO/.demo"
BACKEND_PORT="${DEMO_BACKEND_PORT:-3400}"
FRONT_PORT="${DEMO_PORT:-3401}"
DB_PATH="$DEMO_DIR/invoicing.sqlite"

BRAND_NAME="BlackLabs Invoicing"
RESET=0
STOP=0

die() { echo "error: $*" >&2; exit 1; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --brand-name) BRAND_NAME="${2:?--brand-name needs a value}"; shift 2 ;;
    --reset)      RESET=1; shift ;;
    --stop)       STOP=1; shift ;;
    *) die "unknown option: $1" ;;
  esac
done

stop_all() {
  pkill -f 'dist-be/backend/server/webserver/main.js' 2>/dev/null || true
  pkill -f 'scripts/demo-proxy.cjs' 2>/dev/null || true
}

if [[ "$STOP" -eq 1 ]]; then
  stop_all
  echo "Demo stopped. The database is kept at $DB_PATH"
  exit 0
fi

command -v node >/dev/null || die "node is not installed"
[[ -d "$REPO/node_modules" ]] || die "dependencies missing — run: npm ci"

echo "==> Stopping anything already running"
stop_all
sleep 1

mkdir -p "$DEMO_DIR"
if [[ "$RESET" -eq 1 ]]; then
  echo "==> --reset: removing $DB_PATH"
  rm -f "$DB_PATH"
fi

# VITE_API_URL is deliberately left unset. The frontend then falls back to
# window.location.origin, which is how the production image is built, and the
# demo front door serves both on one origin.
echo "==> Building frontend (branding is compiled in, so this is required)"
VITE_MANAGED_MODE=true \
VITE_BRAND_NAME="$BRAND_NAME" \
VITE_BRAND_WEBSITE_URL="http://127.0.0.1:$FRONT_PORT" \
VITE_DEFAULT_PAGE_FORMAT=LETTER \
npm run --prefix "$REPO" build:react >/dev/null

echo "==> Building backend"
npm run --prefix "$REPO" build:webserver >/dev/null

echo "==> Starting backend (managed, sqlite)"
cd "$REPO"
BLACKLABS_MANAGED=true \
BLACKLABS_DB=sqlite \
BLACKLABS_SQLITE_PATH="$DB_PATH" \
BLACKLABS_SEED_LOCALE=us \
PORT="$BACKEND_PORT" \
DEV_SERVER_URL=127.0.0.1 \
MIGRATIONS_PATH="$REPO/dist-be/backend/server/shared/migrations" \
node dist-be/backend/server/webserver/main.js > "$DEMO_DIR/backend.log" 2>&1 &

echo "==> Waiting for the backend to report healthy"
for _ in $(seq 1 60); do
  code="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$BACKEND_PORT/api/health" 2>/dev/null || echo 000)"
  [[ "$code" == "200" ]] && break
  sleep 1
done
[[ "${code:-000}" == "200" ]] || { echo "--- backend log ---"; cat "$DEMO_DIR/backend.log"; die "backend did not become healthy"; }

echo "==> Starting demo front door"
DEMO_PORT="$FRONT_PORT" DEMO_BACKEND_PORT="$BACKEND_PORT" \
  node "$REPO/scripts/demo-proxy.cjs" > "$DEMO_DIR/frontend.log" 2>&1 &

for _ in $(seq 1 30); do
  curl -s -o /dev/null "http://127.0.0.1:$FRONT_PORT/" 2>/dev/null && break
  sleep 1
done

cat <<EOF

  $BRAND_NAME is running.

    Open        http://127.0.0.1:$FRONT_PORT
    Database    $DB_PATH
    Logs        $DEMO_DIR/backend.log
                $DEMO_DIR/frontend.log

    Stop        deploy/demo-local.sh --stop
    Reset       deploy/demo-local.sh --reset

  No authentication is running in front of this. Loopback only.

EOF
