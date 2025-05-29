// src/main/main.js

const { app, BrowserWindow } = require('electron');
const path = require('path');

// Import centralized logger
const log = require('../shared/logger');

// Handle uncaught exceptions in the main process
process.on('uncaughtException', (err) => {
    log.error('Uncaught Exception:', err);
});

// Handle unhandled promise rejections in the main process
process.on('unhandledRejection', (reason) => {
    log.error('Unhandled Rejection:', reason);
});

/**
 * Create and configure the Dashboard window
 */
function createDashboardWindow() {
    const dashboardWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
        },
    });

    dashboardWindow.loadFile(path.join(__dirname, '../renderer/pages/dashboard.html'));
}

/**
 * Create and configure the Watchlist window
 */
function createWatchlistWindow() {
    const watchlistWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
        },
    });

    watchlistWindow.loadFile(path.join(__dirname, '../renderer/pages/watchlist.html'));
}

// App lifecycle: when ready, create the Dashboard window
app.whenReady().then(() => {
    createDashboardWindow();

    app.on('activate', () => {
        // Recreate a window if none are open (macOS behavior)
        if (BrowserWindow.getAllWindows().length === 0) {
            createDashboardWindow();
        }
    });
});

// Close app unless on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Export functions if needed in other modules
module.exports = {
    createDashboardWindow,
    createWatchlistWindow,
};
