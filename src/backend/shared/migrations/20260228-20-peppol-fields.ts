import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import { getTableColumns } from '../utils/dbHelper';
import { mapDatabaseError } from '../utils/errorFunctions';

export const up = async (db: DatabaseAdapter) => {
  try {
    const cols = await getTableColumns(db, 'settings');
    const colInfo = cols.find(c => c.name === 'ublON');
    if (colInfo) return;

    await db.run(
      `
        ALTER TABLE settings
        ADD COLUMN "ublON" INTEGER NOT NULL DEFAULT 1 CHECK ("ublON" IN (0,1))
      `
    );

    await db.run(
      `
        ALTER TABLE clients
        ADD COLUMN "peppolEndpointId" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE clients
        ADD COLUMN "countryCode" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE clients
        ADD COLUMN "peppolEndpointSchemeId" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE clients
        ADD COLUMN "buyerReference" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE invoice_client_snapshots
        ADD COLUMN "clientPeppolEndpointId" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE invoice_client_snapshots
        ADD COLUMN "clientCountryCode" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE invoice_client_snapshots
        ADD COLUMN "clientPeppolEndpointSchemeId" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE invoice_client_snapshots
        ADD COLUMN "clientBuyerReference" TEXT
      `
    );

    await db.run(
      `
        ALTER TABLE businesses
        ADD COLUMN "code" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE businesses
        ADD COLUMN "peppolEndpointId" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE businesses
        ADD COLUMN "countryCode" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE businesses
        ADD COLUMN "peppolEndpointSchemeId" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE invoice_business_snapshots
        ADD COLUMN "businessCode" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE invoice_business_snapshots
        ADD COLUMN "businessPeppolEndpointId" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE invoice_business_snapshots
        ADD COLUMN "businessCountryCode" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE invoice_business_snapshots
        ADD COLUMN "businessPeppolEndpointSchemeId" TEXT
      `
    );
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
