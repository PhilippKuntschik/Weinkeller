/**
 * Swagger/OpenAPI Configuration
 * Provides API documentation for the Weinkeller application
 */

import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import loggerFactory from './logger.js';

// Handle __dirname and __filename which don't exist in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logger = loggerFactory('swagger');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Weinkeller API',
    version: '1.0.0',
    description: 'API documentation for the Weinkeller wine inventory management system',
    contact: {
      name: 'API Support',
      email: 'support@weinkeller.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server'
    }
  ],
  tags: [
    { name: 'Wines', description: 'Wine management endpoints' },
    { name: 'Producers', description: 'Producer management endpoints' },
    { name: 'Inventory', description: 'Inventory management endpoints' },
    { name: 'Assessments', description: 'Wine assessment endpoints' },
    { name: 'Tags', description: 'Tag management endpoints' },
    { name: 'Export/Import', description: 'Data export and import endpoints' },
    { name: 'Health', description: 'Health check endpoints' }
  ],
  components: {
    schemas: {
      Wine: {
        type: 'object',
        required: ['name', 'producer_id'],
        properties: {
          id: {
            type: 'integer',
            description: 'The wine ID'
          },
          name: {
            type: 'string',
            description: 'The wine name'
          },
          producer_id: {
            type: 'integer',
            description: 'The producer ID'
          },
          terroir: {
            type: 'string',
            description: 'The terroir information'
          },
          year: {
            type: 'integer',
            description: 'The vintage year'
          },
          type: {
            type: 'string',
            description: 'The wine type'
          },
          wine_description: {
            type: 'string',
            description: 'Description of the wine'
          },
          grape: {
            type: 'string',
            description: 'The grape variety'
          },
          grape_description: {
            type: 'string',
            description: 'Description of the grape variety'
          },
          bottle_top: {
            type: 'string',
            description: 'The bottle top type'
          },
          bottle_format: {
            type: 'string',
            description: 'The bottle format'
          },
          maturity: {
            type: 'string',
            description: 'The wine maturity'
          },
          wishlist: {
            type: 'integer',
            description: 'Whether the wine is on the wishlist (0 or 1)'
          },
          favorite: {
            type: 'integer',
            description: 'Whether the wine is a favorite (0 or 1)'
          }
        }
      },
      Producer: {
        type: 'object',
        required: ['name'],
        properties: {
          id: {
            type: 'integer',
            description: 'The producer ID'
          },
          name: {
            type: 'string',
            description: 'The producer name'
          },
          description: {
            type: 'string',
            description: 'Description of the producer'
          },
          country: {
            type: 'string',
            description: 'The country of the producer'
          },
          region: {
            type: 'string',
            description: 'The region of the producer'
          },
          website: {
            type: 'string',
            description: 'The producer website'
          },
          geocoordinates: {
            type: 'string',
            description: 'The producer location coordinates'
          },
          contact: {
            type: 'string',
            description: 'Contact information for the producer'
          }
        }
      },
      InventoryEvent: {
        type: 'object',
        required: ['wine_id', 'quantity'],
        properties: {
          id: {
            type: 'integer',
            description: 'The event ID'
          },
          wine_id: {
            type: 'integer',
            description: 'The wine ID'
          },
          event_type: {
            type: 'string',
            description: 'The event type (add, drink)'
          },
          acquisition_type: {
            type: 'string',
            description: 'How the wine was acquired'
          },
          quantity: {
            type: 'integer',
            description: 'The quantity of bottles'
          },
          price: {
            type: 'number',
            description: 'The price per bottle'
          },
          bought_at: {
            type: 'string',
            description: 'Where the wine was purchased'
          },
          event_date: {
            type: 'string',
            format: 'date-time',
            description: 'When the event occurred'
          },
          error_quantity: {
            type: 'integer',
            description: 'Error quantity for consumption events'
          }
        }
      },
      Assessment: {
        type: 'object',
        required: ['wine_id'],
        properties: {
          id: {
            type: 'integer',
            description: 'The assessment ID'
          },
          wine_id: {
            type: 'integer',
            description: 'The wine ID'
          },
          SAT_date: {
            type: 'string',
            format: 'date-time',
            description: 'When the assessment was made'
          },
          appearance_clarity: {
            type: 'string',
            description: 'Wine appearance clarity'
          },
          appearance_intensity: {
            type: 'string',
            description: 'Wine appearance intensity'
          },
          appearance_color: {
            type: 'string',
            description: 'Wine appearance color'
          },
          appearance_observations: {
            type: 'string',
            description: 'Wine appearance observations'
          },
          nose_condition: {
            type: 'string',
            description: 'Wine nose condition'
          },
          nose_intensity: {
            type: 'string',
            description: 'Wine nose intensity'
          },
          nose_development: {
            type: 'string',
            description: 'Wine nose development'
          },
          nose_aromas_primary: {
            type: 'string',
            description: 'Wine primary nose aromas'
          },
          nose_aromas_secondary: {
            type: 'string',
            description: 'Wine secondary nose aromas'
          },
          nose_aromas_tertiary: {
            type: 'string',
            description: 'Wine tertiary nose aromas'
          },
          palate_sweetness: {
            type: 'string',
            description: 'Wine palate sweetness'
          },
          palate_acidity: {
            type: 'string',
            description: 'Wine palate acidity'
          },
          palate_tannin: {
            type: 'string',
            description: 'Wine palate tannin'
          },
          palate_mousse: {
            type: 'string',
            description: 'Wine palate mousse'
          },
          palate_alcohol: {
            type: 'string',
            description: 'Wine palate alcohol'
          },
          palate_body: {
            type: 'string',
            description: 'Wine palate body'
          },
          palate_flavor_intensity: {
            type: 'string',
            description: 'Wine palate flavor intensity'
          },
          palate_flavor_characteristics: {
            type: 'string',
            description: 'Wine palate flavor characteristics'
          },
          palate_aromas_primary: {
            type: 'string',
            description: 'Wine primary palate aromas'
          },
          palate_aromas_secondary: {
            type: 'string',
            description: 'Wine secondary palate aromas'
          },
          palate_aromas_tertiary: {
            type: 'string',
            description: 'Wine tertiary palate aromas'
          },
          palate_finish: {
            type: 'string',
            description: 'Wine palate finish'
          },
          conclusions_quality: {
            type: 'string',
            description: 'Wine quality conclusion'
          },
          conclusions_readiness: {
            type: 'string',
            description: 'Wine readiness conclusion'
          },
          conclusions_aging_potential: {
            type: 'string',
            description: 'Wine aging potential conclusion'
          },
          conclusions_notes: {
            type: 'string',
            description: 'Additional conclusion notes'
          }
        }
      },
      Tag: {
        type: 'object',
        required: ['name'],
        properties: {
          id: {
            type: 'integer',
            description: 'The tag ID'
          },
          name: {
            type: 'string',
            description: 'The tag name'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message'
          }
        }
      }
    }
  }
};

// Swagger options
const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, '../routes.js')], // Path to the API routes file
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

logger.info('Swagger specification initialized');

export default swaggerSpec;
