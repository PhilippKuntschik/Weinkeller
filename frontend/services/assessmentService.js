/**
 * assessment service
 * 
 * This file provides functions for interacting with the assessment API endpoints.
 */

import api, { handleApiRequest } from './api';

/**
 * Get all assessments
 * @returns {Promise} Promise that resolves with an array of assessment objects
 */
export const getAllSATs = () => {
  return handleApiRequest(() => api.get('/assessments'));
};

/**
 * Get a assessment by ID
 * @param {number} id - The SAT ID
 * @returns {Promise} Promise that resolves with a assessment object
 */
export const getSATById = (id) => {
  return handleApiRequest(() => api.get(`/assessments/${id}`));
};

/**
 * Get assessments for a specific wine
 * @param {number} wineId - The wine ID
 * @returns {Promise} Promise that resolves with an array of assessment objects
 */
export const getSATsByWineId = (wineId) => {
  return handleApiRequest(() => api.get(`/wines/${wineId}/assessments`));
};

/**
 * Create a new assessment
 * @param {Object} SATData - The SAT data
 * @returns {Promise} Promise that resolves with the created assessment object
 */
export const createSAT = (SATData) => {
  console.log('Creating SAT with data:', SATData);
  return handleApiRequest(() => api.post('/assessments', SATData));
};

/**
 * Update a assessment
 * @param {number} id - The SAT ID
 * @param {Object} SATData - The updated SAT data
 * @returns {Promise} Promise that resolves with the updated assessment object
 */
export const updateSAT = (id, SATData) => {
  return handleApiRequest(() => api.put(`/assessments/${id}`, SATData));
};

/**
 * Delete a assessment
 * @param {number} id - The SAT ID
 * @returns {Promise} Promise that resolves with a success message
 */
export const deleteSAT = (id) => {
  return handleApiRequest(() => api.delete(`/assessments/${id}`));
};
