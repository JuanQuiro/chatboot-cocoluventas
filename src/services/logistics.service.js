import databaseService from '../config/database.service.js';

class LogisticsService {
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
     * Find best stock sources for a request
     * Priority: LOWEST Lead Time (Local -> India -> China)
     */
    findStockSources(variantId, quantityNeeded) {
        const db = this._getDb();

        // 1. Get all stock locations for this variant, ordered by speed (lead_time)
        const sources = db.prepare(`
            SELECT 
                vsl.location_id, 
                vsl.quantity,
                l.code,
                l.lead_time_days
            FROM variant_stock_locations vsl
            JOIN locations l ON vsl.location_id = l.id
            WHERE vsl.variante_id = ? AND vsl.quantity > 0
            ORDER BY l.lead_time_days ASC
        `).all(variantId);

        let remaining = quantityNeeded;
        let maxLeadTime = 0;
        const allocation = [];

        for (const source of sources) {
            if (remaining <= 0) break;

            const take = Math.min(remaining, source.quantity);
            allocation.push({
                location_id: source.location_id,
                code: source.code,
                taken: take,
                lead_time: source.lead_time_days
            });

            if (source.lead_time_days > maxLeadTime) {
                maxLeadTime = source.lead_time_days;
            }

            remaining -= take;
        }

        if (remaining > 0) {
            // Not enough stock across the world!
            return { fully_stocked: false, missing: remaining, allocation, max_lead_time: maxLeadTime };
        }

        return { fully_stocked: true, missing: 0, allocation, max_lead_time: maxLeadTime };
    }

    /**
     * Calculate Estimated Delivery Date
     * @param {number} maxLeadTimeDays 
     */
    calculateDeliveryDate(maxLeadTimeDays) {
        const date = new Date();
        date.setDate(date.getDate() + maxLeadTimeDays);
        return date.toISOString().slice(0, 10); // YYYY-MM-DD
    }

    /**
     * Commit the stock allocation (Decrement from specific locations)
     * Must be called inside a transaction ideally, or we rely on the caller's transaction.
     * @param {Array} allocation [{ location_id, taken, ... }]
     * @param {number} variantId
     */
    commitAllocation(variantId, allocation) {
        const db = this._getDb();
        const stmt = db.prepare('UPDATE variant_stock_locations SET quantity = quantity - ? WHERE variante_id = ? AND location_id = ?');

        for (const alloc of allocation) {
            if (alloc.taken > 0) {
                stmt.run(alloc.taken, variantId, alloc.location_id);
                console.log(`📉 Stock Deducted: ${alloc.taken} from ${alloc.code} (Variant ${variantId})`);
            }
        }
    }
}

export default new LogisticsService();
