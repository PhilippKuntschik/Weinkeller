/**
 * Centralized error handler for the application
 * Provides consistent error responses and logging
 */

import loggerFactory from './logger.js';
const logger = loggerFactory('errorHandler');

const errorHandler = (err, req, res, next) => {
  // Log the error with details
  logger.error('Error handling request:', {
    url: req.url,
    method: req.method,
    error: err.message,
    stack: err.stack,
    type: err.type
  });
  
  // Handle specific error types
  if (err.type === 'validation') {
    logger.debug('Validation error:', { details: err.details || err.message });
    return res.status(400).json({ error: err.message });
  }
  
  if (err.type === 'not_found') {
    logger.debug('Not found error:', { resource: err.resource || req.url });
    return res.status(404).json({ error: err.message });
  }
  
  // Default to 500 Internal Server Error for unhandled errors
  logger.error('Unhandled error:', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal Server Error' });
};

export default errorHandler;
