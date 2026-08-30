import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import { getColumnType, getTableColumns } from '../utils/dbHelper';
import { mapDatabaseError } from '../utils/errorFunctions';

export const up = async (db: DatabaseAdapter) => {
  try {
    const cols = await getTableColumns(db, 'invoices');
    const colInfo = cols.find(c => c.name === 'signatureData');

    if (colInfo) {
      return;
    }

    await db.run(`
      ALTER TABLE invoices ADD COLUMN "signatureData" ${getColumnType('BLOB', db.type)};
    `);
    await db.run(`ALTER TABLE invoices ADD COLUMN "signatureName" TEXT;`);
    await db.run(`ALTER TABLE invoices ADD COLUMN "signatureType" TEXT;`);
    await db.run(`ALTER TABLE invoices ADD COLUMN "signatureSize" INTEGER;`);
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
