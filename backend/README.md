# Weinkeller Backend

This is the backend for the Weinkeller wine inventory management system. It provides a RESTful API for managing wines, producers, inventory, and assessments.

## Architecture Improvements

The backend has been improved with the following architectural enhancements:

### 1. OpenAPI/Swagger Documentation

- Added Swagger UI for API documentation at `/api-docs`
- Documented API endpoints with OpenAPI annotations
- Defined schemas for all data models
- Provides interactive API testing capabilities

### 2. Service Layer

- Implemented a service layer between routes and models
- Separates business logic from data access
- Improves code organization and maintainability
- Makes the codebase more testable

### 3. Improved Code Documentation

- Enhanced JSDoc comments for all functions
- Module-level documentation
- Better error handling and logging
- Clear separation of concerns

## Project Structure

```
backend/
├── middleware/         # Express middleware
│   └── validators.js   # Request validation
├── models/             # Data access layer
│   ├── AssessmentModel.js
│   ├── inventoryModel.js
│   ├── producerModel.js
│   └── wineModel.js
├── services/           # Business logic layer
│   ├── assessmentService.js
│   ├── exportImportService.js
│   ├── inventoryService.js
│   ├── producerService.js
│   ├── tagService.js
│   ├── wineService.js
│   └── index.js        # Service exports
├── utils/              # Utility functions
│   ├── errorHandler.js # Error handling middleware
│   ├── logger.js       # Logging utility
│   └── swagger.js      # Swagger configuration
├── db.js               # Database connection
├── routes.js           # API routes
└── server.js           # Express server
```

## API Documentation

The API documentation is available at `/api-docs` when the server is running. It provides detailed information about all available endpoints, request/response schemas, and allows for interactive testing.

## Service Layer

The service layer is responsible for:

- Business logic
- Data validation
- Error handling

Each service module corresponds to a specific domain:

- `WineService` - Wine-related operations
- `ProducerService` - Producer-related operations
- `InventoryService` - Inventory-related operations
- `AssessmentService` - Assessment-related operations
- `TagService` - Tag-related operations
- `ExportImportService` - Export/import operations

## Running the Server

```bash
# Install dependencies
npm install

# Start the server
npm start

# Start the server in development mode
npm run dev
```

The server will be available at http://localhost:3000.

## API Endpoints

The API provides endpoints for:

- Wines
- Producers
- Inventory
- Assessments
- Tags (Grape, Wine Type, Country, Region, Occasion, Food Pairing)
- Export/Import

For detailed information about the API endpoints, please refer to the Swagger documentation at `/api-docs`.
