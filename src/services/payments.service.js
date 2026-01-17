/**
 * Payments Service
 * Manages payment installments (abonos) and payment tracking
 */

import orderRepository from '../repositories/order.repository.js';
import databaseService from '../config/database.service.js';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination.js';

class PaymentsService {
    /**
     * Add payment to order
     */
    async addPayment(paymentData) {
        try {
            // Validate order exists
            const order = orderRepository.getById(paymentData.pedido_id);
            if (!order) {
                throw new Error('Pedido no encontrado');
            }

            // Validate payment amount
            const totalPagado = order.total_abono_usd || 0;
            const saldoPendiente = order.total_usd - totalPagado;

            if (paymentData.monto_abono_usd > saldoPendiente) {
                throw new Error(`El monto del abono ($${paymentData.monto_abono_usd}) excede el saldo pendiente ($${saldoPendiente})`);
            }

            // Add payment
            const paymentId = orderRepository.addPayment({
                ...paymentData,
                cliente_id: order.cliente_id
            });

            console.log(`✅ Pago registrado: $${paymentData.monto_abono_usd} para pedido #${paymentData.pedido_id}`);

            // Check if order is fully paid
            const updatedOrder = orderRepository.getById(paymentData.pedido_id);
            if (updatedOrder.total_abono_usd >= updatedOrder.total_usd) {
                orderRepository.updateStatus(paymentData.pedido_id, 'pagado');
                console.log(`✅ Pedido #${paymentData.pedido_id} completamente pagado`);
            }

            return paymentId;
        } catch (error) {
            console.error('Error adding payment:', error);
            throw error;
        }
    }

    /**
     * Create scheduled payment plan with multiple installments
     */
    async createPaymentPlan(paymentData) {
        try {
            const db = databaseService.getDatabase();
            const { pedido_id, monto_abono_usd, plan_pago, metodo_pago, notas } = paymentData;

            // Validate order exists
            const order = orderRepository.getById(pedido_id);
            if (!order) {
                throw new Error('Pedido no encontrado');
            }

            const { num_cuotas, fecha_inicio, frecuencia, monto_cuota } = plan_pago;
            const createdPayments = [];

            // Calculate dates based on frequency
            const addDays = (date, days) => {
                const result = new Date(date);
                result.setDate(result.getDate() + days);
                return result;
            };

            const frequencyDays = {
                'semanal': 7,
                'quincenal': 15,
                'mensual': 30
            };

            let currentDate = new Date(fecha_inicio);

            // Create each scheduled installment
            for (let i = 0; i < num_cuotas; i++) {
                const stmt = db.prepare(`
                    INSERT INTO abonos (
                        pedido_id, cliente_id, monto_abono_usd, metodo_pago_abono,
                        tipo_abono, fecha_vencimiento, estado_abono, comentarios
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `);

                const info = stmt.run(
                    pedido_id,
                    order.cliente_id,
                    monto_cuota,
                    metodo_pago || 'pendiente',
                    'programado',
                    currentDate.toISOString().split('T')[0],
                    'pendiente', // Scheduled payments start as pending
                    notas || `Cuota ${i + 1} de ${num_cuotas}`
                );

                createdPayments.push({
                    id: info.lastInsertRowid,
                    cuota: i + 1,
                    monto: monto_cuota,
                    fecha_vencimiento: currentDate.toISOString().split('T')[0]
                });

                // Move to next date
                currentDate = addDays(currentDate, frequencyDays[frecuencia] || 30);
            }

            console.log(`✅ Plan de pagos creado: ${num_cuotas} cuotas de $${monto_cuota} para pedido #${pedido_id}`);

            return {
                success: true,
                plan: {
                    pedido_id,
                    total: monto_abono_usd,
                    cuotas: createdPayments
                }
            };
        } catch (error) {
            console.error('Error creating payment plan:', error);
            throw error;
        }
    }

    /**
     * Get payments by order
     */
    getPaymentsByOrder(orderId) {
        try {
            return orderRepository.getOrderPayments(orderId);
        } catch (error) {
            console.error('Error getting payments:', error);
            return [];
        }
    }

    /**
     * Get payment summary for order
     */
    getPaymentSummary(orderId) {
        try {
            const order = orderRepository.getById(orderId);
            if (!order) {
                throw new Error('Pedido no encontrado');
            }

            const payments = order.abonos || [];
            const totalPagado = payments
                .filter(p => p.estado_abono === 'confirmado')
                .reduce((sum, p) => sum + parseFloat(p.monto_abono_usd || 0), 0);

            const saldoPendiente = order.total_usd - totalPagado;

            return {
                pedido_id: orderId,
                total_pedido: order.total_usd,
                total_pagado: totalPagado,
                saldo_pendiente: saldoPendiente,
                numero_pagos: payments.length,
                estado_pago: saldoPendiente <= 0 ? 'pagado' : saldoPendiente < order.total_usd ? 'parcial' : 'pendiente',
                pagos: payments
            };
        } catch (error) {
            console.error('Error getting payment summary:', error);
            throw error;
        }
    }

    /**
     * Get all pending payments
     */
    getPendingPayments(search = '', options = {}) {
        try {
            const { page = 1, limit = 10 } = options;
            // Use the GROUPED query
            const { items, total } = orderRepository.getPendingByClient(search, { page, limit });

            const formatted = items.map(client => ({
                id: client.cliente_id, // Use Client ID as Row ID
                clientId: client.cliente_id,
                clientName: `${client.nombre} ${client.apellido}`,
                clientPhone: client.telefono,
                totalPendingOrders: client.pending_orders,
                totalAmount: client.total_sales,
                paidAmount: client.total_paid,
                balance: client.total_pending,
                status: 'pendiente' // Generic status for the group
            }));

            return formatPaginatedResponse(formatted, total, { page, limit });
        } catch (error) {
            console.error('Error getting pending payments:', error);
            return formatPaginatedResponse([], 0, options);
        }
    }

    /**
     * Get all payments/incomes (abonos + ingresos_varios)
     */
    async getPayments(filters = {}) {
        try {
            const db = databaseService.getDatabase();
            const { start, end, page = 1, limit = 20 } = filters;
            const offset = (page - 1) * limit;

            let whereClause = '';
            const params = [];

            if (start && end) {
                whereClause = ' WHERE fecha_abono BETWEEN ? AND ?';
                params.push(start, end);
            }

            // Get abonos (payments on orders)
            const abonosQuery = `
                SELECT 
                    a.id, 
                    'abono' as type,
                    a.monto_abono_usd as amount,
                    a.metodo_pago_abono as method,
                    a.fecha_abono as date,
                    COALESCE(c.nombre || ' ' || c.apellido, 'Pago Pedido #' || a.pedido_id) as description,
                    a.comentarios as notes
                FROM abonos a
                LEFT JOIN clientes c ON a.cliente_id = c.id
                ${whereClause}
                ORDER BY a.fecha_abono DESC
                LIMIT ? OFFSET ?
            `;

            const abonos = db.prepare(abonosQuery).all(...params, limit, offset);

            // Get count
            const countStmt = db.prepare(`SELECT COUNT(*) as total FROM abonos ${whereClause}`);
            const { total } = countStmt.get(...params);

            return {
                data: abonos,
                meta: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error getting payments:', error);
            return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
        }
    }

    /**
     * Get payment statistics
     */
    getStats() {
        try {
            // Use optimized SQL query for accuracy
            const stats = orderRepository.getReceivableStatistics();

            return {
                count: stats.count,
                totalPending: stats.totalPending,
                overdueCount: stats.overdueCount,
                totalIngresos: stats.totalSales,
                total_ventas: stats.totalSales,
                total_cobrado: stats.totalPaid,
                total_pendiente: stats.totalPending,
                ordenes_pendientes: stats.count, // Approximate
                tasa_cobranza: stats.totalSales > 0 ? (stats.totalPaid / stats.totalSales) * 100 : 0,
                last_updated: new Date()
            };

        } catch (error) {
            console.error('Error getting payment stats:', error);
            return {
                totalPending: 0,
                overdueCount: 0,
                total_ventas: 0,
                total_cobrado: 0,
                total_pendiente: 0,
                ordenes_pendientes: 0,
                tasa_cobranza: 0
            };
        }
    }
    /**
     * Create installment plan
     */
    async createInstallmentPlan(orderId, plan) {
        try {
            const order = orderRepository.getById(orderId);
            if (!order) throw new Error('Pedido no encontrado');

            const results = [];

            if (plan.schedule && Array.isArray(plan.schedule)) {
                for (const item of plan.schedule) {
                    const paymentData = {
                        pedido_id: orderId,
                        cliente_id: order.cliente_id,
                        monto_abono_usd: item.amount,
                        fecha_abono: item.dueDate, // Fix: Map from dueDate
                        estado_abono: 'pendiente',
                        metodo_pago: 'por_definir', // Fix: Provide explicit default for pending
                        notas: `Cuota ${item.number} de ${plan.numberOfInstallments} (${plan.frequency})` // Fix: Map from number
                    };

                    // Use addPayment from Repository (which inserts into abonos)
                    // Note: Repository.addPayment usually sets 'confirmado', check if it respects passed 'pendiente'
                    // I verified it uses passed `estado_abono` or defaults.
                    const id = orderRepository.addPayment(paymentData);
                    results.push(id);
                }
            }
            return results;
        } catch (error) {
            console.error('Error creating installment plan:', error);
            throw error;
        }
    }

    /**
     * Update installment (record payment)
     */
    async addPaymentToInstallment(installmentId, paymentData) {
        try {
            // paymentData: { amount, method, reference, notes }
            const updateData = {
                monto_abono_usd: paymentData.amount, // Verify if we overwrite amount or just confirm it? Usually confirm.
                metodo_pago: paymentData.method,
                referencia_pago: paymentData.reference,
                notas: paymentData.notes,
                fecha_abono: new Date().toISOString(),
                estado_abono: 'confirmado'
            };

            // Call repository logic
            const updated = orderRepository.updateAbono(installmentId, updateData);
            return updated;
        } catch (error) {
            console.error('Error adding payment to installment:', error);
            throw error;
        }
    }
    async createIncome(data) {
        try {
            const stmt = databaseService.getDatabase().prepare(`
                INSERT INTO ingresos_varios (
                    descripcion, monto, fecha, categoria, notas, metodo_pago
                ) VALUES (?, ?, ?, ?, ?, ?)
            `);
            const result = stmt.run(
                data.description,
                data.amount,
                data.date,
                data.category || 'General',
                data.notes,
                data.method || 'efectivo'
            );
            return { id: result.lastInsertRowid, ...data };
        } catch (error) {
            console.error('Error creating income:', error);
            throw error;
        }
    }

    async getAllIncome(options = {}) {
        try {
            const { page = 1, limit = 20 } = options;
            const { limit: l, offset } = getPaginationParams(page, limit);
            const db = databaseService.getDatabase();

            // 1. Calculate Total Count
            const countGeneric = db.prepare('SELECT COUNT(*) as count FROM ingresos_varios').get().count;
            const countSales = db.prepare('SELECT COUNT(*) as count FROM abonos').get().count;
            const total = countGeneric + countSales;

            // 2. Fetch Paginated Data using UNION
            // We need to cast columns to match types and order
            const query = `
                SELECT * FROM (
                    SELECT 
                        'GEN-' || id as id,
                        'generic' as type,
                        descripcion as client,
                        descripcion as description,
                        monto as amount,
                        fecha as date,
                        categoria as category,
                        notas,
                        metodo_pago as method
                    FROM ingresos_varios
                    
                    UNION ALL
                    
                    SELECT 
                        'SALE-' || a.id as id,
                        'sale' as type,
                        COALESCE(c.nombre || ' ' || c.apellido, 'Cliente') as client,
                        'Abono Venta #' || a.pedido_id as description,
                        a.monto_abono_usd as amount,
                        a.fecha_abono as date,
                        'Venta' as category,
                        'Abono Pedido #' || a.pedido_id as notes,
                        a.metodo_pago_abono as method
                    FROM abonos a
                    LEFT JOIN pedidos p ON a.pedido_id = p.id
                    LEFT JOIN clientes c ON p.cliente_id = c.id
                )
                ORDER BY date DESC
                LIMIT ? OFFSET ?
            `;

            const items = db.prepare(query).all(l, offset);
            return formatPaginatedResponse(items, total, { page, limit });

        } catch (error) {
            console.error('Error getting all income:', error);
            // Return empty paginated structure
            return formatPaginatedResponse([], 0, options);
        }
    }
    /**
     * Get global income statistics
     */
    async getGlobalIncomeStats(filters = {}) {
        try {
            const db = databaseService.getDatabase();

            // Calculate total from generic income
            const genericStats = db.prepare(`
                SELECT COUNT(*) as count, SUM(monto) as total 
                FROM ingresos_varios
            `).get();

            // Calculate total from sales payments (abonos confirmed)
            const salesStats = db.prepare(`
                SELECT COUNT(*) as count, SUM(monto_abono_usd) as total 
                FROM abonos 
                WHERE estado_abono = 'confirmado'
            `).get();

            const totalCount = (genericStats.count || 0) + (salesStats.count || 0);
            const totalAmount = (genericStats.total || 0) + (salesStats.total || 0);
            const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

            return {
                totalAmount: totalAmount || 0,
                totalCount: totalCount || 0,
                averageAmount: averageAmount || 0
            };

        } catch (error) {
            console.error('Error getting global income stats:', error);
            return { totalAmount: 0, totalCount: 0, averageAmount: 0 };
        }
    }

    /**
     * Create manual income entry (ingresos varios)
     */
    async createManualIncome(data) {
        try {
            const db = databaseService.getDatabase();

            const stmt = db.prepare(`
                INSERT INTO ingresos_varios (
                    descripcion, 
                    monto, 
                    metodo_pago, 
                    fecha,
                    categoria,
                    notas
                ) VALUES (?, ?, ?, ?, ?, ?)
            `);

            const info = stmt.run(
                data.descripcion || data.description || 'Ingreso manual',
                data.monto || data.amount || 0,
                data.metodo_pago || data.method || 'efectivo',
                data.fecha || data.date || new Date().toISOString(),
                data.categoria || data.category || 'Otros',
                data.notas || data.notes || ''
            );

            console.log(`✅ Ingreso manual registrado: $${data.monto || data.amount}`);

            return {
                id: info.lastInsertRowid,
                ...data
            };
        } catch (error) {
            console.error('Error creating manual income:', error);
            throw error;
        }
    }

    /**
     * Get income summary for charts/reports
     */
    async getIncomeSummary(start, end) {
        try {
            const db = databaseService.getDatabase();
            const params = [];
            let dateFilterGeneric = '';
            let dateFilterAbonos = '';

            if (start && end) {
                dateFilterGeneric = 'WHERE fecha BETWEEN ? AND ?'; // fecha is the correct column now
                dateFilterAbonos = 'AND fecha_abono BETWEEN ? AND ?';
                params.push(start, end);
            }

            // 1. Get Misc Income Total
            const miscQuery = `SELECT SUM(monto) as total FROM ingresos_varios ${dateFilterGeneric}`;
            const miscResult = db.prepare(miscQuery).get(...params);
            const miscTotal = miscResult?.total || 0;

            // 2. Get Orders Income Total (Abonos)
            const ordersQuery = `
                SELECT SUM(monto_abono_usd) as total 
                FROM abonos 
                WHERE estado_abono = 'confirmado' 
                ${dateFilterAbonos}
            `;
            // Re-use params for second query
            const ordersResult = db.prepare(ordersQuery).get(...params);
            const ordersTotal = ordersResult?.total || 0;

            // 3. Get Breakdown of Misc Income
            const miscBreakdownQuery = `
                SELECT 
                    id, 
                    descripcion as description, 
                    monto as amount, 
                    fecha as date, 
                    categoria as category,
                    notas as notes
                FROM ingresos_varios 
                ${dateFilterGeneric}
                ORDER BY fecha DESC
            `;
            const miscBreakdown = db.prepare(miscBreakdownQuery).all(...params);

            return {
                totalOrders: ordersTotal,
                totalMisc: miscTotal,
                grandTotal: ordersTotal + miscTotal,
                breakdown: {
                    misc: miscBreakdown
                }
            };
        } catch (error) {
            console.error('Error getting income summary:', error);
            return { totalOrders: 0, totalMisc: 0, grandTotal: 0, breakdown: { misc: [] } };
        }
    }
}

export default new PaymentsService();
