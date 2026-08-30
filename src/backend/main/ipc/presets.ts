import { ipcMain } from 'electron';
import * as presetsService from '../../shared/services/presets';
import type { DatabaseAdapter } from '../../shared/types/DatabaseAdapter';
import type { Preset } from '../../shared/types/preset';

export const initPresetHandlers = (db: DatabaseAdapter) => {
  ipcMain.handle('add-preset', async (_event, data: Preset) => presetsService.addPreset(db, data));
  ipcMain.handle('update-preset', async (_event, data: Preset) => presetsService.updatePreset(db, data));
  ipcMain.handle('delete-preset', async (_event, id: number) => presetsService.deletePreset(db, id));
  ipcMain.handle('batch-add-preset', async (_event, data: Preset[]) => presetsService.batchAddPreset(db, data));
  ipcMain.handle('get-all-presets', async (_event, filter) => presetsService.getAllPresets(db, filter));
};
