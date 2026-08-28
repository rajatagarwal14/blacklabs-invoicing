# TERMS OF USE — PLACEHOLDER, NOT YET VALID

> **Do not ship this file to a client and do not publish it.**
>
> This is a scaffold marking work that must be done by counsel before BlackLabs
> Invoicing is sold to anyone. It is not a terms of use document, and nothing in
> it protects BlackLabs.

## Why upstream's terms were removed rather than rebranded

This project is a fork of [Invoice Builder](https://github.com/piratuks/invoice-builder).
Upstream's TERMS-OF-USE described a free, offline, single-user desktop
application, and stated among other things:

- that the application is "free, open-source desktop software"
- that "all data is stored locally on the user's machine"
- that "no data is transmitted to the developer or any third party"
- that the developer's total liability is limited to **USD $0**

Every one of those statements is false for a BlackLabs-hosted instance.
BlackLabs runs the server, holds the database, takes backups, and charges money
for it. Rebranding that document would have meant shipping a customer-facing
legal notice that misdescribes the product, so it was deleted instead. An
obviously-missing document is safer than a quietly wrong one.

## What the real terms have to account for

These are the facts about the deployment that counsel needs. They are engineering
statements, not legal ones.

**BlackLabs is the operator, not a distributor.** The client does not install
anything. BlackLabs provisions, hosts, patches and backs up the instance, so the
liability upstream disclaimed now sits with BlackLabs.

**Data leaves the client's premises.** Each instance stores its database on
BlackLabs infrastructure and backups are taken on a schedule and retained (30
days by default). Say where that infrastructure is, who can reach it, how long
copies persist, and what happens to them when a client leaves.

**The data is billing records.** Invoices, client names and addresses, bank
details, and payment history. That is commercially sensitive and contains third
parties' personal data — the client's customers, who never agreed to anything
with BlackLabs. A data processing agreement is likely required, and US state
privacy law may apply depending on where clients and their customers sit.

**Authentication is external to the application.** Access is controlled by a
proxy BlackLabs operates, not by a login inside the product. Who may hold
credentials, and what happens when a client's employee leaves, needs stating —
it is an operational commitment, not a product feature.

**The product does not guarantee tax or regulatory correctness.** It computes
what it is told to compute. Sales-tax rates are entered by the client; there is
no jurisdiction lookup and no nexus logic. Responsibility for correct invoices
stays with the client and this must be explicit.

**Availability.** There is currently no SLA, no redundancy and no failover — a
single container per client on a single host. Either commit to something
achievable or state plainly that no uptime is guaranteed.

**Restoration is possible but not instant.** Backups are verifiable and restore
is scripted, but recovery is manual. Do not promise an RPO or RTO that has not
been measured.

## Related

- `LICENSE` — upstream's MIT licence, retained unmodified as that licence requires.
- `NOTICE` — attribution for the upstream work.
- `PRIVACY-POLICY.md` — same status as this file.
- `deploy/README.md` — what the deployment actually does.
