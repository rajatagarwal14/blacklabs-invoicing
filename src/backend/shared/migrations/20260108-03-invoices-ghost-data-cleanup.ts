import type { DatabaseAdapter } from '../types/DatabaseAdapter';
import { mapDatabaseError } from '../utils/errorFunctions';

export const up = async (db: DatabaseAdapter) => {
  try {
    await db.run('delete from invoice_items where "parentInvoiceId" not in (select "id" from invoices)');
    await db.run('delete from invoice_payments where "parentInvoiceId" not in (select "id" from invoices)');
    await db.run('delete from attachments where "parentInvoiceId" not in (select "id" from invoices)');
  } catch (error) {
    return { success: false, ...mapDatabaseError(error, db.type) };
  }
};
