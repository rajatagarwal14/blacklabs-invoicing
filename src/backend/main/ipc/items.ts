import { ipcMain } from 'electron';
import * as itemsService from '../../shared/services/items';
import type { DatabaseAdapter } from '../../shared/types/DatabaseAdapter';
import type { Item } from '../../shared/types/item';

export const initItemsHandlers = (db: DatabaseAdapter) => {
  ipcMain.handle('add-item', async (_event, data: Item) => itemsService.addItem(db, data));
  ipcMain.handle('update-item', async (_event, data: Item) => itemsService.updateItem(db, data));
  ipcMain.handle('delete-item', async (_event, id: number) => itemsService.deleteItem(db, id));
  ipcMain.handle('batch-add-item', async (_event, data: Item[]) => itemsService.batchAddItem(db, data));
  ipcMain.handle('get-all-items', async (_event, filter) => itemsService.getAllItems(db, filter));
};
