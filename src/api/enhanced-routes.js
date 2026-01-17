/**
 * Enhanced API Routes
 * Nuevas rutas para funcionalidades del template integrado
 */

import { Router } from 'express';
import fs from 'fs';
import clientsService from '../services/clients.service.js';
import productsService from '../services/products.service.js';
import ordersService from '../services/orders.service.js';
import paymentsService from '../services/payments.service.js';
import inventoryService from '../services/inventory.service.js';
import sellerPaymentService from '../services/seller-payments.service.js';
import installmentsService from '../services/installmentsService.js';
import databaseService from '../config/database.service.js';

// Architecture improvements
import { asyncHandler } from '../middleware/error-handler.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { NotFoundError } from '../core/errors.js';
import { logger } from '../core/logger.js';

// Validators
import {
    createClientSchema,
    updateClientSchema,
    clientIdSchema
} from '../validators/client.validator.js';
import {
    createProductSchema,
    updateProductSchema,
    productIdSchema,
    stockAdjustmentSchema
} from '../validators/product.validator.js';
import {
    createOrderSchema,
    updateOrderSchema,
    orderIdSchema,
    cancelOrderSchema
} from '../validators/order.validator.js';

export function setupEnhancedRoutes(app) {
    logger.info('Setting up enhanced API routes');

    // ============================================
    // CLIENTES
    // ============================================

    // Get all clients (or search matches)
    // Get all clients (or search matches)
    app.get('/api/clients', asyncHandler(async (req, res) => {
        const { q, page, limit } = req.query;
        // If q is provided, use searchClients. Otherwise get all.
        // Both now return { success: true, data: [], meta: {} } structure from helper?
        // Wait, formatPaginatedResponse returns { success: true, data, meta }.
        // So we should directly return that object via json().
        const response = q
            ? clientsService.searchClients(q, { page, limit })
            : clientsService.getAllClients({ page, limit });

        res.json(response);
    }));

    // Search clients
    app.get('/api/clients/search', asyncHandler(async (req, res) => {
        const { q } = req.query;
        const clients = clientsService.searchClients(q);
        res.json({ success: true, data: clients });
    }));

    // Get top clients (Must be before /:id)
    app.get('/api/clients/top', asyncHandler(async (req, res) => {
        const { limit = 10 } = req.query;
        const topClients = await clientsService.getTopClients(parseInt(limit));
        res.json({ success: true, data: topClients });
    }));

    // Get client by ID
    app.get('/api/clients/:id',
        validateParams(clientIdSchema),
        asyncHandler(async (req, res) => {
            const client = clientsService.getClientById(req.validated.id);
            if (!client) {
                throw new NotFoundError('Client', req.validated.id);
            }
            res.json({ success: true, data: client });
        })
    );

    // Create client
    app.post('/api/clients',
        validateBody(createClientSchema),
        asyncHandler(async (req, res) => {
            const newClient = clientsService.createClient(req.validated);
            logger.info({ clientId: newClient.id }, 'Client created');
            res.status(201).json({ success: true, data: newClient });
        })
    );

    // Update client
    app.put('/api/clients/:id',
        validateParams(clientIdSchema),
        validateBody(updateClientSchema),
        asyncHandler(async (req, res) => {
            const updated = clientsService.updateClient(req.validated.id, req.validated);
            logger.info({ clientId: req.validated.id }, 'Client updated');
            res.json({ success: true, data: updated });
        })
    );

    // Delete client
    app.delete('/api/clients/:id',
        validateParams(clientIdSchema),
        asyncHandler(async (req, res) => {
            const result = clientsService.deleteClient(req.validated.id);
            logger.info({ clientId: req.validated.id }, 'Client deleted');
            res.json({ success: true, data: result });
        })
    );

    // Get client purchase history
    app.get('/api/clients/:id/history',
        validateParams(clientIdSchema),
        asyncHandler(async (req, res) => {
            const history = await clientsService.getClientHistory(req.validated.id);
            res.json({ success: true, data: history });
        })
    );

    // Get client balance
    app.get('/api/clients/:id/balance',
        validateParams(clientIdSchema),
        asyncHandler(async (req, res) => {
            const balance = await clientsService.getClientBalance(req.validated.id);
            res.json({ success: true, data: balance });
        })
    );

    // Get client debt summary
    app.get('/api/clients/:id/debt-summary',
        validateParams(clientIdSchema),
        asyncHandler(async (req, res) => {
            const summary = await clientsService.getDebtSummary(req.validated.id);
            res.json({ success: true, data: summary });
        })
    );

    // ============================================
    // PRODUCTOS (Enhanced)
    // ============================================

    // PRODUCTOS (Enhanced)
    // ============================================

    // Get all products (with search support)
    // Get all products (with search support)
    app.get('/api/products', asyncHandler(async (req, res) => {
        const { search, page, limit } = req.query;
        const response = await productsService.getProducts(search, { page, limit });
        res.json(response);
    }));

    // Create product
    app.post('/api/products',
        validateBody(createProductSchema),
        asyncHandler(async (req, res) => {
            const newProduct = await productsService.createProduct(req.validated);
            logger.info({ productId: newProduct.id }, 'Product created');
            res.status(201).json({ success: true, data: newProduct });
        })
    );

    // Update product
    app.put('/api/products/:id',
        validateParams(productIdSchema),
        validateBody(updateProductSchema),
        asyncHandler(async (req, res) => {
            console.log('🔄 UPDATE REQUEST detected');
            console.log('📦 Validated Params/Body:', JSON.stringify(req.validated, null, 2));

            const updated = await productsService.updateProduct(req.validated.id, req.validated);
            logger.info({ productId: req.validated.id }, 'Product updated');
            res.json({ success: true, data: updated });
        })
    );

    // Delete product
    app.delete('/api/products/:id',
        validateParams(productIdSchema),
        asyncHandler(async (req, res) => {
            const result = await productsService.deleteProduct(req.validated.id);
            logger.info({ productId: req.validated.id }, 'Product deleted');
            res.json({ success: true, data: result });
        })
    );

    // Get low stock products
    app.get('/api/products/low-stock', asyncHandler(async (req, res) => {
        const products = await productsService.getLowStockProducts();
        res.json({ success: true, data: products });
    }));

    // Get product stats
    app.get('/api/products/stats', asyncHandler(async (req, res) => {
        const stats = await productsService.getStats();
        res.json({ success: true, data: stats });
    }));

    // ============================================
    // PAGOS (Abonos)
    // ============================================

    // Add payment to order
    app.post('/api/payments', asyncHandler(async (req, res) => {
        // Check if this is a scheduled payment plan
        if (req.body.tipo_abono === 'programado' && req.body.plan_pago) {
            const result = await paymentsService.createPaymentPlan(req.body);
            logger.info({ plan: result.plan }, 'Payment plan created');
            return res.status(201).json({ success: true, data: result });
        }

        // Regular single payment
        const paymentId = await paymentsService.addPayment(req.body);
        logger.info({ paymentId, orderId: req.body.pedido_id }, 'Payment added');
        res.status(201).json({ success: true, data: { id: paymentId } });
    }));

    // Get payments by order
    app.get('/api/payments/order/:orderId', asyncHandler(async (req, res) => {
        const payments = paymentsService.getPaymentsByOrder(req.params.orderId);
        res.json({ success: true, data: payments });
    }));

    // Get payment summary for order
    app.get('/api/payments/summary/:orderId', asyncHandler(async (req, res) => {
        const summary = paymentsService.getPaymentSummary(req.params.orderId);
        if (!summary) {
            throw new NotFoundError('Payment summary', req.params.orderId);
        }
        res.json({ success: true, data: summary });
    }));

    // Get pending payments
    app.get('/api/payments/pending', asyncHandler(async (req, res) => {
        const pending = paymentsService.getPendingPayments();
        res.json({ success: true, data: pending });
    }));

    // Get payment stats
    app.get('/api/payments/stats', asyncHandler(async (req, res) => {
        const stats = paymentsService.getStats();
        res.json({ success: true, data: stats });
    }));

    // Record payment for specific installment
    app.post('/api/installments/:id/payment', asyncHandler(async (req, res) => {
        const installmentId = req.params.id;
        const result = await paymentsService.addPaymentToInstallment(installmentId, req.body);
        logger.info({ installmentId }, 'Installment payment recorded');
        res.json({ success: true, data: result });
    }));

    // Create installment plan
    app.post('/api/sales/:id/installments', asyncHandler(async (req, res) => {
        const orderId = req.params.id;
        const plan = req.body;
        const result = await paymentsService.createInstallmentPlan(orderId, plan);
        logger.info({ orderId, installments: result.length }, 'Installment plan created');
        res.status(201).json({ success: true, data: result });
    }));

    // Get installments (abonos) for a sale
    app.get('/api/sales/:id/installments', asyncHandler(async (req, res) => {
        const orderId = req.params.id;
        const payments = paymentsService.getPaymentsByOrder(orderId);
        res.json({ success: true, data: payments });
    }));

    // ============================================
    // VENTAS / API SALES (Adapter)
    // ============================================

    // Create Sale (Adapter for Create Order)
    // Create Sale (Adapter for Create Order)
    app.post('/api/sales', asyncHandler(async (req, res) => {
        try {
            const saleData = req.body;
            // Debug: Log request to file to check payload
            try {
                fs.writeFileSync('last_sale_request.json', JSON.stringify(saleData, null, 2));
                console.log('📝 LOGGED REQUEST TO last_sale_request.json');
            } catch (e) { console.error('Write failed', e); }

            logger.info({ type: 'SALE_CREATION', data: saleData }, 'Processing new sale');

            // 1. Fetch Client - Support both cliente_id and clientId
            const clientId = saleData.cliente_id || saleData.clientId;
            if (!clientId) {
                throw new Error('Cliente ID es requerido');
            }

            const client = await clientsService.getClientById(clientId);
            if (!client) {
                throw new NotFoundError('Client', clientId);
            }

            // 2. Process manual products BEFORE creating sale
            for (const item of saleData.items) {
                if (item.es_manual || item.isManual) {
                    const productCode = item.codigo || item.code || item.sku || `MANUAL-${Date.now()}`;
                    const productName = item.nombre || item.name || 'Producto Manual';
                    const quantitySold = item.cantidad || item.quantity || 1;
                    const initialStock = item.stock_inicial || quantitySold; // Default to quantity sold if not specified

                    try {
                        // Check if manual product already exists
                        const existingProduct = await db.get(
                            'SELECT * FROM productos WHERE codigo = ? OR nombre = ?',
                            [productCode, productName]
                        );

                        if (existingProduct) {
                            // Product exists - verify stock and update
                            const newStock = (existingProduct.stock || 0) + initialStock - quantitySold;
                            if (newStock < 0) {
                                throw new Error(`Stock insuficiente para ${productName}. Disponible: ${existingProduct.stock}, Solicitado: ${quantitySold}`);
                            }

                            await db.run(
                                'UPDATE productos SET stock = ? WHERE id = ?',
                                [newStock, existingProduct.id]
                            );

                            // Update item to reference existing product
                            item.producto_id = existingProduct.id;
                            logger.info(`Manual product ${productName} updated. Stock: ${existingProduct.stock} -> ${newStock}`);
                        } else {
                            // Create new manual product
                            const result = await db.run(`
                                INSERT INTO productos (nombre, codigo, precio, stock, categoria, es_manual)
                                VALUES (?, ?, ?, ?, ?, 1)
                            `, [
                                productName,
                                productCode,
                                item.precio_unitario || item.price || 0,
                                initialStock - quantitySold, // Remaining stock after this sale
                                'Manual'
                            ]);

                            item.producto_id = result.lastID;
                            logger.info(`Manual product ${productName} created with ID ${result.lastID}. Initial stock: ${initialStock}, Sold: ${quantitySold}, Remaining: ${initialStock - quantitySold}`);
                        }
                    } catch (error) {
                        logger.error(`Error processing manual product ${productName}:`, error);
                        throw error;
                    }
                }
            }

            // 3. Adapt to Order Schema expected by ordersService
            const orderPayload = {
                cliente_id: client.id,
                cliente_nombre: client.nombre,
                cliente_apellido: client.apellido || '-',
                cliente_cedula: client.cedula || '',
                cliente_telefono: client.telefono || '',
                cliente_email: client.email || '',
                cliente_direccion: client.direccion || '',

                // Map items to 'productos' - Fetch product details if nombre is missing
                productos: await Promise.all(saleData.items.map(async (item) => {
                    let productName = item.nombre || item.name;

                    // If no name provided, fetch from database
                    if (!productName && (item.producto_id || item.productId)) {
                        try {
                            const product = await productsService.getProductById(item.producto_id || item.productId);
                            productName = product?.nombre || `Producto ${item.producto_id || item.productId}`;
                        } catch (e) {
                            console.error(`Error fetching product ${item.producto_id}:`, e);
                            productName = `Producto ${item.producto_id || item.productId}`;
                        }
                    }

                    return {
                        producto_id: item.producto_id || item.productId,
                        cantidad: item.cantidad || item.quantity || 1,
                        precio_unitario: item.precio_unitario || item.price || 0,
                        nombre: productName || 'Producto Sin Nombre',
                        codigo: item.codigo || item.code || item.sku || `PROD-${item.producto_id || item.productId}`,
                        es_manual: item.es_manual || item.isManual || false,
                        nombre_manual: (item.es_manual || item.isManual) ? productName : null
                    };
                })),

                // Financials
                total_usd: saleData.total_usd || saleData.total || 0,
                subtotal: saleData.subtotal || 0,
                descuento_total: saleData.descuento_valor || saleData.discount || 0,
                impuesto_total: saleData.iva || 0,

                // Payment info
                tipo_pago: saleData.paymentType,
                metodo_pago: saleData.paymentMethod,

                // Fix: Correct mapping for Mixed Payments
                es_pago_mixto: saleData.paymentType === 'Pago Mixto',
                monto_mixto_usd: saleData.mixedPaymentUSD || 0,
                monto_mixto_ves: saleData.mixedPaymentVES || 0,

                // Legacy/Standard fields
                monto_recibido_usd: saleData.mixedPaymentUSD || saleData.total || 0, // Fallback for standard payment
                monto_recibido_ves: saleData.mixedPaymentVES || 0,
                tasa_cambio: saleData.exchangeRate || 0,

                comentarios_generales: saleData.notes,

                // Installments
                plan_cuotas: saleData.installmentPlan
            };

            const newOrder = await ordersService.createOrder(orderPayload);

            // 4. Auto-register income for this sale
            try {
                const incomeData = {
                    concepto: `Venta #${newOrder.id} - ${client.nombre}`,
                    monto: saleData.total_usd || saleData.total || 0,
                    fecha: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                    categoria: 'Ventas',
                    metodo_pago: saleData.paymentMethod || 'efectivo',
                    referencia: `PEDIDO-${newOrder.id}`,
                    descripcion: `Ingreso automático por venta. Productos: ${saleData.items.length}`
                };

                await db.run(`
                    INSERT INTO ingresos (concepto, monto, fecha, categoria, metodo_pago, referencia, descripcion)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    incomeData.concepto,
                    incomeData.monto,
                    incomeData.fecha,
                    incomeData.categoria,
                    incomeData.metodo_pago,
                    incomeData.referencia,
                    incomeData.descripcion
                ]);

                logger.info({ orderId: newOrder.id, amount: incomeData.monto }, '💰 Income auto-registered');
            } catch (incomeError) {
                // Log but don't fail the sale if income registration fails
                logger.error('Failed to register income for sale:', incomeError);
            }

            res.status(201).json({ success: true, data: newOrder });

        } catch (error) {
            console.error('❌ SALE ERROR:', error.message);
            logger.error({ err: error }, 'Error creating sale');
            // Return 400 Bad Request with specific message instead of 500
            res.status(400).json({
                success: false,
                error: error.message || 'Error processing sale',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }));

    // Get Sales by Period - Fixed to return actual data
    app.get('/api/sales/by-period', asyncHandler(async (req, res) => {
        const { period } = req.query;
        const db = databaseService.getDatabase();

        // Logic matches AnalyticsService.getExecutiveSummary using SQLite native date functions
        // This ensures the Modal Details match the Dashboard Cards

        let query = `
            SELECT p.*, 
                   c.nombre as cliente_nombre_join, 
                   c.apellido as cliente_apellido_join
            FROM pedidos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            WHERE p.estado_entrega != 'anulado'
        `;
        const params = [];

        try {
            if (period === 'daily') {
                query += ` AND date(p.fecha_pedido) >= date('now', 'localtime')`;
            }
            else if (period === 'weekly') {
                // Logic: Saturday to Friday cycle
                const d = new Date();
                const day = d.getDay(); // 0 (Sun) to 6 (Sat)
                const diff = day === 6 ? 0 : -(day + 1);

                const start = new Date(d);
                start.setDate(d.getDate() + diff);

                // Format YYYY-MM-DD
                const startStr = start.toISOString().split('T')[0];

                query += ` AND date(p.fecha_pedido) >= date(?)`;
                params.push(startStr);
            }
            else if (period === 'monthly') {
                const today = new Date();
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                const monthStartStr = monthStart.toISOString().split('T')[0];

                query += ` AND date(p.fecha_pedido) >= date(?)`;
                params.push(monthStartStr);
            }
            // If explicit date range provided (optional future proofing)
            else if (period === 'manual' && req.query.startDate && req.query.endDate) {
                query += ` AND date(p.fecha_pedido) >= date(?) AND date(p.fecha_pedido) <= date(?)`;
                params.push(req.query.startDate, req.query.endDate);
            }
            else {
                // Default to today if unknown period
                query += ` AND date(p.fecha_pedido) >= date('now', 'localtime')`;
            }

            query += ` ORDER BY p.fecha_pedido DESC`;

            const sales = db.prepare(query).all(...params);

            // Enrich sales with client names if JOIN worked
            const enrichedSales = sales.map(s => ({
                ...s,
                cliente_nombre: s.cliente_nombre_join || s.cliente_nombre,
                cliente_apellido: s.cliente_apellido_join || s.cliente_apellido
            }));

            // Calculate totals
            const total = enrichedSales.reduce((sum, order) => sum + (parseFloat(order.total_usd) || 0), 0);

            res.json({
                success: true,
                data: {
                    sales: enrichedSales,
                    total: total,
                    count: enrichedSales.length,
                    period: period
                }
            });
        } catch (error) {
            console.error('Error in sales/by-period:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }));

    // Duplicate Sale/Order
    app.post('/api/sales/:id/duplicate', asyncHandler(async (req, res) => {
        const orderId = req.params.id;
        const newOrder = await ordersService.duplicateOrder(orderId);
        logger.info({ originalId: orderId, newId: newOrder.id }, 'Sale duplicated');
        res.status(201).json({ success: true, data: newOrder });
    }));

    // GET /api/sales (Verification: Alias for orders or mapped for Frontend)
    // If Frontend uses /sales, we must provide it.
    app.get('/api/sales', asyncHandler(async (req, res) => {
        // Reuse Orders Logic (or adapt)
        // Since frontend expects response.data to be list or { data: list }
        const { status, search, startDate, endDate } = req.query;
        let orders = await ordersService.getAllOrders();

        // Apply filters (Same as orders route)
        if (status) orders = orders.filter(o => o.estado_entrega === status);
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            orders = orders.filter(o => new Date(o.fecha_pedido) >= start && new Date(o.fecha_pedido) <= end);
        }
        if (search) {
            const q = search.toLowerCase();
            orders = orders.filter(o =>
                o.id.toString().includes(q) ||
                (o.cliente_nombre && o.cliente_nombre.toLowerCase().includes(q))
            );
        }

        res.json({ success: true, data: orders });
    }));

    // ============================================
    // INVENTARIO
    // ============================================

    // Check Stock for specific product
    app.get('/api/inventory/:id/stock', asyncHandler(async (req, res) => {
        const product = await productsService.getProductById(req.params.id);
        if (!product) {
            throw new NotFoundError('Product', req.params.id);
        }
        res.json({
            available: product.stock_actual,
            reserved: 0 // TODO: Implement reservation logic if needed
        });
    }));

    // Get stock movements
    app.get('/api/inventory/movements', asyncHandler(async (req, res) => {
        const { page, limit } = req.query;
        // Pass pagination object to service
        const response = inventoryService.getMovements({ page, limit });
        // Response is already formatted { success: true, data, meta }
        res.json(response);
    }));

    // Get movements by product
    app.get('/api/inventory/movements/:productId', asyncHandler(async (req, res) => {
        const movements = inventoryService.getMovementsByProduct(req.params.productId);
        res.json({ success: true, data: movements });
    }));

    // Register stock adjustment
    app.post('/api/inventory/adjustment',
        validateBody(stockAdjustmentSchema),
        asyncHandler(async (req, res) => {
            const { producto_id, cantidad, comentario } = req.validated;
            const result = inventoryService.registerAdjustment(producto_id, cantidad, comentario);
            logger.info({ producto_id, cantidad }, 'Stock adjustment registered');
            res.json({ success: true, data: result });
        })
    );

    // Get inventory stats
    app.get('/api/inventory/stats', asyncHandler(async (req, res) => {
        const stats = inventoryService.getStats();
        res.json({ success: true, data: stats });
    }));

    // ============================================
    // PEDIDOS (Enhanced)
    // ============================================

    // Get all orders (with filters and adapter)
    app.get('/api/orders/export', asyncHandler(async (req, res) => {
        const { format = 'json', ...filters } = req.query;
        // Map frontend filters to backend expectations if needed
        // The service logic aligns with these standard filters

        try {
            const buffer = await ordersService.exportOrders(format, filters);

            if (format === 'excel' || format === 'xlsx') {
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=pedidos.xlsx');
            } else if (format === 'json') {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=pedidos.json');
            } else if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=pedidos.csv');
            } else if (format === 'pdf') {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=pedidos.pdf');
            } else if (format === 'markdown' || format === 'md') {
                res.setHeader('Content-Type', 'text/markdown');
                res.setHeader('Content-Disposition', 'attachment; filename=pedidos.md');
            }

            res.send(buffer);
        } catch (error) {
            console.error('Export Error:', error);
            res.status(500).json({ success: false, error: 'Export failed' });
        }
    }));

    // Get order by ID (Placed AFTER export to avoid collision)
    // Get order stats (Global) - MUST BE BEFORE /:id
    app.get('/api/orders/stats', asyncHandler(async (req, res) => {
        const stats = await ordersService.getStats();
        res.json({ success: true, data: stats });
    }));

    // Get order by ID (Placed AFTER export to avoid collision)
    app.get('/api/orders/:id', asyncHandler(async (req, res) => {
        const orderId = req.params.id;
        const o = await ordersService.getOrderStatus(orderId);

        if (!o) {
            return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
        }

        // Adapt to Frontend Structure (Same as list view)
        const adaptedOrder = {
            id: o.id,
            date: o.fecha_pedido,
            client: {
                id: o.cliente_id,
                name: `${o.cliente_nombre || ''} ${o.cliente_apellido || ''}`.trim() || 'Cliente -',
                phone: o.cliente_telefono || '',
                email: o.cliente_email || ''
            },
            // Parse items if string, or use direct if object
            items: (() => {
                try {
                    return typeof o.detalles_pedido === 'string' && o.detalles_pedido
                        ? JSON.parse(o.detalles_pedido)
                        : (o.detalles_pedido || [])
                } catch (e) { return [] }
            })(),
            total: o.total_usd,
            status: o.estado_entrega,
            paymentMethod: o.metodo_pago,
            notes: o.comentarios || o.notas || '',
            paymentType: o.tipo_pago, // 'Contado', 'Credito', etc.
            installments: o.plan_cuotas || [], // If strictly stored
            payments: o.abonos || []
        };

        res.json({ success: true, data: adaptedOrder });
    }));



    // Create new order - POST /api/orders
    app.post('/api/orders', asyncHandler(async (req, res) => {
        try {
            const orderData = req.body;
            logger.info({ type: 'ORDER_CREATION', data: orderData }, 'Processing new order');

            // If clientId exists, fetch client details
            if (orderData.clientId) {
                const client = await clientsService.getClientById(orderData.clientId);
                if (!client) {
                    throw new NotFoundError('Client', orderData.clientId);
                }

                // Enhance order payload with client info
                orderData.cliente_nombre = client.nombre;
                orderData.cliente_apellido = client.apellido || '-';
                orderData.cliente_cedula = client.cedula || '';
                orderData.cliente_telefono = client.telefono || '';
                orderData.cliente_email = client.email || '';
                orderData.cliente_direccion = client.direccion || '';
            }

            // Create order using ordersService
            const newOrder = await ordersService.createOrder(orderData);

            logger.info({ orderId: newOrder.id }, 'Order created successfully');
            res.status(201).json({ success: true, data: newOrder });

        } catch (error) {
            console.error('❌ ORDER CREATION ERROR:', error.message);
            logger.error({ err: error }, 'Error creating order');
            res.status(400).json({
                success: false,
                error: error.message || 'Error creating order',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }));

    app.get('/api/orders', asyncHandler(async (req, res) => {
        const { status, search, manufacturer, startDate, endDate, page, limit } = req.query;
        console.log('🔍 ROUTE: /api/orders called with pagination', { page, limit, manufacturer });

        // Call Service with Filters and Pagination
        // Service returns { success: true, data: [items], meta: {} }
        const serviceResponse = await ordersService.getAllOrders(
            { status, search, manufacturer, startDate, endDate },
            { page, limit }
        );

        // Adapt the data array to Frontend Structure (CamelCase)
        const adaptedOrders = serviceResponse.data.map(o => ({
            id: o.id,
            date: o.fecha_pedido,
            client: {
                name: `${o.cliente_nombre || ''} ${o.cliente_apellido || ''}`.trim() || 'Cliente -'
            },
            items: o.detalles_pedido || [],
            total: o.total_usd,
            status: o.estado_entrega,
            paymentMethod: o.metodo_pago
        }));

        res.json({
            success: true,
            data: adaptedOrders,
            meta: serviceResponse.meta
        });
    }));

    // Delete order
    app.delete('/api/orders/:id',
        validateParams(orderIdSchema),
        asyncHandler(async (req, res) => {
            const result = await ordersService.deleteOrder(req.validated.id);
            logger.info({ orderId: req.validated.id }, 'Order deleted');
            res.json({ success: true, data: result });
        })
    );

    // Cancel order
    app.post('/api/orders/:id/cancel',
        validateParams(orderIdSchema),
        validateBody(cancelOrderSchema),
        asyncHandler(async (req, res) => {
            const { motivo } = req.validated;
            const cancelled = await ordersService.cancelOrder(req.validated.id, motivo);
            logger.info({ orderId: req.validated.id }, 'Order cancelled');
            res.json({ success: true, data: cancelled });
        })
    );

    // Update order (General)
    app.put('/api/orders/:id',
        validateParams(orderIdSchema),
        validateBody(updateOrderSchema),
        asyncHandler(async (req, res) => {
            const updated = await ordersService.updateOrder(req.validated.id, req.validated);
            if (!updated) {
                return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
            }
            res.json({ success: true, data: updated });
        })
    );

    // Update order status
    app.put('/api/orders/:id/status',
        validateParams(orderIdSchema),
        asyncHandler(async (req, res) => {
            const { status, notes } = req.body;
            // Validate status
            const validStatus = ['pendiente', 'confirmado', 'en_camino', 'entregado', 'cancelado', 'en proceso', 'completado'];
            if (status && !validStatus.includes(status)) {
                return res.status(400).json({ success: false, error: 'Estado inválido' });
            }

            const updated = await ordersService.updateOrderStatus(req.validated.id, status, notes);
            if (!updated) {
                return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
            }
            res.json({ success: true, data: updated });
        })
    );

    // Get orders by status
    app.get('/api/orders/status/:status', asyncHandler(async (req, res) => {
        const orders = await ordersService.getOrdersByStatus(req.params.status);
        res.json({ success: true, data: orders });
    }));

    // Get Account History (Orders + Payments)
    app.get('/api/accounts-receivable/:id/history', asyncHandler(async (req, res) => {
        const clientId = req.params.id;

        // 1. Get Client
        const client = await clientsService.getClientById(clientId);
        if (!client) {
            throw new NotFoundError('Client', clientId);
        }

        // 2. Get Orders (which contain payments in 'abonos')
        const orders = await ordersService.getOrdersByClient(clientId);

        // 3. Construct History
        let history = [];

        orders.forEach(order => {
            // Add Order Event
            history.push({
                id: order.id,
                client_id: order.cliente_id,
                date: order.fecha_pedido,
                type: 'order',
                reference: `Pedido #${order.id}`,
                amount: -Math.abs(order.total_usd), // Debt increases (negative for balance calculation view, or positive debt?)
                // Let's stick to: Credits (Payments) are positive/green, Debts (Orders) are negative/red
                balance_after: 0, // Calculated later
                notes: order.estado_entrega
            });

            // Add Payment Events
            if (order.abonos && Array.isArray(order.abonos)) {
                order.abonos.forEach(payment => {
                    history.push({
                        date: payment.fecha_abono,
                        type: 'payment',
                        reference: `Abono #${payment.id} (Pedido #${order.id})`,
                        amount: Math.abs(payment.monto_abono_usd),
                        notes: payment.metodo_pago
                    });
                });
            } else if (order.total_abono_usd > 0 && (!order.abonos || order.abonos.length === 0)) {
                // Legacy support if abonos array is missing but total exists
                history.push({
                    date: order.fecha_pedido, // Fallback date
                    type: 'payment',
                    reference: `Abono Inicial (Pedido #${order.id})`,
                    amount: Math.abs(order.total_abono_usd),
                    notes: 'Abono registrado en pedido'
                });
            }
        });

        // 4. Sort by Date Ascending to calculate running balance
        history.sort((a, b) => new Date(a.date) - new Date(b.date));

        // 5. Calculate Running Balance
        let balance = 0;
        history = history.map(item => {
            // If order (debt), it adds to what they owe. If payment, it reduces what they owe.
            // Let's say Balance = Debt.
            // Order: Balance += Amount
            // Payment: Balance -= Amount

            // Adjust logic:
            // Order Amount: +Total
            // Payment Amount: -Payment

            const effect = item.type === 'order' ? Math.abs(item.amount) : -Math.abs(item.amount);
            balance += effect;

            return {
                ...item,
                amount: item.type === 'order' ? item.amount : Math.abs(item.amount), // Display purposes
                balance_after: balance
            };
        });

        // 6. Return Sorted Descending (Newest First) for View
        history.reverse();

        res.json({
            success: true,
            data: {
                client: {
                    id: client.id,
                    name: `${client.nombre} ${client.apellido}`,
                    phone: client.telefono,
                    email: client.email,
                    cedula: client.cedula,
                    address: client.direccion,
                    balance: balance // Current totals
                },
                history: history
            }
        });
    }));

    // Get sales statistics
    app.get('/api/sales/stats', asyncHandler(async (req, res) => {
        // Simple aggregate of all orders for now, filtered by date if needed
        const { start, end } = req.query;
        // In a real app, pass dates to service.
        // Reusing paymentsService.getStats or similar.
        // For Reports Page, we need: totalSales, totalRevenue, totalOrders, averageTicket
        const stats = await paymentsService.getStats();
        res.json({ success: true, data: stats });
    }));

    // ============================================
    // DASHBOARD & ANALYTICS
    // ============================================

    // Health Check
    app.get('/api/health', (req, res) => {
        res.json({
            status: 'ok',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    });

    // Dashboard Summary
    // Dashboard Summary
    // Dashboard Summary
    app.get('/api/dashboard', asyncHandler(async (req, res) => {
        console.log('🔍 ENHANCED DASHBOARD REQUEST STARTED');
        try {
            // Import legacy services for compatibility if not imported at top
            const { default: sellersManager } = await import('../services/sellers.service.js');
            const { default: analyticsService } = await import('../services/analytics.service.js');

            console.log('🔍 Fetching stats parallel...');

            // 1. Orders Stats (Real DB Data)
            const ordersStats = await ordersService.getStats();

            // 2. Manufacturers Workload (Real DB Data)
            const productionWorkload = manufacturersService.getAllWithWorkload();

            // 3. Sellers Workload (Memory State)
            const sellersStats = sellersManager.getStats();
            const workload = sellersManager.getWorkload();

            // 4. Analytics Summary (Legacy/Memory + DB mixed likely)
            const analyticsSummary = analyticsService.getExecutiveSummary();

            // 5. Construct Response matching Dashboard.js expectations
            const responseData = {
                analytics: {
                    ...analyticsSummary,
                    daily: {
                        total: ordersStats.daily,
                        orders: ordersStats.dailyCount || 0 // If getStats returns count
                    },
                    weekly: {
                        total: ordersStats.weekly || 0 // If implemented
                    },
                    monthly: {
                        total: ordersStats.monthly
                    }
                },
                sellers: sellersStats,
                workload: workload,
                production_workload: productionWorkload
            };

            res.json({
                success: true,
                data: responseData
            });
        } catch (error) {
            console.error('🔥 ENHANCED DASHBOARD ERROR:', error);
            throw error; // Let asyncHandler handle it
        }
    }));

    // Sales Stats (Aggregated from Payments)
    app.get('/api/sales/stats', asyncHandler(async (req, res) => {
        const stats = await paymentsService.getStats();
        res.json({ success: true, data: stats });
    }));

    // Product Stats (Inventory Analysis)
    app.get('/api/products/stats', asyncHandler(async (req, res) => {
        const stats = await productsService.getStats();
        res.json({ success: true, data: stats });
    }));

    // Analytics Metrics (Alias or Detailed)
    app.get('/api/analytics/metrics', asyncHandler(async (req, res) => {
        const stats = await ordersService.getSalesByPeriod('day');
        res.json({ success: true, data: stats });
    }));

    app.get('/api/analytics/summary', asyncHandler(async (req, res) => {
        const stats = await ordersService.getStats();
        res.json({ success: true, data: stats });
    }));

    // Get orders by client
    app.get('/api/orders/client/:clientId', asyncHandler(async (req, res) => {
        const orders = await ordersService.getOrdersByClient(req.params.clientId);
        res.json({ success: true, data: orders });
    }));

    // Get order stats
    app.get('/api/orders/stats', asyncHandler(async (req, res) => {
        const stats = await ordersService.getStats();
        res.json({ success: true, data: stats });
    }));

    // Get seller sales statistics
    app.get('/api/reports/seller-sales', asyncHandler(async (req, res) => {
        const { startDate, endDate } = req.query;
        const stats = await ordersService.getSellerSalesStats(startDate, endDate);
        res.json({ success: true, data: stats });
    }));

    // --- Seller Payments Routes ---
    app.post('/api/seller-payments', asyncHandler(async (req, res) => {
        const payment = await sellerPaymentService.createPayment(req.body);
        res.json({ success: true, data: payment });
    }));

    // --- Sellers Workload ---
    app.get('/api/sellers/workload', asyncHandler(async (req, res) => {
        const { default: sellersManager } = await import('../services/sellers.service.js');
        const workload = sellersManager.getWorkload();
        res.json({ success: true, data: workload });
    }));

    // --- Finance Income Routes ---
    app.get('/api/finance/income', asyncHandler(async (req, res) => {
        const { start, end, page = 1, limit = 20 } = req.query;
        // Use payments/abonos as income source
        const income = await paymentsService.getPayments({ start, end, page, limit });
        res.json({ success: true, data: income.data || income, meta: income.meta });
    }));

    app.post('/api/finance/income', asyncHandler(async (req, res) => {
        // Create a manual income entry (ingreso varios)
        const data = req.body;
        // Store in ingresos_varios or similar table logic
        const result = await paymentsService.createManualIncome(data);
        res.json({ success: true, data: result });
    }));

    // Income Summary
    app.get('/api/finance/income/summary', asyncHandler(async (req, res) => {
        const { start, end } = req.query;
        const summary = await paymentsService.getIncomeSummary(start, end);
        res.json({ success: true, data: summary });
    }));

    // --- Expenses Routes ---
    app.get('/api/finance/expenses', asyncHandler(async (req, res) => {
        const { default: expensesService } = await import('../services/expenses.service.js');
        const result = await expensesService.getExpenses(req.query);
        res.json({ success: true, ...result });
    }));

    app.post('/api/finance/expenses', asyncHandler(async (req, res) => {
        const { default: expensesService } = await import('../services/expenses.service.js');
        const result = await expensesService.createExpense(req.body);
        res.json({ success: true, data: result });
    }));

    app.post('/api/finance/expenses/:id/pay', asyncHandler(async (req, res) => {
        const { default: expensesService } = await import('../services/expenses.service.js');
        const result = await expensesService.registerPayment(req.params.id, req.body.amount);
        res.json({ success: true, data: result });
    }));

    // --- Manufacturers Workload for Finance ---
    app.get('/api/finance/manufacturers', asyncHandler(async (req, res) => {
        const { default: manufacturersService } = await import('../services/manufacturers.service.js');
        const workload = manufacturersService.getAllWithWorkload();
        res.json({ success: true, data: workload });
    }));

    // --- Commissions Configuration ---
    app.get('/api/finance/commissions/seller/:sellerId', asyncHandler(async (req, res) => {
        const { default: commissionsService } = await import('../services/commissions.service.js');
        const rate = await commissionsService.getSellerRate(req.params.sellerId);
        res.json({ success: true, data: rate });
    }));

    app.post('/api/finance/commissions/config', asyncHandler(async (req, res) => {
        const { default: commissionsService } = await import('../services/commissions.service.js');
        const result = await commissionsService.updateRate(req.body);
        res.json({ success: true, data: result });
    }));

    // ============================================
    // ACCOUNTS RECEIVABLE
    // ============================================

    app.get('/api/accounts-receivable/stats', asyncHandler(async (req, res) => {
        // Reuse installment stats for now as it tracks pending payments
        const result = await installmentsService.getStats();
        res.json({
            success: true,
            data: {
                totalReceivable: result.data.total_por_cobrar,
                overdueTotal: result.data.monto_vencido,
                overdueCount: result.data.cuotas_vencidas,
                upcomingTotal: result.data.monto_proximo
            }
        });
    }));

    app.get('/api/accounts-receivable', asyncHandler(async (req, res) => {
        // Return clients with pending installments
        // This is a simplified version, ideally we group installments by client
        const filters = { status: 'pendiente', limit: 100 };
        const result = await installmentsService.getAllInstallments(filters);

        // Group by client
        const clientsMap = new Map();
        result.data.forEach(inst => {
            if (!clientsMap.has(inst.cliente_id)) {
                clientsMap.set(inst.cliente_id, {
                    id: inst.cliente_id,
                    nombre: inst.cliente_nombre,
                    apellido: inst.cliente_apellido,
                    telefono: inst.cliente_telefono,
                    total_debt: 0,
                    installments_count: 0
                });
            }
            const client = clientsMap.get(inst.cliente_id);
            client.total_debt += parseFloat(inst.monto_cuota) - parseFloat(inst.monto_pagado || 0);
            client.installments_count++;
        });

        res.json({
            success: true,
            data: Array.from(clientsMap.values()),
            meta: { total: clientsMap.size }
        });
    }));

    // ============================================
    // INSTALL MENTS / CUOTAS PROGRAMADAS
    // ============================================

    // Get all installments with filters
    app.get('/api/installments', asyncHandler(async (req, res) => {
        const filters = {
            status: req.query.status || 'all',
            cliente_id: req.query.cliente_id,
            pedido_id: req.query.pedido_id,
            start_date: req.query.start_date,
            end_date: req.query.end_date,
            page: req.query.page || 1,
            limit: req.query.limit || 50
        };
        const result = await installmentsService.getAllInstallments(filters);
        res.json(result);
    }));

    // Get installment statistics
    app.get('/api/installments/stats', asyncHandler(async (req, res) => {
        const result = await installmentsService.getStats();
        res.json(result);
    }));

    // Mark installment as paid
    app.post('/api/installments/:id/pay', asyncHandler(async (req, res) => {
        const id = parseInt(req.params.id);
        const paymentData = {
            fecha_pago: req.body.fecha_pago,
            monto_pagado: parseFloat(req.body.monto_pagado),
            metodo_pago: req.body.metodo_pago,
            referencia: req.body.referencia,
            notas: req.body.notas
        };
        const result = await installmentsService.markAsPaid(id, paymentData);
        logger.info({ installmentId: id }, 'Installment marked as paid');
        res.json(result);
    }));

    // Get complete payment plan by order ID
    app.get('/api/installments/plan/:pedidoId', asyncHandler(async (req, res) => {
        const pedidoId = parseInt(req.params.pedidoId);
        const result = await installmentsService.getPlanByOrder(pedidoId);
        res.json(result);
    }));

    // Create installments for an order (manual creation)
    app.post('/api/installments/create', asyncHandler(async (req, res) => {
        const planData = {
            pedido_id: req.body.pedido_id,
            cliente_id: req.body.cliente_id,
            total: parseFloat(req.body.total),
            cuotas: parseInt(req.body.cuotas),
            fecha_inicio: req.body.fecha_inicio,
            frecuencia: req.body.frecuencia || 'monthly'
        };
        const result = await installmentsService.createInstallments(planData);
        logger.info({ pedidoId: planData.pedido_id, cuotas: planData.cuotas }, 'Installments created');
        res.status(201).json(result);
    }));

    logger.info('✅ Enhanced API routes configured');
}
