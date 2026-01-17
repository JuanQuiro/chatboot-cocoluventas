
import databaseService from '../config/database.service.js';

class ReportsService {
    constructor() {
        this.db = null;
    }

    _getDb() {
        if (!this.db) {
            this.db = databaseService.getDatabase();
        }
        return this.db;
    }

    /**
     * Generate Comprehensive P&L (Profit & Loss) Statement
     * @param {string} startDate YYYY-MM-DD
     * @param {string} endDate YYYY-MM-DD
     */
    async getPnL(startDate, endDate) {
        const db = this._getDb();

        // 1. Total Revenue (Sales)
        const revenue = db.prepare(`
            SELECT COALESCE(SUM(total_usd), 0) as total 
            FROM pedidos 
            WHERE date(fecha_pedido) BETWEEN date(?) AND date(?)
            AND estado_entrega != 'anulado'
        `).get(startDate, endDate).total;

        // 2. COGS (Cost of Goods Sold)
        // We need to look up costs. 
        // For Variants: Link via variante_id -> productos_variantes.costo_usd
        // For Legacy: Link via producto_id -> productos.precio_usd (Approximation? No, assume 0 or need column) -> Assume 0 for safety or schema change?
        // Wait, for 006 hardening we only added variante_id. 
        // Best effort: Get items and sum (qty * cost).

        const cogsQuery = db.prepare(`
            SELECT 
                d.cantidad, 
                pv.costo_usd as variant_cost
            FROM detalles_pedido d
            JOIN pedidos p ON d.pedido_id = p.id
            LEFT JOIN productos_variantes pv ON d.variante_id = pv.id
            WHERE date(p.fecha_pedido) BETWEEN date(?) AND date(?)
            AND p.estado_entrega != 'anulado'
        `);

        const items = cogsQuery.all(startDate, endDate);
        let cogs = 0;
        for (const item of items) {
            // If variant_cost exists, use it. Legacy? Assume 0 (pure profit) or TODO.
            // We will document that Legacy items have 0 cost unless migrated.
            if (item.variant_cost) {
                cogs += (item.variant_cost * item.cantidad);
            }
        }

        // 3. Commissions Paid
        const commissions = db.prepare(`
            SELECT COALESCE(SUM(monto_comision), 0) as total 
            FROM pedidos 
            WHERE date(fecha_pedido) BETWEEN date(?) AND date(?)
            AND estado_entrega != 'anulado'
        `).get(startDate, endDate).total;

        // 4. Operating Expenses (Gastos)
        const expenses = db.prepare(`
            SELECT COALESCE(SUM(monto_total_usd), 0) as total 
            FROM gastos 
            WHERE date(created_at) BETWEEN date(?) AND date(?)
            AND estado != 'anulado'
        `).get(startDate, endDate).total;

        const grossProfit = revenue - cogs;
        const netProfit = grossProfit - commissions - expenses;
        const marginPercent = revenue > 0 ? ((netProfit / revenue) * 100) : 0;

        return {
            period: { start: startDate, end: endDate },
            revenue,
            cogs,
            grossProfit,
            commissions,
            expenses,
            netProfit,
            marginPercent: parseFloat(marginPercent.toFixed(2))
        };
    }

    /**
     * Product Performance Report (Winners & Losers)
     */
    async getProductPerformance(startDate, endDate) {
        const db = this._getDb();
        const stmt = db.prepare(`
            SELECT 
                d.nombre_producto,
                SUM(d.cantidad) as units_sold,
                SUM(d.cantidad * d.precio_unitario_usd) as revenue,
                pv.costo_usd
            FROM detalles_pedido d
            JOIN pedidos p ON d.pedido_id = p.id
            LEFT JOIN productos_variantes pv ON d.variante_id = pv.id
            WHERE date(p.fecha_pedido) BETWEEN date(?) AND date(?)
            AND p.estado_entrega != 'anulado'
            GROUP BY d.nombre_producto, pv.costo_usd
            ORDER BY revenue DESC
        `);

        // We process in JS to calculate profit for each group
        const rawStats = stmt.all(startDate, endDate);

        return rawStats.map(item => {
            const cost = item.costo_usd || 0;
            const cogs = item.units_sold * cost;
            const profit = item.revenue - cogs;
            const margin = item.revenue > 0 ? (profit / item.revenue) * 100 : 0;

            return {
                name: item.nombre_producto,
                units_sold: item.units_sold,
                revenue: item.revenue,
                cogs,
                profit,
                margin: parseFloat(margin.toFixed(1))
            };
        });
    }
}

export default new ReportsService();
