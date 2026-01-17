import express from 'express';
import * as providerController from '../controllers/provider.controller.js';

const router = express.Router();

router.get('/', providerController.getAllProviders);
router.get('/:id', providerController.getProviderById);
router.post('/', providerController.createProvider);
router.put('/:id', providerController.updateProvider);
router.delete('/:id', providerController.deleteProvider);

export default router;
