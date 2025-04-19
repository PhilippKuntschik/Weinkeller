/**
 * @module ProducerService
 * @description Service layer for producer-related operations
 * 
 * This service handles all business logic related to wine producers, including:
 * - Retrieving producers with associated tags
 * - Creating and updating producers
 * - Managing producer tags
 * 
 * It acts as an intermediary between the route handlers and the data models,
 * providing a clean separation of concerns.
 */

import { ProducerModel } from '../models/producerModel.js';
import { db } from '../db.js';
import loggerFactory from '../utils/logger.js';
const logger = loggerFactory('producerService');

export const ProducerService = {
  /**
   * Get all producers with their associated tags
   * 
   * @returns {Promise<Array>} Array of producer objects with tags
   * @throws {Error} If database operation fails
   */
  getAllProducers: async () => {
    try {
      logger.debug('Fetching all producers from database');
      const producers = await ProducerModel.getAll();
      
      // Get country and region tags for all producers
      return Promise.all(producers.map(async (producer) => {
        // Get country tag
        const countryTag = await new Promise((resolve, reject) => {
          db.get(
            `SELECT ct.* FROM country_tags ct
             JOIN producer_country_tags pct ON ct.id = pct.country_tag_id
             WHERE pct.producer_id = ?`,
            [producer.id],
            (err, row) => {
              if (err) reject(err);
              else resolve(row || null);
            }
          );
        });
        
        // Get region tag
        const regionTag = await new Promise((resolve, reject) => {
          db.get(
            `SELECT rt.* FROM region_tags rt
             JOIN producer_region_tags prt ON rt.id = prt.region_tag_id
             WHERE prt.producer_id = ?`,
            [producer.id],
            (err, row) => {
              if (err) reject(err);
              else resolve(row || null);
            }
          );
        });
        
        return {
          ...producer,
          country_tag: countryTag || null,
          region_tag: regionTag || null
        };
      }));
    } catch (err) {
      logger.error('Error getting all producers:', { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get a producer by ID with all associated tags and wines
   * 
   * @param {number} id - Producer ID
   * @returns {Promise<Object>} Producer object with tags and wines
   * @throws {Error} If producer not found or database operation fails
   */
  getProducerById: async (id) => {
    try {
      logger.debug(`Fetching producer with ID: ${id}`);
      const producer = await ProducerModel.getById(id);
      
      if (!producer) {
        const error = new Error('Producer not found');
        error.type = 'not_found';
        throw error;
      }
      
      // Get wines from this producer
      const wines = await ProducerModel.getWines(id);
      
      // Get country tag
      const countryTag = await new Promise((resolve, reject) => {
        db.get(
          `SELECT ct.* FROM country_tags ct
           JOIN producer_country_tags pct ON ct.id = pct.country_tag_id
           WHERE pct.producer_id = ?`,
          [id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row || null);
          }
        );
      });
      
      // Get region tag
      const regionTag = await new Promise((resolve, reject) => {
        db.get(
          `SELECT rt.* FROM region_tags rt
           JOIN producer_region_tags prt ON rt.id = prt.region_tag_id
           WHERE prt.producer_id = ?`,
          [id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row || null);
          }
        );
      });
      
      return {
        ...producer,
        wines,
        country_tag: countryTag || null,
        region_tag: regionTag || null
      };
    } catch (err) {
      logger.error(`Error getting producer with ID ${id}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Create or update a producer with associated tags
   * 
   * @param {Object} producerData - Producer data including tag IDs
   * @returns {Promise<Object>} Created/updated producer object
   * @throws {Error} If database operation fails
   */
  createOrUpdateProducer: async (producerData) => {
    try {
      logger.debug('Creating or updating producer:', { name: producerData.name, id: producerData.id });
      
      const {
        country_tag_id,
        region_tag_id,
        ...producerCore
      } = producerData;
      
      // Create or update the producer
      const producer = await ProducerModel.createOrUpdate(producerCore);
      
      // Update country tag if provided
      if (country_tag_id) {
        // First, clear existing country tags for this producer
        await new Promise((resolve, reject) => {
          db.run(
            `DELETE FROM producer_country_tags WHERE producer_id = ?`,
            [producer.id],
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
            [producer.id, country_tag_id],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
      
      // Update region tag if provided
      if (region_tag_id) {
        // First, clear existing region tags for this producer
        await new Promise((resolve, reject) => {
          db.run(
            `DELETE FROM producer_region_tags WHERE producer_id = ?`,
            [producer.id],
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
            [producer.id, region_tag_id],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
      
      // Return the complete producer object with tags
      return ProducerService.getProducerById(producer.id);
    } catch (err) {
      logger.error('Error creating or updating producer:', { error: err.message, stack: err.stack, producer: producerData });
      throw err;
    }
  },
  
  /**
   * Get producers by country tag ID
   * 
   * @param {number} countryTagId - Country tag ID
   * @returns {Promise<Array>} Array of producer objects with the specified country tag
   * @throws {Error} If database operation fails
   */
  getProducersByCountryTag: async (countryTagId) => {
    try {
      logger.debug(`Fetching producers with country tag ID: ${countryTagId}`);
      // Get producers with the specified country tag
      const producers = await new Promise((resolve, reject) => {
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
      
      // Get region tags for all producers
      return Promise.all(producers.map(async (producer) => {
        // Get region tag
        const regionTag = await new Promise((resolve, reject) => {
          db.get(
            `SELECT rt.* FROM region_tags rt
             JOIN producer_region_tags prt ON rt.id = prt.region_tag_id
             WHERE prt.producer_id = ?`,
            [producer.id],
            (err, row) => {
              if (err) reject(err);
              else resolve(row || null);
            }
          );
        });
        
        return {
          ...producer,
          region_tag: regionTag || null
        };
      }));
    } catch (err) {
      logger.error(`Error getting producers with country tag ID ${countryTagId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get producers by region tag ID
   * 
   * @param {number} regionTagId - Region tag ID
   * @returns {Promise<Array>} Array of producer objects with the specified region tag
   * @throws {Error} If database operation fails
   */
  getProducersByRegionTag: async (regionTagId) => {
    try {
      logger.debug(`Fetching producers with region tag ID: ${regionTagId}`);
      // Get producers with the specified region tag
      const producers = await new Promise((resolve, reject) => {
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
      
      // Get country tags for all producers
      return Promise.all(producers.map(async (producer) => {
        // Get country tag
        const countryTag = await new Promise((resolve, reject) => {
          db.get(
            `SELECT ct.* FROM country_tags ct
             JOIN producer_country_tags pct ON ct.id = pct.country_tag_id
             WHERE pct.producer_id = ?`,
            [producer.id],
            (err, row) => {
              if (err) reject(err);
              else resolve(row || null);
            }
          );
        });
        
        return {
          ...producer,
          country_tag: countryTag || null
        };
      }));
    } catch (err) {
      logger.error(`Error getting producers with region tag ID ${regionTagId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  }
};
