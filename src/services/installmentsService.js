// installmentsService.js - Service for managing installments (cuotas programadas)
import installmentRepository from '../repositories/installment.repository.js';

class InstallmentsService {
    /**
     * Get all installments with filters
     * @param {Object} filters - { status, cliente_id, start_date, end_date, page, limit, pedido_id }
     */
    async getAllInstallments(filters = {}) {
        try {
            const { items, total } = installmentRepository.getAll(filters);
            const { page = 1, limit = 50 } = filters;

            return {
                success: true,
                data: items,
                meta: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error getting installments:', error);
            throw error;
        }
    }

    /**
     * Get installment statistics
     */
    async getStats() {
        try {
            const stats = installmentRepository.getStats();

            // Calculate tasa de cumplimiento
            const tasaCumplimiento = stats.total_cuotas > 0
                ? Math.round((stats.cuotas_pagadas / stats.total_cuotas) * 100)
                : 0;

            return {
                success: true,
                data: {
                    ...stats,
                    tasa_cumplimiento: tasaCumplimiento
                }
            };
        } catch (error) {
            console.error('Error getting installment stats:', error);
            throw error;
        }
    }

    /**
     * Mark installment as paid
     * @param {number} id - Installment ID
     * @param {Object} paymentData - { fecha_pago, monto_pagado, metodo_pago, referencia, notas }
     */
    async markAsPaid(id, paymentData) {
        try {
            const { fecha_pago, monto_pagado, metodo_pago, referencia, notas } = paymentData;

            // Obtener cuota actual
            const installment = installmentRepository.getById(id);

            if (!installment) {
                throw new Error('Cuota no encontrada');
            }

            // Determinar estado según monto pagado
            let nuevoEstado = 'pagada';
            if (monto_pagado < installment.monto_cuota) {
                nuevoEstado = 'parcial';
            }

            // Actualizar cuota
            installmentRepository.update(id, {
                estado: nuevoEstado,
                fecha_pago,
                monto_pagado,
                metodo_pago,
                referencia,
                notas
            });

            return {
                success: true,
                message: 'Pago registrado exitosamente'
            };
        } catch (error) {
            console.error('Error marking installment as paid:', error);
            throw error;
        }
    }

    /**
     * Get complete payment plan by order ID
     * @param {number} pedidoId
     */
    async getPlanByOrder(pedidoId) {
        try {
            // Obtener información del pedido usando el DB del repositorio
            const db = installmentRepository.db;
            const pedido = db.prepare(`
                SELECT p.*, c.nombre, c.apellido, c.telefono, c.email
                FROM pedidos p
                INNER JOIN clientes c ON p.cliente_id = c.id
                WHERE p.id = ?
            `).get(pedidoId);

            if (!pedido) {
                throw new Error('Pedido no encontrado');
            }

            // Obtener todas las cuotas del plan
            const cuotas = installmentRepository.getByPedidoId(pedidoId);

            // Calcular días restantes manualmente
            const cuotasConDias = cuotas.map(c => {
                const today = new Date();
                const due = new Date(c.fecha_vencimiento);
                const diffTime = due - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return { ...c, dias_restantes: diffDays };
            });

            // Calcular resumen
            const totalCuotas = cuotasConDias.length;
            const cuotasPagadas = cuotasConDias.filter(c => c.estado === 'pagada').length;
            const montoPagado = cuotasConDias.reduce((sum, c) => sum + parseFloat(c.monto_pagado || 0), 0);
            const montoRestante = cuotasConDias.reduce((sum, c) =>
                sum + (parseFloat(c.monto_cuota) - parseFloat(c.monto_pagado || 0)), 0
            );

            return {
                success: true,
                data: {
                    pedido,
                    cliente: {
                        nombre: pedido.nombre,
                        apellido: pedido.apellido,
                        telefono: pedido.telefono,
                        email: pedido.email
                    },
                    cuotas: cuotasConDias,
                    resumen: {
                        total_cuotas: totalCuotas,
                        cuotas_pagadas: cuotasPagadas,
                        monto_total: parseFloat(pedido.total_usd),
                        monto_pagado: montoPagado,
                        monto_restante: montoRestante,
                        progreso: totalCuotas > 0 ? Math.round((cuotasPagadas / totalCuotas) * 100) : 0
                    }
                }
            };
        } catch (error) {
            console.error('Error getting payment plan:', error);
            throw error;
        }
    }

    /**
     * Create installments for an order
     * @param {Object} planData - { pedido_id, cliente_id, total, cuotas, fecha_inicio, frecuencia }
     */
    async createInstallments(planData) {
        try {
            const {
                pedido_id,
                cliente_id,
                total,
                cuotas,
                fecha_inicio,
                frecuencia = 'monthly'
            } = planData;

            const montoPorCuota = (total / cuotas).toFixed(2);
            const installmentsToCreate = [];

            for (let i = 1; i <= cuotas; i++) {
                const fechaVencimiento = this.calculateDueDate(fecha_inicio, i, frecuencia);

                installmentsToCreate.push({
                    pedido_id,
                    cliente_id,
                    numero_cuota: i,
                    total_cuotas: cuotas,
                    monto_cuota: montoPorCuota,
                    fecha_vencimiento: fechaVencimiento,
                    estado: 'pendiente'
                });
            }

            installmentRepository.createMany(installmentsToCreate);

            return {
                success: true,
                message: `${cuotas} cuotas creadas exitosamente`
            };
        } catch (error) {
            console.error('Error creating installments:', error);
            throw error;
        }
    }

    /**
     * Calculate due date based on frequency
     * @param {string} startDate - YYYY-MM-DD
     * @param {number} installmentNumber
     * @param {string} frequency - weekly, biweekly, monthly
     */
    calculateDueDate(startDate, installmentNumber, frequency) {
        const date = new Date(startDate);

        switch (frequency) {
            case 'weekly':
                date.setDate(date.getDate() + (7 * installmentNumber));
                break;
            case 'biweekly':
                date.setDate(date.getDate() + (14 * installmentNumber));
                break;
            case 'monthly':
            default:
                date.setMonth(date.getMonth() + installmentNumber);
                break;
        }

        return date.toISOString().split('T')[0];
    }
}

export default new InstallmentsService();
