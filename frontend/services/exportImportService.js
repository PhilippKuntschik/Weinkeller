/**
 * Export/Import Service
 * 
 * This file provides functions for interacting with the export/import-related API endpoints.
 */

import { apiService } from './api';

/**
 * Export data as JSON
 * @param {string} exportType - The type of data to export ('all', 'wines', 'inventory', etc.)
 * @returns {Promise<Blob>} Promise that resolves to a blob containing the exported data
 */
export const exportData = (exportType) => {
  return apiService.get(`/export/${exportType}/json`, {
    responseType: 'blob'
  });
};

/**
 * Import data from JSON
 * @param {Object} jsonData - The JSON data to import
 * @returns {Promise<Object>} Promise that resolves to the import result
 */
export const importData = (jsonData) => {
  return apiService.post('/import/json', jsonData);
};
