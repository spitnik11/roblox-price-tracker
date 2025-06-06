const fs = require('fs');
const path = require('path');

// Path to watchlist JSON file
const WATCHLIST_FILE = path.join(__dirname, '../../data/watchlist.json');

// In-memory storage of the watchlist
let watchlist = {};

// Last removed item (for undo)
let lastRemovedItem = null;

/**
 * Load the watchlist from disk
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
 * Save the current watchlist to disk
 */
function saveWatchlist() {
    try {
        const clean = Object.fromEntries(
            Object.entries(watchlist).map(([id, item]) => [
                id,
                {
                    id: item.id,
                    thresholdBelow: item.thresholdBelow ?? null,
                    thresholdAbove: item.thresholdAbove ?? null,
                    percentDrop: item.percentDrop ?? null
                }
            ])
        );
        fs.writeFileSync(WATCHLIST_FILE, JSON.stringify(clean, null, 2));
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
 * Add item to watchlist
 */
function addItem(id, thresholds = {}) {
    if (!watchlist[id]) {
        watchlist[id] = {
            id,
            thresholdBelow: thresholds.thresholdBelow ?? null,
            thresholdAbove: thresholds.thresholdAbove ?? null,
            percentDrop: thresholds.percentDrop ?? null
        };
        saveWatchlist();
    } else {
        throw new Error('Item already exists in watchlist');
    }
}

/**
 * Remove item from watchlist
 */
function removeItem(id) {
    if (watchlist[id]) {
        lastRemovedItem = { ...watchlist[id] };
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
        lastRemovedItem = null;
        return restored;
    }
    return null;
}

/**
 * Update thresholds for an item
 */
function updateThresholds(id, thresholds = {}) {
    if (!watchlist[id]) throw new Error('Item not found in watchlist');

    watchlist[id].thresholdBelow = thresholds.thresholdBelow ?? null;
    watchlist[id].thresholdAbove = thresholds.thresholdAbove ?? null;
    watchlist[id].percentDrop = thresholds.percentDrop ?? null;
    saveWatchlist();
}

/**
 * Get single item by ID
 */
function getItem(id) {
    return watchlist[id] || null;
}

/**
 * Format item HTML for display in the Watchlist UI
 * Includes canvas for sparkline + buttons for remove/edit/details
 */
function formatItemHTML(item) {
    const below = item.thresholdBelow !== null ? `Below: R$${item.thresholdBelow}` : '';
    const above = item.thresholdAbove !== null ? `Above: R$${item.thresholdAbove}` : '';
    const drop = item.percentDrop !== null ? `Drop: ${item.percentDrop}%` : '';
    const thresholds = [below, above, drop].filter(Boolean).join(', ');

    return `
        <strong>ID: ${item.id}</strong><br/>
        ${thresholds ? `<span>Threshold: ${thresholds}</span><br/>` : ''}
        <canvas class="sparkline" data-id="${item.id}" height="30" width="100"></canvas>
        <div>
            <button data-remove-id="${item.id}">Remove</button>
            <button data-edit-id="${item.id}">Edit</button>
            <button class="details-btn" data-details-id="${item.id}">Details</button>
        </div>
    `;
}

// Load watchlist on module init
loadWatchlist();

// Export functions
module.exports = {
    getWatchlist,
    addItem,
    removeItem,
    updateThresholds,
    getItem,
    undoLastRemove,
    formatItemHTML
};
