/**
 * API service
 * 
 * This file provides a centralized API client for making HTTP requests.
 * It serves as the single source of truth for all HTTP requests in the application.
 */

import axios from 'axios';
import { createAxiosInstance } from '../config';

// Create a pre-configured axios instance
const axiosInstance = createAxiosInstance(axios);

/**
 * Generic API request handler with error handling
 * @param {Function} apiCall - The API call function to execute
 * @returns {Promise} - Promise that resolves with the API response data or rejects with an error
 */
export const handleApiRequest = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.error || 'Bad request');
        case 401:
          throw new Error('Unauthorized. Please log in again.');
        case 403:
          throw new Error('You do not have permission to perform this action.');
        case 404:
          throw new Error('The requested resource was not found.');
        case 500:
          throw new Error('Internal server error. Please try again later.');
        default:
          throw new Error(`Request failed with status ${status}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response received from server. Please check your network connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }
};

/**
 * API service with direct methods for making API calls
 * This provides a cleaner interface for other services to use
 */
export const apiService = {
  /**
   * Make a GET request
   * @param {string} url - The URL to request
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise that resolves with the response data
   */
  get: async (url, params = {}) => {
    return handleApiRequest(() => axiosInstance.get(url, { params }));
  },
  
  /**
   * Make a POST request
   * @param {string} url - The URL to request
   * @param {Object} data - The data to send
   * @returns {Promise} - Promise that resolves with the response data
   */
  post: async (url, data = {}) => {
    return handleApiRequest(() => axiosInstance.post(url, data));
  },
  
  /**
   * Make a PUT request
   * @param {string} url - The URL to request
   * @param {Object} data - The data to send
   * @returns {Promise} - Promise that resolves with the response data
   */
  put: async (url, data = {}) => {
    return handleApiRequest(() => axiosInstance.put(url, data));
  },
  
  /**
   * Make a DELETE request
   * @param {string} url - The URL to request
   * @returns {Promise} - Promise that resolves with the response data
   */
  delete: async (url) => {
    return handleApiRequest(() => axiosInstance.delete(url));
  }
};

// For backward compatibility
export default axiosInstance;
