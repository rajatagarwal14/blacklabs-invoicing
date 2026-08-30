import { ipcMain } from 'electron';
import * as categoriesService from '../../shared/services/categories';
import type { Category } from '../../shared/types/category';
import type { DatabaseAdapter } from '../../shared/types/DatabaseAdapter';

export const initCategoriesHandlers = (db: DatabaseAdapter) => {
  ipcMain.handle('add-category', async (_event, data: Category) => categoriesService.addCategory(db, data));
  ipcMain.handle('update-category', async (_event, data: Category) => categoriesService.updateCategory(db, data));
  ipcMain.handle('delete-category', async (_event, id: number) => categoriesService.deleteCategory(db, id));
  ipcMain.handle('batch-add-category', async (_event, data: Category[]) =>
    categoriesService.batchAddCategory(db, data)
  );
  ipcMain.handle('get-all-categories', async (_event, filter) => categoriesService.getAllCategories(db, filter));
};
