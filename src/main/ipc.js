// Import Electron's IPC module for main process communication
const { ipcMain } = require('electron');

// Import the function to fetch price data from the Roblox API
const { fetchLimitedPrice } = require('./api');

// Handle 'refresh-data' event from the renderer process
// This is used when the dashboard asks for an updated price
ipcMain.handle('refresh-data', async (event, itemId) => {
    // Fetch and return the latest price data for the given itemId
    return await fetchLimitedPrice(itemId);
});

// Handle 'add-item' event from the renderer process
// This is used when the user adds a new item to their watchlist
ipcMain.handle('add-item', async (event, itemId) => {
    // For now, just fetch the item data — later this will also update persistent storage
    return await fetchLimitedPrice(itemId);
});
