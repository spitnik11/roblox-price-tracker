const fs = require('fs');
const path = require('path');

// File path to persist the watchlist
const WATCHLIST_FILE = path.join(__dirname, '../../data/watchlist.json');

// In-memory watchlist: { [id]: { id, threshold } }
let watchlist = {};

// Store last removed item for undo functionality
let lastRemovedItem = null;

/**
 * Load the watchlist from file if it exists
 */
function loadWatchlist() {
    try {
        if (fs.existsSync(WATCHLIST_FILE)) {
            const data = fs.readFileSync(WATCHLIST_FILE, 'utf-8');
            watchlist = JSON.parse(data);
        }
    } catch (err) {
        console.error('Failed to load watchlist:', err);
        watchlist = {};
    }
}

/**
 * Save the current watchlist to file
 */
function saveWatchlist() {
    try {
        fs.writeFileSync(WATCHLIST_FILE, JSON.stringify(watchlist, null, 2));
    } catch (err) {
        console.error('Failed to save watchlist:', err);
    }
}

/**
 * Get full watchlist as array
 */
function getWatchlist() {
    return Object.values(watchlist);
}

/**
 * Add item to watchlist with optional threshold
 */
function addItem(id, threshold = null) {
    if (!watchlist[id]) {
        watchlist[id] = { id, threshold };
        saveWatchlist();
    } else {
        throw new Error('Item already exists in watchlist');
    }
}

/**
 * Remove item from watchlist (with undo support)
 */
function removeItem(id) {
    if (watchlist[id]) {
        lastRemovedItem = { ...watchlist[id] }; // Store for undo
        delete watchlist[id];
        saveWatchlist();
    }
}

/**
 * Undo the last removed item
 */
function undoLastRemove() {
    if (lastRemovedItem && !watchlist[lastRemovedItem.id]) {
        watchlist[lastRemovedItem.id] = lastRemovedItem;
        saveWatchlist();
        const restored = lastRemovedItem;
        lastRemovedItem = null; // Clear after use
        return restored;
    }
    return null;
}

/**
 * Update threshold for an item
 */
function updateThreshold(id, threshold) {
    if (watchlist[id]) {
        watchlist[id].threshold = threshold;
        saveWatchlist();
    } else {
        throw new Error('Item not found in watchlist');
    }
}

/**
 * Get a specific item's info
 */
function getItem(id) {
    return watchlist[id] || null;
}

// Load watchlist from disk on startup
loadWatchlist();

// Export manager API
module.exports = {
    getWatchlist,
    addItem,
    removeItem,
    updateThreshold,
    getItem,
    undoLastRemove, // Exported for Task 4 undo
};
