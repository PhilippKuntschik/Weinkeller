# Service Layer Architecture

This directory contains the service layer for the Weinkeller application. The service layer is responsible for implementing business logic and acts as an intermediary between the route handlers and the data models.

## Directory Structure

```
services/
├── assessmentService.js
├── exportImportService.js
├── inventoryService.js
├── producerService.js
├── tagService.js
├── wineService.js
├── index.js
└── README.md
```

## Service Responsibilities

### WineService

Handles all wine-related operations, including:
- Creating and updating wines
- Retrieving wines
- Wine data formatting

### ProducerService

Handles all producer-related operations, including:
- Creating and updating producers
- Retrieving producers
- Producer data formatting

### InventoryService

Handles all inventory-related operations, including:
- Adding wine to inventory
- Consuming wine from inventory
- Retrieving inventory history
- Calculating current inventory

### AssessmentService

Handles all assessment-related operations, including:
- Creating and updating assessments
- Retrieving assessments
- Assessment data formatting

### TagService

Handles all tag-related operations, including:
- Creating and retrieving tags of all types (grape, wine type, country, region, occasion, food pairing)
- Managing relationships between tags and wines/producers
- Querying wines/producers by tags

### ExportImportService

Handles data export and import operations, including:
- Exporting wines, inventory, and producers to JSON
- Importing data from JSON

## Design Principles

1. **Separation of Concerns**: Each service is responsible for a specific domain of the application.
2. **Single Responsibility**: Each service method has a single responsibility.
3. **DRY (Don't Repeat Yourself)**: Common functionality is extracted into helper functions.
4. **Error Handling**: Services include proper error handling and logging.

## Usage

Services are imported and used in the route handlers. For example:

```javascript
const { WineService } = require('./services');

router.get('/wines', async (req, res, next) => {
  try {
    const wines = await WineService.getAllWines();
    res.json(wines);
  } catch (err) {
    next(err);
  }
});
```

## Error Handling

Services include proper error handling and logging. Errors are propagated to the route handlers, which use the error handler middleware to format and return error responses.
