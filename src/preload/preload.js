const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Refresh price for a single item
    refreshData: (itemId) => ipcRenderer.invoke('refresh-data', itemId),

    // Watchlist item controls
    addItem: (item) => ipcRenderer.invoke('add-item', item),
    removeItem: (itemId) => ipcRenderer.invoke('remove-item', itemId),
    editThresholds: (payload) => ipcRenderer.invoke('edit-thresholds', payload),
    getWatchlist: () => ipcRenderer.invoke('get-watchlist'),
    undoRemove: () => ipcRenderer.invoke('undo-remove'),

    // Search and item info
    searchItemsByName: (query) => ipcRenderer.invoke('search-items', query),
    getItemDetails: (itemId) => ipcRenderer.invoke('get-item-details'),

    // Sparkline price history
    getPriceHistory: (itemId) => ipcRenderer.invoke('get-price-history'),

    // Logging
    logError: (message) => ipcRenderer.send('log-error', message),
});
