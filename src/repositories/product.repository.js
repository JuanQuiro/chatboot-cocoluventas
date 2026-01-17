import databaseService from '../config/database.service.js';
import { getPaginationParams } from '../utils/pagination.js';

class ProductRepository {
    constructor() {
        this.db = databaseService.getDatabase();
    }

    /**
     * Get all products
     */
    /**
     * Get all products (paginated)
     */
    getAll({ page = 1, limit = 10, category } = {}) {
        const { limit: l, offset } = getPaginationParams(page, limit);
        const params = [];
        let whereClause = 'WHERE p.activo = 1';

        if (category) {
            whereClause += ' AND (c.nombre = ? OR p.categoria_id = ?)'; // Support name or ID
            params.push(category, category);
        }

        const countStmt = this.db.prepare(`
            SELECT COUNT(*) as total 
            FROM productos p
            LEFT JOIN categorias_producto c ON p.categoria_id = c.id
            ${whereClause}
        `);
        const { total } = countStmt.get(...params);

        const stmt = this.db.prepare(`
            SELECT p.*, c.nombre as categoria_nombre
            FROM productos p
            LEFT JOIN categorias_producto c ON p.categoria_id = c.id
            ${whereClause}
            ORDER BY p.nombre
            LIMIT ? OFFSET ?
        `);
        const items = stmt.all(...params, l, offset);
        return { items, total };
    }

    /**
     * Get product by ID
     */
    getById(id) {
        const stmt = this.db.prepare(`
            SELECT p.*, c.nombre as categoria_nombre
            FROM productos p
            LEFT JOIN categorias_producto c ON p.categoria_id = c.id
            WHERE p.id = ?
        `);
        return stmt.get(id);
    }

    /**
     * Get product by SKU
     */
    getBySku(sku) {
        const stmt = this.db.prepare(`
            SELECT p.*, c.nombre as categoria_nombre
            FROM productos p
            LEFT JOIN categorias_producto c ON p.categoria_id = c.id
            WHERE p.sku = ?
        `);
        return stmt.get(sku);
    }

    /**
     * Search products
     */
    /**
     * Search products (paginated)
     */
    search(query, { page = 1, limit = 10, category } = {}) {
        const { limit: l, offset } = getPaginationParams(page, limit);
        const searchTerm = `%${query}%`;

        let whereClause = 'WHERE p.activo = 1 AND (p.nombre LIKE ? OR p.sku LIKE ? OR p.descripcion LIKE ?)';
        const params = [searchTerm, searchTerm, searchTerm];

        if (category) {
            whereClause += ' AND (c.nombre = ? OR p.categoria_id = ?)';
            params.push(category, category);
        }

        const countStmt = this.db.prepare(`
            SELECT COUNT(*) as total
            FROM productos p
            LEFT JOIN categorias_producto c ON p.categoria_id = c.id
            ${whereClause}
        `);
        const { total } = countStmt.get(...params);

        const stmt = this.db.prepare(`
            SELECT p.*, c.nombre as categoria_nombre
            FROM productos p
            LEFT JOIN categorias_producto c ON p.categoria_id = c.id
            ${whereClause}
            ORDER BY p.nombre
            LIMIT ? OFFSET ?
        `);
        const items = stmt.all(...params, l, offset);
        return { items, total };
    }

    /**
     * Create product
     */
    create(productData) {
        const stmt = this.db.prepare(`
            INSERT INTO productos (
                sku, nombre, descripcion, precio_usd, 
                stock_actual, stock_minimo, stock_maximo, categoria_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            productData.sku || null,
            productData.nombre,
            productData.descripcion || null,
            productData.precio_usd,
            productData.stock_actual || 0,
            productData.stock_minimo || 0,
            productData.stock_maximo || 1000,
            productData.categoria_id || 1
        );

        return this.getById(result.lastInsertRowid);
    }

    /**
     * Update product
     */
    update(id, productData) {
        const stmt = this.db.prepare(`
            UPDATE productos 
            SET nombre = ?, 
                descripcion = ?, 
                precio_usd = ?, 
                stock_actual = ?,
                stock_minimo = ?,
                stock_maximo = ?,
                categoria_id = ?,
                sku = ?
            WHERE id = ?
        `);

        try {
            console.log('UPDATING PRODUCT:', { id, ...productData });
            stmt.run(
                productData.nombre,
                productData.descripcion || null,
                productData.precio_usd,
                productData.stock_actual,
                productData.stock_minimo || 0,
                productData.stock_maximo || 1000,
                productData.categoria_id || 1,
                productData.sku || null,
                id
            );
            return this.getById(id);
        } catch (error) {
            console.error('❌ SQL UPDATE ERROR:', error);
            throw error;
        }
    }

    /**
     * Update stock
     */
    updateStock(id, newStock) {
        const stmt = this.db.prepare(`
            UPDATE productos 
            SET stock_actual = ?
            WHERE id = ?
        `);
        stmt.run(newStock, id);
        return this.getById(id);
    }

    /**
     * Increment stock
     */
    incrementStock(id, quantity) {
        const product = this.getById(id);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        return this.updateStock(id, product.stock_actual + quantity);
    }

    /**
     * Decrement stock
     */
    decrementStock(id, quantity) {
        const product = this.getById(id);
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        const newStock = product.stock_actual - quantity;
        if (newStock < 0) {
            throw new Error(`Stock insuficiente. Disponible: ${product.stock_actual}, Solicitado: ${quantity}`);
        }

        return this.updateStock(id, newStock);
    }

    /**
     * Soft delete product
     */
    delete(id) {
        const stmt = this.db.prepare('UPDATE productos SET activo = 0 WHERE id = ?');
        stmt.run(id);
        return { success: true, id };
    }

    /**
     * Get products with low stock
     */
    getLowStock() {
        const stmt = this.db.prepare(`
            SELECT p.*, c.nombre as categoria_nombre
            FROM productos p
            LEFT JOIN categorias_producto c ON p.categoria_id = c.id
            WHERE p.activo = 1 
            AND p.stock_actual <= p.stock_minimo
            ORDER BY p.stock_actual ASC
        `);
        return stmt.all();
    }

    /**
     * Get product statistics
     */
    getStats() {
        const stmt = this.db.prepare(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN activo = 1 THEN 1 END) as activos,
                COUNT(CASE WHEN stock_actual <= stock_minimo THEN 1 END) as bajo_stock,
                SUM(stock_actual * precio_usd) as valor_inventario
            FROM productos
        `);
        return stmt.get();
    }

    /**
     * Get all categories
     */
    getCategories() {
        const stmt = this.db.prepare(`
            SELECT * FROM categorias_producto 
            WHERE activo = 1 
            ORDER BY nombre
        `);
        return stmt.all();
    }

    /**
     * Create category
     */
    createCategory(categoryData) {
        const stmt = this.db.prepare(`
            INSERT INTO categorias_producto (nombre, descripcion)
            VALUES (?, ?)
        `);

        const result = stmt.run(
            categoryData.nombre,
            categoryData.descripcion || null
        );

        return {
            id: result.lastInsertRowid,
            ...categoryData
        };
    }
    getTopSelling(limit = 10) {
        try {
            const stmt = this.db.prepare(`
                SELECT p.nombre as name, MAX(p.sku) as code, SUM(dp.cantidad) as quantitySold, SUM(dp.cantidad * dp.precio_unitario_usd) as revenue
                FROM detalles_pedido dp
                JOIN productos p ON dp.producto_id = p.id
                GROUP BY p.nombre
                ORDER BY quantitySold DESC
                LIMIT ?
            `);
            const results = stmt.all(limit);
            return results;
        } catch (error) {
            console.error('Error getting top selling products:', error);
            return [];
        }
    }
}

export default new ProductRepository();
