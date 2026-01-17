import express from 'express';
import { sellersService } from '../services/sellers.service.js';

const router = express.Router();

/**
 * GET /api/sellers
 * Get all sellers with optional filters
 */
router.get('/', async (req, res) => {
    try {
        const filters = {};

        if (req.query.active !== undefined) {
            filters.active = parseInt(req.query.active);
        }
        if (req.query.status) {
            filters.status = req.query.status;
        }
        if (req.query.specialty) {
            filters.specialty = req.query.specialty;
        }

        const sellers = sellersService.getAllSellers(filters);
        res.json({ success: true, data: sellers });
    } catch (error) {
        console.error('Error in GET /api/sellers:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching sellers',
            message: error.message
        });
    }
});

/**
 * GET /api/sellers/stats
 * Get seller statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = sellersService.getSellerStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error in GET /api/sellers/stats:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching seller stats',
            message: error.message
        });
    }
});

/**
 * GET /api/sellers/:id
 * Get seller by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const seller = sellersService.getSellerById(req.params.id);

        if (!seller) {
            return res.status(404).json({
                success: false,
                error: 'Seller not found'
            });
        }

        res.json({ success: true, data: seller });
    } catch (error) {
        console.error('Error in GET /api/sellers/:id:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching seller',
            message: error.message
        });
    }
});

/**
 * POST /api/sellers
 * Create new seller
 */
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, password, specialty, max_clients, rating } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                error: 'Name and email are required'
            });
        }

        const seller = sellersService.createSeller({
            name,
            email,
            phone,
            password,
            specialty,
            max_clients,
            rating
        });

        res.status(201).json({ success: true, data: seller });
    } catch (error) {
        console.error('Error in POST /api/sellers:', error);
        res.status(500).json({
            success: false,
            error: 'Error creating seller',
            message: error.message
        });
    }
});

/**
 * PUT /api/sellers/:id
 * Update seller
 */
router.put('/:id', async (req, res) => {
    try {
        const seller = sellersService.updateSeller(req.params.id, req.body);

        if (!seller) {
            return res.status(404).json({
                success: false,
                error: 'Seller not found'
            });
        }

        res.json({ success: true, data: seller });
    } catch (error) {
        console.error('Error in PUT /api/sellers/:id:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating seller',
            message: error.message
        });
    }
});

/**
 * DELETE /api/sellers/:id
 * Soft delete seller (set active = 0)
 */
router.delete('/:id', async (req, res) => {
    try {
        const result = sellersService.deleteSeller(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error in DELETE /api/sellers/:id:', error);
        res.status(500).json({
            success: false,
            error: 'Error deleting seller',
            message: error.message
        });
    }
});

/**
 * PATCH /api/sellers/:id/status
 * Update seller status (online/offline)
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['online', 'offline'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Valid status (online/offline) is required'
            });
        }

        const seller = sellersService.updateSellerStatus(req.params.id, status);

        if (!seller) {
            return res.status(404).json({
                success: false,
                error: 'Seller not found'
            });
        }

        res.json({ success: true, data: seller });
    } catch (error) {
        console.error('Error in PATCH /api/sellers/:id/status:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating seller status',
            message: error.message
        });
    }
});

/**
 * POST /api/sellers/:id/assign-client
 * Increment current_clients counter
 */
router.post('/:id/assign-client', async (req, res) => {
    try {
        const seller = sellersService.assignClient(req.params.id);

        if (!seller) {
            return res.status(404).json({
                success: false,
                error: 'Seller not found'
            });
        }

        res.json({ success: true, data: seller });
    } catch (error) {
        console.error('Error in POST /api/sellers/:id/assign-client:', error);
        res.status(500).json({
            success: false,
            error: 'Error assigning client',
            message: error.message
        });
    }
});

/**
 * POST /api/sellers/:id/unassign-client
 * Decrement current_clients counter
 */
router.post('/:id/unassign-client', async (req, res) => {
    try {
        const seller = sellersService.unassignClient(req.params.id);

        if (!seller) {
            return res.status(404).json({
                success: false,
                error: 'Seller not found'
            });
        }

        res.json({ success: true, data: seller });
    } catch (error) {
        console.error('Error in POST /api/sellers/:id/unassign-client:', error);
        res.status(500).json({
            success: false,
            error: 'Error unassigning client',
            message: error.message
        });
    }
});

export default router;
