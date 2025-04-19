/**
 * Inventory Service
 * 
 * This file provides functions for interacting with the inventory-related API endpoints.
 */

import { apiService } from './api';

/**
 * Get current inventory
 * @returns {Promise<Array>} Promise that resolves to an array of inventory items
 */
export const getCurrentInventory = () => {
  return apiService.get('/get_inventory');
};

/**
 * Add wine to inventory
 * @param {Object} eventData - The event data
 * @param {number} eventData.wine_id - The wine ID
 * @param {number} eventData.quantity - The quantity
 * @param {number} eventData.price - The price (optional)
 * @param {string} eventData.bought_at - Where the wine was bought (optional)
 * @param {string} eventData.event_date - The event date (optional)
 * @param {string} eventData.event_type - The acquisition type (gifted, producer, fair, event, online)
 * @returns {Promise<Object>} Promise that resolves to the created event object
 */
export const addToInventory = (eventData) => {
  return apiService.post('/add_to_inventory', {
    ...eventData,
    acquisition_type: eventData.event_type, // Store the original acquisition type
    event_type: 'buy' // Set the correct event type for inventory calculations
  });
};

/**
 * Consume wine from inventory
 * @param {Object} consumptionData - The consumption data
 * @param {number} consumptionData.wine_id - The wine ID
 * @param {number} consumptionData.quantity - The quantity
 * @param {number} consumptionData.error_quantity - Error quantity (optional)
 * @param {string} consumptionData.event_date - The event date (optional)
 * @returns {Promise<Object>} Promise that resolves to the created event object
 */
export const consumeWine = (consumptionData) => {
  return apiService.post('/consume_wine', consumptionData);
};

/**
 * Get inventory history
 * @returns {Promise<Array>} Promise that resolves to an array of inventory events
 */
export const getInventoryHistory = () => {
  return apiService.get('/inventory_history');
};

/**
 * Format inventory item for display
 * @param {Object} item - The inventory item
 * @returns {Object} Formatted inventory item
 */
export const formatInventoryItem = (item) => {
  if (!item) return null;
  
  return {
    ...item,
    displayName: item.wine_name,
    displayQuantity: `${item.inventory} ${item.inventory === 1 ? 'bottle' : 'bottles'}`,
  };
};

/**
 * Calculate inventory statistics
 * @param {Array} inventory - Array of inventory items
 * @returns {Object} Inventory statistics
 */
export const calculateInventoryStats = (inventory = []) => {
  if (!inventory.length) {
    return {
      totalBottles: 0,
      totalWines: 0,
      averageBottlesPerWine: 0
    };
  }
  
  const totalBottles = inventory.reduce((sum, item) => sum + item.inventory, 0);
  const totalWines = inventory.length;
  
  return {
    totalBottles,
    totalWines,
    averageBottlesPerWine: (totalBottles / totalWines).toFixed(1)
  };
};
