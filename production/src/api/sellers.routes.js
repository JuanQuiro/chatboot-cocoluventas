/**
 * Sellers Routes
 * IMPLEMENTACIÓN: CRUD completo de vendedores
 */

import express from 'express';
import Seller from '../models/Seller.model.js';
import { requireAuth, requireRole, requirePermission } from '../middleware/auth.middleware.js';
import errorHandler from '../utils/error-handler.js';
import auditLogger from '../core/audit/AuditLogger.js';

const router = express.Router();

/**
 * GET /api/sellers
 * Listar vendedores
 */
router.get('/', requireAuth, async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const { active, status, specialty, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (active !== undefined) filter.active = active === 'true';
        if (status) filter.status = status;
        if (specialty) filter.specialty = specialty;

        const sellers = await Seller.find(filter)
            .sort({ rating: -1, name: 1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        const total = await Seller.countDocuments(filter);

        res.json({
            success: true,
            sellers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }, { operation: 'getSellers', res });
});

/**
 * GET /api/sellers/:id
 * Obtener vendedor por ID
 */
router.get('/:id', requireAuth, async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const seller = await Seller.findById(req.params.id);

        if (!seller) {
            return res.status(404).json({
                error: 'Seller not found'
            });
        }

        res.json({
            success: true,
            seller
        });
    }, { operation: 'getSeller', res });
});

/**
 * POST /api/sellers
 * Crear vendedor
 */
router.post('/', requireAuth, requirePermission('sellers.create'), async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const seller = new Seller(req.body);
        await seller.save();

        await auditLogger.logAction({
            category: 'data',
            action: 'create_seller',
            userId: req.user.id,
            userName: req.user.name,
            resource: 'sellers',
            resourceId: seller._id.toString()
        });

        res.status(201).json({
            success: true,
            seller
        });
    }, { operation: 'createSeller', res });
});

/**
 * PUT /api/sellers/:id
 * Actualizar vendedor
 */
router.put('/:id', requireAuth, requirePermission('sellers.create'), async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const before = await Seller.findById(req.params.id).lean();

        if (!before) {
            return res.status(404).json({
                error: 'Seller not found'
            });
        }

        const seller = await Seller.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        await auditLogger.logDataChange({
            action: 'update',
            userId: req.user.id,
            resource: 'sellers',
            resourceId: seller._id.toString(),
            before,
            after: seller.toObject()
        });

        res.json({
            success: true,
            seller
        });
    }, { operation: 'updateSeller', res });
});

/**
 * DELETE /api/sellers/:id
 * Eliminar vendedor
 */
router.delete('/:id', requireAuth, requirePermission('sellers.delete'), async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const seller = await Seller.findByIdAndDelete(req.params.id);

        if (!seller) {
            return res.status(404).json({
                error: 'Seller not found'
            });
        }

        await auditLogger.logAction({
            category: 'data',
            action: 'delete_seller',
            userId: req.user.id,
            userName: req.user.name,
            resource: 'sellers',
            resourceId: req.params.id
        });

        res.json({
            success: true,
            message: 'Seller deleted successfully'
        });
    }, { operation: 'deleteSeller', res });
});

/**
 * GET /api/sellers/available/list
 * Listar vendedores disponibles
 */
router.get('/available/list', requireAuth, async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const sellers = await Seller.find({
            active: true,
            status: 'online',
            $expr: { $lt: ['$currentClients', '$maxClients'] }
        }).sort({ currentClients: 1, rating: -1 });

        res.json({
            success: true,
            sellers,
            count: sellers.length
        });
    }, { operation: 'getAvailableSellers', res });
});

/**
 * POST /api/sellers/:id/assign
 * Asignar cliente a vendedor
 */
router.post('/:id/assign', requireAuth, async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const seller = await Seller.findById(req.params.id);

        if (!seller) {
            return res.status(404).json({
                error: 'Seller not found'
            });
        }

        if (!seller.isAvailable) {
            return res.status(400).json({
                error: 'Seller is not available'
            });
        }

        await seller.assignClient();

        res.json({
            success: true,
            seller
        });
    }, { operation: 'assignClient', res });
});

/**
 * POST /api/sellers/:id/release
 * Liberar cliente de vendedor
 */
router.post('/:id/release', requireAuth, async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const seller = await Seller.findById(req.params.id);

        if (!seller) {
            return res.status(404).json({
                error: 'Seller not found'
            });
        }

        await seller.releaseClient();

        res.json({
            success: true,
            seller
        });
    }, { operation: 'releaseClient', res });
});

export default router;
