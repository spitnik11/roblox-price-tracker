// src/main/watchlistStore.js

// Internal in-memory array to hold Roblox item entries
let watchlist = [];

/**
 * Returns a shallow copy of the current watchlist.
 * Prevents external modules from mutating the internal state directly.
 * @returns {Array} List of tracked Roblox limited items
 */
function getWatchlist() {
    return [...watchlist];
}

/**
 * Adds a new item to the watchlist if it does not already exist.
 * Relies on `item.id` for uniqueness.
 * @param {Object} item - A Roblox limited item object with at least an `id` field
 */
function addItem(item) {
    if (!item || !item.id) return;

    const exists = watchlist.some(w => w.id === item.id);
    if (!exists) {
        watchlist.push(item);
    }
}

/**
 * Removes an item from the watchlist by its unique ID.
 * @param {String|Number} itemId - ID of the item to remove
 */
function removeItem(itemId) {
    watchlist = watchlist.filter(item => item.id !== itemId);
}

/**
 * Clears the entire watchlist.
 * Useful for debugging or resetting state.
 */
function clearWatchlist() {
    watchlist = [];
}

// Export public API
module.exports = {
    getWatchlist,
    addItem,
    removeItem,
    clearWatchlist // Optional utility
};
