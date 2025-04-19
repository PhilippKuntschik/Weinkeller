/**
 * @module WineService
 * @description Service layer for wine-related operations
 * 
 * This service handles all business logic related to wines, including:
 * - Retrieving wines with associated tags
 * - Creating and updating wines
 * - Managing wine tags
 * 
 * It acts as an intermediary between the route handlers and the data models,
 * providing a clean separation of concerns.
 */

import { WineModel } from '../models/wineModel.js';
import { db } from '../db.js';
import loggerFactory from '../utils/logger.js';
const logger = loggerFactory('wineService');

export const WineService = {
  /**
   * Get all wines with their associated tags
   * 
   * @returns {Promise<Array>} Array of wine objects with tags
   * @throws {Error} If database operation fails
   */
  getAllWines: async () => {
    try {
      logger.debug('Fetching all wines from database');
      const wines = await WineModel.getAllWithProducers();
      
      // Process wines and add tags
      return Promise.all(wines.map(async (wine) => {
        const wineTypeTags = await WineModel.getWineTypeTags(wine.id);
        const grapeTags = await WineModel.getGrapeTags(wine.id);
        const occasionTags = await WineModel.getOccasionTags(wine.id);
        const foodPairingTags = await WineModel.getFoodPairingTags(wine.id);
        
        return {
          ...wine,
          wine_type_tags: wineTypeTags,
          grape_tags: grapeTags,
          occasion_tags: occasionTags,
          food_pairing_tags: foodPairingTags
        };
      }));
    } catch (err) {
      logger.error('Error getting all wines:', { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get a wine by ID with all associated tags
   * 
   * @param {number} id - Wine ID
   * @returns {Promise<Object>} Wine object with tags
   * @throws {Error} If wine not found or database operation fails
   */
  getWineById: async (id) => {
    try {
      logger.debug(`Fetching wine with ID: ${id}`);
      const wine = await WineModel.getById(id);
      
      if (!wine) {
        const error = new Error('Wine not found');
        error.type = 'not_found';
        throw error;
      }
      
      // Get all associated tags
      const grapeTags = await WineModel.getGrapeTags(id);
      const wineTypeTags = await WineModel.getWineTypeTags(id);
      const occasionTags = await WineModel.getOccasionTags(id);
      const foodPairingTags = await WineModel.getFoodPairingTags(id);
      
      return {
        ...wine,
        grape_tags: grapeTags,
        wine_type_tags: wineTypeTags,
        occasion_tags: occasionTags,
        food_pairing_tags: foodPairingTags
      };
    } catch (err) {
      logger.error(`Error getting wine with ID ${id}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Create or update a wine with associated tags
   * 
   * @param {Object} wineData - Wine data including tag IDs
   * @returns {Promise<Object>} Created/updated wine object
   * @throws {Error} If database operation fails
   */
  createOrUpdateWine: async (wineData) => {
    try {
      logger.debug('Creating or updating wine:', { name: wineData.name, id: wineData.id });
      
      const {
        grape_tag_ids,
        wine_type_tag_ids,
        occasion_tag_ids,
        food_pairing_tag_ids,
        ...wineCore
      } = wineData;
      
      // Create or update the wine
      const wine = await WineModel.createOrUpdate(wineCore);
      
      // Add tags if provided
      if (grape_tag_ids && Array.isArray(grape_tag_ids)) {
        await WineModel.addGrapeTags(wine.id, grape_tag_ids);
      }
      
      if (wine_type_tag_ids && Array.isArray(wine_type_tag_ids)) {
        await WineModel.addWineTypeTags(wine.id, wine_type_tag_ids);
      }
      
      if (occasion_tag_ids && Array.isArray(occasion_tag_ids)) {
        await WineModel.addOccasionTags(wine.id, occasion_tag_ids);
      }
      
      if (food_pairing_tag_ids && Array.isArray(food_pairing_tag_ids)) {
        await WineModel.addFoodPairingTags(wine.id, food_pairing_tag_ids);
      }
      
      
      // Return the complete wine object with tags
      return WineService.getWineById(wine.id);
    } catch (err) {
      logger.error('Error creating or updating wine:', { error: err.message, stack: err.stack, wine: wineData });
      throw err;
    }
  },
  
  /**
   * Get wines by grape tag ID
   * 
   * @param {number} grapeTagId - Grape tag ID
   * @returns {Promise<Array>} Array of wine objects with the specified grape tag
   * @throws {Error} If database operation fails
   */
  getWinesByGrapeTag: async (grapeTagId) => {
    try {
      logger.debug(`Fetching wines with grape tag ID: ${grapeTagId}`);
      const wines = await WineModel.getWinesByGrapeTag(grapeTagId);
      
      // Process wines and add tags
      return Promise.all(wines.map(async (wine) => {
        const wineTypeTags = await WineModel.getWineTypeTags(wine.id);
        const grapeTags = await WineModel.getGrapeTags(wine.id);
        
        return {
          ...wine,
          wine_type_tags: wineTypeTags,
          grape_tags: grapeTags
        };
      }));
    } catch (err) {
      logger.error(`Error getting wines with grape tag ID ${grapeTagId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get wines by wine type tag ID
   * 
   * @param {number} wineTypeTagId - Wine type tag ID
   * @returns {Promise<Array>} Array of wine objects with the specified wine type tag
   * @throws {Error} If database operation fails
   */
  getWinesByWineTypeTag: async (wineTypeTagId) => {
    try {
      logger.debug(`Fetching wines with wine type tag ID: ${wineTypeTagId}`);
      const wines = await WineModel.getWinesByWineTypeTag(wineTypeTagId);
      
      // Process wines and add tags
      return Promise.all(wines.map(async (wine) => {
        const wineTypeTags = await WineModel.getWineTypeTags(wine.id);
        const grapeTags = await WineModel.getGrapeTags(wine.id);
        
        return {
          ...wine,
          wine_type_tags: wineTypeTags,
          grape_tags: grapeTags
        };
      }));
    } catch (err) {
      logger.error(`Error getting wines with wine type tag ID ${wineTypeTagId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Update grape tags for a wine
   * 
   * @param {number} wineId - Wine ID
   * @param {Array<number>} grapeTagIds - Array of grape tag IDs
   * @returns {Promise<Object>} Result of the operation
   * @throws {Error} If database operation fails
   */
  updateGrapeTags: async (wineId, grapeTagIds) => {
    try {
      logger.debug(`Updating grape tags for wine ID: ${wineId}`);
      
      // Verify wine exists
      const wine = await WineModel.getById(wineId);
      if (!wine) {
        const error = new Error(`Wine with ID ${wineId} not found`);
        error.type = 'not_found';
        throw error;
      }
      
      // Clear existing grape tags
      await db.run('DELETE FROM wine_grape_tags WHERE wine_id = ?', [wineId]);
      
      // Add new grape tags
      const result = await WineModel.addGrapeTags(wineId, grapeTagIds);
      
      
      return result;
    } catch (err) {
      logger.error(`Error updating grape tags for wine ID ${wineId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Update wine type tags for a wine
   * 
   * @param {number} wineId - Wine ID
   * @param {Array<number>} wineTypeTagIds - Array of wine type tag IDs
   * @returns {Promise<Object>} Result of the operation
   * @throws {Error} If database operation fails
   */
  updateWineTypeTags: async (wineId, wineTypeTagIds) => {
    try {
      logger.debug(`Updating wine type tags for wine ID: ${wineId}`);
      
      // Verify wine exists
      const wine = await WineModel.getById(wineId);
      if (!wine) {
        const error = new Error(`Wine with ID ${wineId} not found`);
        error.type = 'not_found';
        throw error;
      }
      
      // Clear existing wine type tags
      await db.run('DELETE FROM wine_wine_type_tags WHERE wine_id = ?', [wineId]);
      
      // Add new wine type tags
      const result = await WineModel.addWineTypeTags(wineId, wineTypeTagIds);
      
      
      return result;
    } catch (err) {
      logger.error(`Error updating wine type tags for wine ID ${wineId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Update occasion tags for a wine
   * 
   * @param {number} wineId - Wine ID
   * @param {Array<number>} occasionTagIds - Array of occasion tag IDs
   * @returns {Promise<Object>} Result of the operation
   * @throws {Error} If database operation fails
   */
  updateOccasionTags: async (wineId, occasionTagIds) => {
    try {
      logger.debug(`Updating occasion tags for wine ID: ${wineId}`);
      
      // Verify wine exists
      const wine = await WineModel.getById(wineId);
      if (!wine) {
        const error = new Error(`Wine with ID ${wineId} not found`);
        error.type = 'not_found';
        throw error;
      }
      
      // Add new occasion tags
      const result = await WineModel.addOccasionTags(wineId, occasionTagIds);
      
      
      return result;
    } catch (err) {
      logger.error(`Error updating occasion tags for wine ID ${wineId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Update food pairing tags for a wine
   * 
   * @param {number} wineId - Wine ID
   * @param {Array<number>} foodPairingTagIds - Array of food pairing tag IDs
   * @returns {Promise<Object>} Result of the operation
   * @throws {Error} If database operation fails
   */
  updateFoodPairingTags: async (wineId, foodPairingTagIds) => {
    try {
      logger.debug(`Updating food pairing tags for wine ID: ${wineId}`);
      
      // Verify wine exists
      const wine = await WineModel.getById(wineId);
      if (!wine) {
        const error = new Error(`Wine with ID ${wineId} not found`);
        error.type = 'not_found';
        throw error;
      }
      
      // Add new food pairing tags
      const result = await WineModel.addFoodPairingTags(wineId, foodPairingTagIds);
      
      
      return result;
    } catch (err) {
      logger.error(`Error updating food pairing tags for wine ID ${wineId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  }
};
