import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import { getTableColumns } from '../utils/dbHelper';
import { mapDatabaseError } from '../utils/errorFunctions';

export const up = async (db: DatabaseAdapter) => {
  try {
    const cols = await getTableColumns(db, 'invoice_customizations');
    const colInfo = cols.find(c => c.name === 'pdfTexts');
    if (colInfo) return;

    await db.run(
      `
        ALTER TABLE style_profiles
        ADD COLUMN "pdfTexts" TEXT
      `
    );
    await db.run(
      `
        ALTER TABLE invoice_customizations
        ADD COLUMN "pdfTexts" TEXT 
      `
    );
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
