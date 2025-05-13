const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    refreshPrices: () => ipcRenderer.invoke('refresh-data'),
});
