// src/shared/logger.js

const log = require('electron-log');
const path = require('path');
const fs = require('fs');

// Ensure the logs directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Set log file path based on environment (dev or prod)
log.transports.file.resolvePath = () => {
    const filename = process.env.NODE_ENV === 'development' ? 'dev.log' : 'main.log';
    return path.join(logDir, filename);
};

// Format for console and file output
log.transports.console.format = '{h}:{i}:{s} [{level}] {text}';
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}';

// Set minimum logging levels
log.transports.file.level = 'info';
log.transports.console.level = 'warn'; // Only warn and error messages in console

// Export the logger
module.exports = log;
