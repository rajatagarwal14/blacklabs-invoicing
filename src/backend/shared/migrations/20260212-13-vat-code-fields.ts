import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import { getTableColumns } from '../utils/dbHelper';
import { mapDatabaseError } from '../utils/errorFunctions';

export const up = async (db: DatabaseAdapter) => {
  try {
    const cols = await getTableColumns(db, 'invoice_client_snapshots');
    const colInfo = cols.find(c => c.name === 'clientVatCode');
    if (colInfo) return;

    await db.run(
      `
        ALTER TABLE clients
        ADD COLUMN "vatCode" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE businesses
        ADD COLUMN "vatCode" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE invoice_business_snapshots
        ADD COLUMN "businessVatCode" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE invoice_client_snapshots
        ADD COLUMN "clientVatCode" TEXT
      `
    );
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
