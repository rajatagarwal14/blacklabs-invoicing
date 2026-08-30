/**
 * Single source of truth for white-label identity.
 *
 * Every customer-visible name, URL and filename prefix resolves here, so a
 * re-skin is a config change rather than a search-and-replace across the tree.
 */

const env = import.meta.env as Record<string, string | undefined>;

const text = (key: string, fallback: string): string => {
  const value = env[key];
  return value && value.trim().length > 0 ? value.trim() : fallback;
};

const flag = (key: string, fallback: boolean): boolean => {
  const value = env[key];
  if (value === undefined || value.trim() === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
};

/** Filenames must survive Windows, macOS and Linux; keep them boring. */
const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'invoicing';

export const BRAND = {
  name: text('VITE_BRAND_NAME', 'BlackLabs Invoicing'),
  company: text('VITE_BRAND_COMPANY', 'BlackLabs'),
  websiteUrl: text('VITE_BRAND_WEBSITE_URL', 'https://blacklabs.example'),
  supportUrl: text('VITE_BRAND_SUPPORT_URL', 'https://blacklabs.example/support'),
  docsUrl: text('VITE_BRAND_DOCS_URL', 'https://blacklabs.example/docs'),
  privacyUrl: text('VITE_BRAND_PRIVACY_URL', 'https://blacklabs.example/privacy'),
  termsUrl: text('VITE_BRAND_TERMS_URL', 'https://blacklabs.example/terms'),
  licensesUrl: text('VITE_BRAND_LICENSES_URL', 'https://blacklabs.example/open-source'),

  /**
   * Third-party licence notices.
   *
   * The product is built on open source components whose licences require
   * their notices to be reproduced in anything distributed. LICENSE and NOTICE
   * carry them in the repository; licensesUrl is where they reach end users,
   * and that page must actually serve the contents of NOTICE.
   *
   * Set VITE_BRAND_SHOW_LICENSES=false only when the notices are surfaced
   * elsewhere in a client's build — not to omit them. Shipping without them
   * puts the product outside the terms it is licensed under.
   */
  showLicenses: flag('VITE_BRAND_SHOW_LICENSES', true)
} as const;

/** e.g. "blacklabs-invoicing-backup-2026-08-29.json" */
export const backupFileName = (extension: string): string =>
  `${slugify(BRAND.name)}-backup-${new Date().toISOString().slice(0, 10)}.${extension}`;

/**
 * Managed deployments pin the database server-side, so the chooser screen has
 * nothing to choose and is skipped. Off by default: the desktop build and any
 * self-hosted single-user install still need it.
 */
export const IS_MANAGED = flag('VITE_MANAGED_MODE', false);

/**
 * Paper size for a new invoice.
 *
 * The default is Letter. US clients need it, and getting this wrong is
 * visible on the very first PDF a client generates. It is not a database
 * default — style_profiles starts empty and its pageFormat column is nullable
 * — so the value the invoice form seeds itself with IS the effective default.
 *
 * Set VITE_DEFAULT_PAGE_FORMAT=A4 for a non-US deployment.
 */
export const DEFAULT_PAGE_FORMAT: 'A4' | 'LETTER' =
  text('VITE_DEFAULT_PAGE_FORMAT', 'LETTER').toUpperCase() === 'A4' ? 'A4' : 'LETTER';

/**
 * Guided demo player. Off by default so a client's production instance never
 * ships a "Play demo" button; demo-local.sh turns it on.
 */
export const DEMO_TOUR = flag('VITE_DEMO_TOUR', false);
