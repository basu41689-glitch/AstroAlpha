/**
 * Logger Utility
 * Simple structured logging with timestamps and levels
 */

const fs = require('fs');
const path = require('path');

const LOG_LEVELS = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG',
};

const LOG_DIR = path.join(__dirname, '../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

class Logger {
    constructor() {
        this.logLevel = process.env.LOG_LEVEL || 'INFO';
        this.enableFileLogging = process.env.ENABLE_FILE_LOGGING !== 'false';
    }

    /**
     * Format log message
     * @param {string} level
     * @param {string} message
     * @param {*} data
     * @returns {string} Formatted message
     */
    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
        return `[${timestamp}] [${level}] ${message}${dataStr}`;
    }

    /**
     * Log to console and file
     * @param {string} level
     * @param {string} message
     * @param {*} data
     */
    log(level, message, data = null) {
        const formatted = this.formatMessage(level, message, data);

        // Console output
        const consoleMethod = level === LOG_LEVELS.ERROR ? 'error' : level === LOG_LEVELS.WARN ? 'warn' : 'log';
        console[consoleMethod](formatted);

        // File logging
        if (this.enableFileLogging) {
            this.writeToFile(formatted);
        }
    }

    /**
     * Write to log file
     * @param {string} message
     */
    writeToFile(message) {
        try {
            const logFile = path.join(LOG_DIR, `options-engine-${new Date().toISOString().split('T')[0]}.log`);
            fs.appendFileSync(logFile, message + '\n');
        } catch (error) {
            console.error('Error writing to log file:', error);
        }
    }

    error(message, data = null) {
        this.log(LOG_LEVELS.ERROR, message, data);
    }

    warn(message, data = null) {
        this.log(LOG_LEVELS.WARN, message, data);
    }

    info(message, data = null) {
        this.log(LOG_LEVELS.INFO, message, data);
    }

    debug(message, data = null) {
        if (this.logLevel === LOG_LEVELS.DEBUG) {
            this.log(LOG_LEVELS.DEBUG, message, data);
        }
    }
}

module.exports = new Logger();
