# Configuration

This directory contains configuration files for the Weinkeller application. These files control various aspects of the application's behavior and can be customized for different environments.

## Configuration Files

### Vite Configuration (vite.config.js)

The Vite configuration file controls the build process for the frontend application.

Key features:
- Development server configuration
- Build optimization settings
- Plugin configuration
- Environment variable handling
- Path aliases

### Environment Variables (.env.example)

The `.env.example` file provides a template for environment variables used by the application. To use these variables, copy this file to `.env` and customize the values.

## Configuration Implementation

### Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../frontend')
    }
  },
  build: {
    outDir: '../run/frontend',
    emptyOutDir: true,
    sourcemap: true
  },
  define: {
    'process.env': {}
  }
});
```

### Environment Variables

```
# .env.example

# Node Environment
NODE_ENV=development

# Server Configuration
PORT=3000
HOST=localhost

# Database Configuration
DB_PATH=./run/database/wine_inventory.db

# Logging Configuration
LOG_LEVEL=info
LOG_DIR=./logs

# Frontend Configuration
VITE_API_URL=/api
VITE_DEFAULT_LANGUAGE=en
```

## Environment Variables

The application uses the following environment variables:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| NODE_ENV | Node.js environment (development, production, test) | development |
| PORT | Port for the server to listen on | 3000 |
| HOST | Host for the server to bind to | localhost |
| DB_PATH | Path to the SQLite database file | ./run/database/wine_inventory.db |
| LOG_LEVEL | Logging level (error, warn, info, http, verbose, debug, silly) | info in production, debug in development |
| LOG_DIR | Directory for log files | ./logs |
| VITE_API_URL | URL for the API (used by the frontend) | /api |
| VITE_DEFAULT_LANGUAGE | Default language for the frontend | en |

## Environment-Specific Configuration

The application supports different configurations for different environments:

### Development

Development configuration is optimized for local development:
- Detailed logging
- Source maps
- Hot module replacement
- Proxy for API requests

### Production

Production configuration is optimized for performance and security:
- Minified code
- Optimized assets
- Reduced logging
- Caching

### Test

Test configuration is optimized for testing:
- In-memory database
- Mocked services
- Detailed error reporting

## Using Configuration in Code

### Backend

```javascript
// server.js
require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';
const dbPath = process.env.DB_PATH || './run/database/wine_inventory.db';

// Use configuration values
app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
```

### Frontend

```javascript
// config.js
const config = {
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  defaultLanguage: import.meta.env.VITE_DEFAULT_LANGUAGE || 'en'
};

export default config;
```

## Best Practices

1. **Environment Variables**: Use environment variables for configuration that varies between environments
2. **Defaults**: Provide sensible default values for all configuration options
3. **Validation**: Validate configuration values at startup
4. **Centralization**: Keep configuration centralized and well-documented
5. **Secrets**: Never commit sensitive information (passwords, API keys) to version control
6. **Documentation**: Document all configuration options and their effects
7. **Separation**: Separate configuration from code
