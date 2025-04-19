/**
 * API Routes for Weinkeller
 */

import express from 'express';

const router = express.Router();

// Import services
import {
  WineService,
  ProducerService,
  InventoryService,
  AssessmentService,
  TagService,
  ExportImportService
} from './services/index.js';

// Import models for validators

// Import validators
import {
  validateWineData,
  validateProducerData,
  validateInventoryEvent,
  validateWineConsumption,
  validateWSET
} from './middleware/validators.js';

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Inventory routes
router.post('/add_to_inventory', validateInventoryEvent, async (req, res, next) => {
  try {
    const result = await InventoryService.addEvent(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/consume_wine', validateWineConsumption, async (req, res, next) => {
  try {
    const result = await InventoryService.consumeWine(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/get_inventory', async (req, res, next) => {
  try {
    const inventory = await InventoryService.getCurrentInventory();
    res.json(inventory);
  } catch (err) {
    next(err);
  }
});

// Wine routes
router.post('/add_or_update_wine_data', validateWineData, async (req, res, next) => {
  try {
    const wine = await WineService.createOrUpdateWine(req.body);
    res.status(201).json(wine);
  } catch (err) {
    next(err);
  }
});

router.get('/get_wine_data', async (req, res, next) => {
  try {
    const wines = await WineService.getAllWines();
    res.json(wines);
  } catch (err) {
    next(err);
  }
});

router.get('/get_wine_data/:id', async (req, res, next) => {
  try {
    const wine = await WineService.getWineById(req.params.id);
    res.json(wine);
  } catch (err) {
    next(err);
  }
});

// Producer routes
router.post('/add_or_update_producer_data', validateProducerData, async (req, res, next) => {
  try {
    const producer = await ProducerService.createOrUpdateProducer(req.body);
    res.status(201).json(producer);
  } catch (err) {
    next(err);
  }
});

router.get('/get_producer_data', async (req, res, next) => {
  try {
    const producers = await ProducerService.getAllProducers();
    res.json(producers);
  } catch (err) {
    next(err);
  }
});

router.get('/get_producer_data/:id', async (req, res, next) => {
  try {
    const producer = await ProducerService.getProducerById(req.params.id);
    res.json(producer);
  } catch (err) {
    next(err);
  }
});

// Tag routes
router.get('/grape_tags', async (req, res, next) => {
  try {
    const tags = await TagService.getAllGrapeTags();
    res.json(tags);
  } catch (err) {
    next(err);
  }
});

router.get('/wine_type_tags', async (req, res, next) => {
  try {
    const tags = await TagService.getAllWineTypeTags();
    res.json(tags);
  } catch (err) {
    next(err);
  }
});

router.get('/country_tags', async (req, res, next) => {
  try {
    const tags = await TagService.getAllCountryTags();
    res.json(tags);
  } catch (err) {
    next(err);
  }
});

router.get('/region_tags', async (req, res, next) => {
  try {
    const tags = await TagService.getAllRegionTags();
    res.json(tags);
  } catch (err) {
    next(err);
  }
});

router.get('/occasion_tags', async (req, res, next) => {
  try {
    const tags = await TagService.getAllOccasionTags();
    res.json(tags);
  } catch (err) {
    next(err);
  }
});

router.get('/food_pairing_tags', async (req, res, next) => {
  try {
    const tags = await TagService.getAllFoodPairingTags();
    res.json(tags);
  } catch (err) {
    next(err);
  }
});

router.post('/grape_tags', async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      const error = new Error('Grape tag name is required');
      error.type = 'validation';
      return next(error);
    }
    
    const tag = await TagService.createGrapeTag(name);
    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});

router.post('/wine_type_tags', async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      const error = new Error('Wine type tag name is required');
      error.type = 'validation';
      return next(error);
    }
    
    const tag = await TagService.createWineTypeTag(name);
    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});

router.post('/country_tags', async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      const error = new Error('Country tag name is required');
      error.type = 'validation';
      return next(error);
    }
    
    const tag = await TagService.createCountryTag(name);
    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});

router.post('/region_tags', async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      const error = new Error('Region tag name is required');
      error.type = 'validation';
      return next(error);
    }
    
    const tag = await TagService.createRegionTag(name);
    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});

router.post('/occasion_tags', async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      const error = new Error('Occasion tag name is required');
      error.type = 'validation';
      return next(error);
    }
    
    const tag = await TagService.createOccasionTag(name);
    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});

router.post('/food_pairing_tags', async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      const error = new Error('Food pairing tag name is required');
      error.type = 'validation';
      return next(error);
    }
    
    const tag = await TagService.createFoodPairingTag(name);
    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});

// Assessment routes
router.get('/assessments', async (req, res, next) => {
  try {
    const assessments = await AssessmentService.getAllAssessments();
    res.json(assessments);
  } catch (err) {
    next(err);
  }
});

router.get('/assessments/:id', async (req, res, next) => {
  try {
    const assessment = await AssessmentService.getAssessmentById(req.params.id);
    res.json(assessment);
  } catch (err) {
    next(err);
  }
});

router.post('/assessments', validateWSET, async (req, res, next) => {
  try {
    const assessment = await AssessmentService.createAssessment(req.body);
    res.status(201).json(assessment);
  } catch (err) {
    next(err);
  }
});

// Export/Import routes
router.get('/export/all/json', async (req, res, next) => {
  try {
    const data = await ExportImportService.exportAllToJSON();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=wine_inventory_export.json');
    // Pretty print the JSON with 2-space indentation
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    next(err);
  }
});

export default router;
