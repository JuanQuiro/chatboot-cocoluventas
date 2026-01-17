import databaseService from '../config/database.service.js';

class BaseProductRepository {
    constructor() {
        this.db = null;
    }

    _getDb() {
        if (!this.db) {
            this.db = databaseService.getDatabase();
        }
        return this.db;
    }

    getAll() {
        const db = this._getDb();
        const stmt = db.prepare(`
            SELECT pb.*, c.nombre as categoria_nombre 
            FROM productos_base pb
            LEFT JOIN categorias_producto c ON pb.categoria_id = c.id
            WHERE pb.activo = 1 
            ORDER BY pb.nombre
        `);
        return stmt.all();
    }

    getById(id) {
        const db = this._getDb();
        const stmt = db.prepare(`
            SELECT pb.*, c.nombre as categoria_nombre 
            FROM productos_base pb
            LEFT JOIN categorias_producto c ON pb.categoria_id = c.id
            WHERE pb.id = ?
        `);
        return stmt.get(id);
    }

    create(data) {
        const db = this._getDb();
        const stmt = db.prepare(`
            INSERT INTO productos_base (
                nombre, descripcion_general, categoria_id, sku_base, producto_legacy_id
            ) VALUES (?, ?, ?, ?, ?)
        `);

        const info = stmt.run(
            data.nombre,
            data.descripcion_general,
            data.categoria_id,
            data.sku_base,
            data.producto_legacy_id
        );

        return this.getById(info.lastInsertRowid);
    }

    // Searches products by name or SKU base
    search(query) {
        const db = this._getDb();
        const term = `%${query}%`;
        const stmt = db.prepare(`
            SELECT pb.*, c.nombre as categoria_nombre 
            FROM productos_base pb
            LEFT JOIN categorias_producto c ON pb.categoria_id = c.id
            WHERE pb.activo = 1 AND (pb.nombre LIKE ? OR pb.sku_base LIKE ?)
            ORDER BY pb.nombre
        `);
        return stmt.all(term, term);
    }
}

export default new BaseProductRepository();
