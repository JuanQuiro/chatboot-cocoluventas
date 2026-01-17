
import databaseService from '../config/database.service.js';
import sellersService from './sellers.service.js';

class CommissionsService {
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
     * Calculate commission for an order
     * @param {number} orderTotalUsd 
     * @param {number} sellerId 
     * @returns {Promise<number>} commission amount in USD
     */
    async calculateOrderCommission(orderTotalUsd, sellerId) {
        try {
            const seller = await sellersService.getById(sellerId);
            if (!seller) return 0;

            const rate = seller.commission_rate || 0; // percentage
            return (orderTotalUsd * rate) / 100;
        } catch (error) {
            console.error('Error calculating commission:', error);
            return 0;
        }
    }

    /**
     * Get commission summary for all sellers
     */
    async getSellersSummary(startDate, endDate) {
        const db = this._getDb();

        // 1. Get total sales and commissions per seller
        const stmt = db.prepare(`
            SELECT 
                v.id,
                v.name,
                v.email,
                v.commission_rate,
                COUNT(p.id) as total_pedidos,
                SUM(p.total_usd) as total_ventas,
                SUM(p.monto_comision) as total_comision_generada
            FROM sellers v
            LEFT JOIN pedidos p ON v.id = p.vendedor_id
                AND p.created_at BETWEEN ? AND ?
                AND p.estado_entrega != 'anulado'
            WHERE v.active = 1
            GROUP BY v.id
        `);

        // Default dates: this month
        const start = startDate || new Date().toISOString().slice(0, 8) + '01';
        const end = endDate || new Date().toISOString().slice(0, 10);

        return stmt.all(start, end);
    }

    /**
     * Get commission summary for manufacturers
     */
    async getManufacturersSummary(startDate, endDate) {
        const db = this._getDb();

        const stmt = db.prepare(`
            SELECT 
                f.id,
                f.nombre,
                f.tarifa_base,
                COUNT(p.id) as total_pedidos,
                SUM(d.cantidad) as total_piezas,
                SUM(d.cantidad * f.tarifa_base) as total_ganado
            FROM fabricantes f
            LEFT JOIN pedidos p ON f.id = p.fabricante_id
                AND p.created_at BETWEEN ? AND ?
                AND p.estado_entrega != 'anulado'
            LEFT JOIN detalles_pedido d ON p.id = d.pedido_id
            WHERE f.activo = 1
            GROUP BY f.id
        `);

        const start = startDate || new Date().toISOString().slice(0, 8) + '01';
        const end = endDate || new Date().toISOString().slice(0, 10);

        return stmt.all(start, end);
    }

    /**
     * Get seller commission rate
     */
    getSellerRate(sellerId) {
        const db = this._getDb();
        const seller = db.prepare('SELECT id, name, commission_rate FROM sellers WHERE id = ?').get(sellerId);
        return seller || { id: sellerId, commission_rate: 0 };
    }

    /**
     * Update rate (wrapper for updateConfig)
     */
    updateRate(data) {
        return this.updateConfig(data.entityType, data.entityId, data.type, data.value);
    }

    /**
     * Update configuration (seller rate or manufacturer fixed rate)
     */
    updateConfig(entityType, entityId, type, value) {
        const db = this._getDb();

        if (entityType === 'seller') {
            const stmt = db.prepare('UPDATE sellers SET commission_rate = ? WHERE id = ?');
            stmt.run(value, entityId);
        } else if (entityType === 'manufacturer') {
            const stmt = db.prepare('UPDATE fabricantes SET tarifa_base = ? WHERE id = ?');
            stmt.run(value, entityId);
        }

        return { success: true };
    }
}

export default new CommissionsService();
