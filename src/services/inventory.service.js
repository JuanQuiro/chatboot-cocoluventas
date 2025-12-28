/**
 * Inventory Service
 * Manages stock movements and inventory tracking
 */

import productRepository from '../repositories/product.repository.js';
import databaseService from '../config/database.service.js';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination.js';

class InventoryService {
    constructor() {
        this.db = databaseService.getDatabase();
    }

    /**
     * Get all stock movements
     */
    /**
     * Get all stock movements (paginated)
     */
    getMovements(options = {}) {
        const { page = 1, limit = 20 } = options;
        const { limit: l, offset } = getPaginationParams(page, limit);

        // Count
        const countStmt = this.db.prepare('SELECT COUNT(*) as total FROM movimientos_stock');
        const { total } = countStmt.get();

        const stmt = this.db.prepare(`
            SELECT m.*, p.nombre as producto_nombre, p.sku
            FROM movimientos_stock m
            LEFT JOIN productos p ON m.producto_id = p.id
            ORDER BY m.fecha_movimiento DESC
            LIMIT ? OFFSET ?
        `);
        const items = stmt.all(l, offset);

        return formatPaginatedResponse(items, total, { page, limit });
    }

    /**
     * Get movements by product
     */
    getMovementsByProduct(productoId) {
        const stmt = this.db.prepare(`
            SELECT m.*, p.nombre as producto_nombre, p.sku
            FROM movimientos_stock m
            LEFT JOIN productos p ON m.producto_id = p.id
            WHERE m.producto_id = ?
            ORDER BY m.fecha_movimiento DESC
        `);
        return stmt.all(productoId);
    }

    /**
     * Register manual stock adjustment
     */
    registerAdjustment(productoId, cantidad, comentario = null) {
        try {
            const product = productRepository.getById(productoId);
            if (!product) {
                throw new Error('Producto no encontrado');
            }

            const stockAnterior = product.stock_actual;
            const nuevoStock = stockAnterior + cantidad;

            if (nuevoStock < 0) {
                throw new Error('El ajuste resultaría en stock negativo');
            }

            // Update product stock
            productRepository.updateStock(productoId, nuevoStock);

            // Register movement
            const stmt = this.db.prepare(`
                INSERT INTO movimientos_stock (
                    producto_id, tipo_movimiento, cantidad,
                    stock_anterior, stock_nuevo, comentario
                ) VALUES (?, ?, ?, ?, ?, ?)
            `);

            const tipoMovimiento = cantidad > 0 ? 'ajuste_entrada' : 'ajuste_salida';

            stmt.run(
                productoId,
                tipoMovimiento,
                Math.abs(cantidad),
                stockAnterior,
                nuevoStock,
                comentario
            );

            console.log(`✅ Ajuste de inventario: ${product.nombre} (${stockAnterior} → ${nuevoStock})`);
            return productRepository.getById(productoId);
        } catch (error) {
            console.error('Error registering adjustment:', error);
            throw error;
        }
    }

    /**
     * Get low stock products
     */
    getLowStockProducts() {
        return productRepository.getLowStock();
    }

    /**
     * Get inventory value
     */
    getInventoryValue() {
        const stmt = this.db.prepare(`
            SELECT 
                SUM(stock_actual * precio_usd) as valor_total,
                COUNT(*) as total_productos,
                SUM(stock_actual) as total_unidades
            FROM productos
            WHERE activo = 1
        `);
        return stmt.get();
    }

    /**
     * Get inventory statistics
     */
    /**
     * Get movement statistics (global totals)
     */
    getMovementStats() {
        const stmt = this.db.prepare(`
            SELECT 
                SUM(CASE WHEN tipo_movimiento IN ('compra', 'ajuste_entrada', 'devolucion', 'entrada') THEN 1 ELSE 0 END) as total_entradas,
                SUM(CASE WHEN tipo_movimiento IN ('venta', 'ajuste_salida', 'salida') THEN 1 ELSE 0 END) as total_salidas,
                COUNT(*) as total_movimientos
            FROM movimientos_stock
        `);
        return stmt.get();
    }

    /**
     * Get inventory statistics
     */
    getStats() {
        const stats = productRepository.getStats();
        const value = this.getInventoryValue();
        const lowStock = this.getLowStockProducts();
        const movements = this.getMovementStats();

        return {
            ...stats,
            ...value,
            productos_bajo_stock: lowStock.length,
            movements_stats: {
                total_entradas: movements.total_entradas || 0,
                total_salidas: movements.total_salidas || 0,
                total_movimientos: movements.total_movimientos || 0
            }
        };
    }
}

export default new InventoryService();
