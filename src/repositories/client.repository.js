
import databaseService from '../config/database.service.js';

class ClientRepository {
    constructor() {
        this.db = databaseService.getDatabase();
    }

    getAll(options = {}) {
        const { page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;

        const count = this.db.prepare('SELECT COUNT(*) as count FROM clientes WHERE activo = 1').get();
        const items = this.db.prepare('SELECT * FROM clientes WHERE activo = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);

        return { items, total: count.count };
    }

    /**
     * Get clients with Aggregated Stats (LTV, Last Purchase)
     */
    getAllWithStats(options = {}) {
        const { page = 1, limit = 10, sortBy = 'last_purchase', order = 'desc' } = options;
        const offset = (page - 1) * limit;

        // Sorting mapping
        const validSorts = ['total_spent', 'last_purchase', 'created_at', 'nombre'];
        const safeSort = validSorts.includes(sortBy) ? sortBy : 'last_purchase';
        const safeOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        const sql = `
            SELECT 
                c.*,
                COALESCE(SUM(p.total_usd), 0) as total_spent,
                MAX(p.fecha_pedido) as last_purchase,
                COUNT(p.id) as purchase_count
            FROM clientes c
            LEFT JOIN pedidos p ON c.id = p.cliente_id AND p.estado_entrega != 'anulado'
            WHERE c.activo = 1
            GROUP BY c.id
            ORDER BY ${safeSort} ${safeOrder}
            LIMIT ? OFFSET ?
        `;

        const countBase = `
            SELECT COUNT(DISTINCT c.id) as count 
            FROM clientes c 
            LEFT JOIN pedidos p ON c.id = p.cliente_id 
            WHERE c.activo = 1
        `;

        const items = this.db.prepare(sql).all(limit, offset);
        const count = this.db.prepare(countBase).get();

        return { items, total: count.count };
    }

    getById(id) {
        return this.db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
    }

    getByCedula(cedula) {
        return this.db.prepare('SELECT * FROM clientes WHERE cedula = ?').get(cedula);
    }

    search(query, options = {}) {
        const { page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;
        const term = `%${query}%`;

        // Simple search without stats for now, or could upgrade
        const sql = `
            SELECT * FROM clientes 
            WHERE activo = 1 AND (
                nombre LIKE ? OR 
                apellido LIKE ? OR 
                cedula LIKE ? OR 
                telefono LIKE ?
            )
            LIMIT ? OFFSET ?
        `;

        const countSql = `
            SELECT COUNT(*) as count FROM clientes 
            WHERE activo = 1 AND (
                nombre LIKE ? OR 
                apellido LIKE ? OR 
                cedula LIKE ? OR 
                telefono LIKE ?
            )
        `;

        const items = this.db.prepare(sql).all(term, term, term, term, limit, offset);
        const count = this.db.prepare(countSql).get(term, term, term, term);

        return { items, total: count.count };
    }

    create(data) {
        const stmt = this.db.prepare(`
            INSERT INTO clientes (cedula, nombre, apellido, telefono, email, instagram, direccion)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(data.cedula, data.nombre, data.apellido, data.telefono, data.email, data.instagram || null, data.direccion);
        return this.getById(info.lastInsertRowid);
    }

    update(id, data) {
        const stmt = this.db.prepare(`
            UPDATE clientes 
            SET nombre = ?, apellido = ?, telefono = ?, email = ?, instagram = ?, direccion = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        stmt.run(data.nombre, data.apellido, data.telefono, data.email, data.instagram || null, data.direccion, id);
        return this.getById(id);
    }

    delete(id) {
        // Soft delete
        this.db.prepare('UPDATE clientes SET activo = 0 WHERE id = ?').run(id);
        return true;
    }

    restore(id) {
        this.db.prepare('UPDATE clientes SET activo = 1 WHERE id = ?').run(id);
        return true;
    }

    getStats() {
        const total = this.db.prepare('SELECT COUNT(*) as count FROM clientes').get();
        const active = this.db.prepare('SELECT COUNT(*) as count FROM clientes WHERE activo = 1').get();
        return { total: total.count, activos: active.count };
    }

    /**
     * Get top clients by total spent
     */
    getTopClients(limit = 10) {
        const sql = `
            SELECT 
                c.*,
                COALESCE(SUM(p.total_usd), 0) as total_spent,
                MAX(p.fecha_pedido) as last_purchase,
                COUNT(p.id) as purchase_count
            FROM clientes c
            LEFT JOIN pedidos p ON c.id = p.cliente_id AND p.estado_entrega != 'anulado'
            WHERE c.activo = 1
            GROUP BY c.id
            ORDER BY total_spent DESC
            LIMIT ?
        `;
        return this.db.prepare(sql).all(limit);
    }
}

export default new ClientRepository();

