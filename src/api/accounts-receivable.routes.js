// Accounts Receivable/Cuentas por Cobrar routes - Real implementation
import databaseService from '../config/database.service.js';

export function setupAccountsReceivableRoutes(app) {
    const db = databaseService.getDatabase();

    // GET /api/accounts-receivable
    app.get('/api/accounts-receivable', (req, res) => {
        try {
            const { page = 1, limit = 15, status } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            // Query to get clients with pending payment orders
            // Get all orders with pending balance (where tipo_pago is 'Credito' or partial payment)
            const query = `
                SELECT 
                    c.id as clientId,
                    c.nombre || ' ' || COALESCE(c.apellido, '') as clientName,
                    c.telefono as clientPhone,
                    COUNT(DISTINCT p.id) as totalPendingOrders,
                    SUM(p.total_usd) as totalAmount,
                    SUM(p.total_usd - COALESCE(p.total_abono_usd, 0)) as balance
                FROM pedidos p
                INNER JOIN clientes c ON p.cliente_id = c.id
                WHERE (p.total_usd - COALESCE(p.total_abono_usd, 0)) > 0.01
                    AND p.estado_entrega != 'anulado'
                GROUP BY c.id, c.nombre, c.apellido, c.telefono
                HAVING balance > 0
                ORDER BY balance DESC
                LIMIT ? OFFSET ?
            `;

            const countQuery = `
                SELECT COUNT(DISTINCT c.id) as total
                FROM pedidos p
                INNER JOIN clientes c ON p.cliente_id = c.id
                WHERE (p.total_usd - COALESCE(p.total_abono_usd, 0)) > 0.01
                    AND p.estado_entrega != 'anulado'
            `;

            const accounts = db.prepare(query).all(parseInt(limit), offset);
            const { total } = db.prepare(countQuery).get();

            res.json({
                success: true,
                data: accounts,
                meta: {
                    total: total || 0,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil((total || 0) / parseInt(limit))
                }
            });
        } catch (error) {
            console.error('Accounts receivable error:', error);
            res.status(500).json({ success: false, error: 'Error fetching accounts' });
        }
    });

    // GET /api/accounts-receivable/stats
    app.get('/api/accounts-receivable/stats', (req, res) => {
        try {
            // Get total pending balance and count of overdue accounts
            const statsQuery = `
                SELECT 
                    COUNT(DISTINCT CASE WHEN (p.total_usd - COALESCE(p.total_abono_usd, 0)) > 0.01 THEN c.id END) as totalAccounts,
                    SUM(p.total_usd - COALESCE(p.total_abono_usd, 0)) as totalPending,
                    COUNT(DISTINCT CASE 
                        WHEN (p.total_usd - COALESCE(p.total_abono_usd, 0)) > 0.01 
                        AND julianday('now') - julianday(p.fecha_pedido) > 30 
                        THEN c.id 
                    END) as overdueCount
                FROM pedidos p
                INNER JOIN clientes c ON p.cliente_id = c.id
                WHERE (p.total_usd - COALESCE(p.total_abono_usd, 0)) > 0.01
                    AND p.estado_entrega != 'anulado'
            `;

            const stats = db.prepare(statsQuery).get();

            // Calculate Buckets based on Order Date (fecha_pedido)
            const bucketsQuery = `
                SELECT 
                    SUM(CASE 
                        WHEN (julianday('now') - julianday(p.fecha_pedido)) <= 30 
                        THEN (p.total_usd - COALESCE(p.total_abono_usd, 0)) 
                        ELSE 0 
                    END) as bucket_0_30,
                    
                    SUM(CASE 
                        WHEN (julianday('now') - julianday(p.fecha_pedido)) > 30 AND (julianday('now') - julianday(p.fecha_pedido)) <= 60
                        THEN (p.total_usd - COALESCE(p.total_abono_usd, 0)) 
                        ELSE 0 
                    END) as bucket_31_60,
                    
                    SUM(CASE 
                        WHEN (julianday('now') - julianday(p.fecha_pedido)) > 60 AND (julianday('now') - julianday(p.fecha_pedido)) <= 90
                        THEN (p.total_usd - COALESCE(p.total_abono_usd, 0)) 
                        ELSE 0 
                    END) as bucket_61_90,
                    
                    SUM(CASE 
                        WHEN (julianday('now') - julianday(p.fecha_pedido)) > 90
                        THEN (p.total_usd - COALESCE(p.total_abono_usd, 0)) 
                        ELSE 0 
                    END) as bucket_90_plus
                FROM pedidos p
                WHERE (p.total_usd - COALESCE(p.total_abono_usd, 0)) > 0.01
                    AND p.estado_entrega != 'anulado'
            `;

            const buckets = db.prepare(bucketsQuery).get();

            res.json({
                success: true,
                data: {
                    totalReceivable: stats.totalPending || 0, // Frontend expects totalReceivable
                    totalPending: stats.totalPending || 0,
                    overdueCount: stats.overdueCount || 0,
                    overdueTotal: stats.totalPending || 0, // Approximated
                    bucket_0_30: buckets.bucket_0_30 || 0,
                    bucket_31_60: buckets.bucket_31_60 || 0,
                    bucket_61_90: buckets.bucket_61_90 || 0,
                    bucket_90_plus: buckets.bucket_90_plus || 0
                }
            });
        } catch (error) {
            console.error('Accounts receivable stats error:', error);
            res.status(500).json({ success: false, error: 'Error fetching stats' });
        }
    });

    console.log('✅ Accounts receivable routes loaded');
}

