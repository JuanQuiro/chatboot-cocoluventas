
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
     * Calculate commission for an order with Profit Protection (Smart Logic)
     * @param {Object} orderData Full order object with items
     * @param {number} sellerId 
     * @returns {Promise<number>} commission amount in USD
     */
    async calculateOrderCommission(orderData, sellerId) {
        try {
            const db = this._getDb();
            const seller = await sellersService.getById(sellerId);
            if (!seller) return 0;

            const rate = seller.commission_rate || 0; // standard percentage on revenue

            // ⚙️ FETCH CONFIG (Allow User Override)
            let maxProfitShare = 50; // Default
            let mode = 'smart';      // Default

            try {
                const configShare = db.prepare("SELECT value FROM meta_config WHERE key = 'COMMISSION_MAX_PROFIT_SHARE'").get();
                if (configShare) maxProfitShare = parseFloat(configShare.value);

                const configMode = db.prepare("SELECT value FROM meta_config WHERE key = 'COMMISSION_MODE'").get();
                if (configMode) mode = configMode.value;
            } catch (err) {
                console.warn('⚠️ Could not fetch commission config, using defaults.');
            }

            // Fallback for empty/legacy
            if (!orderData.productos || orderData.productos.length === 0) {
                return ((orderData.total_usd || 0) * rate) / 100;
            }

            let totalCommission = 0;

            for (const item of orderData.productos) {
                // Determine item revenue
                const itemRevenue = (item.precio_unitario || 0) * (item.cantidad || 0);

                // Calculate Base Commission (Revenue Logic)
                let itemCommission = (itemRevenue * rate) / 100;

                // 🛡️ PROFIT GUARD LOGIC (Only if Mode is 'smart') 🛡️
                if (mode === 'smart' && item.costo_usd) {
                    const itemCost = (item.costo_usd) * (item.cantidad || 0);
                    const grossProfit = itemRevenue - itemCost;

                    // If profit is positive, calculate Max Allowable Commission
                    if (grossProfit > 0) {
                        const maxCommission = (grossProfit * maxProfitShare) / 100;
                        if (itemCommission > maxCommission) {
                            // Capped
                            itemCommission = maxCommission;
                        }
                    } else {
                        // Loss = Zero Commission
                        itemCommission = 0;
                    }
                }

                totalCommission += itemCommission;
            }

            return totalCommission;
        } catch (error) {
            console.error('Error calculating smart commission:', error);
            return ((orderData.total_usd || 0) * 0) / 100;
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

        const runUpdate = db.transaction(() => {
            if (entityType === 'seller') {
                // Get old value for log (optional, but good)
                const old = db.prepare('SELECT commission_rate FROM sellers WHERE id = ?').get(entityId);
                const oldVal = old ? old.commission_rate : 'unknown';

                const stmt = db.prepare('UPDATE sellers SET commission_rate = ? WHERE id = ?');
                stmt.run(value, entityId);

                // Audit Log
                db.prepare(`
                    INSERT INTO meta_config_history (key, value, changed_by) 
                    VALUES (?, ?, ?)
                `).run(`USER:${entityId}:COMMISSION_RATE`, `${oldVal} -> ${value}`, 'admin'); // Assuming 'admin' for now

            } else if (entityType === 'manufacturer') {
                const stmt = db.prepare('UPDATE fabricantes SET tarifa_base = ? WHERE id = ?');
                stmt.run(value, entityId);
            } else if (entityType === 'global') {
                // Support GLOBAL config updates via this service too
                const stmt = db.prepare('INSERT OR REPLACE INTO meta_config (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
                stmt.run(entityId, value); // here entityId acts as Key

                db.prepare(`
                    INSERT INTO meta_config_history (key, value, changed_by) 
                    VALUES (?, ?, ?)
                `).run(entityId, value, 'admin');
            }
        });

        runUpdate();
        return { success: true };
    }
}

export default new CommissionsService();
