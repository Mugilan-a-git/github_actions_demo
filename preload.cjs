const { ipcRenderer } = require('electron');

window.electronAPI = {
  getVersion: () => ipcRenderer.invoke('get-version')
};
