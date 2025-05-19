const { app, BrowserWindow } = require('electron');
const path = require('path');

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

// App lifecycle
app.whenReady().then(() => {
    createDashboardWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createDashboardWindow();
        }
    });
});

app.on('window-all-closed', () => {
    // Keep app running only on macOS
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Expose for use in other files if needed
module.exports = {
    createDashboardWindow,
    createWatchlistWindow,
};
