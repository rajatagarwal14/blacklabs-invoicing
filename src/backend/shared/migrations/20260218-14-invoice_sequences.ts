import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import { getColumnType, getDefaultValue, isTableExists } from '../utils/dbHelper';
import { mapDatabaseError } from '../utils/errorFunctions';

export const up = async (db: DatabaseAdapter) => {
  try {
    const isExisting = await isTableExists(db, 'invoice_sequences');
    if (isExisting) return;

    await db.run(
      `
      CREATE TABLE invoice_sequences (
        "id" ${getColumnType('INTEGER PRIMARY KEY AUTOINCREMENT', db.type)},
        "businessId" INTEGER NOT NULL,
        "clientId" INTEGER NOT NULL,
        "nextSequence" BIGINT NOT NULL,
        "createdAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        "updatedAt" ${getColumnType('DATETIME', db.type)} NOT NULL DEFAULT ${getDefaultValue("(datetime('now'))", db.type)},
        UNIQUE("businessId","clientId")
      );
      `
    );

    await db.run(
      `
      INSERT INTO invoice_sequences ("businessId", "clientId", "nextSequence")
      SELECT
        "businessId", "clientId",  COALESCE(
          MAX(CAST("invoiceNumber" AS BIGINT)) + 1,
          COUNT(*) + 1,
          1
        )
      FROM invoices
      GROUP BY "businessId", "clientId"
      `
    );
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
