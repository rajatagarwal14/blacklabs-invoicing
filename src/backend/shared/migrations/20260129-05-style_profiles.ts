import { DatabaseType } from '../enums/databaseType';
import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import { getColumnType, getDefaultValue, getTableColumns } from '../utils/dbHelper';
import { mapDatabaseError } from '../utils/errorFunctions';

export const up = async (db: DatabaseAdapter) => {
  try {
    const cols = await getTableColumns(db, 'settings');
    const colInfo = cols.find(c => c.name === 'styleProfilesON');

    if (colInfo) {
      return;
    }

    await db.run(
      `
      ALTER TABLE settings
      ADD COLUMN "styleProfilesON" INTEGER NOT NULL DEFAULT 1 CHECK ("styleProfilesON" IN (0,1))
    `
    );

    await db.run(
      `
      CREATE TABLE IF NOT EXISTS style_profiles (
        "id" ${getColumnType('INTEGER PRIMARY KEY AUTOINCREMENT', db.type)},
        "name" TEXT NOT NULL UNIQUE,
        "isArchived" INTEGER NOT NULL DEFAULT 0 CHECK ("isArchived" IN (0,1)),
        "customizationColor" TEXT,
        "customizationLogoSize" TEXT,
        "customizationFontSizeSize" TEXT,
        "customizationLayout" TEXT,
        "customizationTableHeaderStyle" TEXT,
        "customizationTableRowStyle" TEXT,
        "customizationPageFormat" TEXT,
        "customizationLabelUpperCase" INTEGER NOT NULL DEFAULT 0 CHECK ("customizationLabelUpperCase" IN (0,1)),
        "customizationWatermarkFileName" TEXT,
        "customizationWatermarkFileType" TEXT,            
        "customizationWatermarkFileSize" INTEGER,       
        "customizationWatermarkFileData" ${getColumnType('BLOB', db.type)},         
        "customizationPaidWatermarkFileName" TEXT,
        "customizationPaidWatermarkFileType" TEXT,            
        "customizationPaidWatermarkFileSize" INTEGER,        
        "customizationPaidWatermarkFileData" ${getColumnType('BLOB', db.type)},     
        "createdAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        "updatedAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)}
      );
    `
    );

    await db.run(`CREATE INDEX IF NOT EXISTS idx_style_profiles_id ON style_profiles("id")`);

    if (db.type === DatabaseType.sqlite) {
      await db.run('DROP TABLE IF EXISTS invoices_new;');

      await db.run(
        `
      CREATE TABLE IF NOT EXISTS invoices_new (
        "id" ${getColumnType('INTEGER PRIMARY KEY AUTOINCREMENT', db.type)},
        "invoiceType" TEXT NOT NULL CHECK("invoiceType" IN ('quotation','invoice')),
        "convertedFromQuotationId" INTEGER,
        "businessId" INTEGER NOT NULL,
        "clientId" INTEGER NOT NULL,
        "currencyId" INTEGER NOT NULL,
        "createdAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        "updatedAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        "issuedAt" ${getColumnType('DATETIME', db.type)} NOT NULL,
        "dueDate" ${getColumnType('DATETIME', db.type)},
        "invoiceNumber" TEXT NOT NULL,
        "isArchived" INTEGER NOT NULL DEFAULT 0 CHECK("isArchived" IN (0,1)),
        "status" TEXT NOT NULL DEFAULT 'unpaid' CHECK("status" IN ('unpaid','open','closed','partially','paid')),
        "customerNotes" TEXT,
        "thanksNotes" TEXT,
        "termsConditionNotes" TEXT,
        "discountName" TEXT,
        "businessNameSnapshot" TEXT NOT NULL,
        "businessShortNameSnapshot" TEXT NOT NULL CHECK (length("businessShortNameSnapshot") <= 2),
        "businessAddressSnapshot" TEXT,
        "businessRoleSnapshot" TEXT,
        "businessEmailSnapshot" TEXT,
        "businessPhoneSnapshot" TEXT,
        "businessAdditionalSnapshot" TEXT,
        "businessPaymentInformationSnapshot" TEXT,
        "businessLogoSnapshot" ${getColumnType('BLOB', db.type)},
        "businessFileSizeSnapshot" INTEGER,
        "businessFileTypeSnapshot" TEXT,
        "businessFileNameSnapshot" TEXT,
        "clientNameSnapshot" TEXT NOT NULL,
        "clientAddressSnapshot" TEXT,
        "clientEmailSnapshot" TEXT,
        "clientPhoneSnapshot" TEXT,
        "clientCodeSnapshot" TEXT,
        "clientAdditionalSnapshot" TEXT,
        "currencyCodeSnapshot" TEXT NOT NULL,
        "currencySymbolSnapshot" TEXT NOT NULL,
        "currencySubunitSnapshot" INTEGER NOT NULL,
        "discountType" TEXT CHECK("discountType" IN ('fixed','percentage') OR "discountType" IS NULL),
        "discountAmountCents" INTEGER NOT NULL DEFAULT 0,
        "discountPercent" REAL NOT NULL DEFAULT 0,
        "shippingFeeCents" INTEGER NOT NULL DEFAULT 0,
        "invoicePrefix" TEXT,
        "invoiceSuffix" TEXT,
        "customizationColor" TEXT NOT NULL DEFAULT '#006400',
        "customizationLogoSize" TEXT NOT NULL DEFAULT 'medium',
        "customizationFontSizeSize" TEXT NOT NULL DEFAULT 'medium',
        "customizationLayout" TEXT NOT NULL DEFAULT 'classic',
        "customizationTableHeaderStyle" TEXT NOT NULL DEFAULT 'light',
        "customizationTableRowStyle" TEXT NOT NULL DEFAULT 'classic',
        "customizationPageFormat" TEXT NOT NULL DEFAULT 'A4',
        "customizationLabelUpperCase" INTEGER NOT NULL DEFAULT 0 CHECK("customizationLabelUpperCase" IN (0,1)),
        "customizationWatermarkFileName" TEXT,
        "customizationWatermarkFileType" TEXT,
        "customizationWatermarkFileSize" INTEGER,
        "customizationWatermarkFileData" ${getColumnType('BLOB', db.type)},
        "customizationPaidWatermarkFileName" TEXT,
        "customizationPaidWatermarkFileType" TEXT,
        "customizationPaidWatermarkFileSize" INTEGER,
        "customizationPaidWatermarkFileData" ${getColumnType('BLOB', db.type)},
        "taxName" TEXT,
        "taxRate" REAL NOT NULL DEFAULT 0,
        "taxType" TEXT CHECK("taxType" IN ('exclusive','inclusive','deducted') OR "taxType" IS NULL),
        "invoiceFullNumber" TEXT GENERATED ALWAYS AS (
          COALESCE("invoicePrefix", '') || "invoiceNumber" || COALESCE("invoiceSuffix", '')
        ) STORED,
        "language" TEXT NOT NULL DEFAULT 'en',
        "signatureData" ${getColumnType('BLOB', db.type)},
        "signatureName" TEXT,
        "signatureType" TEXT,
        "signatureSize" INTEGER,
        "styleProfilesId" INTEGER,
        "styleProfileNameSnapshot" TEXT,
        FOREIGN KEY("styleProfilesId") REFERENCES style_profiles("id"),
        FOREIGN KEY("businessId") REFERENCES businesses("id"),
        FOREIGN KEY("clientId") REFERENCES clients("id"),
        FOREIGN KEY("currencyId") REFERENCES currencies("id"),
        FOREIGN KEY("convertedFromQuotationId") REFERENCES invoices("id"),
        UNIQUE("businessId","invoiceFullNumber"),
        CHECK (
          ("discountType" = 'fixed' AND "discountAmountCents" >= 0 AND "discountPercent" = 0) OR
          ("discountType" = 'percentage' AND "discountPercent" <= 100 AND "discountPercent" >= 0 AND "discountAmountCents" = 0) OR
          ("discountType" IS NULL AND "discountAmountCents" = 0 AND "discountPercent" = 0)
        ),
        CHECK("dueDate" IS NULL OR "dueDate" >= "issuedAt"),
        CHECK("convertedFromQuotationId" IS NULL OR "convertedFromQuotationId" != "id")
      );
    `
      );

      await db.run(
        `
        INSERT INTO invoices_new (
          "id",
          "invoiceType",
          "convertedFromQuotationId",
          "businessId",
          "clientId",
          "currencyId",
          "createdAt",
          "updatedAt",
          "issuedAt",
          "dueDate",
          "invoiceNumber",
          "isArchived",
          "status",
          "customerNotes",
          "thanksNotes",
          "termsConditionNotes",
          "discountName",
          "businessNameSnapshot",
          "businessShortNameSnapshot",
          "businessAddressSnapshot",
          "businessRoleSnapshot",
          "businessEmailSnapshot",
          "businessPhoneSnapshot",
          "businessAdditionalSnapshot",
          "businessPaymentInformationSnapshot",
          "businessLogoSnapshot",
          "businessFileSizeSnapshot",
          "businessFileTypeSnapshot",
          "businessFileNameSnapshot",
          "clientNameSnapshot",
          "clientAddressSnapshot",
          "clientEmailSnapshot",
          "clientPhoneSnapshot",
          "clientCodeSnapshot",
          "clientAdditionalSnapshot",
          "currencyCodeSnapshot",
          "currencySymbolSnapshot",
          "currencySubunitSnapshot",
          "discountType",
          "discountAmountCents",
          "discountPercent",
          "shippingFeeCents",
          "invoicePrefix",
          "invoiceSuffix",
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
          "taxName",
          "taxRate",
          "taxType",
          "language",
          "signatureData",
          "signatureName",
          "signatureType",
          "signatureSize"
        )
        SELECT
          i."id",
          i."invoiceType",
          i."convertedFromQuotationId",
          i."businessId",
          i."clientId",
          i."currencyId",
          i."createdAt",
          i."updatedAt",
          i."issuedAt",
          i."dueDate",
          i."invoiceNumber",
          i."isArchived",
          i."status",
          i."customerNotes",
          i."thanksNotes",
          i."termsConditionNotes",
          i."discountName",
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
          i."clientNameSnapshot",
          i."clientAddressSnapshot",
          i."clientEmailSnapshot",
          i."clientPhoneSnapshot",
          i."clientCodeSnapshot",
          i."clientAdditionalSnapshot",
          i."currencyCodeSnapshot",
          i."currencySymbolSnapshot",
          i."currencySubunitSnapshot",
          i."discountType",
          i."discountAmountCents",
          i."discountPercent",
          i."shippingFeeCents",
          i."invoicePrefix",
          i."invoiceSuffix",
          i."customizationColor",
          i."customizationLogoSize",
          i."customizationFontSizeSize",
          i."customizationLayout",
          i."customizationTableHeaderStyle",
          i."customizationTableRowStyle",
          i."customizationPageFormat",
          i."customizationLabelUpperCase",
          i."customizationWatermarkFileName",
          i."customizationWatermarkFileType",
          i."customizationWatermarkFileSize",
          i."customizationWatermarkFileData",
          i."customizationPaidWatermarkFileName",
          i."customizationPaidWatermarkFileType",
          i."customizationPaidWatermarkFileSize",
          i."customizationPaidWatermarkFileData",
          i."taxName",
          i."taxRate",
          i."taxType",
          i."language",
          i."signatureData",
          i."signatureName",
          i."signatureType",
          i."signatureSize"
        FROM invoices as i;
      `
      );

      await db.run('DROP TABLE invoices;');
      await db.run('ALTER TABLE invoices_new RENAME TO invoices;');
      await db.run(`CREATE INDEX IF NOT EXISTS idx_invoices_clientId ON invoices("clientId")`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_invoices_businessId ON invoices("businessId")`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_invoices_business_client ON invoices("businessId", "clientId")`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_invoices_type ON invoices("invoiceType")`);
      await db.run(
        `CREATE INDEX IF NOT EXISTS idx_invoices_convertedFromQuotationId ON invoices("convertedFromQuotationId")`
      );
      await db.run(`CREATE INDEX IF NOT EXISTS idx_invoices_invoiceNumber ON invoices("invoiceNumber")`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices("status")`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_invoices_issuedAt ON invoices("issuedAt")`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_invoices_styleProfilesId ON invoices("styleProfilesId")`);
    }

    if (db.type === DatabaseType.postgre) {
      await db.run(`
        ALTER TABLE invoices
        ADD COLUMN IF NOT EXISTS "styleProfilesId" INTEGER,
        ADD COLUMN IF NOT EXISTS "styleProfileNameSnapshot" TEXT;
      `);
    }
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
