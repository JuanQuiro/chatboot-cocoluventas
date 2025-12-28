import express from 'express';
import clientsService from '../services/clients.service.js';

const router = express.Router();

/**
 * GET /api/clients
 * Search or list all clients
 * Query params: ?q=search_term
 */
router.get('/', async (req, res) => {
    try {
        const { q, page, limit } = req.query;
        // Pass pagination options
        const options = { page, limit };

        const result = q
            ? await clientsService.searchClients(q, options)
            : await clientsService.getAllClients(options);

        // Result is already formatted as { success: true, data: [...], meta: {...} }
        res.json(result);
    } catch (error) {
        console.error('GET /api/clients error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/clients/stats
 * Get client statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await clientsService.getStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('GET /api/clients/stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/clients/top
 * Get top clients
 */
router.get('/top', async (req, res) => {
    try {
        const { limit } = req.query;
        const topClients = await clientsService.getTopClients(parseInt(limit) || 10);
        // topClients is an array, so we wrap it
        res.json({ success: true, data: topClients });
    } catch (error) {
        console.error('GET /api/clients/top error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/clients/:id
 * Get client by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const client = clientsService.getClientById(req.params.id);
        res.json({ success: true, data: client });
    } catch (error) {
        // Only log error if it's NOT a "not found" (common for search/filtering conflict)
        if (error.message !== 'Cliente no encontrado') {
            console.error('GET /api/clients/:id error:', error);
        }
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/clients
 * Create new client
 */
router.post('/', async (req, res) => {
    try {
        const client = clientsService.createClient(req.body);
        res.status(201).json({ success: true, data: client });
    } catch (error) {
        console.error('POST /api/clients error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/clients/:id
 * Update client
 */
router.put('/:id', async (req, res) => {
    try {
        const client = clientsService.updateClient(req.params.id, req.body);
        res.json({ success: true, data: client });
    } catch (error) {
        console.error('PUT /api/clients/:id error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DELETE /api/clients/:id
 * Delete client (soft delete)
 */
router.delete('/:id', async (req, res) => {
    try {
        const result = clientsService.deleteClient(req.params.id);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('DELETE /api/clients/:id error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/clients/stats
 * Get client statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = clientsService.getStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('GET /api/clients/stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
