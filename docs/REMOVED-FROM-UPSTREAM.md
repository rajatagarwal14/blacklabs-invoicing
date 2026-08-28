# Files removed from the upstream fork, and why

Deleting these was deliberate. Restoring any of them without reading this first
would reintroduce a specific problem.

## `docker-compose.yml`, `docker-compose.standalone.yml`

Both pulled `ghcr.io/piratuks/invoice-builder:latest` and published the app on a
public port.

An operator who ran `docker compose up` at the repo root — the most natural
thing to try — would have started **upstream's unmodified image**, not this
fork. No managed mode, so the database-selection routes are live: an
unauthenticated `POST /api/databases` that connects to an arbitrary Postgres
host, and that deletes and recreates the SQLite file when `mode` is omitted. On
a published port, reachable from the internet.

The stacks that actually belong to this fork are in `deploy/`, they build from
this repository, and they bind to loopback only. `deploy/provision.sh` is the
supported entry point.

Failure mode after removal: `docker compose up` at the repo root says there is
no configuration file. That is the intended outcome.

## `.github/FUNDING.yml`

Contained `buy_me_a_coffee: evaldizi`, which renders a Sponsor button on the
repository.

On a commercial product's repository that button solicits donations for a third
party from people paying BlackLabs for the software. Wrong on the fork,
regardless of intent.

Supporting upstream is still the right thing to do — but as a deliberate
BlackLabs decision, not as a button on our repo. The attribution links live in
`NOTICE`, `README.md` and the app's settings menu.

## `LICENSE-DISCLAIMER.md`, `SUPPORTERS.md`

`LICENSE-DISCLAIMER.md` limited **the upstream developer's** liability to USD $0
and stated the application stores all data locally and that the developer never
accesses it. For a BlackLabs-hosted instance that is false, and a liability
disclaimer naming the wrong party protects nobody.

`SUPPORTERS.md` was upstream's donor wall, reached from a menu entry this fork
replaced with an attribution link.

`LICENSE` itself is untouched and must stay that way — retaining it is the one
hard obligation MIT imposes.

## Rewritten rather than removed

`TERMS-OF-USE.md` and `PRIVACY-POLICY.md` are now placeholders that describe
what real versions must cover. Upstream's text asserted that no data reaches the
developer, which is the opposite of true for a hosted service. Both need counsel
before anything is sold.

## `scripts/backup-data.cjs`, `scripts/remove-db.cjs`

Upstream helpers behind the `docker:backup-data` and `docker:remove-database`
npm scripts, both of which assumed upstream's container names and its
`/data/*.db` file layout. Neither holds in this fork.

`remove-db.cjs` shelled out to `docker exec <container> rm -f /data/<name>` —
an unguarded delete against a path taken from the command line. Left in place
with the scripts removed, it would have been a dead destructive helper that
still ran if anyone invoked it directly.

`deploy/backup.sh` and `deploy/restore.sh` replace both, and are engine-aware.
