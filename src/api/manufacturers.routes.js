import express from 'express';
import manufacturerRepository from '../repositories/manufacturer.repository.js';

const router = express.Router();

// GET /api/manufacturers - Get all manufacturers
router.get('/', (req, res) => {
    try {
        const manufacturers = manufacturerRepository.getAll();
        res.json({ success: true, data: manufacturers });
    } catch (error) {
        console.error('Error getting manufacturers:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/manufacturers/:id - Get manufacturer by ID
router.get('/:id', (req, res) => {
    try {
        const manufacturer = manufacturerRepository.getById(req.params.id);
        if (!manufacturer) {
            return res.status(404).json({ success: false, error: 'Manufacturer not found' });
        }
        res.json({ success: true, data: manufacturer });
    } catch (error) {
        console.error('Error getting manufacturer:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/manufacturers/:id/stats - Get manufacturer statistics
router.get('/:id/stats', (req, res) => {
    try {
        const stats = manufacturerRepository.getStats(req.params.id);
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error getting manufacturer stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/manufacturers/:id/orders - Get manufacturer order history
router.get('/:id/orders', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const orders = manufacturerRepository.getOrderHistory(req.params.id, limit);
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Error getting manufacturer orders:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/manufacturers - Create new manufacturer
router.post('/', (req, res) => {
    try {
        const manufacturer = manufacturerRepository.create(req.body);
        res.status(201).json({ success: true, data: manufacturer });
    } catch (error) {
        console.error('Error creating manufacturer:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/manufacturers/:id - Update manufacturer
router.put('/:id', (req, res) => {
    try {
        const manufacturer = manufacturerRepository.update(req.params.id, req.body);
        res.json({ success: true, data: manufacturer });
    } catch (error) {
        console.error('Error updating manufacturer:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/manufacturers/:id - Delete (soft) manufacturer
router.delete('/:id', (req, res) => {
    try {
        const result = manufacturerRepository.delete(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error deleting manufacturer:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
