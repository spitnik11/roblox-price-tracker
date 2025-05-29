// src/main/ipc/watchlist-ipc.js

const { fetchLimitedPrice } = require('../api');
const { getWatchlist, addItem, removeItem } = require('../watchlistStore');

module.exports = (ipcMain) => {
    /**
     * Handle getting the current watchlist
     * @returns {Array} Array of watchlist items
     */
    ipcMain.handle('get-watchlist', () => {
        return getWatchlist();
    });

    /**
     * Handle adding a new item to the watchlist
     * Fetches data first, then adds only if valid and not already present
     * @param {String} itemId - Roblox limited item ID
     * @returns {Object} Fetched item data or error object
     */
    ipcMain.handle('add-item', async (event, itemId) => {
        if (!itemId) {
            return { error: 'Invalid item ID' };
        }

        try {
            const itemData = await fetchLimitedPrice(itemId);

            if (!itemData || !itemData.id) {
                return { error: 'Failed to fetch valid item data' };
            }

            addItem(itemData); // Handles duplicate checking internally
            return itemData;
        } catch (error) {
            return { error: 'Failed to add item' };
        }
    });

    /**
     * Handle removing an item from the watchlist by ID
     * @param {String} itemId - Roblox limited item ID
     */
    ipcMain.handle('remove-item', (event, itemId) => {
        if (!itemId) return;
        removeItem(itemId);
    });
};
