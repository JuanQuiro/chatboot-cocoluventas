
import databaseService from '../config/database.service.js';

class ManufacturersService {
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
     * Get all manufacturers with their current workload
     */
    getAllWithWorkload() {
        const db = this._getDb();
        // Count active orders (not delivered, not cancelled)
        const sql = `
            SELECT 
                f.*, 
                COUNT(p.id) as current_workload
            FROM fabricantes f
            LEFT JOIN pedidos p ON p.fabricante_id = f.id 
                AND p.estado_entrega NOT IN ('entregado', 'anulado', 'cancelado')
            WHERE f.activo = 1
            GROUP BY f.id
        `;
        return db.prepare(sql).all();
    }

    /**
     * Get specific manufacturer details
     */
    getById(id) {
        const db = this._getDb();
        return db.prepare('SELECT * FROM fabricantes WHERE id = ?').get(id);
    }

    /**
     * Auto-assign manufacturer to an order
     * Strategy: Least Workload (Balance)
     */
    async assignNextManufacturer() {
        const manufacturers = this.getAllWithWorkload();

        if (manufacturers.length === 0) return null;

        // Sort by workload ASC
        manufacturers.sort((a, b) => a.current_workload - b.current_workload);

        // Pick the one with least work
        return manufacturers[0];
    }

    /**
     * Create new manufacturer
     */
    create(data) {
        const db = this._getDb();
        const stmt = db.prepare('INSERT INTO fabricantes (nombre, especialidad) VALUES (?, ?)');
        const info = stmt.run(data.nombre, data.especialidad || 'general');
        return { id: info.lastInsertRowid, ...data };
    }

    /**
     * Update manufacturer
     */
    update(id, data) {
        const db = this._getDb();
        const stmt = db.prepare('UPDATE fabricantes SET nombre = ?, especialidad = ?, activo = ? WHERE id = ?');
        stmt.run(data.nombre, data.especialidad, data.activo ? 1 : 0, id);
        return this.getById(id);
    }
}

export default new ManufacturersService();
