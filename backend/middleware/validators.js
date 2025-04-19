/**
 * Custom validation middleware functions
 * Provides input validation without external dependencies
 */

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

// Validation middleware for producer data
export const validateProducerData = (req, res, next) => {
  const { name } = req.body;
  
  // Check required fields
  const requiredError = validateRequired(req.body, ['name']);
  if (requiredError) {
    const error = new Error(requiredError);
    error.type = 'validation';
    return next(error);
  }
  
  next();
};

// Validation middleware for inventory events
export const validateInventoryEvent = (req, res, next) => {
  const { wine_id, quantity, event_type } = req.body;
  
  // Check required fields
  const requiredError = validateRequired(req.body, ['wine_id', 'quantity']);
  if (requiredError) {
    const error = new Error(requiredError);
    error.type = 'validation';
    return next(error);
  }
  
  // Check numeric fields
  const numericError = validateNumeric(req.body, ['wine_id', 'quantity', 'price']);
  if (numericError) {
    const error = new Error(numericError);
    error.type = 'validation';
    return next(error);
  }
  
  // Validate quantity
  if (quantity <= 0) {
    const error = new Error('Quantity must be greater than 0');
    error.type = 'validation';
    return next(error);
  }
  
  next();
};

// Validation middleware for wine consumption
export const validateWineConsumption = (req, res, next) => {
  const { wine_id, quantity } = req.body;
  
  // Check required fields
  const requiredError = validateRequired(req.body, ['wine_id', 'quantity']);
  if (requiredError) {
    const error = new Error(requiredError);
    error.type = 'validation';
    return next(error);
  }
  
  // Check numeric fields
  const numericError = validateNumeric(req.body, ['wine_id', 'quantity', 'error_quantity']);
  if (numericError) {
    const error = new Error(numericError);
    error.type = 'validation';
    return next(error);
  }
  
  // Validate quantity
  if (quantity <= 0) {
    const error = new Error('Quantity must be greater than 0');
    error.type = 'validation';
    return next(error);
  }
  
  next();
};

// Validation middleware for assessment data
export const validateWSET = (req, res, next) => {
  const { wine_id } = req.body;
  
  // Check required fields
  const requiredError = validateRequired(req.body, ['wine_id']);
  if (requiredError) {
    const error = new Error(requiredError);
    error.type = 'validation';
    return next(error);
  }
  
  // Check numeric fields
  const numericError = validateNumeric(req.body, ['wine_id']);
  if (numericError) {
    const error = new Error(numericError);
    error.type = 'validation';
    return next(error);
  }
  
  next();
};
