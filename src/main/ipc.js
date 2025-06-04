// src/main/ipc.js

// Electron IPC module
const { ipcMain } = require('electron');

// Feature-specific IPC modules
require('./ipc/watchlist-ipc')(ipcMain);
require('./ipc/alerts-ipc')(ipcMain);

// Roblox price refresh handler with per-item cooldown
const { fetchLimitedPrice } = require('./api');

// Watchlist manager with threshold and undo support
const watchlistManager = require('./watchlist'); // Adjust path if needed

// Cooldown tracking per item
const itemCooldownMap = {};

/**
 * Check if the specified item can be refreshed based on 30s cooldown
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
 * Handles refresh-data request from renderer with item-specific cooldown
 */
ipcMain.handle('refresh-data', async (event, itemId) => {
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
 * Handle threshold editing request from renderer
 */
ipcMain.handle('edit-threshold', async (event, { id, threshold }) => {
    try {
        await watchlistManager.updateThreshold(id, threshold);
        return { success: true };
    } catch (err) {
        return { error: 'Failed to update threshold' };
    }
});

/**
 * Handle undo of last removed item
 */
ipcMain.handle('undo-remove', async () => {
    try {
        const restoredItem = watchlistManager.undoLastRemove();
        if (restoredItem) {
            return { success: true, item: restoredItem };
        } else {
            return { error: 'No item to undo' };
        }
    } catch (err) {
        return { error: 'Undo failed' };
    }
});
