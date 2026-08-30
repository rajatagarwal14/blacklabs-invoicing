/* eslint-disable no-undef */
/**
 * Populate a demo instance with placeholder data.
 *
 * An empty invoicing app demos badly — every screen is an empty state and the
 * reports are blank. This fills one through the public API, exactly as the UI
 * would, so nothing here depends on internal database shapes.
 *
 * The data is a plausible US design studio: a business with bank details,
 * five clients, a rate card, and roughly four months of invoices spread across
 * every status the app models — paid, partially paid, overdue and current —
 * plus open quotes.
 *
 * Two deliberate choices about the timeline:
 *
 *   Statuses are spread, because a demo where everything is paid shows none of
 *   the tracking the product exists for.
 *
 *   Everything sits inside the last ~120 days, because dates are relative to
 *   the moment of seeding and a wider spread opens the demo on entries from
 *   last year. The default report range is 30 days and the invoice list sorts
 *   by status, so the oldest paid invoices surface first — a stale-looking
 *   demo is a distracting one.
 *
 * FICTIONAL DATA. Every business, person, address, email and bank detail
 * below is invented for demonstration. The bank account and routing numbers
 * are not real accounts; routing numbers are deliberately invalid so they
 * cannot be mistaken for live details.
 *
 *   node scripts/demo-seed.cjs [--url http://127.0.0.1:3401] [--force]
 *
 * Refuses to run against an instance that already has invoices unless --force
 * is given, so it cannot quietly duplicate a demo someone is mid-way through.
 */

const BASE = (() => {
  const i = process.argv.indexOf('--url');
  return (i !== -1 && process.argv[i + 1]) || process.env.DEMO_URL || 'http://127.0.0.1:3401';
})();
const FORCE = process.argv.includes('--force');

/**
 * Two different units are in play and mixing them is a 100x error:
 *   items.amount              — a plain decimal amount, rendered as-is
 *   invoice_item_snapshots    — unitPriceCents, integer cents
 * Keep both derived from the same dollar rate rather than converting between
 * them after the fact.
 */
const toCents = rate => String(Math.round(rate * 100));

const api = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`${method} ${path} -> ${res.status}, non-JSON response: ${text.slice(0, 200)}`);
  }
  if (!json.success) {
    throw new Error(`${method} ${path} -> ${json.key || json.message || 'failed'}`);
  }
  return json.data;
};

const get = p => api('GET', p);
const post = (p, b) => api('POST', p, b);

/** Dates are relative to now so the demo never looks stale. */
const daysAgo = n => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

// ---------------------------------------------------------------- data ----

const BUSINESS = {
  name: 'Northgate Studio LLC',
  shortName: 'NG',
  role: 'Design & Development',
  address: '1204 Guadalupe St, Suite 300\nAustin, TX 78701',
  email: 'billing@northgatestudio.example',
  phone: '+1 (512) 555-0142',
  website: 'northgatestudio.example',
  additional: 'EIN 88-0000000',
  description: 'Product design and front-end engineering studio.',
  isArchived: false
};

const BANK = {
  name: 'Operating account',
  bankName: 'Lone Star Commerce Bank',
  accountHolder: 'Northgate Studio LLC',
  accountNumber: '000123456789',
  // Deliberately not a valid ABA routing number.
  routingNumber: '000000000',
  address: '600 Congress Ave, Austin, TX 78701',
  type: 'Checking',
  sortOrder: 1,
  isArchived: false
};

const CLIENTS = [
  {
    name: 'Cedar & Vine Hospitality',
    shortName: 'CV',
    address: '88 Rainey St\nAustin, TX 78701',
    email: 'ap@cedarvine.example',
    phone: '+1 (512) 555-0197',
    code: 'CV-001',
    isArchived: false
  },
  {
    name: 'Halcyon Analytics Inc',
    shortName: 'HA',
    address: '2201 Mission St, Floor 4\nSan Francisco, CA 94110',
    email: 'accounts@halcyon.example',
    phone: '+1 (415) 555-0110',
    code: 'HA-002',
    isArchived: false
  },
  {
    name: 'Brightwater Outdoor Co',
    shortName: 'BW',
    address: '410 NW 12th Ave\nPortland, OR 97209',
    email: 'finance@brightwater.example',
    phone: '+1 (503) 555-0163',
    code: 'BW-003',
    isArchived: false
  },
  {
    name: 'Meridian Health Partners',
    shortName: 'MH',
    address: '77 N Water St\nChicago, IL 60611',
    email: 'invoices@meridianhp.example',
    phone: '+1 (312) 555-0178',
    code: 'MH-004',
    isArchived: false
  },
  {
    name: 'Juniper Learning',
    shortName: 'JL',
    address: '19 Beacon St\nBoston, MA 02108',
    email: 'ap@juniperlearning.example',
    phone: '+1 (617) 555-0125',
    code: 'JL-005',
    isArchived: false
  }
];

/** A studio rate card. `amount` is cents. */
const ITEMS = [
  { name: 'Product design — senior', unit: 'hrs', category: 'Design', rate: 185 },
  { name: 'Front-end engineering', unit: 'hrs', category: 'Development', rate: 165 },
  { name: 'Design system audit', unit: 'flat', category: 'Consulting', rate: 6500 },
  { name: 'Discovery workshop', unit: 'days', category: 'Consulting', rate: 2400 },
  { name: 'Brand identity package', unit: 'flat', category: 'Design', rate: 12000 },
  { name: 'Monthly retainer — support', unit: 'months', category: 'Support & Maintenance', rate: 3500 },
  { name: 'Accessibility remediation', unit: 'hrs', category: 'Development', rate: 155 },
  { name: 'Usability testing round', unit: 'each', category: 'Consulting', rate: 4200 },
  { name: 'Travel — client onsite', unit: 'each', category: 'Travel', rate: 850 }
];

/**
 * Invoices, newest last. `pay` is the fraction already received, which drives
 * the resulting status. Texas does not tax these services, so most carry no
 * tax — the two that do are out-of-state goods-like line items, which is
 * exactly the case a US seller has to think about.
 */
const INVOICES = [
  // Settled — the back catalogue, still recent enough to look active.
  {
    client: 0,
    issued: 118,
    due: 88,
    lines: [
      [0, 42],
      [1, 68]
    ],
    pay: 1,
    tax: 0
  },
  {
    client: 1,
    issued: 110,
    due: 80,
    lines: [
      [2, 1],
      [3, 3]
    ],
    pay: 1,
    tax: 0
  },
  {
    client: 2,
    issued: 101,
    due: 71,
    lines: [
      [4, 1],
      [0, 24]
    ],
    pay: 1,
    tax: 0
  },
  {
    client: 3,
    issued: 93,
    due: 63,
    lines: [
      [5, 3],
      [6, 36]
    ],
    pay: 1,
    tax: 0
  },
  {
    client: 0,
    issued: 84,
    due: 54,
    lines: [
      [1, 88],
      [7, 2]
    ],
    pay: 1,
    tax: 0
  },
  {
    client: 4,
    issued: 76,
    due: 46,
    lines: [
      [3, 2],
      [0, 31]
    ],
    pay: 1,
    tax: 0
  },
  {
    client: 1,
    issued: 67,
    due: 37,
    lines: [
      [5, 3],
      [1, 52]
    ],
    pay: 1,
    tax: 0
  },
  {
    client: 3,
    issued: 58,
    due: 28,
    lines: [
      [0, 55],
      [7, 1]
    ],
    pay: 1,
    tax: 0
  },

  // Part-paid, and past due — the awkward middle the dashboard exists to show.
  {
    client: 2,
    issued: 49,
    due: 19,
    lines: [
      [6, 44],
      [8, 2]
    ],
    pay: 0.5,
    tax: 0
  },
  {
    client: 0,
    issued: 41,
    due: 11,
    lines: [
      [5, 1],
      [6, 22]
    ],
    pay: 0.4,
    tax: 0
  },

  // Overdue: due date passed, nothing received.
  {
    client: 4,
    issued: 34,
    due: 6,
    lines: [
      [2, 1],
      [1, 40]
    ],
    pay: 0,
    tax: 0
  },
  {
    client: 1,
    issued: 28,
    due: 2,
    lines: [
      [0, 36],
      [3, 1]
    ],
    pay: 0,
    tax: 0
  },

  // Current: issued recently, still inside terms (negative = due in future).
  {
    client: 2,
    issued: 19,
    due: -11,
    lines: [
      [1, 64],
      [0, 18]
    ],
    pay: 0,
    tax: 0
  },
  {
    client: 3,
    issued: 11,
    due: -19,
    lines: [
      [5, 1],
      [7, 1]
    ],
    pay: 0,
    tax: 8.25
  },
  { client: 4, issued: 4, due: -26, lines: [[4, 1]], pay: 0, tax: 0 }
];

const QUOTES = [
  {
    client: 1,
    issued: 14,
    due: -16,
    lines: [
      [4, 1],
      [3, 2]
    ]
  },
  {
    client: 2,
    issued: 8,
    due: -22,
    lines: [
      [2, 1],
      [0, 40]
    ]
  },
  {
    client: 0,
    issued: 2,
    due: -28,
    lines: [
      [5, 6],
      [6, 30]
    ]
  }
];

// ---------------------------------------------------------------- build ----

const lineTotalCents = (item, qty) => Math.round(Number(item.rateCents) * qty);

const buildDocument = ({ type, spec, business, bank, client, currency, items, number }) => {
  const invoiceItems = spec.lines.map(([itemIdx, qty]) => {
    const item = items[itemIdx];
    return {
      itemId: item.id,
      quantity: String(qty),
      taxRate: spec.tax ?? 0,
      taxType: 'exclusive',
      invoiceItemSnapshot: {
        itemName: item.name,
        unitPriceCents: item.rateCents,
        unitName: item.unitName
      }
    };
  });

  const subtotal = spec.lines.reduce((sum, [i, q]) => sum + lineTotalCents(items[i], q), 0);
  const taxed = Math.round(subtotal * (1 + (spec.tax ?? 0) / 100));

  const payments = [];
  if (spec.pay > 0) {
    payments.push({
      amountCents: String(Math.round(taxed * spec.pay)),
      paidAt: daysAgo(Math.max(0, spec.due - 4)),
      paymentMethod: spec.pay === 1 ? 'ACH transfer' : 'ACH transfer (partial)',
      notes: null
    });
  }

  let status;
  if (type === 'quotation') status = 'open';
  else if (spec.pay >= 1) status = 'paid';
  else if (spec.pay > 0) status = 'partially';
  else status = 'unpaid';

  return {
    invoiceType: type,
    businessId: business.id,
    clientId: client.id,
    currencyId: currency.id,
    bankId: bank.id,
    issuedAt: daysAgo(spec.issued),
    dueDate: daysAgo(spec.due),
    invoiceNumber: number,
    invoicePrefix: type === 'quotation' ? 'QUO-' : 'INV-',
    invoiceSuffix: null,
    status,
    isArchived: false,
    language: 'en',
    taxName: spec.tax ? 'Sales tax' : null,
    taxRate: spec.tax ?? 0,
    taxType: spec.tax ? 'exclusive' : null,
    discountType: null,
    discountAmountCents: '0',
    discountPercent: 0,
    surchargeType: null,
    surchargeAmountCents: '0',
    surchargePercent: 0,
    shippingFeeCents: '0',
    customerNotes:
      type === 'quotation'
        ? 'Quote valid for 30 days from the date of issue.'
        : 'Payment due within 30 days. ACH preferred.',
    thanksNotes: 'Thank you for your business.',
    termsConditionNotes: 'Late payments may be subject to a 1.5% monthly service charge.',
    invoiceItems,
    invoicePayments: payments,
    invoiceAttachments: [],
    // Mandatory, despite reading as optional: decodeInvoice dereferences this
    // without a null guard, so omitting it yields a 500 rather than a
    // validation error. Values mirror what the invoice form seeds, with
    // LETTER for the US default.
    invoiceCustomization: {
      color: '#1B4D3E',
      logoSize: 'medium',
      fontSize: 'medium',
      fontFamily: 'Roboto',
      layout: 'classic',
      tableHeaderStyle: 'light',
      tableRowStyle: 'classic',
      pageFormat: 'LETTER',
      labelUpperCase: false,
      showQuantity: true,
      showUnit: true,
      showRowNo: true,
      fieldSortOrders: { no: 0, item: 1, unit: 2, quantity: 3, unitCost: 4, total: 5 },
      pdfTexts: undefined
    },
    invoiceBusinessSnapshot: {
      businessName: business.name,
      businessShortName: business.shortName,
      businessAddress: business.address,
      businessRole: business.role,
      businessEmail: business.email,
      businessPhone: business.phone,
      businessAdditional: business.additional
    },
    invoiceClientSnapshot: {
      clientName: client.name,
      clientAddress: client.address,
      clientEmail: client.email,
      clientPhone: client.phone,
      clientCode: client.code
    },
    invoiceCurrencySnapshot: {
      currencyCode: currency.code,
      currencySymbol: currency.symbol,
      currencySubunit: currency.subunit
    },
    invoiceBankSnapshot: {
      name: bank.name,
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      routingNumber: bank.routingNumber,
      accountHolder: bank.accountHolder,
      address: bank.address,
      type: bank.type,
      sortOrder: bank.sortOrder
    }
  };
};

// ----------------------------------------------------------------- main ----

const main = async () => {
  process.stdout.write(`Seeding ${BASE}\n`);

  const health = await fetch(`${BASE}/api/health`).then(r => r.json());
  if (!health.ok) throw new Error('instance is not healthy');

  const existing = await get('/api/invoices');
  if (existing.length > 0 && !FORCE) {
    process.stdout.write(
      `  ${existing.length} invoices already present — nothing done.\n` +
        '  Re-run with --force to add anyway, or start clean:\n' +
        '    deploy/demo-local.sh --reset\n'
    );
    return;
  }

  const business = await post('/api/businesses', BUSINESS);
  process.stdout.write(`  business  ${business.name}\n`);

  const bank = await post('/api/banks', { ...BANK, businessId: business.id });
  process.stdout.write(`  bank      ${bank.bankName}\n`);

  const clients = [];
  for (const c of CLIENTS) clients.push(await post('/api/clients', c));
  process.stdout.write(`  clients   ${clients.length}\n`);

  // Units and categories are already seeded by the US locale pack; look up
  // their ids rather than creating duplicates.
  const units = await get('/api/units');
  const categories = await get('/api/categories');
  const unitId = n => (units.find(u => u.name === n) || units[0]).id;
  const categoryId = n => (categories.find(c => c.name === n) || categories[0]).id;

  const items = [];
  for (const it of ITEMS) {
    const created = await post('/api/items', {
      name: it.name,
      amount: String(it.rate),
      unitId: unitId(it.unit),
      categoryId: categoryId(it.category),
      description: null,
      isArchived: false
    });
    items.push({ ...created, unitName: it.unit, rateCents: toCents(it.rate) });
  }
  process.stdout.write(`  items     ${items.length}\n`);

  const currencies = await get('/api/currencies');
  const usd = currencies.find(c => c.code === 'USD');
  if (!usd) throw new Error('USD currency not found');

  let n = 0;
  for (const spec of INVOICES) {
    n += 1;
    await post(
      '/api/invoices',
      buildDocument({
        type: 'invoice',
        spec,
        business,
        bank,
        client: clients[spec.client],
        currency: usd,
        items,
        number: String(n).padStart(4, '0')
      })
    );
  }
  process.stdout.write(`  invoices  ${INVOICES.length}\n`);

  let q = 0;
  for (const spec of QUOTES) {
    q += 1;
    await post(
      '/api/invoices',
      buildDocument({
        type: 'quotation',
        spec: { ...spec, pay: 0, tax: 0 },
        business,
        bank,
        client: clients[spec.client],
        currency: usd,
        items,
        number: String(q).padStart(4, '0')
      })
    );
  }
  process.stdout.write(`  quotes    ${QUOTES.length}\n`);

  process.stdout.write(`\nDone. Open ${BASE}\n`);
};

main().catch(err => {
  process.stderr.write(`\nSeed failed: ${err.message}\n`);
  process.exit(1);
});
