const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Search Roblox items by name (autocomplete)
    searchItemsByName: (query) => ipcRenderer.invoke('search-items', query),

    // Refresh price data for an item
    refreshData: (itemId) => ipcRenderer.invoke('refresh-data', itemId),

    // Edit thresholds for alerts
    editThresholds: (data) => ipcRenderer.invoke('edit-thresholds', data),

    // Undo the last watchlist removal
    undoRemove: () => ipcRenderer.invoke('undo-remove'),

    // Fetch full item details for modal
    getItemDetails: (itemId) => ipcRenderer.invoke('get-item-details', itemId),

    // Log error to main process (optional if you implemented this)
    logError: (message) => ipcRenderer.send('log-error', message)
});
