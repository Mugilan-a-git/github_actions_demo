const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// Disable automatic downloading for Phase 3
autoUpdater.autoDownload = false;

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  ipcMain.handle('get-version', () => app.getVersion());
  
  ipcMain.handle('check-for-updates', async () => {
    if (!app.isPackaged) {
      console.log('Update check skipped in development mode.');
      return { status: 'error', message: 'Update check skipped in development mode.' };
    }
    console.log('Checking for updates...');
    
    return new Promise((resolve) => {
      const onAvailable = (info) => { cleanup(); resolve({ status: 'available', version: info.version }); };
      const onNotAvailable = () => { cleanup(); resolve({ status: 'not-available', version: app.getVersion() }); };
      const onError = (err) => { cleanup(); resolve({ status: 'error', message: err.message }); };
      
      const cleanup = () => {
        autoUpdater.removeListener('update-available', onAvailable);
        autoUpdater.removeListener('update-not-available', onNotAvailable);
        autoUpdater.removeListener('error', onError);
      };
      
      autoUpdater.once('update-available', onAvailable);
      autoUpdater.once('update-not-available', onNotAvailable);
      autoUpdater.once('error', onError);
      
      autoUpdater.checkForUpdates().catch(err => {
        cleanup();
        resolve({ status: 'error', message: err.message });
      });
    });
  });

  ipcMain.handle('download-update', async () => {
    console.log('Starting update download...');
    try {
      await autoUpdater.downloadUpdate();
      return { status: 'success' };
    } catch (error) {
      console.error('Failed to download update:', error);
      return { status: 'error', message: error.message };
    }
  });

  ipcMain.handle('install-update', () => {
    console.log('Quitting and installing update...');
    autoUpdater.quitAndInstall();
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    console.log(`Download progress: ${progressObj.percent}%`);
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('update-progress', progressObj);
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('update-downloaded', info);
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available. Current version is latest.');
  });

  autoUpdater.on('error', (err) => {
    console.error('Error in auto-updater:', err);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
