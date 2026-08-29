# Running managed instances

One client, one instance: its own container, its own volume, its own database
file, its own hostname. Nothing is shared between clients, which is what makes
this safe to sell before any multi-tenancy work exists.

**The application has no authentication.** Not weak authentication — none. Every
API route is open to whoever can reach the port. Instances therefore bind to
`127.0.0.1` only, and an authenticating proxy in front of them is the login.
That proxy is not optional and it is the one thing in this runbook that must
never be skipped.

## Provisioning a client

```bash
./provision.sh acme-corp invoices.acme.com --brand-name "Acme Billing"
```

Writes `deploy/clients/acme-corp/.env`, builds an image carrying that client's
branding, starts the stack, and waits for it to report healthy. Re-running is
safe: credentials, port and engine are reused, branding flags take effect, and
the data volume is never touched.

Then, in order:

1. Point the hostname at this host in DNS.
2. Put the proxy in front of the loopback port — see `Caddyfile.example`.
3. Verify the gate from outside the host, before sending the client anything:

   ```bash
   curl -sS -o /dev/null -w '%{http_code}\n' https://invoices.acme.com/api/health
   ```

   `200` means the gate is not in the request path and the instance is
   exposed. Stop and fix it. Expect `302` (SSO), `401` (basic auth), or a
   Cloudflare Access challenge.

4. Add the client to the backup schedule.

## Local demo (no Docker)

```bash
./demo-local.sh --brand-name "Acme Billing"   # start, then open the printed URL
./demo-local.sh --reset                       # start from an empty database
./demo-local.sh --stop
```

Same application, same managed mode, same US defaults — only the packaging
differs: node processes instead of containers, with `scripts/demo-proxy.cjs`
standing in for the nginx container so the frontend and API share one origin
(which is how the production image is built).

Loopback only, and **no proxy gate is set up**, so this has no authentication
at all. Fine on a laptop for a demo; never on a shared or public host.

## Backups

```bash
./backup.sh --all                 # nightly, from cron
./restore.sh --verify acme-corp   # weekly
```

`backup.sh` uses `sqlite3 .backup`, which takes a consistent copy of a live
database. Never `cp` the file — a copy taken mid-transaction restores corrupt.
Archives are written to `.partial` first and renamed on success, so an
interrupted run cannot leave something that looks valid but is truncated.
`--all` exits non-zero if any client fails, so cron actually notices.

Retention defaults to 30 days (`BLACKLABS_BACKUP_RETAIN_DAYS`), and the most
recent archive is never pruned — otherwise a month of silent failures would
expire the last good copy.

**Run `restore.sh --verify` on a schedule.** It restores into a throwaway copy,
runs `PRAGMA integrity_check`, prints row counts, and discards it. The live
database is untouched. A directory of backup files nobody has ever restored is
not a recovery capability.

A real restore prompts for the client slug, saves the current state to a
`pre-restore-*` archive first, stops the app so nothing writes mid-restore, and
restarts it after.

## Database engine

SQLite, one file per instance. This is upstream's tested path — all 26
migrations apply cleanly against it.

Postgres is implemented but **does not work**: the migration chain fails partway
through, and `--engine postgres` will produce an instance that cannot boot.
`docs/POSTGRES-STATUS.md` has the specific failures, what was already fixed,
and the three options for finishing it. Read it before planning any work that
assumes Postgres.

Practically: per-instance SQLite is fine at this scale. It becomes a constraint
when you want shared multi-tenancy, which needs Postgres — so this is deferred
work, not avoided work.

## Configuration

Per-client values live in `deploy/clients/<slug>/.env`. **These files contain
credentials and are gitignored — back them up alongside the database.** An
instance whose `.env` is lost still runs but cannot be reprovisioned cleanly.

Branding is compiled into the frontend by Vite, so it is a *build* argument, not
a runtime variable — changing a brand name requires a rebuild, which
`provision.sh` does for you. Every white-label value resolves through
`src/renderer/shared/config/brand.ts`; add new ones there rather than scattering
strings through components.

Backend runtime variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `BLACKLABS_MANAGED` | off | Pins the database and unregisters the selection routes |
| `BLACKLABS_DB` | `sqlite` | `sqlite` or `postgres` |
| `BLACKLABS_SQLITE_PATH` | `/data/blacklabs-invoicing.sqlite` | Database file |
| `BLACKLABS_SEED_LOCALE` | `us` | `us` or `none` |

## What managed mode changes

- `GET /api/databases`, `POST /api/databases` and `POST /api/databases/test` are
  never registered. Upstream lets the browser name a Postgres host and connect
  to it, and `POST /api/databases` with no `mode` **deletes and recreates** the
  SQLite file. Those are reasonable on a laptop and unacceptable on a host.
- The database is opened once at boot from environment configuration.
- The frontend skips the database chooser.
- `/api/health` returns 503 until the database is genuinely connected, so the
  compose healthcheck gates on a usable backend rather than an open port.
- On first boot only, US defaults are applied: Letter paper, `en-US` amounts,
  `MM/dd/yyyy` dates, and US service-business units and categories. An instance
  with any data in it is left alone.

## Upgrading

```bash
git fetch upstream && git merge upstream/main
./provision.sh <slug> <hostname>      # rebuild and restart in place
```

Fork changes are deliberately confined to new files plus a short list of edits,
to keep merges viable. Back up before upgrading: migrations run automatically at
boot and there is no down-migration path.
