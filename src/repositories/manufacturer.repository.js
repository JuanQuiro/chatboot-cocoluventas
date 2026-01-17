import databaseService from '../config/database.service.js';

class ManufacturerRepository {
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
     * Get all manufacturers
     */
    getAll() {
        const db = this._getDb();
        const stmt = db.prepare(`
            SELECT 
                f.*,
                COUNT(DISTINCT p.id) as carga_actual,
                COUNT(DISTINCT CASE WHEN p.estado_entrega = 'entregado' THEN p.id END) as pedidos_completados
            FROM fabricantes f
            LEFT JOIN pedidos p ON f.id = p.fabricante_id 
                AND p.estado_entrega NOT IN ('anulado', 'entregado')
            WHERE f.activo = 1
            GROUP BY f.id
            ORDER BY f.nombre
        `);
        return stmt.all();
    }

    /**
     * Get manufacturer by ID
     */
    getById(id) {
        const db = this._getDb();
        const stmt = db.prepare('SELECT * FROM fabricantes WHERE id = ?');
        return stmt.get(id);
    }

    /**
     * Create new manufacturer
     */
    create(data) {
        const db = this._getDb();
        const stmt = db.prepare(`
            INSERT INTO fabricantes (
                nombre, especialidad, tarifa_base, capacidad_maxima,
                tiempo_entrega_dias, contacto_telefono, contacto_email,
                notas, activo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const info = stmt.run(
            data.nombre,
            data.especialidad || 'general',
            data.tarifa_base || 0,
            data.capacidad_maxima || 10,
            data.tiempo_entrega_dias || 7,
            data.contacto_telefono || null,
            data.contacto_email || null,
            data.notas || null,
            data.activo !== undefined ? data.activo : 1
        );

        return { id: info.lastInsertRowid, ...data };
    }

    /**
     * Update manufacturer
     */
    update(id, data) {
        const db = this._getDb();
        const stmt = db.prepare(`
            UPDATE fabricantes 
            SET nombre = ?,
                especialidad = ?,
                tarifa_base = ?,
                capacidad_maxima = ?,
                tiempo_entrega_dias = ?,
                contacto_telefono = ?,
                contacto_email = ?,
                notas = ?,
                activo = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        stmt.run(
            data.nombre,
            data.especialidad,
            data.tarifa_base,
            data.capacidad_maxima,
            data.tiempo_entrega_dias,
            data.contacto_telefono,
            data.contacto_email,
            data.notas,
            data.activo,
            id
        );

        return this.getById(id);
    }

    /**
     * Delete (soft delete) manufacturer
     */
    delete(id) {
        const db = this._getDb();
        const stmt = db.prepare('UPDATE fabricantes SET activo = 0 WHERE id = ?');
        stmt.run(id);
        return { success: true };
    }

    /**
     * Get manufacturer statistics
     */
    getStats(id) {
        const db = this._getDb();

        // Total orders
        const ordersStmt = db.prepare(`
            SELECT 
                COUNT(*) as total_pedidos,
                COUNT(CASE WHEN estado_entrega = 'entregado' THEN 1 END) as completados,
                COUNT(CASE WHEN estado_entrega NOT IN ('anulado', 'entregado') THEN 1 END) as activos
            FROM pedidos
            WHERE fabricante_id = ?
        `);
        const orders = ordersStmt.get(id);

        // Revenue generated
        const revenueStmt = db.prepare(`
            SELECT 
                SUM(d.cantidad * f.tarifa_base) as ingresos_generados
            FROM pedidos p
            JOIN detalles_pedido d ON p.id = d.pedido_id
            JOIN fabricantes f ON p.fabricante_id = f.id
            WHERE p.fabricante_id = ? AND p.estado_entrega = 'entregado'
        `);
        const revenue = revenueStmt.get(id);

        // Average delivery time
        const deliveryStmt = db.prepare(`
            SELECT 
                AVG(JULIANDAY(fecha_entrega) - JULIANDAY(fecha_pedido)) as tiempo_promedio
            FROM pedidos
            WHERE fabricante_id = ? AND estado_entrega = 'entregado'
                AND fecha_entrega IS NOT NULL
        `);
        const delivery = deliveryStmt.get(id);

        return {
            ...orders,
            ingresos_generados: revenue.ingresos_generados || 0,
            tiempo_promedio_dias: Math.round(delivery.tiempo_promedio || 0)
        };
    }

    /**
     * Get manufacturer order history
     */
    getOrderHistory(id, limit = 10) {
        const db = this._getDb();
        const stmt = db.prepare(`
            SELECT 
                p.id,
                p.fecha_pedido,
                p.fecha_entrega,
                p.estado_entrega,
                p.total_usd,
                c.nombre as cliente_nombre,
                c.apellido as cliente_apellido
            FROM pedidos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            WHERE p.fabricante_id = ?
            ORDER BY p.fecha_pedido DESC
            LIMIT ?
        `);
        return stmt.all(id, limit);
    }
}

export default new ManufacturerRepository();
