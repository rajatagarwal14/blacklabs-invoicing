import { ipcMain } from 'electron';
import * as businessesService from '../../shared/services/businesses';
import type { Business } from '../../shared/types/business';
import type { DatabaseAdapter } from '../../shared/types/DatabaseAdapter';

export const initBusinessesHandlers = (db: DatabaseAdapter) => {
  ipcMain.handle('add-business', async (_event, data: Business) => businessesService.addBusiness(db, data));
  ipcMain.handle('update-business', async (_event, data: Business) => businessesService.updateBusiness(db, data));
  ipcMain.handle('delete-business', async (_event, id: number) => businessesService.deleteBusiness(db, id));
  ipcMain.handle('batch-add-business', async (_event, data: Business[]) =>
    businessesService.batchAddBusiness(db, data)
  );
  ipcMain.handle('get-all-businesses', async (_event, filter) => businessesService.getAllBusinesses(db, filter));
};
