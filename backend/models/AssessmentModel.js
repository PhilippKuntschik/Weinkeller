/**
 * assessment data access layer
 * Handles all database operations related to WSET wine SATs
 */

import { db } from '../db.js';

export const AssessmentModel = {
  /**
   * Get all assessments from the database
   * @returns {Promise} Promise object that resolves to an array of SAT objects
   */
  getAll: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          a.*,
          w.name AS wine_name,
          w.year AS wine_year,
          p.name AS producer_name
        FROM assessments a
        JOIN wines w ON a.wine_id = w.id
        JOIN producers p ON w.producer_id = p.id
        ORDER BY a.SAT_date DESC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  /**
   * Get a assessment by ID
   * @param {number} id - The SAT ID
   * @returns {Promise} Promise object that resolves to an SAT object
   */
  getById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          a.*,
          w.name AS wine_name,
          w.year AS wine_year,
          p.name AS producer_name
        FROM assessments a
        JOIN wines w ON a.wine_id = w.id
        JOIN producers p ON w.producer_id = p.id
        WHERE a.id = ?
      `;
      
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  
  /**
   * Get all assessments for a specific wine
   * @param {number} wineId - The wine ID
   * @returns {Promise} Promise object that resolves to an array of SAT objects
   */
  getByWineId: (wineId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          a.*,
          w.name AS wine_name,
          w.year AS wine_year,
          p.name AS producer_name
        FROM assessments a
        JOIN wines w ON a.wine_id = w.id
        JOIN producers p ON w.producer_id = p.id
        WHERE a.wine_id = ?
        ORDER BY a.SAT_date DESC
      `;
      
      db.all(query, [wineId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  /**
   * Create a new assessment
   * @param {Object} SATData - The SAT data
   * @returns {Promise} Promise object that resolves to the created SAT object
   */
  create: (SATData) => {
    console.log('Creating new assessment with data:', SATData);
    
    // Validate wine_id exists
    if (!SATData.wine_id) {
      return Promise.reject(new Error('Wine ID is required'));
    }
    
    // Check if wine exists
    return new Promise((resolve, reject) => {
      db.get('SELECT id FROM wines WHERE id = ?', [SATData.wine_id], (err, row) => {
        if (err) {
          console.error('Error checking wine existence:', err);
          return reject(err);
        }
        
        if (!row) {
          console.error('Wine not found with ID:', SATData.wine_id);
          return reject(new Error(`Wine with ID ${SATData.wine_id} not found`));
        }
        
        // Continue with creating the SAT
        const {
          wine_id,
          SAT_date,
          
          // Appearance
          appearance_clarity,
          appearance_intensity,
          appearance_color,
          appearance_observations,
          
          // Nose
          nose_condition,
          nose_intensity,
          nose_development,
          nose_aromas_primary,
          nose_aromas_secondary,
          nose_aromas_tertiary,
          
          // Palate
          palate_sweetness,
          palate_acidity,
          palate_tannin,
          palate_mousse,
          palate_alcohol,
          palate_body,
          palate_flavor_intensity,
          palate_flavor_characteristics,
          palate_aromas_primary,
          palate_aromas_secondary,
          palate_aromas_tertiary,
          palate_finish,
          
          // Conclusions
          conclusions_quality,
          conclusions_readiness,
          conclusions_aging_potential,
          conclusions_notes
        } = SATData;
    
    const query = `
      INSERT INTO assessments (
        wine_id,
        SAT_date,
        appearance_clarity,
        appearance_intensity,
        appearance_color,
        appearance_observations,
        nose_condition,
        nose_intensity,
        nose_development,
        nose_aromas_primary,
        nose_aromas_secondary,
        nose_aromas_tertiary,
        palate_sweetness,
        palate_acidity,
        palate_tannin,
        palate_mousse,
        palate_alcohol,
        palate_body,
        palate_flavor_intensity,
        palate_flavor_characteristics,
        palate_aromas_primary,
        palate_aromas_secondary,
        palate_aromas_tertiary,
        palate_finish,
        conclusions_quality,
        conclusions_readiness,
        conclusions_aging_potential,
        conclusions_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
        db.run(
          query,
          [
            wine_id,
            SAT_date || new Date().toISOString(),
            appearance_clarity || null,
            appearance_intensity || null,
            appearance_color || null,
            appearance_observations || null,
            nose_condition || null,
            nose_intensity || null,
            nose_development || null,
            nose_aromas_primary || null,
            nose_aromas_secondary || null,
            nose_aromas_tertiary || null,
            palate_sweetness || null,
            palate_acidity || null,
            palate_tannin || null,
            palate_mousse || null,
            palate_alcohol || null,
            palate_body || null,
            palate_flavor_intensity || null,
            palate_flavor_characteristics || null,
            palate_aromas_primary || null,
            palate_aromas_secondary || null,
            palate_aromas_tertiary || null,
            palate_finish || null,
            conclusions_quality || null,
            conclusions_readiness || null,
            conclusions_aging_potential || null,
            conclusions_notes || null
          ],
          function (err) {
            if (err) {
              console.error('Error inserting assessment:', err);
              reject(err);
            } else {
              console.log('assessment created successfully with ID:', this.lastID);
              db.get('SELECT * FROM assessments WHERE id = ?', [this.lastID], (err, row) => {
                if (err) {
                  console.error('Error retrieving created assessment:', err);
                  reject(err);
                } else {
                  resolve(row);
                }
              });
            }
          }
        );
      });
    });
  },
  
  /**
   * Update an existing assessment
   * @param {number} id - The SAT ID
   * @param {Object} SATData - The updated SAT data
   * @returns {Promise} Promise object that resolves to the updated SAT object
   */
  update: (id, SATData) => {
    const {
      wine_id,
      SAT_date,
      
      // Appearance
      appearance_clarity,
      appearance_intensity,
      appearance_color,
      appearance_observations,
      
      // Nose
      nose_condition,
      nose_intensity,
      nose_development,
      nose_aromas_primary,
      nose_aromas_secondary,
      nose_aromas_tertiary,
      
      // Palate
      palate_sweetness,
      palate_acidity,
      palate_tannin,
      palate_mousse,
      palate_alcohol,
      palate_body,
      palate_flavor_intensity,
      palate_flavor_characteristics,
      palate_aromas_primary,
      palate_aromas_secondary,
      palate_aromas_tertiary,
      palate_finish,
      
      // Conclusions
      conclusions_quality,
      conclusions_readiness,
      conclusions_aging_potential,
      conclusions_notes
    } = SATData;
    
    const query = `
      UPDATE assessments SET
        wine_id = ?,
        SAT_date = ?,
        appearance_clarity = ?,
        appearance_intensity = ?,
        appearance_color = ?,
        appearance_observations = ?,
        nose_condition = ?,
        nose_intensity = ?,
        nose_development = ?,
        nose_aromas_primary = ?,
        nose_aromas_secondary = ?,
        nose_aromas_tertiary = ?,
        palate_sweetness = ?,
        palate_acidity = ?,
        palate_tannin = ?,
        palate_mousse = ?,
        palate_alcohol = ?,
        palate_body = ?,
        palate_flavor_intensity = ?,
        palate_flavor_characteristics = ?,
        palate_aromas_primary = ?,
        palate_aromas_secondary = ?,
        palate_aromas_tertiary = ?,
        palate_finish = ?,
        conclusions_quality = ?,
        conclusions_readiness = ?,
        conclusions_aging_potential = ?,
        conclusions_notes = ?
      WHERE id = ?
    `;
    
    return new Promise((resolve, reject) => {
      db.run(
        query,
        [
          wine_id,
          SAT_date,
          appearance_clarity,
          appearance_intensity,
          appearance_color,
          appearance_observations,
          nose_condition,
          nose_intensity,
          nose_development,
          nose_aromas_primary,
          nose_aromas_secondary,
          nose_aromas_tertiary,
          palate_sweetness,
          palate_acidity,
          palate_tannin,
          palate_mousse,
          palate_alcohol,
          palate_body,
          palate_flavor_intensity,
          palate_flavor_characteristics,
          palate_aromas_primary,
          palate_aromas_secondary,
          palate_aromas_tertiary,
          palate_finish,
          conclusions_quality,
          conclusions_readiness,
          conclusions_aging_potential,
          conclusions_notes,
          id
        ],
        function (err) {
          if (err) reject(err);
          else {
            db.get('SELECT * FROM assessments WHERE id = ?', [id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          }
        }
      );
    });
  },
  
  /**
   * Delete a assessment
   * @param {number} id - The SAT ID
   * @returns {Promise} Promise object that resolves when the SAT is deleted
   */
  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM assessments WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve({ success: true, id });
      });
    });
  }
};
