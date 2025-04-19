/**
 * Wine data access layer
 * Handles all database operations related to wines
 */

import { db } from '../db.js';

export const WineModel = {
  /**
   * Get all wines from the database
   * @returns {Promise} Promise object that resolves to an array of wine objects
   */
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM wines', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  /**
   * Get all wines with their producer information
   * @returns {Promise} Promise object that resolves to an array of wine objects with producer data
   */
  getAllWithProducers: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT w.*, p.name as producer_name 
        FROM wines w
        LEFT JOIN producers p ON w.producer_id = p.id
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  /**
   * Get a wine by ID
   * @param {number} id - The wine ID
   * @returns {Promise} Promise object that resolves to a wine object
   */
  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM wines WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  
  /**
   * Create or update a wine
   * @param {Object} wineData - The wine data
   * @returns {Promise} Promise object that resolves to the created/updated wine object
   */
  createOrUpdate: (wineData) => {
    const {
      id,
      name,
      producer_id,
      terroir,
      year,
      type,
      wine_description,
      grape,
      grape_description,
      bottle_top,
      bottle_format,
      maturity,
      wishlist,
      favorite
    } = wineData;
    
    const query = `
      INSERT INTO wines (id, name, producer_id, terroir, year, type, wine_description, grape, grape_description, bottle_top, bottle_format, maturity, wishlist, favorite)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        producer_id = excluded.producer_id,
        terroir = excluded.terroir,
        year = excluded.year,
        type = excluded.type,
        wine_description = excluded.wine_description,
        grape = excluded.grape,
        grape_description = excluded.grape_description,
        bottle_top = excluded.bottle_top,
        bottle_format = excluded.bottle_format,
        maturity = excluded.maturity,
        wishlist = excluded.wishlist,
        favorite = excluded.favorite
    `;
    
    return new Promise((resolve, reject) => {
      db.run(
        query,
        [id, name, producer_id, terroir, year, type, wine_description, grape, grape_description, bottle_top, bottle_format, maturity, wishlist || 0, favorite || 0],
        function (err) {
          if (err) reject(err);
          else {
            resolve({
              id: id || this.lastID,
              name,
              producer_id,
              terroir,
              year,
              type,
              wine_description,
              grape,
              grape_description,
              bottle_top,
              bottle_format,
              maturity,
              wishlist: wishlist || 0,
              favorite: favorite || 0
            });
          }
        }
      );
    });
  },
  
  /**
   * Add grape tags to a wine
   * @param {number} wineId - The wine ID
   * @param {Array} grapeTagIds - Array of grape tag IDs
   * @returns {Promise} Promise object that resolves when tags are added
   */
  addGrapeTags: (wineId, grapeTagIds) => {
    if (!grapeTagIds || grapeTagIds.length === 0) {
      return Promise.resolve({ success: true });
    }
    
    return new Promise((resolve, reject) => {
      // First, clear existing grape tags for this wine
      db.run('DELETE FROM wine_grape_tags WHERE wine_id = ?', [wineId], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        // Then add the new grape tags
        const placeholders = grapeTagIds.map(() => '(?, ?)').join(', ');
        const values = grapeTagIds.flatMap((id) => [wineId, id]);
        
        db.run(`INSERT INTO wine_grape_tags (wine_id, grape_tag_id) VALUES ${placeholders}`, values, function (err) {
          if (err) reject(err);
          else resolve({ success: true });
        });
      });
    });
  },
  
  /**
   * Get grape tags for a wine
   * @param {number} wineId - The wine ID
   * @returns {Promise} Promise object that resolves to an array of grape tag objects
   */
  getGrapeTags: (wineId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT gt.* 
        FROM grape_tags gt
        JOIN wine_grape_tags wgt ON gt.id = wgt.grape_tag_id
        WHERE wgt.wine_id = ?
      `;
      
      db.all(query, [wineId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  /**
   * Add wine type tags to a wine
   * @param {number} wineId - The wine ID
   * @param {Array} wineTypeTagIds - Array of wine type tag IDs
   * @returns {Promise} Promise object that resolves when tags are added
   */
  addWineTypeTags: (wineId, wineTypeTagIds) => {
    if (!wineTypeTagIds || wineTypeTagIds.length === 0) {
      return Promise.resolve({ success: true });
    }
    
    return new Promise((resolve, reject) => {
      // First, clear existing wine type tags for this wine
      db.run('DELETE FROM wine_wine_type_tags WHERE wine_id = ?', [wineId], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        // Then add the new wine type tags
        const placeholders = wineTypeTagIds.map(() => '(?, ?)').join(', ');
        const values = wineTypeTagIds.flatMap((id) => [wineId, id]);
        
        db.run(`INSERT INTO wine_wine_type_tags (wine_id, wine_type_tag_id) VALUES ${placeholders}`, values, function (err) {
          if (err) reject(err);
          else resolve({ success: true });
        });
      });
    });
  },
  
  /**
   * Get wine type tags for a wine
   * @param {number} wineId - The wine ID
   * @returns {Promise} Promise object that resolves to an array of wine type tag objects
   */
  getWineTypeTags: (wineId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT wtt.* 
        FROM wine_type_tags wtt
        JOIN wine_wine_type_tags wwtt ON wtt.id = wwtt.wine_type_tag_id
        WHERE wwtt.wine_id = ?
      `;
      
      db.all(query, [wineId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  /**
   * Add occasion tags to a wine
   * @param {number} wineId - The wine ID
   * @param {Array} occasionTagIds - Array of occasion tag IDs
   * @returns {Promise} Promise object that resolves when tags are added
   */
  addOccasionTags: (wineId, occasionTagIds) => {
    if (!occasionTagIds || occasionTagIds.length === 0) {
      return Promise.resolve({ success: true });
    }
    
    return new Promise((resolve, reject) => {
      // First, clear existing occasion tags for this wine
      db.run('DELETE FROM wine_occasion_tags WHERE wine_id = ?', [wineId], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        // Then add the new occasion tags
        const placeholders = occasionTagIds.map(() => '(?, ?)').join(', ');
        const values = occasionTagIds.flatMap((id) => [wineId, id]);
        
        db.run(`INSERT INTO wine_occasion_tags (wine_id, occasion_tag_id) VALUES ${placeholders}`, values, function (err) {
          if (err) reject(err);
          else resolve({ success: true });
        });
      });
    });
  },
  
  /**
   * Get occasion tags for a wine
   * @param {number} wineId - The wine ID
   * @returns {Promise} Promise object that resolves to an array of occasion tag objects
   */
  getOccasionTags: (wineId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT ot.* 
        FROM occasion_tags ot
        JOIN wine_occasion_tags wot ON ot.id = wot.occasion_tag_id
        WHERE wot.wine_id = ?
      `;
      
      db.all(query, [wineId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  /**
   * Add food pairing tags to a wine
   * @param {number} wineId - The wine ID
   * @param {Array} foodPairingTagIds - Array of food pairing tag IDs
   * @returns {Promise} Promise object that resolves when tags are added
   */
  addFoodPairingTags: (wineId, foodPairingTagIds) => {
    if (!foodPairingTagIds || foodPairingTagIds.length === 0) {
      return Promise.resolve({ success: true });
    }
    
    return new Promise((resolve, reject) => {
      // First, clear existing food pairing tags for this wine
      db.run('DELETE FROM wine_food_pairing_tags WHERE wine_id = ?', [wineId], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        // Then add the new food pairing tags
        const placeholders = foodPairingTagIds.map(() => '(?, ?)').join(', ');
        const values = foodPairingTagIds.flatMap((id) => [wineId, id]);
        
        db.run(`INSERT INTO wine_food_pairing_tags (wine_id, food_pairing_tag_id) VALUES ${placeholders}`, values, function (err) {
          if (err) reject(err);
          else resolve({ success: true });
        });
      });
    });
  },
  
  /**
   * Get food pairing tags for a wine
   * @param {number} wineId - The wine ID
   * @returns {Promise} Promise object that resolves to an array of food pairing tag objects
   */
  getFoodPairingTags: (wineId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT fpt.* 
        FROM food_pairing_tags fpt
        JOIN wine_food_pairing_tags wfpt ON fpt.id = wfpt.food_pairing_tag_id
        WHERE wfpt.wine_id = ?
      `;
      
      db.all(query, [wineId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  /**
   * Get wines by grape tag ID
   * @param {number} grapeTagId - The grape tag ID
   * @returns {Promise} Promise object that resolves to an array of wine objects
   */
  getWinesByGrapeTag: (grapeTagId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT w.* 
        FROM wines w
        JOIN wine_grape_tags wgt ON w.id = wgt.wine_id
        WHERE wgt.grape_tag_id = ?
      `;
      
      db.all(query, [grapeTagId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  /**
   * Get wines by wine type tag ID
   * @param {number} wineTypeTagId - The wine type tag ID
   * @returns {Promise} Promise object that resolves to an array of wine objects
   */
  getWinesByWineTypeTag: (wineTypeTagId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT w.* 
        FROM wines w
        JOIN wine_wine_type_tags wwtt ON w.id = wwtt.wine_id
        WHERE wwtt.wine_type_tag_id = ?
      `;
      
      db.all(query, [wineTypeTagId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};
