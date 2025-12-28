/**
 * Servicio de Analytics y Métricas
 * Monitoreo REAL de ventas (Base de Datos) + Métricas en vivo (Memoria)
 */
import databaseService from '../config/database.service.js';

class AnalyticsService {
    constructor() {
        this.db = null;
        // Ephemeral metrics (Real-time monitoring)
        this.activeUsers = new Set();
        this.metrics = {
            activeUsers: 0
        };
    }

    _getDb() {
        if (!this.db) {
            this.db = databaseService.getDatabase();
        }
        return this.db;
    }

    /**
     * Obtener Resumen Ejecutivo (Dashboard Command Center)
     * - Ventas Diarias (USD)
     * - Ventas Semanal (Sábado - Viernes)
     * - Ventas Mensual (1er día - Actual)
     */
    getExecutiveSummary() {
        try {
            const db = this._getDb();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 1. Daily Sales
            const daily = db.prepare(`
                SELECT COALESCE(SUM(total_usd), 0) as total, COUNT(*) as count 
                FROM pedidos 
                WHERE date(fecha_pedido) >= date('now', 'localtime') 
                AND estado_entrega != 'anulado'
            `).get();

            // 2. Weekly Sales (Saturday - Friday Cycle)
            const { start: weekStart, end: weekEnd } = this._getCocoluWeekRange(today);
            const weekly = db.prepare(`
                SELECT COALESCE(SUM(total_usd), 0) as total, COUNT(*) as count 
                FROM pedidos 
                WHERE date(fecha_pedido) >= date(?) AND date(fecha_pedido) <= date(?)
                AND estado_entrega != 'anulado'
            `).get(weekStart.toISOString(), weekEnd.toISOString());

            // 3. Monthly Sales (1st to Current)
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthly = db.prepare(`
                SELECT COALESCE(SUM(total_usd), 0) as total, COUNT(*) as count 
                FROM pedidos 
                WHERE date(fecha_pedido) >= date(?)
                AND estado_entrega != 'anulado'
            `).get(monthStart.toISOString());

            return {
                daily: { total: daily.total, orders: daily.count },
                weekly: { total: weekly.total, orders: weekly.count, range: { start: weekStart, end: weekEnd } },
                monthly: { total: monthly.total, orders: monthly.count },
                activeUsers: this.activeUsers.size
            };
        } catch (error) {
            console.error('❌ Error getting executive summary:', error);
            return {
                daily: { total: 0, orders: 0 },
                weekly: { total: 0, orders: 0 },
                monthly: { total: 0, orders: 0 },
                error: error.message
            };
        }
    }

    /**
     * Helper: Calculate Cocolu Week (Sat -> Fri)
     * If today is Sunday (0), Start was yesterday (Sat)
     * If today is Saturday (6), Start is today
     * If today is Friday (5), Start was last Saturday
     */
    _getCocoluWeekRange(date) {
        const d = new Date(date);
        const day = d.getDay(); // 0 (Sun) to 6 (Sat)

        // Calculate days to subtract to get to last Saturday
        // Sun(0) -> -1
        // Mon(1) -> -2
        // ...
        // Fri(5) -> -6
        // Sat(6) -> 0
        const diff = day === 6 ? 0 : -(day + 1);

        const start = new Date(d);
        start.setDate(d.getDate() + diff);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6); // Friday is 6 days after Saturday
        end.setHours(23, 59, 59, 999);

        return { start, end };
    }

    // --- Legacy/Ephemeral Tracking (Minimal Retention) ---
    trackMessage(userId) {
        this.activeUsers.add(userId);
    }
}

export default new AnalyticsService();
