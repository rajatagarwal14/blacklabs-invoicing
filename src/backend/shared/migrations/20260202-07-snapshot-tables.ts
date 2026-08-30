import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import { getColumnType, getDefaultValue, isTableExists } from '../utils/dbHelper';
import { mapDatabaseError } from '../utils/errorFunctions';

export const up = async (db: DatabaseAdapter) => {
  try {
    const isExisting = await isTableExists(db, 'invoice_business_snapshots');
    if (isExisting) return;

    await db.run(
      `
      CREATE TABLE IF NOT EXISTS invoice_business_snapshots (
        "id" ${getColumnType('INTEGER PRIMARY KEY AUTOINCREMENT', db.type)},
        "parentInvoiceId" INTEGER NOT NULL,
        "businessName" TEXT NOT NULL,
        "businessShortName" TEXT NOT NULL CHECK (length("businessShortName") <= 2),
        "businessAddress" TEXT,
        "businessRole" TEXT,
        "businessEmail" TEXT,
        "businessPhone" TEXT,
        "businessAdditional" TEXT,
        "businessPaymentInformation" TEXT,
        "businessLogo" ${getColumnType('BLOB', db.type)},
        "businessFileSize" INTEGER,
        "businessFileType" TEXT,
        "businessFileName" TEXT,
        "createdAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        "updatedAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        FOREIGN KEY("parentInvoiceId") REFERENCES invoices("id") ON DELETE CASCADE
      );
    `
    );
    await db.run(
      `
      CREATE TABLE IF NOT EXISTS invoice_client_snapshots (
        "id" ${getColumnType('INTEGER PRIMARY KEY AUTOINCREMENT', db.type)},
        "parentInvoiceId" INTEGER NOT NULL,
        "clientName" TEXT NOT NULL,
        "clientAddress" TEXT,
        "clientEmail" TEXT,
        "clientPhone" TEXT,
        "clientCode" TEXT,
        "clientAdditional" TEXT,
        "createdAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        "updatedAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        FOREIGN KEY("parentInvoiceId") REFERENCES invoices("id") ON DELETE CASCADE
      );
      `
    );
    await db.run(
      `
      CREATE TABLE IF NOT EXISTS invoice_currency_snapshots (
        "id" ${getColumnType('INTEGER PRIMARY KEY AUTOINCREMENT', db.type)},
        "parentInvoiceId" INTEGER NOT NULL,
        "currencyCode" TEXT NOT NULL,
        "currencySymbol" TEXT NOT NULL,
        "currencySubunit" INTEGER NOT NULL,
        "createdAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        "updatedAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        FOREIGN KEY("parentInvoiceId") REFERENCES invoices("id") ON DELETE CASCADE
      );
    `
    );
    await db.run(
      `
      CREATE TABLE IF NOT EXISTS invoice_customizations (
        "id" ${getColumnType('INTEGER PRIMARY KEY AUTOINCREMENT', db.type)},
        "parentInvoiceId" INTEGER NOT NULL,
        "color" TEXT NOT NULL DEFAULT '#006400',
        "logoSize" TEXT NOT NULL DEFAULT 'medium',
        "fontSize" TEXT NOT NULL DEFAULT 'medium',
        "layout" TEXT NOT NULL DEFAULT 'classic',
        "tableHeaderStyle" TEXT NOT NULL DEFAULT 'light',
        "tableRowStyle" TEXT NOT NULL DEFAULT 'classic',
        "pageFormat" TEXT NOT NULL DEFAULT 'A4',
        "labelUpperCase" INTEGER NOT NULL DEFAULT 0 CHECK ("labelUpperCase" IN (0,1)),
        "watermarkFileName" TEXT,
        "watermarkFileType" TEXT,
        "watermarkFileSize" INTEGER,
        "watermarkFileData" ${getColumnType('BLOB', db.type)},
        "paidWatermarkFileName" TEXT,
        "paidWatermarkFileType" TEXT,
        "paidWatermarkFileSize" INTEGER,
        "paidWatermarkFileData" ${getColumnType('BLOB', db.type)},
        "createdAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        "updatedAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        FOREIGN KEY("parentInvoiceId") REFERENCES invoices("id") ON DELETE CASCADE
      );
    `
    );
    await db.run(
      `
      CREATE TABLE IF NOT EXISTS invoice_style_profile_snapshots (
        "id" ${getColumnType('INTEGER PRIMARY KEY AUTOINCREMENT', db.type)},
        "parentInvoiceId" INTEGER NOT NULL,
        "styleProfileName" TEXT NOT NULL,
        "createdAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        "updatedAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        FOREIGN KEY("parentInvoiceId") REFERENCES invoices("id") ON DELETE CASCADE
      );
    `
    );
    await db.run(
      `
      CREATE TABLE IF NOT EXISTS invoice_item_snaphots (
        "id" ${getColumnType('INTEGER PRIMARY KEY AUTOINCREMENT', db.type)},
        "parentInvoiceItemId" INTEGER NOT NULL,
        "itemName" TEXT NOT NULL,
        "unitPriceCents" INTEGER NOT NULL DEFAULT 0,
        "unitName" TEXT,
        "createdAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        "updatedAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        FOREIGN KEY("parentInvoiceItemId") REFERENCES invoice_items("id") ON DELETE CASCADE
      );
    `
    );

    await db.run(
      `CREATE INDEX IF NOT EXISTS idx_invoice_business_snapshots_parentInvoiceId ON invoice_business_snapshots("parentInvoiceId")`
    );
    await db.run(
      `CREATE INDEX IF NOT EXISTS idx_invoice_business_snapshots_businessName ON invoice_business_snapshots("businessName")`
    );
    await db.run(
      `CREATE INDEX IF NOT EXISTS idx_invoice_business_snapshots_businessShortName ON invoice_business_snapshots("businessShortName")`
    );

    await db.run(
      `CREATE INDEX IF NOT EXISTS idx_invoice_client_snapshots_parentInvoiceId ON invoice_client_snapshots("parentInvoiceId")`
    );
    await db.run(
      `CREATE INDEX IF NOT EXISTS idx_invoice_client_snapshots_clientName ON invoice_client_snapshots("clientName")`
    );
    await db.run(
      `CREATE INDEX IF NOT EXISTS idx_invoice_client_snapshots_clientCode ON invoice_client_snapshots("clientCode")`
    );

    await db.run(
      `CREATE INDEX IF NOT EXISTS idx_invoice_currency_snapshots_parentInvoiceId ON invoice_currency_snapshots("parentInvoiceId")`
    );
    await db.run(
      `CREATE INDEX IF NOT EXISTS idx_invoice_currency_snapshots_currencyCode ON invoice_currency_snapshots("currencyCode")`
    );

    await db.run(
      `CREATE INDEX IF NOT EXISTS idx_invoice_customizations_parentInvoiceId ON invoice_customizations("parentInvoiceId")`
    );

    await db.run(
      `CREATE INDEX IF NOT EXISTS idx_invoice_style_profile_snapshots_parentInvoiceId ON invoice_style_profile_snapshots("parentInvoiceId")`
    );

    await db.run(
      `CREATE INDEX IF NOT EXISTS idx_invoice_item_snapshots_parentInvoiceItemId ON invoice_item_snaphots("parentInvoiceItemId")`
    );
    await db.run(`CREATE INDEX IF NOT EXISTS idx_invoice_item_snapshots_itemName ON invoice_item_snaphots("itemName")`);

    await db.run(`
      INSERT INTO invoice_business_snapshots (
          "parentInvoiceId",
          "businessName",
          "businessShortName",
          "businessAddress",
          "businessRole",
          "businessEmail",
          "businessPhone",
          "businessAdditional",
          "businessPaymentInformation",
          "businessLogo",
          "businessFileSize",
          "businessFileType",
          "businessFileName",
          "createdAt",
          "updatedAt"
      )
      SELECT
          i."id",
          i."businessNameSnapshot",
          i."businessShortNameSnapshot",
          i."businessAddressSnapshot",
          i."businessRoleSnapshot",
          i."businessEmailSnapshot",
          i."businessPhoneSnapshot",
          i."businessAdditionalSnapshot",
          i."businessPaymentInformationSnapshot",
          i."businessLogoSnapshot",
          i."businessFileSizeSnapshot",
          i."businessFileTypeSnapshot",
          i."businessFileNameSnapshot",
          i."createdAt",
          i."updatedAt"
      FROM invoices as i;
    `);
    await db.run(`
      INSERT INTO invoice_client_snapshots (
          "parentInvoiceId",
          "clientName",
          "clientAddress",
          "clientEmail",
          "clientPhone",
          "clientCode",
          "clientAdditional",
          "createdAt",
          "updatedAt"
      )
      SELECT
          i."id",
          i."clientNameSnapshot",
          i."clientAddressSnapshot",
          i."clientEmailSnapshot",
          i."clientPhoneSnapshot",
          i."clientCodeSnapshot",
          i."clientAdditionalSnapshot",
          i."createdAt",
          i."updatedAt"
      FROM invoices as i;
    `);
    await db.run(`
      INSERT INTO invoice_currency_snapshots (
          "parentInvoiceId",
          "currencyCode",
          "currencySymbol",
          "currencySubunit",
          "createdAt",
          "updatedAt"
      )
      SELECT
          "id",
          "currencyCodeSnapshot",
          "currencySymbolSnapshot",
          "currencySubunitSnapshot",
          "createdAt",
          "updatedAt"
      FROM invoices;
    `);
    await db.run(`
      INSERT INTO invoice_customizations (
          "parentInvoiceId",
          "color",
          "logoSize",
          "fontSize",
          "layout",
          "tableHeaderStyle",
          "tableRowStyle",
          "pageFormat",
          "labelUpperCase",
          "watermarkFileName",
          "watermarkFileType",
          "watermarkFileSize",
          "watermarkFileData",
          "paidWatermarkFileName",
          "paidWatermarkFileType",
          "paidWatermarkFileSize",
          "paidWatermarkFileData",
          "createdAt",
          "updatedAt"
      )
      SELECT
          "id",
          "customizationColor",
          "customizationLogoSize",
          "customizationFontSizeSize",
          "customizationLayout",
          "customizationTableHeaderStyle",
          "customizationTableRowStyle",
          "customizationPageFormat",
          "customizationLabelUpperCase",
          "customizationWatermarkFileName",
          "customizationWatermarkFileType",
          "customizationWatermarkFileSize",
          "customizationWatermarkFileData",
          "customizationPaidWatermarkFileName",
          "customizationPaidWatermarkFileType",
          "customizationPaidWatermarkFileSize",
          "customizationPaidWatermarkFileData",
          "createdAt",
          "updatedAt"
      FROM invoices;
    `);
    await db.run(`
      INSERT INTO invoice_style_profile_snapshots (
          "parentInvoiceId",
          "styleProfileName",
          "createdAt",
          "updatedAt"
      )
      SELECT
          "id",
          "styleProfileNameSnapshot",
          "createdAt",
          "updatedAt"
      FROM invoices
      WHERE "styleProfilesId" IS NOT NULL;
    `);
    await db.run(`
      INSERT INTO invoice_item_snaphots (
          "parentInvoiceItemId",
          "itemName",
          "unitPriceCents",
          "unitName",
          "createdAt",
          "updatedAt"
      )
      SELECT
          "id",
          "itemNameSnapshot",
          "unitPriceCentsSnapshot",
          "unitNameSnapshot",
          "createdAt",
          "updatedAt"
      FROM invoice_items;
    `);

    await db.run('ALTER TABLE invoices DROP COLUMN "businessNameSnapshot";');
    await db.run('ALTER TABLE invoices DROP COLUMN "businessShortNameSnapshot";');
    await db.run('ALTER TABLE invoices DROP COLUMN "businessAddressSnapshot";');
    await db.run('ALTER TABLE invoices DROP COLUMN "businessRoleSnapshot";');
    await db.run('ALTER TABLE invoices DROP COLUMN "businessEmailSnapshot";');
    await db.run('ALTER TABLE invoices DROP COLUMN "businessPhoneSnapshot";');
    await db.run('ALTER TABLE invoices DROP COLUMN "businessAdditionalSnapshot";');
    await db.run('ALTER TABLE invoices DROP COLUMN "businessPaymentInformationSnapshot";');
    await db.run('ALTER TABLE invoices DROP COLUMN "businessLogoSnapshot";');
    await db.run('ALTER TABLE invoices DROP COLUMN "businessFileSizeSnapshot";');
    await db.run('ALTER TABLE invoices DROP COLUMN "businessFileTypeSnapshot";');
    await db.run('ALTER TABLE invoices DROP COLUMN "businessFileNameSnapshot";');

    await db.run('ALTER TABLE invoices DROP COLUMN "clientNameSnapshot";');
    await db.run('ALTER TABLE invoices DROP COLUMN "clientAddressSnapshot";');
    await db.run('ALTER TABLE invoices DROP COLUMN "clientEmailSnapshot";');
    await db.run('ALTER TABLE invoices DROP COLUMN "clientPhoneSnapshot";');
    await db.run('ALTER TABLE invoices DROP COLUMN "clientCodeSnapshot";');
    await db.run('ALTER TABLE invoices DROP COLUMN "clientAdditionalSnapshot";');

    await db.run('ALTER TABLE invoices DROP COLUMN "currencyCodeSnapshot";');
    await db.run('ALTER TABLE invoices DROP COLUMN "currencySymbolSnapshot";');
    await db.run('ALTER TABLE invoices DROP COLUMN "currencySubunitSnapshot";');

    await db.run('ALTER TABLE invoices DROP COLUMN "customizationColor";');
    await db.run('ALTER TABLE invoices DROP COLUMN "customizationLogoSize";');
    await db.run('ALTER TABLE invoices DROP COLUMN "customizationFontSizeSize";');
    await db.run('ALTER TABLE invoices DROP COLUMN "customizationLayout";');
    await db.run('ALTER TABLE invoices DROP COLUMN "customizationTableHeaderStyle";');
    await db.run('ALTER TABLE invoices DROP COLUMN "customizationTableRowStyle";');
    await db.run('ALTER TABLE invoices DROP COLUMN "customizationPageFormat";');
    await db.run('ALTER TABLE invoices DROP COLUMN "customizationLabelUpperCase";');
    await db.run('ALTER TABLE invoices DROP COLUMN "customizationWatermarkFileName";');
    await db.run('ALTER TABLE invoices DROP COLUMN "customizationWatermarkFileType";');
    await db.run('ALTER TABLE invoices DROP COLUMN "customizationWatermarkFileSize";');
    await db.run('ALTER TABLE invoices DROP COLUMN "customizationWatermarkFileData";');
    await db.run('ALTER TABLE invoices DROP COLUMN "customizationPaidWatermarkFileName";');
    await db.run('ALTER TABLE invoices DROP COLUMN "customizationPaidWatermarkFileType";');
    await db.run('ALTER TABLE invoices DROP COLUMN "customizationPaidWatermarkFileSize";');
    await db.run('ALTER TABLE invoices DROP COLUMN "customizationPaidWatermarkFileData";');

    await db.run('ALTER TABLE invoices DROP COLUMN "styleProfileNameSnapshot";');

    await db.run('ALTER TABLE invoice_items DROP COLUMN "itemNameSnapshot";');
    await db.run('ALTER TABLE invoice_items DROP COLUMN "unitPriceCentsSnapshot";');
    await db.run('ALTER TABLE invoice_items DROP COLUMN "unitNameSnapshot";');
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
