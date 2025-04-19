# Backend Middleware

This directory contains Express middleware functions used in the Weinkeller application. Middleware functions are used to process requests before they reach the route handlers, providing functionality such as validation, authentication, and error handling.

## Middleware Overview

### Validators (validators.js)

The validators middleware provides request validation for API endpoints. It ensures that incoming requests contain the required data in the correct format before they reach the route handlers.

Key features:
- Custom validation functions without external dependencies
- Consistent error responses
- Validation for required fields, numeric values, and data ranges
- Type checking and data format validation

## Middleware Implementation

### Request Validation

The validation middleware uses custom validation functions without external dependencies:

```javascript
// validators.js

// Helper function to validate required fields
const validateRequired = (obj, fields) => {
  const missingFields = fields.filter(field => !obj[field]);
  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(', ')}`;
  }
  return null;
};

// Helper function to validate numeric fields
const validateNumeric = (obj, fields) => {
  const invalidFields = fields.filter(field => {
    if (!obj[field]) return false; // Skip if field is not provided
    return isNaN(Number(obj[field]));
  });
  
  if (invalidFields.length > 0) {
    return `Invalid numeric fields: ${invalidFields.join(', ')}`;
  }
  return null;
};

// Validation middleware for wine data
export const validateWineData = (req, res, next) => {
  const { name, year, producer_id } = req.body;
  
  // Check required fields
  const requiredError = validateRequired(req.body, ['name', 'producer_id']);
  if (requiredError) {
    const error = new Error(requiredError);
    error.type = 'validation';
    return next(error);
  }
  
  // Check numeric fields
  const numericError = validateNumeric(req.body, ['year', 'producer_id']);
  if (numericError) {
    const error = new Error(numericError);
    error.type = 'validation';
    return next(error);
  }
  
  // Validate year if provided
  if (year && (year < 1800 || year > new Date().getFullYear())) {
    const error = new Error(`Year must be between 1800 and ${new Date().getFullYear()}`);
    error.type = 'validation';
    return next(error);
  }
  
  next();
};
```

## Usage in Routes

The middleware is used in the route definitions:

```javascript
// routes.js
import express from 'express';
import { 
  validateWineData, 
  validateProducerData, 
  validateInventoryEvent, 
  validateWineConsumption,
  validateWSET 
} from './middleware/validators.js';

const router = express.Router();

// Wine routes
router.post('/add_or_update_wine_data', validateWineData, async (req, res, next) => {
  try {
    const wine = await WineService.createOrUpdateWine(req.body);
    res.status(201).json(wine);
  } catch (err) {
    next(err);
  }
});

// Producer routes
router.post('/add_or_update_producer_data', validateProducerData, async (req, res, next) => {
  try {
    const producer = await ProducerService.createOrUpdateProducer(req.body);
    res.status(201).json(producer);
  } catch (err) {
    next(err);
  }
});

// Other routes...

export default router;
```

## Additional Middleware

### Error Handling Middleware

While not in this directory, the application uses error handling middleware to catch and format errors:

```javascript
// errorHandler.js
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
```

## Best Practices

1. **Separation of Concerns**: Each middleware has a single responsibility
2. **Error Handling**: Middleware includes proper error handling and passes errors to the next middleware
3. **Validation**: Request validation is performed before processing the request
4. **Reusability**: Middleware is designed to be reusable across multiple routes
5. **Security**: Validation middleware helps prevent security issues by validating input data
