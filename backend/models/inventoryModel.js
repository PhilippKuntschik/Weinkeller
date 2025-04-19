/**
 * Inventory data access layer
 * Handles all database operations related to wine inventory
 */

import { db } from '../db.js';

export const InventoryModel = {
  /**
   * Get current inventory (wines with positive quantity)
   * @returns {Promise} Promise object that resolves to an array of inventory items
   */
  getCurrentInventory: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          w.id as wine_id, 
          w.name AS wine_name,
          w.year,
          w.type,
          w.maturity,
          w.wishlist,
          w.favorite,
          p.id as producer_id,
          p.name as producer_name,
          p.country,
          p.region,
          SUM(CASE WHEN we.event_type = 'drink' THEN -we.quantity ELSE we.quantity END) AS inventory
        FROM wine_events we
        JOIN wines w ON we.wine_id = w.id
        JOIN producers p ON w.producer_id = p.id
        GROUP BY we.wine_id, w.name
        HAVING SUM(CASE WHEN we.event_type = 'drink' THEN -we.quantity ELSE we.quantity END) > 0
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else {
          // Get grape tags, wine type tags, and producer tags for each wine
          const promises = rows.map(wine => {
            return new Promise((resolveWine, rejectWine) => {
              // Get grape tags
              const grapeQuery = `
                SELECT gt.* 
                FROM grape_tags gt
                JOIN wine_grape_tags wgt ON gt.id = wgt.grape_tag_id
                WHERE wgt.wine_id = ?
              `;
              
              db.all(grapeQuery, [wine.wine_id], (grapeErr, grapeTags) => {
                if (grapeErr) {
                  rejectWine(grapeErr);
                  return;
                }
                
                wine.grape_tags = grapeTags;
                
                // Get wine type tags
                const wineTypeQuery = `
                  SELECT wtt.* 
                  FROM wine_type_tags wtt
                  JOIN wine_wine_type_tags wwtt ON wtt.id = wwtt.wine_type_tag_id
                  WHERE wwtt.wine_id = ?
                `;
                
                db.all(wineTypeQuery, [wine.wine_id], (typeErr, wineTypeTags) => {
                  if (typeErr) {
                    rejectWine(typeErr);
                    return;
                  }
                  
                  wine.wine_type_tags = wineTypeTags;
                  
                  // Get country tag for producer
                  const countryTagQuery = `
                    SELECT ct.* 
                    FROM country_tags ct
                    JOIN producer_country_tags pct ON ct.id = pct.country_tag_id
                    WHERE pct.producer_id = ?
                  `;
                  
                  db.get(countryTagQuery, [wine.producer_id], (countryErr, countryTag) => {
                    if (countryErr) {
                      rejectWine(countryErr);
                      return;
                    }
                    
                    if (countryTag) {
                      wine.country_tag = countryTag;
                    }
                    
                    // Get region tag for producer
                    const regionTagQuery = `
                      SELECT rt.* 
                      FROM region_tags rt
                      JOIN producer_region_tags prt ON rt.id = prt.region_tag_id
                      WHERE prt.producer_id = ?
                    `;
                    
                    db.get(regionTagQuery, [wine.producer_id], (regionErr, regionTag) => {
                      if (regionErr) {
                        rejectWine(regionErr);
                        return;
                      }
                      
                      if (regionTag) {
                        wine.region_tag = regionTag;
                      }
                      
                      // Get occasion tags for wine
                      const occasionTagQuery = `
                        SELECT ot.* 
                        FROM occasion_tags ot
                        JOIN wine_occasion_tags wot ON ot.id = wot.occasion_tag_id
                        WHERE wot.wine_id = ?
                      `;
                      
                      db.all(occasionTagQuery, [wine.wine_id], (occasionErr, occasionTags) => {
                        if (occasionErr) {
                          rejectWine(occasionErr);
                          return;
                        }
                        
                        wine.occasion_tags = occasionTags;
                        
                        // Get food pairing tags for wine
                        const foodPairingTagQuery = `
                          SELECT fpt.* 
                          FROM food_pairing_tags fpt
                          JOIN wine_food_pairing_tags wfpt ON fpt.id = wfpt.food_pairing_tag_id
                          WHERE wfpt.wine_id = ?
                        `;
                        
                        db.all(foodPairingTagQuery, [wine.wine_id], (foodPairingErr, foodPairingTags) => {
                          if (foodPairingErr) {
                            rejectWine(foodPairingErr);
                            return;
                          }
                          
                          wine.food_pairing_tags = foodPairingTags;
                          
                          resolveWine(wine);
                        });
                      });
                    });
                  });
                });
              });
            });
          });
          
          Promise.all(promises)
            .then(winesWithTags => resolve(winesWithTags))
            .catch(err => reject(err));
        }
      });
    });
  },
  
  /**
   * Add a wine event (buy or consume)
   * @param {Object} eventData - The event data
   * @returns {Promise} Promise object that resolves to the created event object
   */
  addEvent: (eventData) => {
    const { wine_id, event_type, acquisition_type, quantity, price, bought_at, event_date, error_quantity } = eventData;
    
    // Different handling based on event type
    if (event_type === 'drink') {
      return InventoryModel.consumeWine({ wine_id, quantity, error_quantity, event_date });
    }
    
    const query = `
      INSERT INTO wine_events (wine_id, event_type, acquisition_type, quantity, price, bought_at, event_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    return new Promise((resolve, reject) => {
      db.run(
        query, 
        [wine_id, event_type, acquisition_type, quantity, price, bought_at, event_date || new Date().toISOString()], 
        function (err) {
          if (err) reject(err);
          else {
            resolve({ 
              id: this.lastID, 
              wine_id, 
              event_type, 
              acquisition_type,
              quantity, 
              price, 
              bought_at, 
              event_date: event_date || new Date().toISOString() 
            });
          }
        }
      );
    });
  },
  
  /**
   * Consume wine (add a drink event)
   * @param {Object} consumptionData - The consumption data
   * @returns {Promise} Promise object that resolves to the created event object
   */
  consumeWine: ({ wine_id, quantity, error_quantity, event_date }) => {
    const query = `
      INSERT INTO wine_events (wine_id, event_type, quantity, error_quantity, event_date) 
      VALUES (?, 'drink', ?, ?, ?)
    `;
    
    return new Promise((resolve, reject) => {
      db.run(
        query, 
        [wine_id, quantity, error_quantity || 0, event_date || new Date().toISOString()], 
        function (err) {
          if (err) reject(err);
          else {
            resolve({ 
              id: this.lastID, 
              wine_id, 
              event_type: 'drink', 
              quantity, 
              error_quantity: error_quantity || 0, 
              event_date: event_date || new Date().toISOString() 
            });
          }
        }
      );
    });
  },
  
  /**
   * Get all events for a specific wine
   * @param {number} wineId - The wine ID
   * @returns {Promise} Promise object that resolves to an array of event objects
   */
  getWineEvents: (wineId) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM wine_events WHERE wine_id = ? ORDER BY event_date DESC', 
        [wineId], 
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },
  
  /**
   * Get inventory history (all events)
   * @returns {Promise} Promise object that resolves to an array of event objects with wine details
   */
  getInventoryHistory: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT we.*, w.name as wine_name
        FROM wine_events we
        JOIN wines w ON we.wine_id = w.id
        ORDER BY we.event_date DESC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};
