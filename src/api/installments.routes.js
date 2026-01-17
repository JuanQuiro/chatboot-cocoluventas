// Installments/Cuotas routes - Simple implementation (ES Module)
export function setupInstallmentsRoutes(app) {
    // GET /api/installments
    app.get('/api/installments', (req, res) => {
        try {
            const { page = 1, limit = 50 } = req.query;
            res.json({
                data: [],
                meta: {
                    total: 0,
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Installments error:', error);
            res.status(500).json({ error: 'Error fetching installments' });
        }
    });

    // GET /api/installments/stats
    app.get('/api/installments/stats', (req, res) => {
        try {
            res.json({
                total: 0,
                pending: 0,
                completed: 0,
                overdue: 0
            });
        } catch (error) {
            console.error('Installments stats error:', error);
            res.status(500).json({ error: 'Error fetching stats' });
        }
    });

    console.log('✅ Installments routes loaded');
}
