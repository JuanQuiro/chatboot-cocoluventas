import db from '../../db.js';

export const sellersService = {
    /**
     * Get all sellers with optional filters
     */
    getAllSellers(filters = {}) {
        try {
            let query = `
                SELECT 
                    id, name, email, phone, active, status, specialty,
                    max_clients, current_clients, rating, work_schedule, days_off,
                    created_at, updated_at
                FROM sellers
                WHERE 1=1
            `;
            const params = [];

            if (filters.active !== undefined) {
                query += ` AND active = ?`;
                params.push(filters.active);
            }

            if (filters.status) {
                query += ` AND status = ?`;
                params.push(filters.status);
            }

            if (filters.specialty) {
                query += ` AND specialty = ?`;
                params.push(filters.specialty);
            }

            query += ` ORDER BY name ASC`;

            return db.prepare(query).all(...params);
        } catch (error) {
            console.error('Error getting sellers:', error);
            throw error;
        }
    },

    /**
     * Get seller by ID
     */
    getSellerById(id) {
        try {
            return db.prepare(`
                SELECT 
                    id, name, email, phone, active, status, specialty,
                    max_clients, current_clients, rating, work_schedule, days_off,
                    created_at, updated_at
                FROM sellers
                WHERE id = ?
            `).get(id);
        } catch (error) {
            console.error('Error getting seller:', error);
            throw error;
        }
    },

    /**
     * Create new seller
     */
    createSeller(data) {
        try {
            const stmt = db.prepare(`
                INSERT INTO sellers (
                    name, email, phone, password, active, status, specialty,
                    max_clients, current_clients, rating
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const result = stmt.run(
                data.name,
                data.email,
                data.phone || null,
                data.password || null,
                data.active !== undefined ? data.active : 1,
                data.status || 'offline',
                data.specialty || 'general',
                data.max_clients || 50,
                0, // current_clients always starts at 0
                data.rating || 5.0
            );

            return this.getSellerById(result.lastInsertRowid);
        } catch (error) {
            console.error('Error creating seller:', error);
            throw error;
        }
    },

    /**
     * Update seller
     */
    updateSeller(id, data) {
        try {
            const updates = [];
            const params = [];

            if (data.name !== undefined) {
                updates.push('name = ?');
                params.push(data.name);
            }
            if (data.email !== undefined) {
                updates.push('email = ?');
                params.push(data.email);
            }
            if (data.phone !== undefined) {
                updates.push('phone = ?');
                params.push(data.phone);
            }
            if (data.password !== undefined) {
                updates.push('password = ?');
                params.push(data.password);
            }
            if (data.active !== undefined) {
                updates.push('active = ?');
                params.push(data.active);
            }
            if (data.status !== undefined) {
                updates.push('status = ?');
                params.push(data.status);
            }
            if (data.specialty !== undefined) {
                updates.push('specialty = ?');
                params.push(data.specialty);
            }
            if (data.max_clients !== undefined) {
                updates.push('max_clients = ?');
                params.push(data.max_clients);
            }
            if (data.rating !== undefined) {
                updates.push('rating = ?');
                params.push(data.rating);
            }
            if (data.work_schedule !== undefined) {
                updates.push('work_schedule = ?');
                params.push(data.work_schedule);
            }
            if (data.days_off !== undefined) {
                updates.push('days_off = ?');
                params.push(data.days_off);
            }

            if (updates.length === 0) {
                return this.getSellerById(id);
            }

            updates.push('updated_at = CURRENT_TIMESTAMP');
            params.push(id);

            const query = `UPDATE sellers SET ${updates.join(', ')} WHERE id = ?`;
            db.prepare(query).run(...params);

            return this.getSellerById(id);
        } catch (error) {
            console.error('Error updating seller:', error);
            throw error;
        }
    },

    /**
     * Soft delete seller (set active = 0)
     */
    deleteSeller(id) {
        try {
            db.prepare('UPDATE sellers SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
            return { success: true, message: 'Seller deactivated' };
        } catch (error) {
            console.error('Error deleting seller:', error);
            throw error;
        }
    },

    /**
     * Update seller status (online/offline)
     */
    updateSellerStatus(id, status) {
        try {
            db.prepare('UPDATE sellers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                .run(status, id);
            return this.getSellerById(id);
        } catch (error) {
            console.error('Error updating seller status:', error);
            throw error;
        }
    },

    /**
     * Get seller statistics
     */
    getSellerStats() {
        try {
            const stats = db.prepare(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) as active_count,
                    SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online_count,
                    AVG(rating) as avg_rating,
                    SUM(current_clients) as total_clients
                FROM sellers
            `).get();

            return stats;
        } catch (error) {
            console.error('Error getting seller stats:', error);
            throw error;
        }
    },

    /**
     * Increment current_clients when assigning a client
     */
    assignClient(sellerId) {
        try {
            db.prepare(`
                UPDATE sellers 
                SET current_clients = current_clients + 1, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `).run(sellerId);
            return this.getSellerById(sellerId);
        } catch (error) {
            console.error('Error assigning client:', error);
            throw error;
        }
    },

    /**
     * Decrement current_clients when unassigning a client
     */
    unassignClient(sellerId) {
        try {
            db.prepare(`
                UPDATE sellers 
                SET current_clients = CASE 
                    WHEN current_clients > 0 THEN current_clients - 1 
                    ELSE 0 
                END,
                updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `).run(sellerId);
            return this.getSellerById(sellerId);
        } catch (error) {
            console.error('Error unassigning client:', error);
            throw error;
        }
    }
};
