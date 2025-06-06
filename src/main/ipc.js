const { ipcMain } = require('electron');

// Modular feature-specific handlers
require('./ipc/watchlist-ipc')(ipcMain);
require('./ipc/alerts-ipc')(ipcMain);

// API functions
const {
    fetchLimitedPrice,
    searchItemsByName,
    fetchItemDetails,
    getMockPriceHistory
} = require('./api');

const watchlistManager = require('./watchlist');

// Cooldown map to prevent rapid refreshes
const itemCooldownMap = {};

/**
 * Helper: Check 30-second cooldown per item
 */
function canRefreshItem(itemId) {
    const now = Date.now();
    const lastTime = itemCooldownMap[itemId] || 0;

    if (now - lastTime >= 30000) {
        itemCooldownMap[itemId] = now;
        return true;
    }
    return false;
}

/**
 * Handle price refresh from dashboard (with per-item cooldown)
 */
ipcMain.handle('refresh-data', async (_event, itemId) => {
    if (!canRefreshItem(itemId)) {
        return { error: 'Cooldown in effect' };
    }

    try {
        const data = await fetchLimitedPrice(itemId);
        return data;
    } catch (error) {
        return { error: 'Failed to fetch data' };
    }
});

/**
 * Handle threshold update from UI
 */
ipcMain.handle('edit-thresholds', async (_event, { id, thresholds }) => {
    try {
        watchlistManager.updateThresholds(id, thresholds);
        return { success: true };
    } catch (err) {
        return { error: 'Failed to update thresholds' };
    }
});

/**
 * Handle undo for last removed item from watchlist
 */
ipcMain.handle('undo-remove', async () => {
    try {
        const restoredItem = watchlistManager.undoLastRemove();
        return restoredItem
            ? { success: true, item: restoredItem }
            : { error: 'No item to undo' };
    } catch (err) {
        return { error: 'Undo failed' };
    }
});

/**
 * Handle item search by name for autocomplete input
 */
ipcMain.handle('search-items', async (_event, query) => {
    return await searchItemsByName(query);
});

/**
 * Handle detailed modal info request for a given item
 */
ipcMain.handle('get-item-details', async (_event, itemId) => {
    try {
        const details = await fetchItemDetails(itemId);
        return details;
    } catch (err) {
        return { error: 'Unable to fetch item details' };
    }
});

/**
 * Handle price history request for sparklines
 */
ipcMain.handle('get-price-history', async (_event, itemId) => {
    return getMockPriceHistory(itemId);
});
