import { ipcMain } from 'electron';
import * as settingsService from '../../shared/services/settings';
import type { DatabaseAdapter } from '../../shared/types/DatabaseAdapter';
import type { Settings } from '../../shared/types/settings';

export const initSettingsHandlers = (db: DatabaseAdapter) => {
  ipcMain.handle('get-all-settings', async () => settingsService.getAllSettings(db));
  ipcMain.handle('update-settings', async (_event, data: Settings) => settingsService.updateSettings(db, data));
};
