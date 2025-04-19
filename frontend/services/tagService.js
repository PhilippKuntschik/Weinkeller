/**
 * Tag Service
 * 
 * This file provides functions for interacting with tag-related API endpoints.
 * It handles operations for different types of tags (grape, wine type, country, region, etc.)
 */

import { apiService } from './api';

/**
 * Get all tags of a specific type
 * @param {string} tagType - The type of tag (grape, wine_type, country, region, etc.)
 * @returns {Promise<Array>} Promise that resolves to an array of tag objects
 */
export const getAllTags = (tagType) => {
  return apiService.get(`/${tagType}_tags`);
};

/**
 * Create a new tag of a specific type
 * @param {string} tagType - The type of tag (grape, wine_type, country, region, etc.)
 * @param {string} name - The name of the tag
 * @returns {Promise<Object>} Promise that resolves to the created tag object
 */
export const createTag = (tagType, name) => {
  return apiService.post(`/${tagType}_tags`, { name });
};

/**
 * Get wines by tag
 * @param {string} tagType - The type of tag (grape, wine_type, etc.)
 * @param {number} tagId - The tag ID
 * @returns {Promise<Array>} Promise that resolves to an array of wine objects
 */
export const getWinesByTag = (tagType, tagId) => {
  return apiService.get(`/wines_by_${tagType}_tag/${tagId}`);
};

/**
 * Get producers by tag
 * @param {string} tagType - The type of tag (country, region)
 * @param {number} tagId - The tag ID
 * @returns {Promise<Array>} Promise that resolves to an array of producer objects
 */
export const getProducersByTag = (tagType, tagId) => {
  return apiService.get(`/producers_by_${tagType}_tag/${tagId}`);
};

/**
 * Update tags for a wine
 * @param {string} tagType - The type of tag (grape, wine_type, occasion, food_pairing)
 * @param {number} wineId - The wine ID
 * @param {Array<number>} tagIds - Array of tag IDs
 * @returns {Promise<Object>} Promise that resolves to a success object
 */
export const updateWineTags = (tagType, wineId, tagIds) => {
  return apiService.post(`/wine_${tagType}_tags`, {
    wine_id: wineId,
    [`${tagType}_tag_ids`]: tagIds
  });
};

/**
 * Helper function to extract tag type from endpoint
 * @param {string} endpoint - The API endpoint (e.g., '/grape_tags')
 * @returns {string} The tag type (e.g., 'grape')
 */
export const getTagTypeFromEndpoint = (endpoint) => {
  // Remove leading slash if present
  const path = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // Special case for wine_type_tags
  if (path === 'wine_type_tags') {
    return 'wine_type';
  }
  
  // Special case for food_pairing_tags
  if (path === 'food_pairing_tags') {
    return 'food_pairing';
  }
  
  // Extract tag type (e.g., 'grape' from 'grape_tags')
  return path.split('_')[0];
};

// Export all functions as a service object
const TagService = {
  getAllTags,
  createTag,
  getWinesByTag,
  getProducersByTag,
  updateWineTags,
  getTagTypeFromEndpoint,
  
  // Convenience methods for specific tag types
  getAllGrapeTags: () => getAllTags('grape'),
  getAllWineTypeTags: () => getAllTags('wine_type'),
  getAllCountryTags: () => getAllTags('country'),
  getAllRegionTags: () => getAllTags('region'),
  getAllOccasionTags: () => getAllTags('occasion'),
  getAllFoodPairingTags: () => getAllTags('food_pairing'),
  
  createGrapeTag: (name) => createTag('grape', name),
  createWineTypeTag: (name) => createTag('wine_type', name),
  createCountryTag: (name) => createTag('country', name),
  createRegionTag: (name) => createTag('region', name),
  createOccasionTag: (name) => createTag('occasion', name),
  createFoodPairingTag: (name) => createTag('food_pairing', name),
  
  getWinesByGrapeTag: (tagId) => getWinesByTag('grape', tagId),
  getWinesByWineTypeTag: (tagId) => getWinesByTag('wine_type', tagId),
  getWinesByOccasionTag: (tagId) => getWinesByTag('occasion', tagId),
  getWinesByFoodPairingTag: (tagId) => getWinesByTag('food_pairing', tagId),
  
  getProducersByCountryTag: (tagId) => getProducersByTag('country', tagId),
  getProducersByRegionTag: (tagId) => getProducersByTag('region', tagId),
  
  updateGrapeTags: (wineId, tagIds) => updateWineTags('grape', wineId, tagIds),
  updateWineTypeTags: (wineId, tagIds) => updateWineTags('wine_type', wineId, tagIds),
  updateOccasionTags: (wineId, tagIds) => updateWineTags('occasion', wineId, tagIds),
  updateFoodPairingTags: (wineId, tagIds) => updateWineTags('food_pairing', wineId, tagIds)
};

export default TagService;
