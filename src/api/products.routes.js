/**
 * Products Routes
 * IMPLEMENTACIÓN: CRUD completo de productos
 */

import express from 'express';
import Product from '../models/Product.model.js';
import { requireAuth, requirePermission } from '../middleware/auth.middleware.js';
import errorHandler from '../utils/error-handler.js';
import auditLogger from '../core/audit/AuditLogger.js';

const router = express.Router();

// GET /api/products - List products
router.get('/', async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const { category, active, search, page = 1, limit = 20, sort = 'name' } = req.query;

        const filter = {};
        if (category) filter.category = category;
        if (active !== undefined) filter.active = active === 'true';
        if (search) {
            filter.$text = { $search: search };
        }

        const products = await Product.find(filter)
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }, { operation: 'getProducts', res });
});

// POST /api/products - Create product
router.post('/', requireAuth, requirePermission('products.create'), async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const product = new Product(req.body);
        await product.save();

        await auditLogger.logAction({
            category: 'data',
            action: 'create_product',
            userId: req.user.id,
            userName: req.user.name,
            resource: 'products',
            resourceId: product._id.toString()
        });

        res.status(201).json({ success: true, product });
    }, { operation: 'createProduct', res });
});

// PUT /api/products/:id - Update product
router.put('/:id', requireAuth, requirePermission('products.create'), async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const before = await Product.findById(req.params.id).lean();
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await auditLogger.logDataChange({
            action: 'update',
            userId: req.user.id,
            resource: 'products',
            resourceId: product._id.toString(),
            before,
            after: product.toObject()
        });

        res.json({ success: true, product });
    }, { operation: 'updateProduct', res });
});

// DELETE /api/products/:id
router.delete('/:id', requireAuth, requirePermission('products.delete'), async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await auditLogger.logAction({
            category: 'data',
            action: 'delete_product',
            userId: req.user.id,
            userName: req.user.name,
            resource: 'products',
            resourceId: req.params.id
        });

        res.json({ success: true, message: 'Product deleted' });
    }, { operation: 'deleteProduct', res });
});

export default router;
