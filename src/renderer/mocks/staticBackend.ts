/**
 * In-browser backend for the static demo build.
 *
 * The application talks to a Node server over `/api/*`. GitHub Pages serves
 * static files only, so this replaces that server with an in-memory store and
 * a `fetch` interceptor.
 *
 * Why patch `fetch` rather than use the MSW service worker: a worker
 * registered from a project Pages path (`/<repo>/`) is scoped to that path and
 * cannot intercept the root-relative `/api/*` URLs the app builds. Patching
 * fetch has no scope, needs no worker registration, and leaves `webApi()`
 * completely unchanged — the app cannot tell the difference.
 *
 * Data lives in memory for the tab only. Reloading resets it. That is the
 * intended behaviour: every visitor gets a private sandbox, nothing is shared,
 * and there is no server to attack — which matters, because the application
 * itself has no authentication.
 */
import { seedDatabase, type StaticDb } from './staticSeed';

type Json = Record<string, unknown>;

const ok = (data: unknown) => json({ success: true, data });
const fail = (key: string) => json({ success: false, key });

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

/** Entities exposed as plain CRUD collections. */
const CRUD = [
  'banks',
  'businesses',
  'categories',
  'clients',
  'currencies',
  'items',
  'presets',
  'styleProfiles',
  'units'
] as const;
type CrudName = (typeof CRUD)[number];

const db: StaticDb = seedDatabase();

const nextId = (rows: Json[]) => rows.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;

const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

/**
 * Lists show "6 Invoices / 1 Quote" beside each record, which the server
 * computes with a join. The foreign key is named `<entity>Id` for most tables;
 * items are referenced through invoice line items instead.
 */
const withCounts = (name: CrudName, row: Json): Json => {
  const key = { businesses: 'businessId', clients: 'clientId', banks: 'bankId', currencies: 'currencyId' }[
    name as string
  ];

  const matches = db.invoices.filter(inv => {
    if (key) return inv[key] === row.id;
    if (name === 'items') return ((inv.invoiceItems ?? []) as Json[]).some(li => li.itemId === row.id);
    if (name === 'styleProfiles') return inv.styleProfilesId === row.id;
    return false;
  });

  return {
    ...row,
    invoiceCount: matches.filter(i => i.invoiceType === 'invoice').length,
    quotesCount: matches.filter(i => i.invoiceType === 'quotation').length
  };
};

const sequenceFor = (businessId: number, clientId: number, invoiceType: string) => {
  const used = db.invoices
    .filter(i => i.businessId === businessId && i.clientId === clientId && i.invoiceType === invoiceType)
    .map(i => Number(i.invoiceNumber))
    .filter(n => Number.isFinite(n));

  const next = (used.length ? Math.max(...used) : 0) + 1;
  // Preserve the zero padding the seeded documents use.
  return { nextSequence: next, formattedSequence: String(next).padStart(4, '0') };
};

const customHeaders = (type: string) => {
  const seen = new Map<string, Json>();
  db.invoices
    .filter(i => i.invoiceType === type)
    .forEach(i =>
      ((i.invoiceItems ?? []) as Json[]).forEach(li => {
        const raw = li.customField;
        if (!raw) return;
        try {
          (JSON.parse(raw as string) as Json[]).forEach(f => {
            if (f && typeof f.name === 'string') seen.set(f.name, { name: f.name, order: f.order ?? 0 });
          });
        } catch {
          /* a malformed custom field should not break the whole list */
        }
      })
    );
  return [...seen.values()];
};

const handle = async (method: string, path: string, params: URLSearchParams, body: Json): Promise<Response> => {
  // ---- meta -------------------------------------------------------------
  if (path === '/api/health') return json({ ok: true, managed: true, database: 'in-memory (demo)' });
  if (path === '/api/version') return json({ version: 'demo' });

  // ---- settings ---------------------------------------------------------
  if (path === '/api/settings') {
    if (method === 'GET') return ok(db.settings);
    if (method === 'PUT') {
      db.settings = { ...db.settings, ...body, updatedAt: now() };
      return ok(db.settings);
    }
  }

  // ---- invoices and quotes ----------------------------------------------
  if (path === '/api/invoices/sequence') {
    return ok(
      sequenceFor(
        Number(params.get('businessId')),
        Number(params.get('clientId')),
        params.get('invoiceType') ?? 'invoice'
      )
    );
  }

  if (path === '/api/invoices/headers') return ok(customHeaders(params.get('type') ?? 'invoice'));

  if (path === '/api/invoices/xml') {
    // E-invoice XML is generated server-side; out of scope for a static demo.
    return json({ success: false, key: 'error.notAvailableInDemo' }, 501);
  }

  if (path === '/api/invoices/duplicate') {
    const source = db.invoices.find(i => i.id === Number(body.id));
    if (!source) return fail('error.notFound');
    const seq = sequenceFor(source.businessId as number, source.clientId as number, source.invoiceType as string);
    const copy = {
      ...structuredClone(source),
      id: nextId(db.invoices),
      invoiceNumber: seq.formattedSequence,
      status: source.invoiceType === 'quotation' ? 'open' : 'unpaid',
      invoicePayments: [],
      paidAt: null,
      closedAt: null,
      createdAt: now(),
      updatedAt: now()
    };
    db.invoices.push(copy);
    return ok(copy);
  }

  if (path === '/api/invoices') {
    if (method === 'GET') {
      const type = params.get('type');
      return ok(type ? db.invoices.filter(i => i.invoiceType === type) : db.invoices);
    }
    if (method === 'POST') {
      const created = { ...body, id: nextId(db.invoices), createdAt: now(), updatedAt: now() };
      db.invoices.push(created);
      return ok(created);
    }
    if (method === 'PUT') {
      const idx = db.invoices.findIndex(i => i.id === Number(body.id));
      if (idx === -1) return fail('error.notFound');
      db.invoices[idx] = { ...db.invoices[idx], ...body, updatedAt: now() };
      return ok(db.invoices[idx]);
    }
  }

  const invoiceId = path.match(/^\/api\/invoices\/(\d+)$/);
  if (invoiceId) {
    const id = Number(invoiceId[1]);
    if (method === 'DELETE') {
      db.invoices = db.invoices.filter(i => i.id !== id);
      return ok(id);
    }
    if (method === 'GET') {
      const found = db.invoices.find(i => i.id === id);
      return found ? ok(found) : fail('error.notFound');
    }
  }

  // ---- import / export ---------------------------------------------------
  if (path === '/api/export' || path === '/api/import') {
    return json({ success: false, key: 'error.notAvailableInDemo' }, 501);
  }

  // ---- generic CRUD ------------------------------------------------------
  for (const name of CRUD) {
    const rows = db[name] as Json[];

    if (path === `/api/${name}`) {
      if (method === 'GET') return ok(rows.map(r => withCounts(name, r)));
      if (method === 'POST') {
        const created = { ...body, id: nextId(rows), createdAt: now(), updatedAt: now() };
        rows.push(created);
        return ok(withCounts(name, created));
      }
      if (method === 'PUT') {
        const idx = rows.findIndex(r => r.id === Number(body.id));
        if (idx === -1) return fail('error.notFound');
        rows[idx] = { ...rows[idx], ...body, updatedAt: now() };
        return ok(withCounts(name, rows[idx]));
      }
    }

    if (path === `/api/${name}/batch`) {
      const incoming = Array.isArray(body) ? (body as Json[]) : ((body.data as Json[]) ?? []);
      const created = incoming.map(item => {
        const row = { ...item, id: nextId(rows), createdAt: now(), updatedAt: now() };
        rows.push(row);
        return row;
      });
      return ok(created.map(r => withCounts(name, r)));
    }

    const byId = path.match(new RegExp(`^/api/${name}/(\\d+)$`));
    if (byId && method === 'DELETE') {
      const id = Number(byId[1]);
      db[name] = rows.filter(r => r.id !== id) as never;
      return ok(id);
    }
  }

  return json({ success: false, key: 'error.notAvailableInDemo' }, 404);
};

export const installStaticBackend = () => {
  const original = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const raw = input instanceof Request ? input.url : String(input);
    let url: URL;
    try {
      url = new URL(raw, window.location.origin);
    } catch {
      return original(input, init);
    }

    // Same-origin /api/* only; everything else (fonts, assets) passes through.
    if (url.origin !== window.location.origin || !url.pathname.startsWith('/api/')) {
      return original(input, init);
    }

    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();

    let body: Json = {};
    const rawBody = init?.body;
    if (typeof rawBody === 'string') {
      try {
        body = JSON.parse(rawBody) as Json;
      } catch {
        body = {};
      }
    }

    try {
      return await handle(method, url.pathname, url.searchParams, body);
    } catch (err) {
      // A thrown handler would otherwise surface as an opaque network error.
      return json({ success: false, message: (err as Error).message }, 500);
    }
  };
};
