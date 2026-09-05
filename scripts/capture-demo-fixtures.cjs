/* eslint-disable no-undef */
/**
 * Regenerate src/renderer/mocks/staticSeed.ts from a running instance.
 *
 * The static demo's fixtures are captured from real API responses rather than
 * written by hand, because the invoice shape — nested snapshots, line items,
 * payments, customization — is easy to get subtly wrong and the failure is a
 * blank screen rather than an error.
 *
 *   ./deploy/demo-local.sh --reset --seed
 *   node scripts/capture-demo-fixtures.cjs
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const BASE = process.env.DEMO_URL || 'http://127.0.0.1:3401';
const NAMES = [
  'banks',
  'businesses',
  'categories',
  'clients',
  'currencies',
  'items',
  'presets',
  'styleProfiles',
  'units'
];

const get = async p => {
  const res = await fetch(BASE + p);
  const body = await res.json();
  if (!body.success && body.data === undefined) throw new Error(`GET ${p} failed`);
  return body.data;
};

const main = async () => {
  const collections = {};
  for (const name of NAMES) collections[name] = (await get(`/api/${name}`)) ?? [];
  const settings = await get('/api/settings');
  const invoices = (await get('/api/invoices')) ?? [];

  // Counts are derived from invoices at runtime; stored copies would go stale
  // the moment a visitor adds a document.
  for (const name of NAMES) {
    for (const row of collections[name]) {
      delete row.invoiceCount;
      delete row.quotesCount;
    }
  }

  const out = path.resolve(__dirname, '..', 'src/renderer/mocks/staticSeed.ts');
  const header = fs.readFileSync(out, 'utf8').split('const SEED = ')[0];
  const footer = `\n as unknown as StaticDb;\n\n/** A fresh copy per call, so one tab's edits never leak into another reset. */\nexport const seedDatabase = (): StaticDb => structuredClone(SEED);\n`;

  fs.writeFileSync(
    out,
    header + 'const SEED = ' + JSON.stringify({ settings, invoices, ...collections }, null, 2) + footer
  );
  console.log(`Wrote ${out} (${(fs.statSync(out).size / 1024).toFixed(0)} KB, ${invoices.length} documents)`);
};

main().catch(err => {
  console.error(`Capture failed: ${err.message}`);
  console.error('Is the demo running?  ./deploy/demo-local.sh --reset --seed');
  process.exit(1);
});
