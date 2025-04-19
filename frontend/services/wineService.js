/**
 * Wine Service
 * 
 * This file provides functions for interacting with the wine-related API endpoints.
 * Tag-related functions have been moved to tagService.js.
 */

import { apiService } from './api';

/**
 * Get all wines
 * @returns {Promise<Array>} Promise that resolves to an array of wine objects
 */
export const getAllWines = () => {
  return apiService.get('/get_wine_data');
};

/**
 * Get a wine by ID
 * @param {number} id - The wine ID
 * @returns {Promise<Object>} Promise that resolves to a wine object
 */
export const getWineById = (id) => {
  return apiService.get(`/get_wine_data/${id}`);
};

/**
 * Create or update a wine
 * @param {Object} wineData - The wine data
 * @returns {Promise<Object>} Promise that resolves to the created/updated wine object
 */
export const createOrUpdateWine = (wineData) => {
  return apiService.post('/add_or_update_wine_data', wineData);
};

/**
 * Format wine for display
 * @param {Object} wine - The wine object
 * @returns {Object} Formatted wine object
 */
export const formatWine = (wine) => {
  if (!wine) return null;
  
  return {
    ...wine,
    displayName: `${wine.name} ${wine.year || ''}`.trim(),
    displayProducer: wine.producer_name || 'Unknown Producer',
  };
};

/**
 * Convert wines to options format for select inputs
 * @param {Array} wines - Array of wine objects
 * @returns {Array} Array of option objects with value and label properties
 */
export const winesToOptions = (wines = []) => {
  return wines.map(wine => ({
    value: wine.id,
    label: `${wine.name} ${wine.year || ''}`.trim()
  }));
};
