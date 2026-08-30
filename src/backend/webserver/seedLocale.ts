/**
 * US locale defaults for freshly provisioned instances.
 *
 * The base schema seeds for a European default: A4 paper, and a unit/category
 * list aimed at goods. A US client opening the app for the first time should
 * not have to fix paper size and invent categories before their first invoice.
 *
 * This runs as a separate step rather than as an edit to shared/db/setup.ts, so
 * the base seed logic stays independent of locale.
 *
 * Applies only to an untouched instance — an install with any invoice, client
 * or business in it has been configured by its owner, and those choices are
 * not ours to overwrite on a restart.
 */
import { PageFormat } from '../shared/enums/pageFormat';
import type { DatabaseAdapter } from '../shared/types/DatabaseAdapter';
import { insertOrIgnore } from '../shared/utils/dbHelper';

/** Billing units US service businesses actually invoice in. */
const US_UNITS = [['days'], ['weeks'], ['months'], ['each'], ['flat'], ['sq ft'], ['miles'], ['users'], ['words']];

/** Line-item categories covering the common US service-business shapes. */
const US_CATEGORIES = [
  ['Consulting'],
  ['Design'],
  ['Development'],
  ['Support & Maintenance'],
  ['Licensing & Subscriptions'],
  ['Reimbursable Expenses'],
  ['Travel']
];

const isUntouched = async (db: DatabaseAdapter): Promise<boolean> => {
  for (const table of ['invoices', 'clients', 'businesses']) {
    const result = await db.query(`SELECT 1 FROM ${table} LIMIT 1`);
    if (result && result.rows.length > 0) return false;
  }
  return true;
};

export const seedUsDefaults = async (db: DatabaseAdapter): Promise<boolean> => {
  if (!(await isUntouched(db))) return false;

  // Letter, not A4. On a genuinely fresh install style_profiles is empty and
  // this updates nothing — the effective default for a new invoice comes from
  // the frontend (DEFAULT_PAGE_FORMAT in shared/config/brand.ts), because
  // pageFormat is nullable with no database default. This statement covers the
  // other case: an instance restored from a backup that already carries
  // profiles built against A4.
  await db.run(`UPDATE style_profiles SET "pageFormat" = ?`, [PageFormat.letter]);

  // The schema defaults are already en-US and MM/dd/yyyy; set them explicitly
  // anyway so a future change to those defaults cannot silently alter what US
  // clients get.
  await db.run(`UPDATE settings SET "amountFormat" = ?, "dateFormat" = ?, "language" = ?`, [
    'en-US',
    'MM/dd/yyyy',
    'en'
  ]);

  await db.run(insertOrIgnore('units', ['name'], US_UNITS, db.type, 'name'));
  await db.run(insertOrIgnore('categories', ['name'], US_CATEGORIES, db.type, 'name'));

  return true;
};

/**
 * BLACKLABS_SEED_LOCALE selects the pack. Only 'us' exists today; 'none'
 * disables seeding for a client who wants the schema defaults untouched.
 */
export const applyLocaleSeed = async (db: DatabaseAdapter): Promise<void> => {
  const locale = (process.env.BLACKLABS_SEED_LOCALE ?? 'us').trim().toLowerCase();
  if (locale === 'none') return;

  if (locale !== 'us') {
    console.warn(`Unknown BLACKLABS_SEED_LOCALE "${locale}"; skipping locale seed.`);
    return;
  }

  try {
    const applied = await seedUsDefaults(db);
    console.log(applied ? 'Applied US locale defaults.' : 'Instance already in use; locale seed skipped.');
  } catch (err) {
    // Seeding is a convenience. A client with a working database and European
    // paper size is a support ticket; a container that will not boot is an
    // outage. Log and carry on.
    console.error('Locale seed failed; continuing with schema defaults:', (err as Error).message);
  }
};
