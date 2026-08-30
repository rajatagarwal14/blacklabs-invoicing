# PRIVACY POLICY — PLACEHOLDER, NOT YET VALID

> **This is not a privacy policy and has no legal effect.**
>
> It is a scaffold recording what the real policy must cover, to be drafted by
> counsel before BlackLabs Invoicing is sold to anyone. Do not present it to a
> client, and do not rely on it as a statement of how data is handled.

## Why there is no document here yet

A privacy policy written for software that runs entirely on the user's own
machine promises that no data reaches the operator. That is the opposite of
true here: BlackLabs hosts the instance, holds the database and takes backups
of it. Publishing such a promise would be a false statement about how personal
data is handled — the kind regulators treat as a deceptive practice regardless
of intent — so the policy is being written for the actual architecture.

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
