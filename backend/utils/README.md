# Backend Utilities

This directory contains utility functions and helpers used throughout the Weinkeller backend application. These utilities provide common functionality that is used by multiple parts of the application.

## Utilities Overview

### Error Handler (errorHandler.js)

The error handler utility provides standardized error handling for the application.

Key features:
- Simple error handling with error types
- Consistent error responses
- Error logging
- HTTP status code mapping

### Logger (logger.js)

The logger utility provides a centralized logging system for the application.

Key features:
- Multiple log levels (debug, info, warn, error)
- Structured logging
- Environment-specific logging configuration

### Swagger (swagger.js)

The Swagger utility configures the OpenAPI/Swagger documentation for the API.

Key features:
- API documentation
- Interactive API testing
- Schema definitions
- API endpoint documentation

## Utility Implementation

### Error Handler Utility

```javascript
// errorHandler.js
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad Request', code = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists', code = 'CONFLICT') {
    super(message, 409, code);
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', code = 'INTERNAL_ERROR') {
    super(message, 500, code);
  }
}

function errorHandlerMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR'
    }
  };
  
  // Log the error
  logger.error(`${statusCode} - ${err.message}`, { 
    url: req.originalUrl,
    method: req.method,
    ...(err.stack && { stack: err.stack })
  });
  
  res.status(statusCode).json(errorResponse);
}

module.exports = {
  AppError,
  BadRequestError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  errorHandlerMiddleware
};
```

### Logger Utility

```javascript
// logger.js
const winston = require('winston');
const path = require('path');

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'weinkeller-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message} ${info.stack || ''}`
        )
      )
    }),
    new winston.transports.File({ 
      filename: path.join(process.env.LOG_DIR || 'logs', 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(process.env.LOG_DIR || 'logs', 'combined.log') 
    })
  ]
});

module.exports = logger;
```

### Swagger Utility

```javascript
// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Weinkeller API',
      version: '1.0.0',
      description: 'API for the Weinkeller wine inventory management system',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
      contact: {
        name: 'API Support',
        email: 'support@weinkeller.example.com'
      }
    },
    servers: [
      {
        url: '/api',
        description: 'API Server'
      }
    ]
  },
  apis: [
    './backend/routes.js',
    './backend/models/*.js',
    './backend/controllers/*.js'
  ]
};

const specs = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true
  }));
  
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
}

module.exports = {
  setupSwagger
};
```

## Usage Examples

### Using the Error Handler

```javascript
import { NotFoundError } from '../utils/errorHandler.js';

// In a service method
async function getWineById(id) {
  const wine = await WineModel.getById(id);
  
  if (!wine) {
    const error = new Error('Wine not found');
    error.type = 'not_found';
    throw error;
  }
  
  return wine;
}
```

### Using the Logger

```javascript
import loggerFactory from '../utils/logger.js';
const logger = loggerFactory('serviceName');

// In a service method
async function importData(data) {
  logger.info('Starting data import', { dataSize: data.length });
  
  try {
    // Import logic...
    logger.info('Data import completed successfully');
  } catch (error) {
    logger.error('Error during data import', { error: error.message, stack: error.stack });
    throw error;
  }
}
```

### Using the Swagger Utility

```javascript
import swaggerSpec from './utils/swagger.js';

// In server.js
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Weinkeller API Documentation'
}));
```

## Best Practices

1. **Centralization**: Keep utility functions centralized to avoid duplication
2. **Separation of Concerns**: Each utility has a single responsibility
3. **Error Handling**: Include proper error handling in utility functions
4. **Logging**: Use the logger utility for consistent logging
5. **Configuration**: Make utilities configurable for different environments
6. **Documentation**: Document utility functions with JSDoc comments
7. **Testing**: Write unit tests for utility functions
