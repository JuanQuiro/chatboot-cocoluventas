import express from 'express';
import bcvService from '../services/bcv.service.js';

const router = express.Router();

/**
 * GET /api/bcv/rate
 * Get the current stored exchange rate
 */
router.get('/rate', (req, res) => {
    try {
        const rate = bcvService.getRate();
        res.json({
            success: true,
            data: rate
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/bcv/sync
 * Force synchronization with external BCV API
 */
router.post('/sync', async (req, res) => {
    try {
        const rate = await bcvService.fetchCurrentRate();
        res.json({
            success: true,
            data: rate,
            message: 'Tasa BCV sincronizada exitosamente'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/bcv/rate
 * Manually set the exchange rate (admin override)
 */
router.post('/rate', (req, res) => {
    try {
        const { rate } = req.body;
        if (!rate || isNaN(parseFloat(rate))) {
            return res.status(400).json({ success: false, error: 'Tasa inválida' });
        }
        const newRate = bcvService.setRate(rate);
        res.json({
            success: true,
            data: newRate,
            message: 'Tasa actualizada manualmente'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/bcv/history
 * Get historical rates from external API
 */
router.get('/history', async (req, res) => {
    try {
        const history = await bcvService.fetchHistory();
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
