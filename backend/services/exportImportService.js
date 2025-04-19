/**
 * @module ExportImportService
 * @description Service layer for data export and import operations
 * 
 * This service handles all business logic related to exporting and importing data, including:
 * - Exporting wines, inventory, and all data to JSON
 * - Importing data from JSON
 * 
 * It acts as an intermediary between the route handlers and the data models,
 * providing a clean separation of concerns.
 */

import { WineModel } from '../models/wineModel.js';
import { ProducerModel } from '../models/producerModel.js';
import { InventoryModel } from '../models/inventoryModel.js';
import { TagService } from './tagService.js';
import loggerFactory from '../utils/logger.js';
const logger = loggerFactory('exportImportService');

export const ExportImportService = {
  /**
   * Export all wine data including all associated tags
   * 
   * @returns {Promise<Object>} JSON object with all wine data
   * @throws {Error} If database operation fails
   */
  exportWinesToJSON: async () => {
    try {
      logger.info('Exporting all wines to JSON');
      
      // Fetch all wines
      const wines = await WineModel.getAll();
      
      // For each wine, fetch all associated tags
      const winesWithTags = await Promise.all(wines.map(async (wine) => {
        const grapeTags = await WineModel.getGrapeTags(wine.id);
        const wineTypeTags = await WineModel.getWineTypeTags(wine.id);
        const occasionTags = await WineModel.getOccasionTags(wine.id);
        const foodPairingTags = await WineModel.getFoodPairingTags(wine.id);
        
        return {
          ...wine,
          grape_tags: grapeTags,
          wine_type_tags: wineTypeTags,
          occasion_tags: occasionTags,
          food_pairing_tags: foodPairingTags
        };
      }));
      
      logger.info(`Exported ${winesWithTags.length} wines`);
      
      return { wines: winesWithTags };
    } catch (err) {
      logger.error('Error exporting wines to JSON:', { error: err.message, stack: err.stack });
      throw err;
    }
  },

  /**
   * Export inventory data with all associated wine and tag data
   * 
   * @returns {Promise<Object>} JSON object with all inventory data
   * @throws {Error} If database operation fails
   */
  exportInventoryToJSON: async () => {
    try {
      logger.info('Exporting inventory to JSON');
      
      // Fetch current inventory with all associated data
      const inventory = await InventoryModel.getCurrentInventory();
      
      logger.info(`Exported ${inventory.length} inventory items`);
      
      return { inventory };
    } catch (err) {
      logger.error('Error exporting inventory to JSON:', { error: err.message, stack: err.stack });
      throw err;
    }
  },

  /**
   * Export all data (wines, inventory, producers, tags)
   * 
   * @returns {Promise<Object>} JSON object with all application data
   * @throws {Error} If database operation fails
   */
  exportAllToJSON: async () => {
    try {
      logger.info('Exporting all data to JSON');
      
      // Fetch all data types
      const wines = await ExportImportService.exportWinesToJSON();
      const inventory = await ExportImportService.exportInventoryToJSON();
      const producers = await ProducerModel.getAll();
      
      // Fetch all tag types
      const grapeTags = await TagService.getAllGrapeTags();
      const wineTypeTags = await TagService.getAllWineTypeTags();
      const occasionTags = await TagService.getAllOccasionTags();
      const foodPairingTags = await TagService.getAllFoodPairingTags();
      const countryTags = await TagService.getAllCountryTags();
      const regionTags = await TagService.getAllRegionTags();
      
      logger.info('Export completed successfully');
      
      return {
        wines: wines.wines,
        inventory: inventory.inventory,
        producers,
        tags: {
          grape_tags: grapeTags,
          wine_type_tags: wineTypeTags,
          occasion_tags: occasionTags,
          food_pairing_tags: foodPairingTags,
          country_tags: countryTags,
          region_tags: regionTags
        }
      };
    } catch (err) {
      logger.error('Error exporting all data to JSON:', { error: err.message, stack: err.stack });
      throw err;
    }
  },

  /**
   * Import data from JSON
   * 
   * @param {Object} data - The JSON data to import
   * @returns {Promise<Object>} Result of the import operation
   * @throws {Error} If database operation fails
   */
  importFromJSON: async (data) => {
    try {
      logger.info('Importing data from JSON');
      
      const results = {
        success: true,
        created: { wines: 0, producers: 0, tags: 0, inventory: 0 },
        updated: { wines: 0, producers: 0, tags: 0, inventory: 0 },
        errors: []
      };
      
      // Import tags first (if present)
      if (data.tags) {
        await ExportImportService._importTags(data.tags, results);
      }
      
      // Import producers (if present)
      if (data.producers && Array.isArray(data.producers)) {
        await ExportImportService._importProducers(data.producers, results);
      }
      
      // Import wines (if present)
      if (data.wines && Array.isArray(data.wines)) {
        await ExportImportService._importWines(data.wines, results);
      }
      
      // Import inventory events (if present)
      if (data.inventory && Array.isArray(data.inventory)) {
        await ExportImportService._importInventory(data.inventory, results);
      }
      
      
      logger.info('Import completed', { results });
      
      return results;
    } catch (err) {
      logger.error('Error importing data from JSON:', { error: err.message, stack: err.stack });
      const results = {
        success: false,
        errors: [`Import failed: ${err.message}`]
      };
      return results;
    }
  },
  
  /**
   * Import tags from JSON data
   * 
   * @private
   * @param {Object} tags - The tags data to import
   * @param {Object} results - The results object to update
   * @returns {Promise<void>}
   */
  _importTags: async (tags, results) => {
    try {
      // Import grape tags
      if (tags.grape_tags && Array.isArray(tags.grape_tags)) {
        for (const tag of tags.grape_tags) {
          try {
            await TagService.createGrapeTag(tag.name);
            results.created.tags++;
          } catch (err) {
            // Tag might already exist, which is fine
            if (!err.message.includes('UNIQUE constraint failed')) {
              results.errors.push(`Failed to create grape tag ${tag.name}: ${err.message}`);
            }
          }
        }
      }
      
      // Import wine type tags
      if (tags.wine_type_tags && Array.isArray(tags.wine_type_tags)) {
        for (const tag of tags.wine_type_tags) {
          try {
            await TagService.createWineTypeTag(tag.name);
            results.created.tags++;
          } catch (err) {
            if (!err.message.includes('UNIQUE constraint failed')) {
              results.errors.push(`Failed to create wine type tag ${tag.name}: ${err.message}`);
            }
          }
        }
      }
      
      // Import occasion tags
      if (tags.occasion_tags && Array.isArray(tags.occasion_tags)) {
        for (const tag of tags.occasion_tags) {
          try {
            await TagService.createOccasionTag(tag.name);
            results.created.tags++;
          } catch (err) {
            if (!err.message.includes('UNIQUE constraint failed')) {
              results.errors.push(`Failed to create occasion tag ${tag.name}: ${err.message}`);
            }
          }
        }
      }
      
      // Import food pairing tags
      if (tags.food_pairing_tags && Array.isArray(tags.food_pairing_tags)) {
        for (const tag of tags.food_pairing_tags) {
          try {
            await TagService.createFoodPairingTag(tag.name);
            results.created.tags++;
          } catch (err) {
            if (!err.message.includes('UNIQUE constraint failed')) {
              results.errors.push(`Failed to create food pairing tag ${tag.name}: ${err.message}`);
            }
          }
        }
      }
      
      // Import country tags
      if (tags.country_tags && Array.isArray(tags.country_tags)) {
        for (const tag of tags.country_tags) {
          try {
            await TagService.createCountryTag(tag.name);
            results.created.tags++;
          } catch (err) {
            if (!err.message.includes('UNIQUE constraint failed')) {
              results.errors.push(`Failed to create country tag ${tag.name}: ${err.message}`);
            }
          }
        }
      }
      
      // Import region tags
      if (tags.region_tags && Array.isArray(tags.region_tags)) {
        for (const tag of tags.region_tags) {
          try {
            await TagService.createRegionTag(tag.name);
            results.created.tags++;
          } catch (err) {
            if (!err.message.includes('UNIQUE constraint failed')) {
              results.errors.push(`Failed to create region tag ${tag.name}: ${err.message}`);
            }
          }
        }
      }
      
      logger.info(`Imported ${results.created.tags} tags`);
    } catch (err) {
      logger.error('Error importing tags:', { error: err.message, stack: err.stack });
      results.errors.push(`Error importing tags: ${err.message}`);
    }
  },
  
  /**
   * Import producers from JSON data
   * 
   * @private
   * @param {Array} producers - The producers data to import
   * @param {Object} results - The results object to update
   * @returns {Promise<void>}
   */
  _importProducers: async (producers, results) => {
    try {
      for (const producer of producers) {
        try {
          await ProducerModel.createOrUpdate(producer);
          producer.id ? results.updated.producers++ : results.created.producers++;
        } catch (err) {
          results.errors.push(`Failed to import producer ${producer.name}: ${err.message}`);
        }
      }
      
      logger.info(`Imported ${results.created.producers} new producers and updated ${results.updated.producers} existing producers`);
    } catch (err) {
      logger.error('Error importing producers:', { error: err.message, stack: err.stack });
      results.errors.push(`Error importing producers: ${err.message}`);
    }
  },
  
  /**
   * Import wines from JSON data
   * 
   * @private
   * @param {Array} wines - The wines data to import
   * @param {Object} results - The results object to update
   * @returns {Promise<void>}
   */
  _importWines: async (wines, results) => {
    try {
      for (const wine of wines) {
        try {
          // Extract tag IDs
          const grapeTagIds = wine.grape_tags?.map(tag => tag.id) || [];
          const wineTypeTagIds = wine.wine_type_tags?.map(tag => tag.id) || [];
          const occasionTagIds = wine.occasion_tags?.map(tag => tag.id) || [];
          const foodPairingTagIds = wine.food_pairing_tags?.map(tag => tag.id) || [];
          
          // Create or update the wine
          const wineData = { ...wine };
          delete wineData.grape_tags;
          delete wineData.wine_type_tags;
          delete wineData.occasion_tags;
          delete wineData.food_pairing_tags;
          
          const createdWine = await WineModel.createOrUpdate(wineData);
          wine.id ? results.updated.wines++ : results.created.wines++;
          
          // Add tags to the wine
          await WineModel.addGrapeTags(createdWine.id, grapeTagIds);
          await WineModel.addWineTypeTags(createdWine.id, wineTypeTagIds);
          await WineModel.addOccasionTags(createdWine.id, occasionTagIds);
          await WineModel.addFoodPairingTags(createdWine.id, foodPairingTagIds);
        } catch (err) {
          results.errors.push(`Failed to import wine ${wine.name}: ${err.message}`);
        }
      }
      
      logger.info(`Imported ${results.created.wines} new wines and updated ${results.updated.wines} existing wines`);
    } catch (err) {
      logger.error('Error importing wines:', { error: err.message, stack: err.stack });
      results.errors.push(`Error importing wines: ${err.message}`);
    }
  },
  
  /**
   * Import inventory from JSON data
   * 
   * @private
   * @param {Array} inventory - The inventory data to import
   * @param {Object} results - The results object to update
   * @returns {Promise<void>}
   */
  _importInventory: async (inventory, results) => {
    try {
      for (const item of inventory) {
        try {
          // Check if the wine exists
          const wine = await WineModel.getById(item.wine_id);
          if (!wine) {
            results.errors.push(`Failed to import inventory for wine ID ${item.wine_id}: Wine not found`);
            continue;
          }
          
          // Create inventory events to match the current inventory level
          if (item.inventory > 0) {
            await InventoryModel.addEvent({
              wine_id: item.wine_id,
              event_type: 'add',
              acquisition_type: 'import',
              quantity: item.inventory,
              event_date: new Date().toISOString()
            });
            results.created.inventory++;
          }
        } catch (err) {
          results.errors.push(`Failed to import inventory for wine ID ${item.wine_id}: ${err.message}`);
        }
      }
      
      logger.info(`Imported ${results.created.inventory} inventory items`);
    } catch (err) {
      logger.error('Error importing inventory:', { error: err.message, stack: err.stack });
      results.errors.push(`Error importing inventory: ${err.message}`);
    }
  }
};
