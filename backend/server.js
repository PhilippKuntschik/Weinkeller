import express from 'express';
import path from 'path';
import fs from 'fs';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Handle __dirname and __filename which don't exist in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import local modules
import swaggerSpec from './utils/swagger.js';
import routes from './routes.js'; // Import routes
import errorHandler from './utils/errorHandler.js'; // Import error handler
import loggerFactory from './utils/logger.js';
const logger = loggerFactory('server'); // Import logger

const app = express();
const port = 3000;

// Log startup information
logger.info('Starting Weinkeller server...');
logger.info(`Node environment: ${process.env.NODE_ENV || 'development'}`);
logger.info(`Log level: ${process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')}`);

// Middleware
app.use(express.json());

// HTTP request logging
// Using dynamic import for the logger to avoid circular dependencies
app.use(morgan('combined', { 
  stream: (await import('./utils/logger.js')).default('http').stream 
}));

// Configure Express to pretty-print JSON responses
app.set('json spaces', 2);

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Weinkeller API Documentation'
}));

// Log all API requests
app.use('/', (req, res, next) => {
  logger.debug(`API request: ${req.method} ${req.url}`, { 
    headers: req.headers,
    query: req.query,
    body: req.body 
  });
  next();
});

// Use routes
app.use('/api', routes);


// Check if frontend build directory exists
const frontendBuildPath = path.join(__dirname, '../run/frontend');
if (fs.existsSync(frontendBuildPath)) {
  logger.info(`Frontend build directory found at: ${frontendBuildPath}`);
  
  // Log the contents of the frontend build directory
  try {
    const buildDirContents = fs.readdirSync(frontendBuildPath);
    logger.debug('Frontend build directory contents:', { files: buildDirContents });
  } catch (err) {
    logger.error('Error reading frontend build directory:', { error: err.message });
  }
  
  // Serve the React frontend
  app.use(express.static(frontendBuildPath, {
    // Set proper MIME types for JavaScript modules
    setHeaders: (res, filePath) => {
      logger.debug(`Serving static file: ${filePath}`);
      if (filePath.endsWith('.js')) {
        logger.debug(`Setting Content-Type: application/javascript for ${filePath}`);
        res.setHeader('Content-Type', 'application/javascript');
      }
    }
  }));
  
  // Handle all other routes by serving the React index.html
  const indexHtmlPath = path.join(frontendBuildPath, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    logger.info(`index.html found at: ${indexHtmlPath}`);
    
    // Add routes for specific frontend paths
    app.get('/', (req, res) => {
      logger.debug(`Serving index.html for path: ${req.url}`);
      res.sendFile(indexHtmlPath);
    });
    
    // Add routes for specific frontend routes
    const frontendRoutes = [
      '/inventory-overview',
      '/all-wines',
      '/all-producers',
      '/add-wine',
      '/edit-wine/:id',
      '/add-producer',
      '/edit-producer/:id',
      '/add-to-inventory',
      '/consume-wine',
      '/all-assessments',
      '/add-assessment',
      '/edit-assessment/:id',
      '/import-export',
      '/wine-analytics'
    ];
    
    frontendRoutes.forEach(route => {
      app.get(route, (req, res) => {
        logger.debug(`Serving index.html for frontend route: ${req.url}`);
        res.sendFile(indexHtmlPath);
      });
    });
  } else {
    logger.error(`index.html not found at: ${indexHtmlPath}`);
    app.get('/', (req, res) => {
      res.status(500).send('Frontend build is incomplete: index.html not found');
    });
  }
} else {
  logger.error(`Frontend build directory not found at: ${frontendBuildPath}`);
  app.get('/', (req, res) => {
    res.status(500).send('Frontend build directory not found');
  });
}

// Add a specific error handler for frontend routes
app.use((err, req, res, next) => {
  logger.error('Frontend error:', { error: err.message, stack: err.stack, url: req.url });
  if (!res.headersSent) {
    res.status(500).send('Internal Server Error');
  }
  next(err);
});

// Error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
  logger.error('API error:', { error: err.message, stack: err.stack, url: req.url });
  // Pass the error to the imported errorHandler
  errorHandler(err, req, res, next);
});

// Check if we're only initializing the database
if (process.env.DB_INIT_ONLY === 'true') {
  logger.info('Database initialization mode. Initializing database without starting server...');
  
  // Exit after initialization
  setTimeout(() => {
    logger.info('Database initialization complete. Exiting...');
    process.exit(0);
  }, 2000); // Give some time for async operations to complete
} else {
  // Start server normally
  app.listen(port, () => {
    logger.info(`Server is running on http://localhost:${port}`);
  });
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', { error: err.message, stack: err.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection:', { reason: reason.toString(), stack: reason.stack });
});
