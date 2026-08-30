import { ipcMain } from 'electron';
import * as currenciesService from '../../shared/services/currencies';
import type { Currency } from '../../shared/types/currency';
import type { DatabaseAdapter } from '../../shared/types/DatabaseAdapter';

export const initCurrenciesHandlers = (db: DatabaseAdapter) => {
  ipcMain.handle('add-currency', async (_event, data: Currency) => currenciesService.addCurrency(db, data));
  ipcMain.handle('update-currency', async (_event, data: Currency) => currenciesService.updateCurrency(db, data));
  ipcMain.handle('delete-currency', async (_event, id: number) => currenciesService.deleteCurrency(db, id));
  ipcMain.handle('batch-add-currency', async (_event, data: Currency[]) =>
    currenciesService.batchAddCurrency(db, data)
  );
  ipcMain.handle('get-all-currencies', async (_event, filter) => currenciesService.getAllCurrencies(db, filter));
};
