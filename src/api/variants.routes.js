import express from 'express';
import * as variantController from '../controllers/variant.controller.js';

const router = express.Router();

// Base Products
router.get('/base', variantController.getAllBaseProducts);
router.get('/base/search', variantController.searchBaseProducts); // Specific route before :id
router.post('/base', variantController.createBaseProduct);
router.get('/base/:id', variantController.getBaseProductById);

// Variants
router.get('/search', variantController.searchVariants);
router.get('/compare', variantController.compareVariants);
router.get('/:id', variantController.getVariantById);
router.post('/', variantController.createVariant);

// Variants by Base Product
router.get('/base/:baseId/variants', variantController.getVariantsByBaseId);

export default router;
