/**
 * @module AssessmentService
 * @description Service layer for wine assessment operations
 * 
 * This service handles all business logic related to wine assessments, including:
 * - Retrieving assessments
 * - Creating and updating assessments
 * - Managing assessment data
 * 
 * It acts as an intermediary between the route handlers and the data models,
 * providing a clean separation of concerns.
 */

import { AssessmentModel } from '../models/AssessmentModel.js';
import { WineModel } from '../models/wineModel.js';
import loggerFactory from '../utils/logger.js';
const logger = loggerFactory('assessmentService');

export const AssessmentService = {
  /**
   * Get all assessments
   * 
   * @returns {Promise<Array>} Array of assessment objects
   * @throws {Error} If database operation fails
   */
  getAllAssessments: async () => {
    try {
      logger.debug('Fetching all assessments from database');
      const assessments = await AssessmentModel.getAll();
      
      // Enrich assessments with wine data
      return Promise.all(assessments.map(async (assessment) => {
        const wine = await WineModel.getById(assessment.wine_id);
        return {
          ...assessment,
          wine: wine || null
        };
      }));
    } catch (err) {
      logger.error('Error getting all assessments:', { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get an assessment by ID
   * 
   * @param {number} id - Assessment ID
   * @returns {Promise<Object>} Assessment object with wine data
   * @throws {Error} If assessment not found or database operation fails
   */
  getAssessmentById: async (id) => {
    try {
      logger.debug(`Fetching assessment with ID: ${id}`);
      const assessment = await AssessmentModel.getById(id);
      
      if (!assessment) {
        const error = new Error('Assessment not found');
        error.type = 'not_found';
        throw error;
      }
      
      // Get wine data
      const wine = await WineModel.getById(assessment.wine_id);
      
      return {
        ...assessment,
        wine: wine || null
      };
    } catch (err) {
      logger.error(`Error getting assessment with ID ${id}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Get assessments for a specific wine
   * 
   * @param {number} wineId - Wine ID
   * @returns {Promise<Array>} Array of assessment objects for the specified wine
   * @throws {Error} If database operation fails
   */
  getAssessmentsByWineId: async (wineId) => {
    try {
      logger.debug(`Fetching assessments for wine ID: ${wineId}`);
      
      // Verify wine exists
      const wine = await WineModel.getById(wineId);
      if (!wine) {
        const error = new Error(`Wine with ID ${wineId} not found`);
        error.type = 'not_found';
        throw error;
      }
      
      const assessments = await AssessmentModel.getByWineId(wineId);
      
      // Add wine data to each assessment
      return assessments.map(assessment => ({
        ...assessment,
        wine
      }));
    } catch (err) {
      logger.error(`Error getting assessments for wine ID ${wineId}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  },
  
  /**
   * Create a new assessment
   * 
   * @param {Object} assessmentData - Assessment data
   * @returns {Promise<Object>} Created assessment object
   * @throws {Error} If database operation fails or validation fails
   */
  createAssessment: async (assessmentData) => {
    try {
      logger.debug('Creating assessment for wine ID:', { wine_id: assessmentData.wine_id });
      
      // Verify wine exists
      const wine = await WineModel.getById(assessmentData.wine_id);
      if (!wine) {
        const error = new Error(`Wine with ID ${assessmentData.wine_id} not found`);
        error.type = 'not_found';
        throw error;
      }
      
      // Create the assessment
      const assessment = await AssessmentModel.create(assessmentData);
      
      
      // Return the complete assessment object with wine data
      return {
        ...assessment,
        wine
      };
    } catch (err) {
      logger.error('Error creating assessment:', { error: err.message, stack: err.stack, assessment: assessmentData });
      throw err;
    }
  },
  
  /**
   * Update an assessment
   * 
   * @param {number} id - Assessment ID
   * @param {Object} assessmentData - Updated assessment data
   * @returns {Promise<Object>} Updated assessment object
   * @throws {Error} If assessment not found, database operation fails, or validation fails
   */
  updateAssessment: async (id, assessmentData) => {
    try {
      logger.debug(`Updating assessment with ID: ${id}`);
      
      // Verify assessment exists
      const existingAssessment = await AssessmentModel.getById(id);
      if (!existingAssessment) {
        const error = new Error(`Assessment with ID ${id} not found`);
        error.type = 'not_found';
        throw error;
      }
      
      // Update the assessment
      const assessment = await AssessmentModel.update(id, assessmentData);
      
      
      // Return the complete assessment object with wine data
      const wine = await WineModel.getById(assessment.wine_id);
      
      return {
        ...assessment,
        wine: wine || null
      };
    } catch (err) {
      logger.error(`Error updating assessment with ID ${id}:`, { error: err.message, stack: err.stack, assessment: assessmentData });
      throw err;
    }
  },
  
  /**
   * Delete an assessment
   * 
   * @param {number} id - Assessment ID
   * @returns {Promise<Object>} Result of the delete operation
   * @throws {Error} If assessment not found or database operation fails
   */
  deleteAssessment: async (id) => {
    try {
      logger.debug(`Deleting assessment with ID: ${id}`);
      
      // Verify assessment exists and get wine_id for cache invalidation
      const existingAssessment = await AssessmentModel.getById(id);
      if (!existingAssessment) {
        const error = new Error(`Assessment with ID ${id} not found`);
        error.type = 'not_found';
        throw error;
      }
      
      // Delete the assessment
      const result = await AssessmentModel.delete(id);
      
      
      return result;
    } catch (err) {
      logger.error(`Error deleting assessment with ID ${id}:`, { error: err.message, stack: err.stack });
      throw err;
    }
  }
};
