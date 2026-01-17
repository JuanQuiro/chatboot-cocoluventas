import databaseService from '../config/database.service.js';
import fs from 'fs';
import { getPaginationParams } from '../utils/pagination.js';

class OrderRepository {
    constructor() {
        this.db = databaseService.getDatabase();
    }

    /**
     * Get all orders with details and client info
     */
    /**
     * Get all orders with details and client info (paginated + filtered)
     */
    getAll(filters = {}, { page = 1, limit = 10 } = {}) {
        try {
            const { limit: l, offset } = getPaginationParams(page, limit);
            const params = [];
            const countParams = [];

            let query = `
                FROM pedidos p
                LEFT JOIN clientes c ON p.cliente_id = c.id
                LEFT JOIN fabricantes f ON p.fabricante_id = f.id
                WHERE 1=1
            `;

            if (filters.status && filters.status !== 'all') {
                query += ' AND p.estado_entrega = ?';
                params.push(filters.status);
                countParams.push(filters.status);
            }

            if (filters.startDate && filters.endDate) {
                query += ' AND p.fecha_pedido BETWEEN ? AND ?';
                // Ensure properly formatted dates
                params.push(new Date(filters.startDate).toISOString());
                params.push(new Date(filters.endDate).toISOString()); // Should handle end day logic in caller or here
                countParams.push(new Date(filters.startDate).toISOString());
                countParams.push(new Date(filters.endDate).toISOString());
            }

            if (filters.search) {
                const q = `%${filters.search}%`;
                query += ` AND (
                    CAST(p.id AS TEXT) LIKE ? OR
                    c.nombre LIKE ? OR
                    c.apellido LIKE ?
                )`;
                params.push(q, q, q);
                countParams.push(q, q, q);
            }

            // Manufacturer filter
            if (filters.manufacturer) {
                query += ' AND p.fabricante_id = ?';
                params.push(parseInt(filters.manufacturer));
                countParams.push(parseInt(filters.manufacturer));
            }

            // Count Query
            const countStmt = this.db.prepare(`SELECT COUNT(*) as total ${query}`);
            const { total } = countStmt.get(...countParams);

            const dataQuery = `
                SELECT p.*, 
                       c.nombre as client_join_nombre, 
                       c.apellido as client_join_apellido,
                       c.telefono as client_join_telefono,
                       c.email as client_join_email,
                       f.nombre as fabricante_nombre
                ${query}
                ORDER BY p.fecha_pedido DESC
                LIMIT ? OFFSET ?
            `;

            const stmt = this.db.prepare(dataQuery);
            const orders = stmt.all(...params, l, offset);

            // Enrich with details and abonos (Only for the paginated slice)
            const enriched = orders.map(order => {
                const detalles = this.db.prepare('SELECT d.*, p.nombre as product_name, p.precio_usd as product_price FROM detalles_pedido d LEFT JOIN productos p ON d.producto_id = p.id WHERE d.pedido_id = ?').all(order.id);
                const abonos = this.db.prepare('SELECT * FROM abonos WHERE pedido_id = ?').all(order.id);

                order.cliente_nombre = order.client_join_nombre || order.cliente_nombre;
                order.cliente_apellido = order.client_join_apellido || order.cliente_apellido;
                order.cliente_telefono = order.client_join_telefono || order.cliente_telefono;
                order.cliente_email = order.client_join_email || order.cliente_email;

                return { ...order, detalles_pedido: detalles, abonos };
            });

            return { items: enriched, total };
        } catch (error) {
            console.error('Error in OrderRepository.getAll:', error);
            return { items: [], total: 0 };
        }
    }

    /**
     * Get order by ID with full details
     */
    getById(id) {
        try {
            const stmt = this.db.prepare(`
                SELECT p.*, 
                       c.nombre as client_join_nombre, 
                       c.apellido as client_join_apellido,
                       c.telefono as client_join_telefono,
                       c.email as client_join_email
                FROM pedidos p
                LEFT JOIN clientes c ON p.cliente_id = c.id
                WHERE p.id = ?
            `);
            const order = stmt.get(id);

            if (!order) return null;

            // Prioritize JOIN data
            order.cliente_nombre = order.client_join_nombre || order.cliente_nombre;
            order.cliente_apellido = order.client_join_apellido || order.cliente_apellido;
            order.cliente_telefono = order.client_join_telefono || order.cliente_telefono;
            order.cliente_email = order.client_join_email || order.cliente_email;

            // Fetch details (with product info joined for names)
            order.detalles_pedido = this.db.prepare(`
                SELECT d.*, 
                       p.nombre as nombre,
                       COALESCE(p.precio_usd, 0) as price
                FROM detalles_pedido d 
                LEFT JOIN productos p ON d.producto_id = p.id 
                WHERE d.pedido_id = ?
            `).all(id);

            order.abonos = this.db.prepare('SELECT * FROM abonos WHERE pedido_id = ?').all(id);

            return order;
        } catch (error) {
            console.error('Error in OrderRepository.getById:', error);
            return null;
        }
    }


    /**
     * Get pending orders (with outstanding balance) paginated
     */
    getPending(search = '', { page = 1, limit = 10 } = {}) {
        try {
            const { limit: l, offset } = getPaginationParams(page, limit);
            const params = [];
            const countParams = [];

            let query = `
                FROM pedidos p
                LEFT JOIN clientes c ON p.cliente_id = c.id
                WHERE p.estado_entrega != 'anulado'
                AND (p.total_usd - COALESCE(p.total_abono_usd, 0)) > 0.01
            `;

            if (search) {
                const q = `%${search}%`;
                query += ` AND (
                    CAST(p.id AS TEXT) LIKE ? OR
                    c.nombre LIKE ? OR
                    c.apellido LIKE ?
                )`;
                params.push(q, q, q);
                countParams.push(q, q, q);
            }

            // Count
            const countStmt = this.db.prepare(`SELECT COUNT(*) as total ${query}`);
            const { total } = countStmt.get(...countParams);

            // Data
            const stmt = this.db.prepare(`
                SELECT p.*, 
                       c.nombre as client_join_nombre, 
                       c.apellido as client_join_apellido
                ${query}
                ORDER BY p.fecha_pedido DESC
                LIMIT ? OFFSET ?
            `);
            const orders = stmt.all(...params, l, offset);

            // Enrich (Pending view doesn't need full details usually, but let's keep it safe)
            return { items: orders, total };
        } catch (error) {
            console.error('Error in OrderRepository.getPending:', error);
            return { items: [], total: 0 };
        }
    }

    /**
     * Create new order
     */
    create(data) {
        // Run sequentially without transaction to verify persistence
        try {
            try { fs.writeFileSync('repo_debug.json', JSON.stringify(data, null, 2)); } catch (e) { }

            // Prepare object for Named Parameters
            const insertData = {
                cliente_id: data.cliente_id || null,
                cliente_cedula: data.cliente_cedula || null,
                cliente_nombre: data.cliente_nombre || 'Cliente Sin Nombre',
                cliente_apellido: data.cliente_apellido || '',
                cliente_telefono: data.cliente_telefono || null,
                cliente_email: data.cliente_email || null,
                cliente_direccion: data.cliente_direccion || null,

                subtotal_usd: data.subtotal || data.subtotal_usd || 0,
                monto_descuento_usd: data.monto_descuento_usd || data.descuento_total || 0,
                monto_iva_usd: data.monto_iva_usd || data.impuesto_total || 0,
                monto_delivery_usd: data.monto_delivery_usd || 0,
                total_usd: data.total_usd || 0,

                aplica_iva: data.aplica_iva ? 1 : 0,
                metodo_pago: data.metodo_pago || 'efectivo',
                referencia_pago: data.referencia_pago || null,

                es_abono: data.es_abono ? 1 : 0,
                tipo_pago_abono: data.tipo_pago_abono || null,
                metodo_pago_abono: data.metodo_pago_abono || null,
                monto_abono_simple: data.monto_abono_simple || 0,
                monto_abono_usd: data.monto_abono_usd || 0,
                monto_abono_ves: data.monto_abono_ves || 0,
                total_abono_usd: data.total_abono_usd || 0,

                fecha_vencimiento: data.fecha_vencimiento || null,
                fecha_pedido: data.fecha_pedido || new Date().toISOString(),

                es_pago_mixto: data.es_pago_mixto ? 1 : 0,
                monto_mixto_usd: data.monto_mixto_usd || 0,
                monto_mixto_ves: data.monto_mixto_ves || 0,
                metodo_pago_mixto_usd: data.metodo_pago_mixto_usd || null,
                metodo_pago_mixto_ves: data.metodo_pago_mixto_ves || null,
                referencia_mixto_usd: data.referencia_mixto_usd || null,
                referencia_mixto_ves: data.referencia_mixto_ves || null,

                tasa_bcv: data.tasa_bcv || 36.50,
                estado_entrega: data.estado_entrega || 'pendiente',
                comentarios_generales: data.comentarios_generales || null,
                comentarios_descuento: data.comentarios_descuento || null,
                vendedor_id: data.vendedor_id || null,

                // New columns
                delivery_notes: data.delivery_notes || null,
                priority: data.priority || 'normal'
            };

            // Insert order using Named Parameters (@param) keys match the object properties
            const orderStmt = this.db.prepare(`
                INSERT INTO pedidos (
                    cliente_id, cliente_cedula, cliente_nombre, cliente_apellido,
                    cliente_telefono, cliente_email, cliente_direccion,
                    subtotal_usd, monto_descuento_usd, monto_iva_usd, 
                    monto_delivery_usd, total_usd, aplica_iva,
                    metodo_pago, referencia_pago, es_abono, tipo_pago_abono,
                    metodo_pago_abono, monto_abono_simple, monto_abono_usd,
                    monto_abono_ves, total_abono_usd, fecha_vencimiento, fecha_pedido,
                    es_pago_mixto, monto_mixto_usd, monto_mixto_ves,
                    metodo_pago_mixto_usd, metodo_pago_mixto_ves,
                    referencia_mixto_usd, referencia_mixto_ves,
                    tasa_bcv, estado_entrega, comentarios_generales,
                    comentarios_descuento, vendedor_id,
                    delivery_notes, priority
                ) VALUES (
                    @cliente_id, @cliente_cedula, @cliente_nombre, @cliente_apellido,
                    @cliente_telefono, @cliente_email, @cliente_direccion,
                    @subtotal_usd, @monto_descuento_usd, @monto_iva_usd, 
                    @monto_delivery_usd, @total_usd, @aplica_iva,
                    @metodo_pago, @referencia_pago, @es_abono, @tipo_pago_abono,
                    @metodo_pago_abono, @monto_abono_simple, @monto_abono_usd,
                    @monto_abono_ves, @total_abono_usd, @fecha_vencimiento, @fecha_pedido,
                    @es_pago_mixto, @monto_mixto_usd, @monto_mixto_ves,
                    @metodo_pago_mixto_usd, @metodo_pago_mixto_ves,
                    @referencia_mixto_usd, @referencia_mixto_ves,
                    @tasa_bcv, @estado_entrega, @comentarios_generales,
                    @comentarios_descuento, @vendedor_id,
                    @delivery_notes, @priority
                )
            `);

            const orderResult = orderStmt.run(insertData);
            const orderId = orderResult.lastInsertRowid;

            // Insert order details (Unless skipped by Service which handles complex transactions)
            if (!data.skipDetails && data.productos && data.productos.length > 0) {
                // Updated for Deep Hardening (006)
                const detailStmt = this.db.prepare(`
                    INSERT INTO detalles_pedido (
                        pedido_id, producto_id, variante_id, cantidad, 
                        precio_unitario_usd, nombre_producto, sku_producto
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `);

                for (const producto of data.productos) {
                    const isVariant = producto.is_variant === true;
                    // Strict ID separation: 
                    // Variants -> variante_id = id, producto_id = NULL
                    // Legacy -> producto_id = id, variante_id = NULL
                    // Note: 'producto.producto_id' or 'producto.id' depending on upstream naming. 
                    // Service uses 'producto.producto_id' generally. Let's support both.
                    const itemId = producto.producto_id || producto.id;

                    detailStmt.run(
                        orderId,
                        isVariant ? null : itemId,
                        isVariant ? itemId : null,
                        producto.cantidad,
                        producto.precio_unitario || producto.precio_unitario_usd,
                        producto.nombre || producto.nombre_producto,
                        producto.sku || producto.sku_producto || null
                    );
                }
            }

            return this.getById(orderId);
        } catch (error) {
            console.error('Error in OrderRepository.create:', error);
            throw error;
        }
    }

    /**
     * Delete order
     */
    delete(id) {
        // Run sequentially without transaction wrapper for stability
        try {
            // Fix: Delete related movements first to avoid foreign key constraint violation
            this.db.prepare('DELETE FROM movimientos_stock WHERE pedido_id = ?').run(id);

            // Details and Payments have ON DELETE CASCADE usually, but explicit delete is safe
            this.db.prepare('DELETE FROM detalles_pedido WHERE pedido_id = ?').run(id);
            this.db.prepare('DELETE FROM abonos WHERE pedido_id = ?').run(id);

            const result = this.db.prepare('DELETE FROM pedidos WHERE id = ?').run(id);
            return result.changes > 0;
        } catch (error) {
            console.error('Error in OrderRepository.delete:', error);
            // Ignore constraint errors if we are force deleting, or rethrow
            throw error;
        }
    }


    /**
     * Update order
     */
    update(id, data) {
        try {
            const sets = [];
            const values = [];

            Object.keys(data).forEach(key => {
                if (key !== 'id' && key !== 'created_at') {
                    sets.push(`${key} = ?`);
                    values.push(data[key]);
                }
            });

            if (sets.length === 0) {
                console.warn('⚠️ No fields to update for order:', id, data);
                return this.getById(id);
            }

            values.push(id);

            const sql = `UPDATE pedidos SET ${sets.join(', ')} WHERE id = ?`;
            // console.log('📝 Executing update:', sql, values); // Debug log

            const stmt = this.db.prepare(sql);
            stmt.run(...values);

            return this.getById(id);
        } catch (error) {
            console.error('Error in OrderRepository.update:', error);
            console.error('Data passed:', data);
            throw error;
        }
    }

    /**
     * Update order status
     */
    updateStatus(id, status) {
        try {
            const stmt = this.db.prepare('UPDATE pedidos SET estado_entrega = ? WHERE id = ?');
            stmt.run(status, id);
            return this.getById(id);
        } catch (error) {
            console.error('Error in OrderRepository.updateStatus:', error);
            throw error;
        }
    }

    /**
     * Add payment (abono)
     */
    addPayment(data) {
        try {
            const stmt = this.db.prepare(`
                INSERT INTO abonos (
                    pedido_id, cliente_id, monto_abono_usd, monto_abono_ves,
                    tasa_bcv, metodo_pago_abono, referencia_pago,
                    fecha_abono, estado_abono, comentarios
                ) VALUES (
                    @pedido_id, @cliente_id, @monto_abono_usd, @monto_abono_ves,
                    @tasa_bcv, @metodo_pago_abono, @referencia_pago,
                    @fecha_abono, @estado_abono, @comentarios
                )
            `);

            const insertData = {
                pedido_id: data.pedido_id,
                cliente_id: data.cliente_id,
                monto_abono_usd: data.monto_abono_usd,
                monto_abono_ves: data.monto_abono_ves || 0,
                tasa_bcv: data.tasa_cambio || 36.50, // Map tasa_cambio to tasa_bcv
                metodo_pago_abono: data.metodo_pago || 'efectivo', // Map metodo_pago to metodo_pago_abono
                referencia_pago: data.referencia_pago || null,
                fecha_abono: data.fecha_abono || new Date().toISOString(),
                estado_abono: data.estado_abono || 'confirmado',
                comentarios: data.notas || null
            };

            const result = stmt.run(insertData);

            // Update order total_abono_usd
            this.recalculateOrderTotalPaid(data.pedido_id);

            return result.lastInsertRowid;
        } catch (error) {
            console.error('Error in OrderRepository.addPayment:', error);
            throw error;
        }
    }


    /**
     * Get orders by client
     */
    getByClient(clientId) {
        try {
            const orders = this.db.prepare('SELECT * FROM pedidos WHERE cliente_id = ? ORDER BY fecha_pedido DESC').all(clientId);

            // Enrich
            return orders.map(order => {
                const detalles = this.db.prepare('SELECT * FROM detalles_pedido WHERE pedido_id = ?').all(order.id);
                const abonos = this.db.prepare('SELECT * FROM abonos WHERE pedido_id = ?').all(order.id);
                return { ...order, detalles_pedido: detalles, abonos };
            });
        } catch (error) {
            console.error('Error in OrderRepository.getByClient:', error);
            throw error;
        }
    }

    /**
     * Get payments for an order
     */
    getOrderPayments(orderId) {
        try {
            return this.db.prepare('SELECT * FROM abonos WHERE pedido_id = ? ORDER BY fecha_abono DESC').all(orderId);
        } catch (error) {
            console.error('Error in OrderRepository.getOrderPayments:', error);
            return [];
        }
    }

    /**
     * Get pending payments grouped by client
     */
    getPendingByClient(search = '', options = {}) {
        try {
            const { page = 1, limit = 10 } = options;
            const offset = (page - 1) * limit;

            // Base WHERE clause
            let whereClause = `
                WHERE p.estado_entrega != 'anulado' 
                AND (
                    p.estado_entrega = 'pendiente' OR 
                    (CAST(p.total_usd AS REAL) - COALESCE(CAST(p.total_abono_usd AS REAL), 0)) > 0.01
                )
            `;

            const params = [];

            if (search) {
                whereClause += ` AND (
                    p.cliente_nombre LIKE ? OR 
                    p.cliente_apellido LIKE ? OR
                    c.nombre LIKE ? OR
                    c.apellido LIKE ?
                )`;
                const term = `%${search}%`;
                params.push(term, term, term, term);
            }

            // Count Query (Grouped)
            const countQuery = `
                SELECT COUNT(DISTINCT cliente_id) as total 
                FROM pedidos p
                LEFT JOIN clientes c ON p.cliente_id = c.id
                ${whereClause}
            `;
            const totalResult = this.db.prepare(countQuery).get(...params);
            const total = totalResult ? totalResult.total : 0;

            // Data Query
            const query = `
                SELECT 
                    p.cliente_id,
                    COALESCE(MIN(c.nombre), MIN(p.cliente_nombre)) as nombre,
                    COALESCE(MIN(c.apellido), MIN(p.cliente_apellido)) as apellido,
                    MIN(c.telefono) as telefono,
                    COUNT(p.id) as pending_orders,
                    SUM(CAST(p.total_usd AS REAL)) as total_sales,
                    SUM(CAST(p.total_abono_usd AS REAL)) as total_paid,
                    SUM(CAST(p.total_usd AS REAL) - COALESCE(CAST(p.total_abono_usd AS REAL), 0)) as total_pending
                FROM pedidos p
                LEFT JOIN clientes c ON p.cliente_id = c.id
                ${whereClause}
                GROUP BY p.cliente_id
                ORDER BY total_pending DESC
                LIMIT ? OFFSET ?
            `;

            const items = this.db.prepare(query).all(...params, limit, offset);

            return { items, total };
        } catch (error) {
            console.error('Error in OrderRepository.getPendingByClient:', error);
            throw error;
        }
    }

    /**
     * Update payment (abono)
     */
    updateAbono(id, data) {
        try {
            const stmt = this.db.prepare(`
                UPDATE abonos 
                SET monto_abono_usd = COALESCE(?, monto_abono_usd),
                    estado_abono = COALESCE(?, estado_abono),
                    metodo_pago_abono = COALESCE(?, metodo_pago_abono),
                    referencia_pago = COALESCE(?, referencia_pago),
                    fecha_abono = COALESCE(?, fecha_abono),
                    comentarios = COALESCE(?, comentarios)
                WHERE id = ?
            `);

            stmt.run(
                data.monto_abono_usd,
                data.estado_abono,
                data.metodo_pago,
                data.referencia_pago,
                data.fecha_abono,
                data.notas, // Service passes 'notas', map to 'comentarios'
                id
            );

            // Get updated abono to return
            const updated = this.db.prepare('SELECT * FROM abonos WHERE id = ?').get(id);
            if (updated) {
                this.recalculateOrderTotalPaid(updated.pedido_id);
            }
            return updated;
        } catch (error) {
            console.error('Error in OrderRepository.updateAbono:', error);
            throw error;
        }
    }

    /**
     * Recalculate total paid via abonos
     */
    recalculateOrderTotalPaid(orderId) {
        try {
            const payments = this.getOrderPayments(orderId);
            const totalPaid = payments
                .filter(p => p.estado_abono === 'confirmado')
                .reduce((sum, p) => sum + (p.monto_abono_usd || 0), 0);

            this.db.prepare('UPDATE pedidos SET total_abono_usd = ? WHERE id = ?').run(totalPaid, orderId);
        } catch (error) {
            console.error('Error recalculating order totals:', error);
        }
    }

    /**
     * Get specific stats for accounts receivable (SQL optimized)
     */
    getReceivableStatistics() {
        try {
            const stmt = this.db.prepare(`
                SELECT 
                    COUNT(*) as count,
                    SUM(CAST(total_usd AS REAL)) as total_sales,
                    SUM(COALESCE(CAST(total_abono_usd AS REAL), 0)) as total_paid,
                    SUM(CAST(total_usd AS REAL) - COALESCE(CAST(total_abono_usd AS REAL), 0)) as total_pending,
                    SUM(CASE WHEN fecha_vencimiento IS NOT NULL AND date(fecha_vencimiento) < date('now') AND (CAST(total_usd AS REAL) - COALESCE(CAST(total_abono_usd AS REAL), 0)) > 0.01 THEN 1 ELSE 0 END) as overdue_count
                FROM pedidos
                WHERE estado_entrega != 'anulado'
            `);
            const result = stmt.get();
            // console.log('DEBUG RES', result);
            return {
                count: result.count || 0,
                totalPending: result.total_pending || 0,
                overdueCount: result.overdue_count || 0,
                totalSales: result.total_sales || 0,
                totalPaid: result.total_paid || 0
            };
        } catch (error) {
            console.error('Error in OrderRepository.getReceivableStatistics:', error);
            return { count: 0, totalPending: 0, overdueCount: 0, totalSales: 0, totalPaid: 0 };
        }
    }

    /**
     * Get statistics grouped by seller
     */
    getStatsBySeller(startDate, endDate) {
        try {
            let query = `
                SELECT 
                    vendedor_id,
                    COUNT(*) as total_orders,
                    SUM(CASE WHEN estado_entrega = 'completado' THEN 1 ELSE 0 END) as completed_orders,
                    SUM(CAST(total_usd AS REAL)) as total_sales,
                    SUM(CASE WHEN estado_entrega = 'completado' THEN CAST(total_usd AS REAL) ELSE 0 END) as completed_sales,
                    SUM(COALESCE(CAST(total_abono_usd AS REAL), 0)) as total_collected
                FROM pedidos
                WHERE vendedor_id IS NOT NULL
            `;

            const params = [];
            if (startDate && endDate) {
                query += ' AND fecha_pedido BETWEEN ? AND ?';
                params.push(startDate, endDate);
            }

            query += ' GROUP BY vendedor_id';

            return this.db.prepare(query).all(...params);
        } catch (error) {
            console.error('Error in OrderRepository.getStatsBySeller:', error);
            return [];
        }
    }
}

export default new OrderRepository();
