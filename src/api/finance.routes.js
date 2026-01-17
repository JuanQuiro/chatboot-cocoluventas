
import express from 'express';
import financeService from '../services/finance.service.js';
import commissionsService from '../services/commissions.service.js';
import manufacturersService from '../services/manufacturers.service.js';
import databaseService from '../config/database.service.js';

const router = express.Router();

// --- FINANCE: EXPENSES ---

router.get('/expenses', (req, res) => {
    try {
        const expenses = financeService.getExpenses(req.query);
        res.json({ success: true, data: expenses });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/expenses', (req, res) => {
    try {
        const expense = financeService.createExpense(req.body);
        res.json({ success: true, data: expense });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/expenses/:id/pay', (req, res) => {
    try {
        const { amount } = req.body;
        const result = financeService.registerExpensePayment(req.params.id, amount);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- FINANCE: INCOME ---

router.get('/income/summary', (req, res) => {
    try {
        const { start, end } = req.query;
        // Default to current month if dates not provided
        const now = new Date();
        const startDate = start || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endDate = end || new Date().toISOString();

        const summary = financeService.getIncomeSummary(startDate, endDate);
        res.json({ success: true, data: summary });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /income/breakdown - Detailed breakdown by payment method
router.get('/income/breakdown', (req, res) => {
    try {
        const { start, end } = req.query;
        const now = new Date();
        const startDate = start || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endDate = end || new Date().toISOString();

        const breakdown = financeService.getIncomeBreakdown(startDate, endDate);
        res.json({ success: true, data: breakdown });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- COMMISSIONS ---

router.post('/commissions/config', (req, res) => {
    try {
        // Body: { entityType, entityId, type, value }
        commissionsService.setRate(
            req.body.entityType,
            req.body.entityId,
            req.body.type,
            req.body.value
        );
        res.json({ success: true, message: 'Rate updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/commissions/seller/:id', (req, res) => {
    try {
        const rate = commissionsService.getSellerRate(req.params.id);
        res.json({ success: true, data: { rate } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/commissions/summary/sellers', async (req, res) => {
    try {
        const { start, end } = req.query;
        const summary = await commissionsService.getSellersSummary(start, end);
        res.json({ success: true, data: summary });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/commissions/summary/manufacturers', async (req, res) => {
    try {
        const { start, end } = req.query;
        const summary = await commissionsService.getManufacturersSummary(start, end);
        res.json({ success: true, data: summary });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- MANUFACTURERS ---

router.get('/manufacturers', (req, res) => {
    try {
        const manufacturers = manufacturersService.getAllWithWorkload();
        res.json({ success: true, data: manufacturers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
