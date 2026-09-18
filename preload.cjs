const { ipcRenderer } = require('electron');

window.electronAPI = {
  getVersion: () => ipcRenderer.invoke('get-version'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates')
};
