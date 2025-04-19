/**
 * Application configuration
 * 
 * This file contains configuration settings for the application.
 * Environment-specific settings can be overridden using environment variables.
 */

// API configuration
export const API_CONFIG = {
  // Base URL for API requests
  baseURL: import.meta.env.VITE_API_URL || '/api',
  
  // Request timeout in milliseconds
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
  
  // Whether to include credentials in requests
  withCredentials: import.meta.env.VITE_API_WITH_CREDENTIALS === 'true' || false,
};

// Application settings
export const APP_CONFIG = {
  // Application name
  appName: import.meta.env.VITE_APP_NAME || 'Weinkeller',
  
  // Default language
  defaultLanguage: import.meta.env.VITE_DEFAULT_LANGUAGE || 'en',
  
  // Available languages
  languages: ['en', 'de'],
  
  // Debug mode
  debug: import.meta.env.VITE_DEBUG === 'true' || false,
};

// Create a pre-configured axios instance
export const createAxiosInstance = (axios) => {
  const instance = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    withCredentials: API_CONFIG.withCredentials,
  });
  
  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Add any request headers or authentication here
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle common errors here
      if (error.response) {
        // Server responded with an error status
        console.error('API Error:', error.response.status, error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        console.error('Network Error:', error.request);
      } else {
        // Something else happened
        console.error('Error:', error.message);
      }
      
      return Promise.reject(error);
    }
  );
  
  return instance;
};
