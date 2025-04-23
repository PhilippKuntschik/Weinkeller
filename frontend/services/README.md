# Frontend Service Layer Architecture

This directory contains the service layer for the Weinkeller frontend application. The service layer is responsible for interacting with the backend API and providing data to the frontend components.

## Directory Structure

```
services/
├── api.js
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

### api.js

Provides a centralized API client for making HTTP requests, including:
- Pre-configured axios instance
- Generic error handling
- Request/response processing

### wineService.js

Handles all wine-related API operations, including:
- Retrieving wines
- Creating and updating wines
- Wine data formatting

### producerService.js

Handles all producer-related API operations, including:
- Retrieving producers
- Creating and updating producers
- Producer data formatting

### inventoryService.js

Handles all inventory-related API operations, including:
- Adding wine to inventory
- Consuming wine from inventory
- Retrieving inventory data

### assessmentService.js

Handles all assessment-related API operations, including:
- Retrieving assessments
- Creating and updating assessments
- Assessment data formatting

### tagService.js

Handles all tag-related API operations, including:
- Retrieving tags of all types (grape, wine type, country, region, occasion, food pairing)
- Creating new tags
- Updating tag associations with wines/producers
- Querying wines/producers by tags

### exportImportService.js

Handles all export and import operations, including:
- Exporting data as JSON (all data, wines only, inventory only)
- Importing data from JSON files

## Design Principles

1. **Separation of Concerns**: Each service is responsible for a specific domain of the application.
2. **Single Responsibility**: Each service method has a single responsibility.
3. **DRY (Don't Repeat Yourself)**: Common functionality is extracted into helper functions.
4. **Error Handling**: Services include proper error handling.
5. **Consistent API**: Services provide a consistent API for interacting with the backend.

## Usage

Services are imported and used in the React components. For example:

```javascript
import { wineService } from '../services';
import { useState, useEffect } from 'react';

function WineList() {
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWines = async () => {
      try {
        const data = await wineService.getAllWines();
        setWines(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWines();
  }, []);

  // Component rendering logic
}
```

## Error Handling

The `handleApiRequest` function in api.js provides centralized error handling for all API requests. It catches HTTP errors and transforms them into user-friendly error messages.
