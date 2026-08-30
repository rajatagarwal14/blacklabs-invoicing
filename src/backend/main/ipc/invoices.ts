import { ipcMain } from 'electron';
import * as invoicesService from '../../shared/services/invoices';
import type { DatabaseAdapter } from '../../shared/types/DatabaseAdapter';
import type { Invoice } from '../../shared/types/invoice';
import { mapDatabaseError } from '../../shared/utils/errorFunctions';

export const initInvoicesHandlers = (db: DatabaseAdapter) => {
  ipcMain.handle('get-einvoice-xml', async (_event, data) => {
    try {
      const result = await invoicesService.getInvoiceXML(db, data);
      if (!result.success) return result;

      const xmlBuffer = Buffer.from(result.data.xml, 'utf-8');

      return { success: true, data: xmlBuffer };
    } catch (error) {
      return { success: false, ...mapDatabaseError(error, db.type) };
    }
  });

  ipcMain.handle('get-next-sequence', async (_event, data) => invoicesService.getNextSequence(db, data));
  ipcMain.handle('get-custom-headers', async (_event, type) => invoicesService.getCustomHeaders(db, type));
  ipcMain.handle('get-all-invoices', async (_event, type, filter) => invoicesService.getAllInvoices(db, type, filter));
  ipcMain.handle('delete-invoice', async (_event, id: number) => invoicesService.deleteInvoice(db, id));
  ipcMain.handle('add-invoice', async (_event, data: Invoice) => invoicesService.addInvoice(db, data));
  ipcMain.handle('update-invoice', async (_event, data: Invoice) => invoicesService.updateInvoice(db, data));
  ipcMain.handle('duplicate-invoice', async (_event, invoiceId: number, invoiceType: 'quotation' | 'invoice') =>
    invoicesService.duplicateInvoice(db, invoiceId, invoiceType)
  );
};
