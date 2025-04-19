/**
 * Database initialization and connection module
 * 
 * This module handles:
 * 1. Database file initialization (creating directories and files if needed)
 * 2. Database connection
 * 3. Database schema initialization (creating tables)
 */

import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import loggerFactory from './utils/logger.js';

// Handle __dirname and __filename which don't exist in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logger = loggerFactory('database');

// Get database path from environment variable or use default
const dbPath = process.env.DB_PATH 
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, '../run/database/wine_inventory.db');

logger.info(`Database path: ${dbPath}`);

// Create directory for database if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  logger.info(`Creating database directory: ${dbDir}`);
  try {
    fs.mkdirSync(dbDir, { recursive: true });
    logger.info(`Database directory created successfully: ${dbDir}`);
    
    // Check directory permissions
    const stats = fs.statSync(dbDir);
    logger.debug(`Database directory permissions: ${stats.mode.toString(8)}`);
  } catch (err) {
    logger.error(`Error creating database directory: ${dbDir}`, { error: err.message, stack: err.stack });
    throw err;
  }
}

// Check if database file exists
if (!fs.existsSync(dbPath)) {
  logger.info(`Database file not found at ${dbPath}. Creating new database.`);
  
  // If there's a template database in the codebase, copy it
  const templateDbPath = path.resolve(__dirname, '../run/database/wine_inventory.db');
  if (fs.existsSync(templateDbPath) && dbPath !== templateDbPath) {
    logger.info(`Copying template database from ${templateDbPath}`);
    try {
      fs.copyFileSync(templateDbPath, dbPath);
      logger.info('Template database copied successfully.');
      
      // Check file permissions
      const stats = fs.statSync(dbPath);
      logger.debug(`Database file permissions: ${stats.mode.toString(8)}`);
    } catch (err) {
      logger.error(`Error copying template database`, { error: err.message, stack: err.stack });
      throw err;
    }
  } else {
    // Create an empty file to ensure SQLite can connect
    try {
      fs.writeFileSync(dbPath, '');
      logger.info('Empty database file created.');
      
      // Check file permissions
      const stats = fs.statSync(dbPath);
      logger.debug(`Database file permissions: ${stats.mode.toString(8)}`);
    } catch (err) {
      logger.error(`Error creating empty database file`, { error: err.message, stack: err.stack });
      throw err;
    }
  }
}

logger.info(`Database initialized at ${dbPath}`);

// Connect to the database
logger.info(`Connecting to SQLite database at: ${dbPath}`);
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error('Error connecting to SQLite database:', { error: err.message, stack: err.stack });
  } else {
    logger.info('Connected to SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  logger.debug('Initializing database tables...');
  const createProducersTableQuery = `
    CREATE TABLE IF NOT EXISTS producers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      country TEXT,
      region TEXT,
      website TEXT,
      geocoordinates TEXT,
      contact TEXT
    );
  `;

  const createCountryTagsTable = `
    CREATE TABLE IF NOT EXISTS country_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `;

  const createRegionTagsTable = `
    CREATE TABLE IF NOT EXISTS region_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `;

  const createProducerCountryTagsTable = `
    CREATE TABLE IF NOT EXISTS producer_country_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producer_id INTEGER NOT NULL,
      country_tag_id INTEGER NOT NULL,
      FOREIGN KEY (producer_id) REFERENCES producers(id),
      FOREIGN KEY (country_tag_id) REFERENCES country_tags(id)
    );
  `;

  const createProducerRegionTagsTable = `
    CREATE TABLE IF NOT EXISTS producer_region_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producer_id INTEGER NOT NULL,
      region_tag_id INTEGER NOT NULL,
      FOREIGN KEY (producer_id) REFERENCES producers(id),
      FOREIGN KEY (region_tag_id) REFERENCES region_tags(id)
    );
  `;

  const createWinesTableQuery = `
    CREATE TABLE IF NOT EXISTS wines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      producer_id INTEGER,
      terroir TEXT,
      year INTEGER,
      type TEXT,
      wine_description TEXT,
      grape TEXT,
      grape_description TEXT,
      bottle_top TEXT,
      bottle_format TEXT,
      maturity TEXT,
      wishlist INTEGER DEFAULT 0,
      favorite INTEGER DEFAULT 0,
      FOREIGN KEY (producer_id) REFERENCES producers (id)
    );
  `;

  const createWineEventsTableQuery = `
    CREATE TABLE IF NOT EXISTS wine_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wine_id INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      acquisition_type TEXT,
      quantity INTEGER NOT NULL,
      price REAL,
      bought_at TEXT,
      event_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      error_quantity INTEGER DEFAULT 0,
      FOREIGN KEY (wine_id) REFERENCES wines (id)
    );
  `;

  const createGrapeTagsTable = `
    CREATE TABLE IF NOT EXISTS grape_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `;

  const createWineGrapeTagsTable = `
    CREATE TABLE IF NOT EXISTS wine_grape_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wine_id INTEGER NOT NULL,
      grape_tag_id INTEGER NOT NULL,
      FOREIGN KEY (wine_id) REFERENCES wines(id),
      FOREIGN KEY (grape_tag_id) REFERENCES grape_tags(id)
    );
  `;

  const createWineTypeTagsTable = `
    CREATE TABLE IF NOT EXISTS wine_type_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `;

  const createWineWineTypeTagsTable = `
    CREATE TABLE IF NOT EXISTS wine_wine_type_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wine_id INTEGER NOT NULL,
      wine_type_tag_id INTEGER NOT NULL,
      FOREIGN KEY (wine_id) REFERENCES wines(id),
      FOREIGN KEY (wine_type_tag_id) REFERENCES wine_type_tags(id)
    );
  `;
  
  const createOccasionTagsTable = `
    CREATE TABLE IF NOT EXISTS occasion_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `;
  
  const createWineOccasionTagsTable = `
    CREATE TABLE IF NOT EXISTS wine_occasion_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wine_id INTEGER NOT NULL,
      occasion_tag_id INTEGER NOT NULL,
      FOREIGN KEY (wine_id) REFERENCES wines(id),
      FOREIGN KEY (occasion_tag_id) REFERENCES occasion_tags(id)
    );
  `;
  
  const createFoodPairingTagsTable = `
    CREATE TABLE IF NOT EXISTS food_pairing_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `;
  
  const createWineFoodPairingTagsTable = `
    CREATE TABLE IF NOT EXISTS wine_food_pairing_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wine_id INTEGER NOT NULL,
      food_pairing_tag_id INTEGER NOT NULL,
      FOREIGN KEY (wine_id) REFERENCES wines(id),
      FOREIGN KEY (food_pairing_tag_id) REFERENCES food_pairing_tags(id)
    );
  `;

  const createassessmentsTable = `
    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wine_id INTEGER NOT NULL,
      SAT_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      appearance_clarity TEXT,
      appearance_intensity TEXT,
      appearance_color TEXT,
      appearance_observations TEXT,
      
      nose_condition TEXT,
      nose_intensity TEXT,
      nose_development TEXT,
      nose_aromas_primary TEXT,
      nose_aromas_secondary TEXT,
      nose_aromas_tertiary TEXT,
      
      palate_sweetness TEXT,
      palate_acidity TEXT,
      palate_tannin TEXT,
      palate_mousse TEXT,
      palate_alcohol TEXT,
      palate_body TEXT,
      palate_flavor_intensity TEXT,
      palate_flavor_characteristics TEXT,
      palate_aromas_primary TEXT,
      palate_aromas_secondary TEXT,
      palate_aromas_tertiary TEXT,
      palate_finish TEXT,
      
      conclusions_quality TEXT,
      conclusions_readiness TEXT,
      conclusions_aging_potential TEXT,
      conclusions_notes TEXT,
      
      FOREIGN KEY (wine_id) REFERENCES wines (id)
    );
  `;

  db.run(createProducersTableQuery, (err) => {
    if (err) {
      logger.error('Error initializing producers table:', { error: err.message });
    } else {
      logger.info('Producers table initialized successfully.');
    }
  });

  db.run(createWinesTableQuery, (err) => {
    if (err) {
      logger.error('Error initializing wines table:', { error: err.message });
    } else {
      logger.info('Wines table initialized successfully.');
    }
  });

  db.run(createWineEventsTableQuery, (err) => {
    if (err) {
      logger.error('Error initializing wine_events table:', { error: err.message });
    } else {
      logger.info('Wine events table initialized successfully.');
    }
  });

  db.run(createGrapeTagsTable, (err) => {
    if (err) {
      logger.error('Error initializing grape_tags table:', { error: err.message });
    } else {
      logger.info('Grape tags table initialized successfully.');
    }
  });

  db.run(createWineGrapeTagsTable, (err) => {
    if (err) {
      logger.error('Error initializing wine_grape_tags table:', { error: err.message });
    } else {
      logger.info('Wine grape tags table initialized successfully.');
    }
  });

  db.run(createWineTypeTagsTable, (err) => {
    if (err) {
      logger.error('Error initializing wine_type_tags table:', { error: err.message });
    } else {
      logger.info('Wine type tags table initialized successfully.');
    }
  });

  db.run(createWineWineTypeTagsTable, (err) => {
    if (err) {
      logger.error('Error initializing wine_wine_type_tags table:', { error: err.message });
    } else {
      logger.info('Wine wine type tags table initialized successfully.');
    }
  });

  db.run(createassessmentsTable, (err) => {
    if (err) {
      logger.error('Error initializing assessments table:', { error: err.message });
    } else {
      logger.info('assessments table initialized successfully.');
    }
  });

  // Initialize country and region tags tables
  db.run(createCountryTagsTable, (err) => {
    if (err) {
      logger.error('Error initializing country_tags table:', { error: err.message });
    } else {
      logger.info('Country tags table initialized successfully.');
    }
  });

  db.run(createRegionTagsTable, (err) => {
    if (err) {
      logger.error('Error initializing region_tags table:', { error: err.message });
    } else {
      logger.info('Region tags table initialized successfully.');
    }
  });

  db.run(createProducerCountryTagsTable, (err) => {
    if (err) {
      logger.error('Error initializing producer_country_tags table:', { error: err.message });
    } else {
      logger.info('Producer country tags table initialized successfully.');
    }
  });

  db.run(createProducerRegionTagsTable, (err) => {
    if (err) {
      logger.error('Error initializing producer_region_tags table:', { error: err.message });
    } else {
      logger.info('Producer region tags table initialized successfully.');
    }
  });
  
  // Initialize occasion tags tables
  db.run(createOccasionTagsTable, (err) => {
    if (err) {
      logger.error('Error initializing occasion_tags table:', { error: err.message });
    } else {
      logger.info('Occasion tags table initialized successfully.');
      
      // Pre-populate occasion tags
      const occasionTags = ['Connoisseur', 'Special', 'Summer', 'Winter'];
      occasionTags.forEach(tag => {
        db.run('INSERT OR IGNORE INTO occasion_tags (name) VALUES (?)', [tag], (err) => {
          if (err) {
            logger.error(`Error inserting occasion tag ${tag}:`, { error: err.message });
          } else {
            logger.info(`Occasion tag ${tag} initialized successfully.`);
          }
        });
      });
    }
  });
  
  db.run(createWineOccasionTagsTable, (err) => {
    if (err) {
      logger.error('Error initializing wine_occasion_tags table:', { error: err.message });
    } else {
      logger.info('Wine occasion tags table initialized successfully.');
    }
  });
  
  // Initialize food pairing tags tables
  db.run(createFoodPairingTagsTable, (err) => {
    if (err) {
      logger.error('Error initializing food_pairing_tags table:', { error: err.message });
    } else {
      logger.info('Food pairing tags table initialized successfully.');
      
      // Pre-populate food pairing tags
      const foodPairingTags = ['Red Meat', 'Poultry', 'Seafood', 'Pasta', 'Cheese', 'Dessert', 'Spicy Food', 'Vegetarian'];
      foodPairingTags.forEach(tag => {
        db.run('INSERT OR IGNORE INTO food_pairing_tags (name) VALUES (?)', [tag], (err) => {
          if (err) {
            logger.error(`Error inserting food pairing tag ${tag}:`, { error: err.message });
          } else {
            logger.info(`Food pairing tag ${tag} initialized successfully.`);
          }
        });
      });
    }
  });
  
  db.run(createWineFoodPairingTagsTable, (err) => {
    if (err) {
      logger.error('Error initializing wine_food_pairing_tags table:', { error: err.message });
    } else {
      logger.info('Wine food pairing tags table initialized successfully.');
    }
  });
}

// Export both the database connection and the path
export { db, dbPath };
