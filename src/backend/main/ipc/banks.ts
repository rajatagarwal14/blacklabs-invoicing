import { ipcMain } from 'electron';
import * as banksService from '../../shared/services/banks';
import type { DatabaseAdapter } from '../../shared/types/DatabaseAdapter';
import type { Bank } from '../../shared/types/bank';

export const initBanksHandlers = (db: DatabaseAdapter) => {
  ipcMain.handle('add-bank', async (_event, data: Bank) => banksService.addBank(db, data));
  ipcMain.handle('update-bank', async (_event, data: Bank) => banksService.updateBank(db, data));
  ipcMain.handle('delete-bank', async (_event, id: number) => banksService.deleteBank(db, id));
  ipcMain.handle('batch-add-bank', async (_event, data: Bank[]) => banksService.batchAddBank(db, data));
  ipcMain.handle('get-all-banks', async (_event, filter) => banksService.getAllBanks(db, filter));
};
