/**
 * Orders Service - Persistent SQLite Implementation
 * Replaces in-memory Map with database storage
 */

import orderRepository from '../repositories/order.repository.js';
import productRepository from '../repositories/product.repository.js';
import clientsService from './clients.service.js';
import manufacturersService from './manufacturers.service.js';
import commissionsService from './commissions.service.js';
import ExcelJS from 'exceljs';

import { formatPaginatedResponse } from '../utils/pagination.js';
// Puppeteer imported dynamically to avoid startup crashes if not installed

class OrdersService {
    /**
     * Create new order
     */
    async createOrder(orderData) {
        try {
            // Validate required fields
            if (!orderData.cliente_nombre || !orderData.cliente_apellido) {
                throw new Error('Nombre y apellido del cliente son requeridos');
            }

            if (!orderData.productos || orderData.productos.length === 0) {
                throw new Error('El pedido debe tener al menos un producto');
            }

            // Get or create client if cedula is provided
            if (orderData.cliente_cedula) {
                const client = await clientsService.getOrCreateByCedula({
                    cedula: orderData.cliente_cedula,
                    nombre: orderData.cliente_nombre,
                    apellido: orderData.cliente_apellido,
                    telefono: orderData.cliente_telefono,
                    email: orderData.cliente_email,
                    direccion: orderData.cliente_direccion
                });
                orderData.cliente_id = client.id;
            }

            // Validate stock for each product
            for (const producto of orderData.productos) {
                if (producto.producto_id) {
                    const productInDb = productRepository.getById(producto.producto_id);
                    if (productInDb && productInDb.stock_actual < producto.cantidad) {
                        throw new Error(`Stock insuficiente para ${productInDb.nombre}. Disponible: ${productInDb.stock_actual}, Solicitado: ${producto.cantidad}`);
                    }
                }
            }

            // ---------------------------------------------------------
            // COCOLU PRO LOGIC: Auto-Assignment & Commissions
            // ---------------------------------------------------------

            // 1. Auto-assign Manufacturer
            if (!orderData.fabricante_id) {
                const assignedManufacturer = await manufacturersService.assignNextManufacturer();
                if (assignedManufacturer) {
                    orderData.fabricante_id = assignedManufacturer.id;
                    console.log(`🤖 Auto-assigned Manufacturer: ${assignedManufacturer.nombre}`);
                }
            }

            // 2. Calculate Commission (if seller exists)
            if (orderData.vendedor_id) {
                const commission = commissionsService.calculateOrderCommission(
                    orderData.total_usd || 0,
                    orderData.vendedor_id
                );
                orderData.monto_comision = commission;
            }

            // 3. Set Initial Status
            orderData.estado_entrega = orderData.estado_entrega || 'pendiente';

            // ---------------------------------------------------------

            // Create order
            const newOrder = orderRepository.create(orderData);

            // Decrement stock for products
            for (const producto of orderData.productos) {
                if (producto.producto_id) {
                    try {
                        productRepository.decrementStock(producto.producto_id, producto.cantidad);

                        // Register stock movement
                        this.registerStockMovement(
                            producto.producto_id,
                            'venta',
                            producto.cantidad,
                            newOrder.id
                        );
                    } catch (error) {
                        console.warn(`⚠️ No se pudo actualizar stock para producto ${producto.producto_id}:`, error.message);
                    }
                }
            }

            console.log(`✅ Pedido creado: #${newOrder.id} - ${newOrder.cliente_nombre} ${newOrder.cliente_apellido}`);
            return newOrder;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    /**
     * Get all orders
     */
    /**
     * Get all orders (paginated)
     */
    async getAllOrders(filters = {}, options = {}) {
        try {
            const { page = 1, limit = 10 } = options;
            // Pass filters to Repository because we migrated filtering logic to SQL
            const { items, total } = orderRepository.getAll(filters, { page, limit });
            return formatPaginatedResponse(items, total, { page, limit });
        } catch (error) {
            console.error('Error getting orders:', error);
            return formatPaginatedResponse([], 0, options);
        }
    }

    /**
     * Get order status
     */
    async getOrderStatus(orderId) {
        try {
            const order = orderRepository.getById(orderId);
            if (!order) {
                console.log(`⚠️ Pedido no encontrado: ${orderId}`);
                return null;
            }
            return order;
        } catch (error) {
            console.error('Error getting order status:', error);
            return null;
        }
    }

    /**
     * Update order status
     */
    async updateOrderStatus(orderId, status, notes = '') {
        try {
            const updated = orderRepository.updateStatus(orderId, status);

            if (notes) {
                orderRepository.update(orderId, {
                    ...updated,
                    comentarios_generales: notes
                });
            }

            console.log(`✅ Estado actualizado: Pedido #${orderId} -> ${status}`);
            return updated;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    /**
     * Update order
     */
    async updateOrder(orderId, orderData) {
        try {
            const updated = orderRepository.update(orderId, orderData);
            console.log(`✅ Pedido actualizado: #${orderId}`);
            return updated;
        } catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
    }

    /**
     * Cancel order
     */
    async cancelOrder(orderId, motivo = null) {
        try {
            const order = orderRepository.getById(orderId);
            if (!order) {
                throw new Error('Pedido no encontrado');
            }

            // Restore stock for products
            for (const detalle of order.detalles_pedido) {
                if (detalle.producto_id) {
                    try {
                        productRepository.incrementStock(detalle.producto_id, detalle.cantidad);

                        // Register stock movement
                        this.registerStockMovement(
                            detalle.producto_id,
                            'anulacion',
                            detalle.cantidad,
                            orderId
                        );
                    } catch (error) {
                        console.warn(`⚠️ No se pudo restaurar stock para producto ${detalle.producto_id}:`, error.message);
                    }
                }
            }

            const cancelled = orderRepository.cancel(orderId, motivo);
            console.log(`✅ Pedido anulado: #${orderId}`);
            return cancelled;
        } catch (error) {
            console.error('Error cancelling order:', error);
            throw error;
        }
    }

    /**
     * Delete order hard (admin only usually)
     */
    async deleteOrder(orderId) {
        try {
            const result = orderRepository.delete(orderId);
            console.log(`🗑️ Pedido ELIMINADO: #${orderId}`);
            return result;
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    }

    /**
     * Add payment (abono)
     */
    async addPayment(paymentData) {
        try {
            const paymentId = orderRepository.addPayment(paymentData);
            console.log(`✅ Abono registrado: #${paymentId} para pedido #${paymentData.pedido_id}`);

            // Check if order is fully paid
            const order = orderRepository.getById(paymentData.pedido_id);
            if (order.total_abono_usd >= order.total_usd) {
                orderRepository.updateStatus(paymentData.pedido_id, 'pagado');
                console.log(`✅ Pedido #${paymentData.pedido_id} marcado como PAGADO`);
            }

            return paymentId;
        } catch (error) {
            console.error('Error adding payment:', error);
            throw error;
        }
    }

    /**
     * Get orders by status
     */
    async getOrdersByStatus(status) {
        try {
            return orderRepository.getByStatus(status);
        } catch (error) {
            console.error('Error getting orders by status:', error);
            return [];
        }
    }

    /**
     * Get orders by client
     */
    async getOrdersByClient(clientId) {
        try {
            return orderRepository.getByClient(clientId);
        } catch (error) {
            console.error('Error getting orders by client:', error);
            return [];
        }
    }

    /**
     * Get order statistics
     */
    async getStats() {
        try {
            return orderRepository.getStats();
        } catch (error) {
            console.error('Error getting order stats:', error);
            return {
                total: 0,
                pendientes: 0,
                entregados: 0,
                anulados: 0,
                total_ventas: 0,
                total_abonos: 0
            };
        }
    }

    /**
     * Export orders to specific format
     */
    async exportOrders(format = 'json', filters = {}) {
        try {

            // Fix: Fetch ALL orders (limit 100,000) matching filters using SQL
            // Bypass default pagination limit of 10
            const response = await this.getAllOrders(filters, { page: 1, limit: 100000 });

            // Fix: Extract 'data' array from paginated response object
            let orders = response.data || [];

            if (!Array.isArray(orders)) {
                console.warn('Export: Received non-array data', orders);
                orders = [];
            }

            // Note: Filters (status, date, search) are already applied by getAllOrders query
            // No need to re-filter in Javascript.

            // Generate Output
            console.log(`[EXPORT] Fetched ${orders.length} orders for export.`);

            // Generate Output
            if (format === 'json') {
                return Buffer.from(JSON.stringify(orders, null, 2));
            } else if (format === 'excel' || format === 'xlsx') {
                console.log('[EXPORT] Starting Excel generation...');
                try {
                    const workbook = new ExcelJS.Workbook();
                    workbook.creator = 'Cocolu Dashboard';
                    const worksheet = workbook.addWorksheet('Reporte de Pedidos');

                    // --- Fancy Header & Summary ---
                    worksheet.addRow(['REPORTE DE PEDIDOS - COCOLU VENTAS']);
                    worksheet.mergeCells('A1:G1');
                    worksheet.getCell('A1').font = { name: 'Arial', family: 4, size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
                    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
                    worksheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };

                    worksheet.addRow([`Generado: ${new Date().toLocaleString()}`]);
                    worksheet.mergeCells('A2:G2');
                    worksheet.getCell('A2').alignment = { horizontal: 'center' };
                    worksheet.getCell('A2').font = { italic: true, color: { argb: 'FF555555' } };

                    // Summary Stats
                    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_usd || 0), 0);
                    worksheet.addRow([]); // Empty row
                    worksheet.addRow(['RESUMEN']);
                    worksheet.getCell('A4').font = { bold: true };
                    worksheet.addRow(['Total Pedidos:', orders.length, '', 'Total Ventas:', totalRevenue]);
                    worksheet.getCell('E5').numFmt = '"$"#,##0.00';
                    worksheet.getCell('E5').font = { bold: true, color: { argb: 'FF059669' } };
                    worksheet.addRow([]); // Empty row

                    // --- Data Table ---
                    const headerRow = worksheet.addRow([
                        'ID', 'Fecha', 'Cliente', 'Cédula', 'Total ($)', 'Estado', 'Items'
                    ]);

                    // Style Table Header
                    headerRow.eachCell((cell) => {
                        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
                        cell.alignment = { vertical: 'middle', horizontal: 'center' };
                        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'medium' }, right: { style: 'thin' } };
                    });

                    // Add Data
                    orders.forEach((o, index) => {
                        try {
                            const dateStr = o.fecha_pedido ? new Date(o.fecha_pedido) : new Date();
                            const clientStr = `${o.cliente_nombre || ''} ${o.cliente_apellido || ''}`.trim();
                            const row = worksheet.addRow([
                                o.id,
                                dateStr,
                                clientStr,
                                o.cliente_cedula || '-',
                                o.total_usd || 0,
                                (o.estado_entrega || 'pendiente').toUpperCase(),
                                o.detalles_pedido ? o.detalles_pedido.length : 0
                            ]);

                            // Formatting
                            row.getCell(5).numFmt = '"$"#,##0.00'; // Total Column
                            row.getCell(5).font = { bold: true };

                            // Center align ID, Date, Status, Items
                            [1, 2, 6, 7].forEach(idx => row.getCell(idx).alignment = { horizontal: 'center' });

                            // Conditional Color for Status
                            if (o.estado_entrega === 'completado') row.getCell(6).font = { color: { argb: 'FF059669' }, bold: true }; // Green
                            else if (o.estado_entrega === 'pendiente') row.getCell(6).font = { color: { argb: 'FFF59E0B' }, bold: true }; // Orange
                            else if (o.estado_entrega === 'anulado') row.getCell(6).font = { color: { argb: 'FFEF4444' }, bold: true }; // Red

                            // Borders for all cells
                            row.eachCell(cell => {
                                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                            });
                        } catch (rowError) {
                            console.error(`[EXPORT] Error processing row ${index} (ID: ${o?.id}):`, rowError);
                        }
                    });

                    // Column Widths
                    worksheet.columns = [
                        { width: 10 }, // ID
                        { width: 22 }, // Date
                        { width: 35 }, // Client
                        { width: 15 }, // Cedula
                        { width: 18 }, // Total
                        { width: 18 }, // Status
                        { width: 10 }, // Items
                    ];

                    console.log('[EXPORT] Writing buffer...');
                    return await workbook.xlsx.writeBuffer();
                } catch (excelError) {
                    console.error('[EXPORT] Excel generation failed:', excelError);
                    throw excelError;
                }
            } else if (format === 'csv') {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Pedidos');
                worksheet.columns = [
                    { header: 'ID', key: 'id' },
                    { header: 'Fecha', key: 'fecha_pedido' },
                    { header: 'Cliente', key: 'cliente_nombre' },
                    { header: 'Total', key: 'total_usd' },
                    { header: 'Estado', key: 'estado_entrega' }
                ];
                orders.forEach(o => {
                    let dateStr = o.fecha_pedido;
                    try {
                        const d = new Date(o.fecha_pedido);
                        if (!isNaN(d.getTime())) dateStr = d.toISOString();
                    } catch (e) { }

                    worksheet.addRow({
                        id: o.id,
                        fecha_pedido: dateStr,
                        cliente_nombre: `${o.cliente_nombre} ${o.cliente_apellido}`,
                        total_usd: o.total_usd,
                        estado_entrega: o.estado_entrega
                    });
                });
                return await workbook.csv.writeBuffer();
            } else if (format === 'markdown' || format === 'md') {
                let md = '| ID | Fecha | Cliente | Total | Estado |\n';
                md += '| --- | --- | --- | --- | --- |\n';
                orders.forEach(o => {
                    const client = `${o.cliente_nombre || ''} ${o.cliente_apellido || ''}`.trim();
                    const date = new Date(o.fecha_pedido).toLocaleDateString();
                    md += `| ${o.id} | ${date} | ${client} | $${o.total_usd} | ${o.estado_entrega} |\n`;
                });
                return Buffer.from(md);
            } else if (format === 'pdf') {
                let puppeteer;
                try {
                    puppeteer = (await import('puppeteer')).default;
                } catch (e) {
                    throw new Error('La librería PDF no está instalada. Ejecuta: npm install puppeteer');
                }

                const totalRevenue = orders.reduce((sum, o) => sum + (o.total_usd || 0), 0);

                const htmlContent = `
                <html>
                <head>
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; background: #fff; }
                        
                        /* Header */
                        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
                        .logo { font-size: 24px; font-weight: 800; color: #6366f1; letter-spacing: -1px; }
                        .report-title { font-size: 18px; color: #64748b; font-weight: 500; }
                        
                        /* Summary Cards */
                        .summary { display: flex; gap: 20px; margin-bottom: 30px; }
                        .card { flex: 1; padding: 20px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
                        .card-label { font-size: 13px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px; }
                        .card-value { font-size: 28px; font-weight: 700; color: #1e293b; margin-top: 5px; }
                        .card-value.money { color: #059669; }

                        /* Table */
                        table { width: 100%; border-collapse: collapse; font-size: 13px; }
                        th { text-align: left; padding: 12px 16px; background: #f1f5f9; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
                        td { padding: 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
                        tr:last-child td { border-bottom: none; }
                        
                        /* Status Badges */
                        .status { padding: 4px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; display: inline-block; }
                        .status-completado { background: #dcfce7; color: #166534; }
                        .status-pendiente { background: #fef3c7; color: #92400e; }
                        .status-anulado { background: #fee2e2; color: #991b1b; }

                        .meta { font-size: 10px; color: #94a3b8; margin-top: 40px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">Cocolu Ventas</div>
                        <div class="report-title">Reporte de Pedidos</div>
                    </div>

                    <div class="summary">
                        <div class="card">
                            <div class="card-label">Total Pedidos</div>
                            <div class="card-value">${orders.length}</div>
                        </div>
                        <div class="card">
                            <div class="card-label">Ingresos Totales</div>
                            <div class="card-value money">$${totalRevenue.toFixed(2)}</div>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th>Total</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.map(o => `
                                <tr>
                                    <td style="font-family: monospace; color: #64748b;">#${o.id}</td>
                                    <td>${new Date(o.fecha_pedido).toLocaleDateString()}</td>
                                    <td>
                                        <div style="font-weight: 500; color: #1e293b;">${o.cliente_nombre || ''} ${o.cliente_apellido || ''}</div>
                                        <div style="font-size: 11px; color: #94a3b8;">${o.cliente_cedula || ''}</div>
                                    </td>
                                    <td style="font-weight: 600;">$${o.total_usd.toFixed(2)}</td>
                                    <td>
                                        <span class="status status-${o.estado_entrega.toLowerCase()}">
                                            ${o.estado_entrega.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="meta">
                        Generado automáticamente por Cocolu Dashboard el ${new Date().toLocaleString()}
                    </div>
                </body>
                </html>`;

                const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
                const page = await browser.newPage();
                await page.setContent(htmlContent);
                const pdfBuffer = await page.pdf({
                    format: 'A4',
                    printBackground: true,
                    margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' }
                });
                await browser.close();
                return pdfBuffer;
            } else {
                throw new Error(`Format ${format} not supported`);
            }
        } catch (error) {
            console.error('Error exporting orders:', error);
            throw error;
        }
    }

    /**
     * Register stock movement
     */
    registerStockMovement(productoId, tipoMovimiento, cantidad, pedidoId = null) {
        try {
            const product = productRepository.getById(productoId);
            if (!product) return;

            const db = productRepository.db;
            const stmt = db.prepare(`
                INSERT INTO movimientos_stock (
                    producto_id, tipo_movimiento, cantidad,
                    stock_anterior, stock_nuevo, pedido_id
                ) VALUES (?, ?, ?, ?, ?, ?)
            `);

            const stockAnterior = tipoMovimiento === 'venta'
                ? product.stock_actual + cantidad
                : product.stock_actual - cantidad;

            stmt.run(
                productoId,
                tipoMovimiento,
                cantidad,
                stockAnterior,
                product.stock_actual,
                pedidoId
            );
        } catch (error) {
            console.error('Error registering stock movement:', error);
        }
    }

    /**
     * Duplicate order
     */
    async duplicateOrder(originalId) {
        try {
            const originalOrder = await this.getOrderStatus(originalId);
            if (!originalOrder) throw new Error('Pedido original no encontrado');

            // 1. Prepare new order data
            const newOrderData = {
                cliente_id: originalOrder.cliente_id,
                cliente_nombre: originalOrder.cliente_nombre,
                cliente_apellido: originalOrder.cliente_apellido,
                cliente_telefono: originalOrder.cliente_telefono,
                cliente_email: originalOrder.cliente_email,
                cliente_direccion: originalOrder.cliente_direccion,

                productos: originalOrder.detalles_pedido.map(d => ({
                    producto_id: d.producto_id,
                    cantidad: d.cantidad,
                    precio_unitario: d.precio_unitario_usd,
                    nombre: d.nombre_producto,
                    sku: d.sku_producto
                })),

                subtotal: originalOrder.subtotal_usd,
                descuento_total: originalOrder.monto_descuento_usd,
                impuesto_total: originalOrder.monto_iva_usd,
                deliveryAmount: originalOrder.monto_delivery_usd,
                total: originalOrder.total_usd,

                metodo_pago: 'pendiente', // Reset payment
                estado_entrega: 'pendiente', // Reset status
                comentarios_generales: `Copia de pedido #${originalOrder.id}. ${originalOrder.comentarios_generales || ''}`
            };

            // 2. Create new order
            return await this.createOrder(newOrderData);
        } catch (error) {
            console.error('Error duplicating order:', error);
            throw error;
        }
    }

    /**
     * Get orders stats
     */
    async getStats() {
        try {
            const stmt = orderRepository.db.prepare(`
                SELECT 
                    COUNT(*) as total_orders,
                    SUM(CAST(total_usd AS REAL)) as total_revenue,
                    SUM(CASE WHEN LOWER(estado_entrega) = 'pendiente' THEN 1 ELSE 0 END) as pending_orders,
                    SUM(CASE WHEN LOWER(estado_entrega) IN ('completado', 'entregado') THEN 1 ELSE 0 END) as completed_orders
                FROM pedidos
                WHERE estado_entrega != 'anulado'
            `);
            const result = stmt.get();

            // Calculate daily, weekly (Sat-Fri) and monthly
            const today = new Date().toISOString().split('T')[0];
            const currentMonth = today.substring(0, 7);

            // Daily stats
            const dailyStmt = orderRepository.db.prepare(`SELECT count(*) as count, sum(CAST(total_usd AS REAL)) as total FROM pedidos WHERE date(fecha_pedido) = ? AND estado_entrega != 'anulado'`);
            const daily = dailyStmt.get(today);

            // Weekly stats (Saturday to Friday)
            // Find the most recent Saturday
            const now = new Date();
            const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ... 6=Sat
            const daysSinceSaturday = (dayOfWeek + 1) % 7; // How many days since last Saturday
            const saturday = new Date(now);
            saturday.setDate(now.getDate() - daysSinceSaturday);
            const saturdayStr = saturday.toISOString().split('T')[0];

            // Friday is Saturday + 6 days
            const friday = new Date(saturday);
            friday.setDate(saturday.getDate() + 6);
            const fridayStr = friday.toISOString().split('T')[0];

            const weeklyStmt = orderRepository.db.prepare(`
                SELECT count(*) as count, sum(CAST(total_usd AS REAL)) as total 
                FROM pedidos 
                WHERE date(fecha_pedido) >= ? AND date(fecha_pedido) <= ? AND estado_entrega != 'anulado'
            `);
            const weekly = weeklyStmt.get(saturdayStr, fridayStr);

            // Monthly stats
            const monthlyStmt = orderRepository.db.prepare(`SELECT count(*) as count, sum(CAST(total_usd AS REAL)) as total FROM pedidos WHERE strftime('%Y-%m', fecha_pedido) = ? AND estado_entrega != 'anulado'`);
            const monthly = monthlyStmt.get(currentMonth);

            return {
                total: result.total_orders || 0,
                revenue: result.total_revenue || 0,
                pending: result.pending_orders || 0,
                completed: result.completed_orders || 0,
                daily: daily.total || 0,
                dailyCount: daily.count || 0,
                weekly: weekly.total || 0,
                weeklyCount: weekly.count || 0,
                monthly: monthly.total || 0,
                monthlyCount: monthly.count || 0
            };
        } catch (error) {
            console.error('Error getting order stats:', error);
            return { total: 0, revenue: 0, pending: 0, completed: 0 };
        }
    }

    /**
     * Get sales by period
     */
    async getSalesByPeriod(period = 'month') {
        try {
            const orders = await this.getAllOrders();
            // Filter only valid sales
            const sales = orders.filter(o => o.estado_entrega !== 'anulado');

            // Grouping logic (simplified)
            const grouped = {};

            sales.forEach(sale => {
                const date = new Date(sale.fecha_pedido);
                let key;

                if (period === 'day') {
                    key = date.toISOString().split('T')[0]; // YYYY-MM-DD
                } else if (period === 'month') {
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
                } else {
                    key = `${date.getFullYear()}`;
                }

                if (!grouped[key]) {
                    grouped[key] = { period: key, total: 0, count: 0 };
                }

                grouped[key].total += (sale.total_usd || 0);
                grouped[key].count += 1;
            });

            return Object.values(grouped).sort((a, b) => b.period.localeCompare(a.period));
        } catch (error) {
            console.error('Error getting sales by period:', error);
            return [];
        }
    }

    /**
     * Get aggregated sales stats by seller
     */
    async getSellerSalesStats(startDate, endDate) {
        try {
            const stats = orderRepository.getStatsBySeller(startDate, endDate);

            // Dynamic Import to avoid circular dependency if any (though repo layer is safe)
            // But we'll use the service we just created.
            // Actually, let's just use the repo directly here for speed/simplicity or import the service at top.
            // Since we are inside a method, let's import the repository directly to be safe.
            const { default: sellerPaymentRepo } = await import('../repositories/seller-payment.repository.js');
            const payments = sellerPaymentRepo.getAllTotalPaidGroupedBySeller();

            // Merge
            return stats.map(stat => {
                const payment = payments.find(p => p.seller_id === stat.vendedor_id);
                return {
                    ...stat,
                    total_paid: payment ? payment.total_paid : 0
                };
            });
        } catch (error) {
            console.error('Error getting seller sales stats:', error);
            return [];
        }
    }
}

// Export singleton instance
const ordersService = new OrdersService();
export default ordersService;

// Export individual functions for backward compatibility
export const createOrder = (orderData) => ordersService.createOrder(orderData);
export const getAllOrders = () => ordersService.getAllOrders();
export const getOrderStatus = (orderId) => ordersService.getOrderStatus(orderId);
export const updateOrderStatus = (orderId, status, notes) => ordersService.updateOrderStatus(orderId, status, notes);
export const cancelOrder = (orderId, motivo) => ordersService.cancelOrder(orderId, motivo);
