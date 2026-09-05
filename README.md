# BlackLabs Invoicing

Invoicing and quoting for US businesses, deployed as a branded managed instance
per client.

Each customer gets their own container, their own database and their own
hostname. Nothing is shared between them, and the whole instance is provisioned
by one command.

## Capabilities

- **Invoices and quotes** — quotes are a first-class document and convert into
  invoices, keeping the reference so the trail from estimate to payment holds.
- **Money handling** — multi-currency, per-item or whole-invoice tax, inclusive
  and exclusive modes, percentage or fixed discounts and surcharges, shipping,
  partial payments with automatic balance tracking.
- **Branded PDFs** — live preview, Letter or A4, with colour, typography,
  layout, logo, watermark and signature saved as reusable style profiles.
- **Records** — businesses, clients, items, banks, categories, units and
  currencies, each with persistent search, sort and filter, and archiving
  rather than deletion so historic documents keep their context.
- **Reporting** — billed, collected, outstanding and overdue, with collection
  rate and revenue by client.
- **Data portability** — XLSX and JSON import and export throughout.
- **E-invoicing** — UBL 2.1, Peppol BIS Billing 3.0 and XRechnung export, for
  European expansion when it is wanted.
- **Desktop builds** — macOS, Windows and Linux, as an optional offline SKU.

## Deployment

```bash
cd deploy
./provision.sh acme-corp invoices.acme.com --brand-name "Acme Billing"
```

Writes the instance config, builds an image carrying that client's branding,
starts the stack and waits for it to report healthy. Re-running is safe:
credentials, port and engine are reused and the data volume is untouched.

Then point DNS at the host, put the authenticating proxy in front of the
loopback port, and verify the gate from outside before handing over the URL.
The full runbook — backups, restore verification, upgrades — is in
[`deploy/README.md`](deploy/README.md).

### Authentication — read before deploying

**The application has no login of its own.** Every API route is open to whoever
can reach the port, so instances bind to `127.0.0.1` and an authenticating
proxy is the login. It is not optional and must not be bypassable. See
[`deploy/Caddyfile.example`](deploy/Caddyfile.example).

Building authentication into the product is the main work in a multi-tenant
version and has not been done.

## Live demo

<https://rajatagarwal14.github.io/blacklabs-invoicing/>

The real frontend with an in-browser backend standing in for the Node server,
so it runs on static hosting. Every visitor gets a private copy of the sample
data that resets on reload — nothing is shared and there is no server to
attack, which matters because the application has no authentication of its
own. PDF export, e-invoice XML and file import are server-side and therefore
unavailable in that build.

## Local demo

```bash
./deploy/demo-local.sh --reset --seed
```

Runs a branded instance without Docker and fills it with demonstration data —
a business, five clients, a rate card, fifteen invoices across every status,
and three open quotes. The build also enables a **Play demo** button that walks
through the real screens. Loopback only, with no proxy gate, so it is for a
laptop and nothing else.

## Development

```bash
npm ci
npm run dev            # desktop (Electron)
npm run dev:fe         # frontend only
npm run dev:webserver  # backend only
npm test
```

Two known issues inherited with the codebase, neither introduced here: `npm
test` has 9 failures in invoice sequencing, and `tsc -p tsconfig.app.json`
reports one type error in `usePresetUpdate.ts`.

## Database engines

SQLite, one file per instance — all 26 migrations apply cleanly and this is the
supported path.

**Postgres does not work.** The adapter exists but the migration chain fails
partway through, so `--engine postgres` produces an instance that cannot boot.
[`docs/POSTGRES-STATUS.md`](docs/POSTGRES-STATUS.md) records the failures, the
two already fixed, the one that is not, and the options for finishing it. Read
it before planning anything that assumes Postgres.

## Configuration

White-label values resolve through `src/renderer/shared/config/brand.ts` and are
compiled in by Vite, so changing a brand name means a rebuild — `provision.sh`
handles that. Add new values there rather than scattering strings through
components.

Backend runtime variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `BLACKLABS_MANAGED` | off | Pins the database and unregisters the selection routes |
| `BLACKLABS_DB` | `sqlite` | `sqlite` or `postgres` |
| `BLACKLABS_SQLITE_PATH` | `/data/blacklabs-invoicing.sqlite` | Database file |
| `BLACKLABS_SEED_LOCALE` | `us` | `us` or `none` |

## Legal documents

`TERMS-OF-USE.md` and `PRIVACY-POLICY.md` are **placeholders**, not valid
documents. Both list what real versions must cover. They need counsel before
anything is sold.

## Licensing

Distributed under the MIT Licence; see [`LICENSE`](LICENSE). Third-party
components and their licences are listed in [`NOTICE`](NOTICE), which must ship
with any distribution.
