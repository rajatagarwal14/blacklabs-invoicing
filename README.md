# BlackLabs Invoicing

White-label invoicing and quoting, deployed as a managed instance per client.

A fork of [Invoice Builder](https://github.com/piratuks/invoice-builder) by
Evaldas L., used under the MIT Licence. Upstream built an excellent offline
desktop application; this fork turns it into something BlackLabs can host and
sell to US businesses.

## What is different from upstream

| | Upstream | This fork |
| --- | --- | --- |
| Deployment | Desktop app, or self-hosted single instance | Managed instance per client, provisioned by script |
| Database | Chosen by the user at runtime | Pinned at boot from environment configuration |
| Database-selection API | Exposed | Not registered — see below |
| Branding | Fixed | Resolved through one config module, set at build time |
| Defaults | A4, EU-oriented | Letter, USD, `MM/dd/yyyy`, US service-business categories |
| Authentication | None | Still none in the app — supplied by a proxy in front of it |

### Managed mode

`BLACKLABS_MANAGED=true` changes three things that matter:

- **The database-selection routes are never registered.** Upstream's
  `POST /api/databases` accepts a Postgres host and credentials from the request
  body and connects to them, `GET /api/databases` lists database files on disk,
  and `POST /api/databases` with no `mode` **deletes and recreates the SQLite
  file**. Those are reasonable on a laptop and unacceptable on a host.
- **The database is opened once at boot** from environment configuration.
- **`/api/health` returns 503 until the database is genuinely connected**, so
  orchestration can gate on a usable backend rather than an open port.

### Authentication — read this before deploying

**The application has no login.** Not weak authentication: none. Every API route
is open to anyone who can reach the port. Instances therefore bind to
`127.0.0.1` and an authenticating proxy in front of them is the login. See
[`deploy/README.md`](deploy/README.md) and [`deploy/Caddyfile.example`](deploy/Caddyfile.example).

Adding real authentication is the main work in a multi-tenant version of this
product, and it has not been done.

## Quick start

```bash
cd deploy
./provision.sh acme-corp invoices.acme.com --brand-name "Acme Billing"
```

Then point DNS at the host, put the proxy in front of the loopback port, and
verify from outside that the gate is actually in the request path. The full
runbook, including backups and restore verification, is in
[`deploy/README.md`](deploy/README.md).

## Development

```bash
npm ci
npm run dev            # desktop (Electron)
npm run dev:fe         # frontend only
npm run dev:webserver  # backend only
npm test
```

Two things to know before you trust a green run:

- `npm test` has **9 pre-existing failures** on a clean upstream checkout, in
  invoice sequencing. They are not caused by this fork.
- `tsc -p tsconfig.app.json` reports **one pre-existing type error** in
  `usePresetUpdate.ts`. Also upstream.

## Database engines

SQLite, one file per instance. All 26 migrations apply cleanly and this is the
supported path.

**Postgres does not work.** The adapter exists but the migration chain fails
partway through; `--engine postgres` produces an instance that cannot boot.
[`docs/POSTGRES-STATUS.md`](docs/POSTGRES-STATUS.md) records the specific
failures, the two that are already fixed, the one that is not, and the options
for finishing it. Read it before planning anything that assumes Postgres.

## Keeping up with upstream

Changes are deliberately confined to new files plus a short list of edits, so
merges stay viable:

```bash
git fetch upstream && git merge upstream/main
```

White-label values all resolve through `src/renderer/shared/config/brand.ts`.
Add new ones there rather than scattering strings through components.

## Licence and attribution

MIT. `LICENSE` carries upstream's copyright notice unmodified, as the licence
requires; `NOTICE` records the attribution. Removing either would breach the
licence.

Upstream is actively maintained and worth supporting:
<https://github.com/piratuks/invoice-builder>.

## Legal documents

`TERMS-OF-USE.md` and `PRIVACY-POLICY.md` are **placeholders**. Upstream's
versions described free offline software where no data reaches the developer —
statements that are false for a hosted, paid service — so they were removed
rather than rebranded. Both files list what the real documents must cover. They
need counsel before anything is sold.
