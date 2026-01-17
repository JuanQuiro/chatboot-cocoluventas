import databaseService from '../config/database.service.js';

class VariantRepository {
    constructor() {
        this.db = null;
    }

    _getDb() {
        if (!this.db) {
            this.db = databaseService.getDatabase();
        }
        return this.db;
    }

    getByBaseProductId(baseId) {
        const db = this._getDb();
        const stmt = db.prepare(`
            SELECT pv.*, p.nombre as proveedor_nombre, p.pais as proveedor_pais, 
                   p.tiempo_entrega_promedio_dias
            FROM productos_variantes pv
            JOIN proveedores p ON pv.proveedor_id = p.id
            WHERE pv.producto_base_id = ? AND pv.disponible = 1
            ORDER BY 
                CASE pv.nivel_calidad 
                    WHEN 'luxury' THEN 1 
                    WHEN 'premium' THEN 2 
                    WHEN 'estandar' THEN 3 
                    ELSE 4 
                END
        `);
        return stmt.all(baseId);
    }

    getById(id) {
        const db = this._getDb();
        const stmt = db.prepare(`
            SELECT pv.*, pb.nombre as producto_base_nombre, 
                   p.nombre as proveedor_nombre, p.pais as proveedor_pais
            FROM productos_variantes pv
            JOIN productos_base pb ON pv.producto_base_id = pb.id
            JOIN proveedores p ON pv.proveedor_id = p.id
            WHERE pv.id = ?
        `);
        return stmt.get(id);
    }

    create(data) {
        const db = this._getDb();
        const stmt = db.prepare(`
            INSERT INTO productos_variantes (
                producto_base_id, proveedor_id, sku_variante, nombre_variante,
                material, peso_gramos, dimensiones, acabado, pureza_metal,
                nivel_calidad, garantia_meses, certificado_tipo,
                costo_usd, precio_venta_usd, stock_actual, stock_minimo, 
                ubicacion_actual, disponible
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const info = stmt.run(
            data.producto_base_id,
            data.proveedor_id,
            data.sku_variante,
            data.nombre_variante,
            data.material,
            data.peso_gramos,
            data.dimensiones,
            data.acabado,
            data.pureza_metal,
            data.nivel_calidad,
            data.garantia_meses || 0,
            data.certificado_tipo,
            data.costo_usd || 0,
            data.precio_venta_usd,
            data.stock_actual || 0,
            data.stock_minimo || 0,
            data.ubicacion_actual,
            data.disponible !== undefined ? data.disponible : 1
        );

        return this.getById(info.lastInsertRowid);
    }

    search(query) {
        const db = this._getDb();
        const term = `%${query}%`;
        // Search in variants AND base products
        const stmt = db.prepare(`
            SELECT pv.*, pb.nombre as producto_nombre_base,
                   p.nombre as proveedor_nombre
            FROM productos_variantes pv
            JOIN productos_base pb ON pv.producto_base_id = pb.id
            JOIN proveedores p ON pv.proveedor_id = p.id
            WHERE pv.disponible = 1 
              AND (
                  pv.nombre_variante LIKE ? 
                  OR pv.sku_variante LIKE ?
                  OR pb.nombre LIKE ?
              )
            ORDER BY pb.nombre, pv.nivel_calidad
        `);
        return stmt.all(term, term, term);
    }

    updateStock(id, newStock) {
        const db = this._getDb();
        const stmt = db.prepare('UPDATE productos_variantes SET stock_actual = ? WHERE id = ?');
        stmt.run(newStock, id);
        return this.getById(id);
    }

    decrementStock(id, quantity) {
        const db = this._getDb();
        const stmt = db.prepare('UPDATE productos_variantes SET stock_actual = stock_actual - ? WHERE id = ?');
        stmt.run(quantity, id);
        return this.getById(id);
    }

    update(id, data) {
        const db = this._getDb();

        // Dynamic Update Query Builder
        const fields = [];
        const values = [];

        if (data.sku_variante !== undefined) { fields.push('sku_variante = ?'); values.push(data.sku_variante); }
        if (data.nombre_variante !== undefined) { fields.push('nombre_variante = ?'); values.push(data.nombre_variante); }
        if (data.costo_usd !== undefined) { fields.push('costo_usd = ?'); values.push(data.costo_usd); }
        if (data.precio_venta_usd !== undefined) { fields.push('precio_venta_usd = ?'); values.push(data.precio_venta_usd); }
        if (data.stock_actual !== undefined) { fields.push('stock_actual = ?'); values.push(data.stock_actual); }
        if (data.stock_minimo !== undefined) { fields.push('stock_minimo = ?'); values.push(data.stock_minimo); }
        if (data.ubicacion_actual !== undefined) { fields.push('ubicacion_actual = ?'); values.push(data.ubicacion_actual); }
        if (data.disponible !== undefined) { fields.push('disponible = ?'); values.push(data.disponible); }

        if (fields.length === 0) return this.getById(id);

        values.push(id);
        const stmt = db.prepare(`UPDATE productos_variantes SET ${fields.join(', ')} WHERE id = ?`);
        stmt.run(...values);

        return this.getById(id);
    }
}

export default new VariantRepository();
