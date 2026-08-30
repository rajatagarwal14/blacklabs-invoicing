import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import { getTableColumns } from '../utils/dbHelper';
import { mapDatabaseError } from '../utils/errorFunctions';

export const up = async (db: DatabaseAdapter) => {
  try {
    const cols = await getTableColumns(db, 'banks');
    const colInfo = cols.find(c => c.name === 'accountHolder');
    if (colInfo) return;

    await db.run(
      `
        ALTER TABLE banks
        ADD COLUMN "accountHolder" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE banks
        ADD COLUMN "sortOrder" TEXT 
      `
    );
    await db.run(
      `
        ALTER TABLE invoice_bank_snapshots
        ADD COLUMN "accountHolder" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE invoice_bank_snapshots
        ADD COLUMN "sortOrder" TEXT 
      `
    );
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
