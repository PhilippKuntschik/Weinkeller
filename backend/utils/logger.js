/**
 * Logger configuration using Winston
 * 
 * This module configures Winston for logging throughout the application.
 * Log levels can be controlled via the LOG_LEVEL environment variable.
 * 
 * Log levels (from most to least verbose):
 * - silly
 * - debug
 * - verbose
 * - http
 * - info
 * - warn
 * - error
 * 
 * Default log level is 'info' in production and 'debug' in development.
 */

import winston from 'winston';

// Define log level based on environment variable or NODE_ENV
const getLogLevel = () => {
  const logLevel = process.env.LOG_LEVEL;
  if (logLevel) {
    return logLevel;
  }
  
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
};

// Create the logger
const logger = winston.createLogger({
  level: getLogLevel(),
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'weinkeller' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
        })
      )
    })
  ]
});

// Create a stream object for use with morgan HTTP logger
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Export a function to get a logger for a specific module
export default function(module) {
  return {
    error: (message, meta = {}) => logger.error(message, { module, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { module, ...meta }),
    info: (message, meta = {}) => logger.info(message, { module, ...meta }),
    http: (message, meta = {}) => logger.http(message, { module, ...meta }),
    verbose: (message, meta = {}) => logger.verbose(message, { module, ...meta }),
    debug: (message, meta = {}) => logger.debug(message, { module, ...meta }),
    silly: (message, meta = {}) => logger.silly(message, { module, ...meta })
  };
};
