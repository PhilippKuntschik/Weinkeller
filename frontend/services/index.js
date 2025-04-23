/**
 * Services index
 * 
 * This file exports all services for easier imports.
 */

// Export API service
export { apiService } from './api';

// Export wine service
export * as wineService from './wineService';

// Export producer service
export * as producerService from './producerService';

// Export inventory service
export * as inventoryService from './inventoryService';

// Export assessment service
export * as assessmentService from './assessmentService';

// Export tag service
export { default as tagService } from './tagService';

// Export export/import service
export * as exportImportService from './exportImportService';
