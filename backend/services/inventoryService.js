/**
 * @module InventoryService
 * @description Service layer for inventory-related operations
 * 
 * This service handles all business logic related to wine inventory, including:
 * - Retrieving current inventory
 * - Adding inventory events (purchase, consumption)
 * - Managing inventory history
 * 
 * It acts as an intermediary between the route handlers and the data models,
 * providing a clean separation of concerns.
 */

import { InventoryModel } from '../models/inventoryModel.js';
import { WineModel } from '../models/wineModel.js';
import loggerFactory from '../utils/logger.js';
const logger = loggerFactory('inventoryService');

export const InventoryService = {
  /**
   * Get current inventory (wines with positive quantity)
   * 
   * @returns {Promise<Array>} Array of inventory items with wine details
   * @throws {Error} If database operation fails
   */
  getCurrentInventory: async () => {
    try {
      logger.debug('Fetching current inventory from database');
      const inventory = await InventoryModel.getCurrentInventory();
      return inventory;
    } catch (err) {
      logger.error('Error getting current inventory:', { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Add a wine event (purchase)
   * 
   * @param {Object} eventData - The event data
   * @returns {Promise<Object>} The created event object
   * @throws {Error} If database operation fails or validation fails
   */
  addEvent: async (eventData) => {
    try {
      logger.debug('Adding inventory event:', { wine_id: eventData.wine_id, event_type: eventData.event_type });
      
      // Verify wine exists
      const wine = await WineModel.getById(eventData.wine_id);
      if (!wine) {
        const error = new Error(`Wine with ID ${eventData.wine_id} not found`);
        error.type = 'not_found';
        throw error;
      }
      
      // Add the event
      const result = await InventoryModel.addEvent(eventData);
      
      
      return result;
    } catch (err) {
      logger.error('Error adding inventory event:', { error: err.message, stack: err.stack, event: eventData });
      throw err;
    }
  },
  
  /**
   * Consume wine (add a drink event)
   * 
   * @param {Object} consumptionData - The consumption data
   * @returns {Promise<Object>} The created event object
   * @throws {Error} If database operation fails, validation fails, or insufficient inventory
   */
  consumeWine: async (consumptionData) => {
    try {
      logger.debug('Consuming wine:', { wine_id: consumptionData.wine_id, quantity: consumptionData.quantity });
      
      // Verify wine exists
      const wine = await WineModel.getById(consumptionData.wine_id);
      if (!wine) {
        const error = new Error(`Wine with ID ${consumptionData.wine_id} not found`);
        error.type = 'not_found';
        throw error;
      }
      
      // Check if there's enough inventory
      const inventory = await InventoryService.getCurrentInventory();
      const wineInventory = inventory.find(item => item.wine_id === consumptionData.wine_id);
      
      if (!wineInventory || wineInventory.inventory < consumptionData.quantity) {
        const error = new Error(`Insufficient inventory for wine ID ${consumptionData.wine_id}`);
        error.type = 'validation';
        throw error;
      }
      
      // Add the consumption event
      const result = await InventoryModel.consumeWine(consumptionData);
      
      
      return result;
    } catch (err) {
      logger.error('Error consuming wine:', { error: err.message, stack: err.stack, consumption: consumptionData });
      throw err;
    }
  },
  
  /**
   * Get inventory history (all events)
   * 
   * @returns {Promise<Array>} Array of event objects with wine details
   * @throws {Error} If database operation fails
   */
  getInventoryHistory: async () => {
    try {
      logger.debug('Fetching inventory history from database');
      const history = await InventoryModel.getInventoryHistory();
      return history;
    } catch (err) {
      logger.error('Error getting inventory history:', { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get all events for a specific wine
   * 
   * @param {number} wineId - The wine ID
   * @returns {Promise<Array>} Array of event objects
   * @throws {Error} If database operation fails
   */
  getWineEvents: async (wineId) => {
    try {
      logger.debug(`Fetching events for wine ID: ${wineId}`);
      const events = await InventoryModel.getWineEvents(wineId);
      return events;
    } catch (err) {
      logger.error(`Error getting events for wine ID ${wineId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  }
};
