import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';

export const initAutoUpdaterHandlers = (mainWindow: BrowserWindow) => {
  ipcMain.on('restart-app', () => {
    autoUpdater.quitAndInstall();
  });
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });
  ipcMain.on('check-for-updates', () => {
    autoUpdater.checkForUpdates();
  });
  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update-available');
  });
  autoUpdater.on('update-downloaded', info => {
    mainWindow.webContents.send('update-downloaded', info.version);
  });
  autoUpdater.on('download-progress', progress => {
    mainWindow.webContents.send('update-progress', progress);
  });
  autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('update-not-available');
  });
};
