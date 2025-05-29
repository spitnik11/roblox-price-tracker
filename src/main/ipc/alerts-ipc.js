// src/main/ipc/alerts-ipc.js

const { checkPriceAlert } = require('../alerts');

module.exports = (ipcMain) => {
    /**
     * Checks if the current price triggers an alert based on a threshold.
     * This is useful for on-demand UI checks or silent backend monitoring.
     *
     * @param {Object} event - IPC event (not used here)
     * @param {Object} data - Payload with currentPrice and threshold
     * @returns {Boolean|Object} True/false if valid input; otherwise returns an error
     */
    ipcMain.handle('check-alert', (event, data) => {
        const { currentPrice, threshold } = data || {};

        if (typeof currentPrice !== 'number' || typeof threshold !== 'number') {
            return { error: 'Invalid input for alert check' };
        }

        return checkPriceAlert(currentPrice, threshold);
    });
};
