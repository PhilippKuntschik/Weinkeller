/**
 * @module TagService
 * @description Service layer for tag-related operations
 * 
 * This service handles all business logic related to various types of tags, including:
 * - Grape tags
 * - Wine type tags
 * - Country tags
 * - Region tags
 * - Occasion tags
 * - Food pairing tags
 * 
 * It acts as an intermediary between the route handlers and the database,
 * providing a clean separation of concerns.
 */

import { db } from '../db.js';
import loggerFactory from '../utils/logger.js';
const logger = loggerFactory('tagService');

export const TagService = {
  /**
   * Get all grape tags
   * 
   * @returns {Promise<Array>} Array of grape tag objects
   * @throws {Error} If database operation fails
   */
  /**
   * Get a country tag for a producer
   * 
   * @param {number} producerId - Producer ID
   * @returns {Promise<Object>} Country tag object or null if not found
   * @throws {Error} If database operation fails
   */
  getCountryTagForProducer: async (producerId) => {
    try {
      logger.debug(`Fetching country tag for producer ID: ${producerId}`);
      return new Promise((resolve, reject) => {
        db.get(
          `SELECT ct.* FROM country_tags ct
           JOIN producer_country_tags pct ON ct.id = pct.country_tag_id
           WHERE pct.producer_id = ?`,
          [producerId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row || null);
          }
        );
      });
    } catch (err) {
      logger.error(`Error getting country tag for producer ID ${producerId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get a region tag for a producer
   * 
   * @param {number} producerId - Producer ID
   * @returns {Promise<Object>} Region tag object or null if not found
   * @throws {Error} If database operation fails
   */
  getRegionTagForProducer: async (producerId) => {
    try {
      logger.debug(`Fetching region tag for producer ID: ${producerId}`);
      return new Promise((resolve, reject) => {
        db.get(
          `SELECT rt.* FROM region_tags rt
           JOIN producer_region_tags prt ON rt.id = prt.region_tag_id
           WHERE prt.producer_id = ?`,
          [producerId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row || null);
          }
        );
      });
    } catch (err) {
      logger.error(`Error getting region tag for producer ID ${producerId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Update country tag for a producer
   * 
   * @param {number} producerId - Producer ID
   * @param {number} countryTagId - Country tag ID
   * @returns {Promise<void>}
   * @throws {Error} If database operation fails
   */
  updateCountryTagForProducer: async (producerId, countryTagId) => {
    try {
      logger.debug(`Updating country tag for producer ID: ${producerId} to tag ID: ${countryTagId}`);
      
      // First, clear existing country tags for this producer
      await new Promise((resolve, reject) => {
        db.run(
          `DELETE FROM producer_country_tags WHERE producer_id = ?`,
          [producerId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      // Then add the new country tag
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO producer_country_tags (producer_id, country_tag_id) VALUES (?, ?)`,
          [producerId, countryTagId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
    } catch (err) {
      logger.error(`Error updating country tag for producer ID ${producerId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Update region tag for a producer
   * 
   * @param {number} producerId - Producer ID
   * @param {number} regionTagId - Region tag ID
   * @returns {Promise<void>}
   * @throws {Error} If database operation fails
   */
  updateRegionTagForProducer: async (producerId, regionTagId) => {
    try {
      logger.debug(`Updating region tag for producer ID: ${producerId} to tag ID: ${regionTagId}`);
      
      // First, clear existing region tags for this producer
      await new Promise((resolve, reject) => {
        db.run(
          `DELETE FROM producer_region_tags WHERE producer_id = ?`,
          [producerId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      // Then add the new region tag
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO producer_region_tags (producer_id, region_tag_id) VALUES (?, ?)`,
          [producerId, regionTagId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
    } catch (err) {
      logger.error(`Error updating region tag for producer ID ${producerId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get all grape tags
   * 
   * @returns {Promise<Array>} Array of grape tag objects
   * @throws {Error} If database operation fails
   */
  getAllGrapeTags: async () => {
    try {
      logger.debug('Fetching all grape tags from database');
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM grape_tags ORDER BY name', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    } catch (err) {
      logger.error('Error getting all grape tags:', { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Create a new grape tag
   * 
   * @param {string} name - Tag name
   * @returns {Promise<Object>} Created tag object
   * @throws {Error} If database operation fails or validation fails
   */
  createGrapeTag: async (name) => {
    try {
      logger.debug(`Creating grape tag: ${name}`);
      
      if (!name || typeof name !== 'string' || name.trim() === '') {
        const error = new Error('Grape tag name is required');
        error.type = 'validation';
        throw error;
      }
      
      const tag = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO grape_tags (name) VALUES (?)',
          [name],
          function(err) {
            if (err) reject(err);
            else {
              db.get('SELECT * FROM grape_tags WHERE id = ?', [this.lastID], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            }
          }
        );
      });
      
      
      return tag;
    } catch (err) {
      logger.error(`Error creating grape tag "${name}":`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get wines with a specific grape tag
   * 
   * @param {number} grapeTagId - Grape tag ID
   * @returns {Promise<Array>} Array of wine objects with the specified grape tag
   * @throws {Error} If database operation fails
   */
  getWinesByGrapeTag: async (grapeTagId) => {
    try {
      logger.debug(`Fetching wines with grape tag ID: ${grapeTagId}`);
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT w.* FROM wines w
           JOIN wine_grape_tags wgt ON w.id = wgt.wine_id
           WHERE wgt.grape_tag_id = ?`,
          [grapeTagId],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
    } catch (err) {
      logger.error(`Error getting wines with grape tag ID ${grapeTagId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get all wine type tags
   * 
   * @returns {Promise<Array>} Array of wine type tag objects
   * @throws {Error} If database operation fails
   */
  getAllWineTypeTags: async () => {
    try {
      logger.debug('Fetching all wine type tags from database');
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM wine_type_tags ORDER BY name', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    } catch (err) {
      logger.error('Error getting all wine type tags:', { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Create a new wine type tag
   * 
   * @param {string} name - Tag name
   * @returns {Promise<Object>} Created tag object
   * @throws {Error} If database operation fails or validation fails
   */
  createWineTypeTag: async (name) => {
    try {
      logger.debug(`Creating wine type tag: ${name}`);
      
      if (!name || typeof name !== 'string' || name.trim() === '') {
        const error = new Error('Wine type tag name is required');
        error.type = 'validation';
        throw error;
      }
      
      const tag = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO wine_type_tags (name) VALUES (?)',
          [name],
          function(err) {
            if (err) reject(err);
            else {
              db.get('SELECT * FROM wine_type_tags WHERE id = ?', [this.lastID], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            }
          }
        );
      });
      
      
      return tag;
    } catch (err) {
      logger.error(`Error creating wine type tag "${name}":`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get wines with a specific wine type tag
   * 
   * @param {number} wineTypeTagId - Wine type tag ID
   * @returns {Promise<Array>} Array of wine objects with the specified wine type tag
   * @throws {Error} If database operation fails
   */
  getWinesByWineTypeTag: async (wineTypeTagId) => {
    try {
      logger.debug(`Fetching wines with wine type tag ID: ${wineTypeTagId}`);
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT w.* FROM wines w
           JOIN wine_wine_type_tags wwtt ON w.id = wwtt.wine_id
           WHERE wwtt.wine_type_tag_id = ?`,
          [wineTypeTagId],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
    } catch (err) {
      logger.error(`Error getting wines with wine type tag ID ${wineTypeTagId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get all country tags
   * 
   * @returns {Promise<Array>} Array of country tag objects
   * @throws {Error} If database operation fails
   */
  getAllCountryTags: async () => {
    try {
      logger.debug('Fetching all country tags from database');
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM country_tags ORDER BY name', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    } catch (err) {
      logger.error('Error getting all country tags:', { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Create a new country tag
   * 
   * @param {string} name - Tag name
   * @returns {Promise<Object>} Created tag object
   * @throws {Error} If database operation fails or validation fails
   */
  createCountryTag: async (name) => {
    try {
      logger.debug(`Creating country tag: ${name}`);
      
      if (!name || typeof name !== 'string' || name.trim() === '') {
        const error = new Error('Country tag name is required');
        error.type = 'validation';
        throw error;
      }
      
      const tag = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO country_tags (name) VALUES (?)',
          [name],
          function(err) {
            if (err) reject(err);
            else {
              db.get('SELECT * FROM country_tags WHERE id = ?', [this.lastID], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            }
          }
        );
      });
      
      
      return tag;
    } catch (err) {
      logger.error(`Error creating country tag "${name}":`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get producers with a specific country tag
   * 
   * @param {number} countryTagId - Country tag ID
   * @returns {Promise<Array>} Array of producer objects with the specified country tag
   * @throws {Error} If database operation fails
   */
  getProducersByCountryTag: async (countryTagId) => {
    try {
      logger.debug(`Fetching producers with country tag ID: ${countryTagId}`);
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT p.* FROM producers p
           JOIN producer_country_tags pct ON p.id = pct.producer_id
           WHERE pct.country_tag_id = ?`,
          [countryTagId],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
    } catch (err) {
      logger.error(`Error getting producers with country tag ID ${countryTagId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get all region tags
   * 
   * @returns {Promise<Array>} Array of region tag objects
   * @throws {Error} If database operation fails
   */
  getAllRegionTags: async () => {
    try {
      logger.debug('Fetching all region tags from database');
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM region_tags ORDER BY name', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    } catch (err) {
      logger.error('Error getting all region tags:', { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Create a new region tag
   * 
   * @param {string} name - Tag name
   * @returns {Promise<Object>} Created tag object
   * @throws {Error} If database operation fails or validation fails
   */
  createRegionTag: async (name) => {
    try {
      logger.debug(`Creating region tag: ${name}`);
      
      if (!name || typeof name !== 'string' || name.trim() === '') {
        const error = new Error('Region tag name is required');
        error.type = 'validation';
        throw error;
      }
      
      const tag = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO region_tags (name) VALUES (?)',
          [name],
          function(err) {
            if (err) reject(err);
            else {
              db.get('SELECT * FROM region_tags WHERE id = ?', [this.lastID], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            }
          }
        );
      });
      
      
      return tag;
    } catch (err) {
      logger.error(`Error creating region tag "${name}":`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get producers with a specific region tag
   * 
   * @param {number} regionTagId - Region tag ID
   * @returns {Promise<Array>} Array of producer objects with the specified region tag
   * @throws {Error} If database operation fails
   */
  getProducersByRegionTag: async (regionTagId) => {
    try {
      logger.debug(`Fetching producers with region tag ID: ${regionTagId}`);
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT p.* FROM producers p
           JOIN producer_region_tags prt ON p.id = prt.producer_id
           WHERE prt.region_tag_id = ?`,
          [regionTagId],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
    } catch (err) {
      logger.error(`Error getting producers with region tag ID ${regionTagId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get all occasion tags
   * 
   * @returns {Promise<Array>} Array of occasion tag objects
   * @throws {Error} If database operation fails
   */
  getAllOccasionTags: async () => {
    try {
      logger.debug('Fetching all occasion tags from database');
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM occasion_tags ORDER BY name', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    } catch (err) {
      logger.error('Error getting all occasion tags:', { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Create a new occasion tag
   * 
   * @param {string} name - Tag name
   * @returns {Promise<Object>} Created tag object
   * @throws {Error} If database operation fails or validation fails
   */
  createOccasionTag: async (name) => {
    try {
      logger.debug(`Creating occasion tag: ${name}`);
      
      if (!name || typeof name !== 'string' || name.trim() === '') {
        const error = new Error('Occasion tag name is required');
        error.type = 'validation';
        throw error;
      }
      
      const tag = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO occasion_tags (name) VALUES (?)',
          [name],
          function(err) {
            if (err) reject(err);
            else {
              db.get('SELECT * FROM occasion_tags WHERE id = ?', [this.lastID], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            }
          }
        );
      });
      
      
      return tag;
    } catch (err) {
      logger.error(`Error creating occasion tag "${name}":`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get wines with a specific occasion tag
   * 
   * @param {number} occasionTagId - Occasion tag ID
   * @returns {Promise<Array>} Array of wine objects with the specified occasion tag
   * @throws {Error} If database operation fails
   */
  getWinesByOccasionTag: async (occasionTagId) => {
    try {
      logger.debug(`Fetching wines with occasion tag ID: ${occasionTagId}`);
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT w.* FROM wines w
           JOIN wine_occasion_tags wot ON w.id = wot.wine_id
           WHERE wot.occasion_tag_id = ?`,
          [occasionTagId],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
    } catch (err) {
      logger.error(`Error getting wines with occasion tag ID ${occasionTagId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get all food pairing tags
   * 
   * @returns {Promise<Array>} Array of food pairing tag objects
   * @throws {Error} If database operation fails
   */
  getAllFoodPairingTags: async () => {
    try {
      logger.debug('Fetching all food pairing tags from database');
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM food_pairing_tags ORDER BY name', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    } catch (err) {
      logger.error('Error getting all food pairing tags:', { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Create a new food pairing tag
   * 
   * @param {string} name - Tag name
   * @returns {Promise<Object>} Created tag object
   * @throws {Error} If database operation fails or validation fails
   */
  createFoodPairingTag: async (name) => {
    try {
      logger.debug(`Creating food pairing tag: ${name}`);
      
      if (!name || typeof name !== 'string' || name.trim() === '') {
        const error = new Error('Food pairing tag name is required');
        error.type = 'validation';
        throw error;
      }
      
      const tag = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO food_pairing_tags (name) VALUES (?)',
          [name],
          function(err) {
            if (err) reject(err);
            else {
              db.get('SELECT * FROM food_pairing_tags WHERE id = ?', [this.lastID], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            }
          }
        );
      });
      
      
      return tag;
    } catch (err) {
      logger.error(`Error creating food pairing tag "${name}":`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get wines with a specific food pairing tag
   * 
   * @param {number} foodPairingTagId - Food pairing tag ID
   * @returns {Promise<Array>} Array of wine objects with the specified food pairing tag
   * @throws {Error} If database operation fails
   */
  getWinesByFoodPairingTag: async (foodPairingTagId) => {
    try {
      logger.debug(`Fetching wines with food pairing tag ID: ${foodPairingTagId}`);
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT w.* FROM wines w
           JOIN wine_food_pairing_tags wfpt ON w.id = wfpt.wine_id
           WHERE wfpt.food_pairing_tag_id = ?`,
          [foodPairingTagId],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
    } catch (err) {
      logger.error(`Error getting wines with food pairing tag ID ${foodPairingTagId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  }
};
