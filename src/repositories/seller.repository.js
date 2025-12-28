/**
 * Seller Repository
 * Manejo de persistencia para Vendedores (SQLite)
 */
import databaseService from '../config/database.service.js';

class SellerRepository {
    constructor() {
        this.db = databaseService.getDatabase();
    }

    /**
     * Get all sellers
     */
    findAll() {
        const stmt = this.db.prepare('SELECT * FROM sellers');
        return stmt.all().map(row => this._parseSeller(row));
    }

    /**
     * Get active sellers
     */
    findActive() {
        const stmt = this.db.prepare('SELECT * FROM sellers WHERE active = 1');
        return stmt.all().map(row => this._parseSeller(row));
    }

    /**
     * Get seller by ID
     */
    findById(id) {
        const stmt = this.db.prepare('SELECT * FROM sellers WHERE id = ?');
        const seller = stmt.get(id);
        return seller ? this._parseSeller(seller) : null;
    }

    /**
     * Get seller by email
     */
    findByEmail(email) {
        const stmt = this.db.prepare('SELECT * FROM sellers WHERE email = ?');
        const seller = stmt.get(email);
        return seller ? this._parseSeller(seller) : null;
    }

    /**
     * Create new seller
     */
    create(sellerData) {
        const stmt = this.db.prepare(`
            INSERT INTO sellers (name, email, phone, active, status, specialty, max_clients, work_schedule, days_off)
            VALUES (@name, @email, @phone, @active, @status, @specialty, @max_clients, @work_schedule, @days_off)
        `);

        const info = stmt.run({
            name: sellerData.name,
            email: sellerData.email,
            phone: sellerData.phone || null,
            active: sellerData.active === undefined ? 1 : (sellerData.active ? 1 : 0),
            status: sellerData.status || 'offline',
            specialty: sellerData.specialty || 'general',
            max_clients: sellerData.maxClients || 50,
            work_schedule: JSON.stringify(sellerData.workSchedule || {}),
            days_off: JSON.stringify(sellerData.daysOff || [])
        });
        return this.findById(info.lastInsertRowid);
    }

    /**
     * Update seller
     */
    update(id, sellerData) {
        const current = this.findById(id);
        if (!current) return null;

        const updated = { ...current, ...sellerData };

        const stmt = this.db.prepare(`
            UPDATE sellers 
            SET name = @name, email = @email, phone = @phone, active = @active, 
                status = @status, specialty = @specialty, max_clients = @max_clients,
                current_clients = @current_clients, rating = @rating,
                work_schedule = @work_schedule, days_off = @days_off,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = @id
        `);

        stmt.run({
            id,
            name: updated.name,
            email: updated.email,
            phone: updated.phone,
            active: updated.active ? 1 : 0,
            status: updated.status,
            specialty: updated.specialty,
            max_clients: updated.maxClients,
            current_clients: updated.currentClients,
            rating: updated.rating,
            work_schedule: typeof updated.workSchedule === 'string' ? updated.workSchedule : JSON.stringify(updated.workSchedule),
            days_off: typeof updated.daysOff === 'string' ? updated.daysOff : JSON.stringify(updated.daysOff)
        });

        return this.findById(id);
    }

    /**
     * Update seller status
     */
    updateStatus(id, status) {
        const stmt = this.db.prepare('UPDATE sellers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        stmt.run(status, id);
        return this.findById(id);
    }

    /**
     * Find active assignments
     */
    findActiveAssignments() {
        try {
            const stmt = this.db.prepare("SELECT * FROM seller_assignments WHERE status = 'active'");
            return stmt.all();
        } catch (error) {
            // If table doesn't exist yet (schema update lag), return empty
            return [];
        }
    }

    /**
     * Assign seller to user
     */
    assignSeller(userId, sellerId) {
        const stmt = this.db.prepare(`
            INSERT INTO seller_assignments (user_id, seller_id, status)
            VALUES (?, ?, 'active')
        `);
        stmt.run(userId, sellerId);
    }

    /**
     * Delete seller
     */
    delete(id) {
        const stmt = this.db.prepare('DELETE FROM sellers WHERE id = ?');
        const info = stmt.run(id);
        return info.changes > 0;
    }

    _safeParse(jsonString, fallback) {
        if (!jsonString) return fallback;
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            return fallback;
        }
    }

    _parseSeller(row) {
        return {
            ...row,
            active: Boolean(row.active),
            workSchedule: this._safeParse(row.work_schedule, {}),
            daysOff: this._safeParse(row.days_off, []),
            maxClients: row.max_clients,
            currentClients: row.current_clients,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}

export default new SellerRepository();
