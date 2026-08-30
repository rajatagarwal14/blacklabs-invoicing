# Things deliberately absent

Each of these was removed on purpose. Restoring any of them without reading
this first would reintroduce a specific problem.

## Root-level `docker-compose.yml`

There is no compose file at the repository root, and there should not be.

Any such file is the first thing an operator tries — `docker compose up` in the
project directory. If it pulls a prebuilt image rather than building from this
source, it starts something that is *not this application*: no managed mode, so
the database-selection routes are live, including an unauthenticated
`POST /api/databases` that connects to an arbitrary Postgres host, and that
deletes and recreates the SQLite file when `mode` is omitted. Publishing a port
on top of that puts client billing records on the internet.

The stacks that belong to this product are in `deploy/`, they build from this
repository, and they bind to loopback only. `deploy/provision.sh` is the
supported entry point.

Failure mode: `docker compose up` at the root reports no configuration file.
That is the intended outcome.

## `.github/FUNDING.yml`

Absent because a Sponsor button on a commercial product's repository solicits
donations from the people paying for the product. Support for the open source
components this is built on belongs in `NOTICE`, not in a donate button.

## Helper scripts for container database surgery

Scripts that shelled out to `docker exec <container> rm -f /data/<name>` — an
unguarded delete against a path taken from the command line — are gone.
`deploy/backup.sh` and `deploy/restore.sh` replace them, are engine-aware, and
`restore.sh` takes a safety copy before it overwrites anything.

## Valid terms of use and privacy policy

`TERMS-OF-USE.md` and `PRIVACY-POLICY.md` are placeholders with no legal
effect, and say so. Shipping a plausible-looking legal document that
misdescribes a hosted service is worse than shipping an obviously missing one:
a policy promising that data never leaves the user's machine is false here, and
false privacy claims are treated as a deceptive practice regardless of intent.

Both files list what the real documents must cover. They need counsel before
anything is sold.
