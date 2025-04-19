/**
 * Producer Service
 * 
 * This file provides functions for interacting with the producer-related API endpoints.
 */

import { apiService } from './api';

/**
 * Get all producers
 * @returns {Promise<Array>} Promise that resolves to an array of producer objects
 */
export const getAllProducers = () => {
  return apiService.get('/get_producer_data');
};

/**
 * Get a producer by ID
 * @param {number} id - The producer ID
 * @returns {Promise<Object>} Promise that resolves to a producer object
 */
export const getProducerById = (id) => {
  return apiService.get(`/get_producer_data/${id}`);
};

/**
 * Create or update a producer
 * @param {Object} producerData - The producer data
 * @returns {Promise<Object>} Promise that resolves to the created/updated producer object
 */
export const createOrUpdateProducer = (producerData) => {
  return apiService.post('/add_or_update_producer_data', producerData);
};

/**
 * Get wines by producer
 * @param {number} producerId - The producer ID
 * @returns {Promise<Array>} Promise that resolves to an array of wine objects
 */
export const getWinesByProducer = async (producerId) => {
  // This function uses the producer endpoint that includes wines
  const producerData = await getProducerById(producerId);
  return producerData.wines || [];
};

/**
 * Format producer for display
 * @param {Object} producer - The producer object
 * @returns {Object} Formatted producer object
 */
export const formatProducer = (producer) => {
  if (!producer) return null;
  
  return {
    ...producer,
    displayName: producer.name,
    displayLocation: [producer.region, producer.country].filter(Boolean).join(', '),
  };
};

/**
 * Convert producers to options format for select inputs
 * @param {Array} producers - Array of producer objects
 * @returns {Array} Array of option objects with value and label properties
 */
export const producersToOptions = (producers = []) => {
  return producers.map(producer => ({
    value: producer.id,
    label: producer.name
  }));
};
