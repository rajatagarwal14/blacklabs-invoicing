# PRIVACY POLICY — PLACEHOLDER, NOT YET VALID

> **Do not ship this file to a client and do not publish it.**
>
> This is a scaffold marking work that must be done by counsel before BlackLabs
> Invoicing is sold to anyone.

## Why upstream's policy was removed rather than rebranded

Upstream's privacy policy was written for software that runs entirely on the
user's own machine. Its central promise was that no data ever reaches the
developer. That promise is the opposite of true here: BlackLabs hosts the
instance, holds the database, and takes backups of it.

Publishing that document under BlackLabs branding would be a false statement
about how the service handles personal data — the kind of claim regulators treat
as a deceptive practice regardless of intent. It was deleted rather than edited.

## What the real policy has to cover

**What is held.** Each instance's database contains business details, bank
details, invoice and payment history, and — significantly — the client's own
customers' names, addresses, email addresses and phone numbers. Those people
have no relationship with BlackLabs and never consented to anything. They are
data subjects all the same.

**Where it is held, and for how long.** Name the hosting region. Backups run on
a schedule and are retained for 30 days by default; that retention is a privacy
commitment as much as an operational setting, and deletion on request has to
account for copies sitting in backups.

**Who can access it.** BlackLabs staff can reach client data through host access
— that is inherent in operating the instance. Say who, under what controls, and
whether access is logged.

**Sub-processors.** The hosting provider, and the identity provider fronting
authentication, both need naming.

**Deletion and export.** What happens when a client leaves: how the instance and
its volume are destroyed, when backups age out, and how the client gets their
data first. The app has JSON and XLSX export, which covers the export half.

**Applicable law.** Clients are US businesses, so state privacy statutes may
apply depending on where they and their customers are. If any client operates in
the EU or UK, GDPR obligations attach and a data processing agreement is
required.

## Related

- `TERMS-OF-USE.md` — same status as this file.
- `deploy/README.md` — what the deployment actually does with data.
