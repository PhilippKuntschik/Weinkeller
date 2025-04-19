/**
 * Producer data access layer
 * Handles all database operations related to producers
 */

import { db } from '../db.js';

export const ProducerModel = {
  /**
   * Get all producers from the database
   * @returns {Promise} Promise object that resolves to an array of producer objects
   */
  getAll: async () => {
    try {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM producers', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    } catch (err) {
      throw err;
    }
  },
  
  /**
   * Get a producer by ID
   * @param {number} id - The producer ID
   * @returns {Promise} Promise object that resolves to a producer object
   */
  getById: async (id) => {
    try {
      const producer = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM producers WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      return producer;
    } catch (err) {
      throw err;
    }
  },
  
  /**
   * Create or update a producer
   * @param {Object} producerData - The producer data
   * @returns {Promise} Promise object that resolves to the created/updated producer object
   */
  createOrUpdate: async (producerData) => {
    const { 
      id, 
      name, 
      description, 
      country, 
      region, 
      website, 
      geocoordinates, 
      contact,
      country_tag_id,
      region_tag_id
    } = producerData;
    
    const query = `
      INSERT INTO producers (id, name, description, country, region, website, geocoordinates, contact)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        country = excluded.country,
        region = excluded.region,
        website = excluded.website,
        geocoordinates = excluded.geocoordinates,
        contact = excluded.contact
    `;
    
    try {
      const producer = await new Promise((resolve, reject) => {
        db.run(query, [id, name, description, country, region, website, geocoordinates, contact], function (err) {
          if (err) reject(err);
          else {
            resolve({
              id: id || this.lastID,
              name,
              description,
              country,
              region,
              website,
              geocoordinates,
              contact
            });
          }
        });
      });

      const producerId = producer.id;

      // Tags are now handled by the TagService

      return producer;
    } catch (err) {
      throw err;
    }
  },
  
  /**
   * Get all wines from a specific producer
   * @param {number} producerId - The producer ID
   * @returns {Promise} Promise object that resolves to an array of wine objects
   */
  getWines: (producerId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM wines WHERE producer_id = ?', [producerId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};
