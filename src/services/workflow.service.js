/**
 * Workflow Service
 * Automatizaciones y workflows
 */

import logger from '../utils/logger.js';
import emailService from './email.service.js';
import whatsappService from './whatsapp.service.js';

class WorkflowService {
    constructor() {
        this.workflows = new Map();
        this.initializeDefaultWorkflows();
    }

    /**
     * Inicializar workflows por defecto
     */
    initializeDefaultWorkflows() {
        // Workflow 1: Nueva orden
        this.registerWorkflow({
            id: 'new-order',
            name: 'Nueva Orden',
            trigger: 'order.created',
            actions: [
                { type: 'send_email', template: 'order-confirmation' },
                { type: 'send_whatsapp', template: 'order-confirmation' },
                { type: 'notify_seller' },
                { type: 'create_invoice' }
            ]
        });

        // Workflow 2: Vendedor asignado
        this.registerWorkflow({
            id: 'seller-assigned',
            name: 'Vendedor Asignado',
            trigger: 'seller.assigned',
            actions: [
                { type: 'send_email', template: 'seller-assigned' },
                { type: 'send_whatsapp', template: 'seller-assigned' },
                { type: 'log_audit', category: 'assignment' }
            ]
        });

        // Workflow 3: Orden completada
        this.registerWorkflow({
            id: 'order-completed',
            name: 'Orden Completada',
            trigger: 'order.completed',
            actions: [
                { type: 'send_invoice_email' },
                { type: 'update_seller_stats' },
                { type: 'send_feedback_request', delay: 24 * 60 * 60 * 1000 } // 24h después
            ]
        });

        // Workflow 4: Cliente inactivo
        this.registerWorkflow({
            id: 'inactive-customer',
            name: 'Cliente Inactivo',
            trigger: 'schedule.daily',
            conditions: [
                { field: 'lastOrderDate', operator: 'older_than', value: 30 }
            ],
            actions: [
                { type: 'send_email', template: 'we-miss-you' },
                { type: 'send_whatsapp', template: 'special-offer' }
            ]
        });

        // Workflow 5: Pago vencido
        this.registerWorkflow({
            id: 'payment-overdue',
            name: 'Pago Vencido',
            trigger: 'schedule.daily',
            conditions: [
                { field: 'invoice.status', operator: 'equals', value: 'pending' },
                { field: 'invoice.dueDate', operator: 'past' }
            ],
            actions: [
                { type: 'send_email', template: 'payment-reminder' },
                { type: 'send_whatsapp', template: 'payment-reminder' },
                { type: 'notify_supervisor' }
            ]
        });

        logger.info('Default workflows initialized');
    }

    /**
     * Registrar workflow
     */
    registerWorkflow(workflow) {
        this.workflows.set(workflow.id, workflow);
        logger.info(`Workflow registered: ${workflow.name}`);
    }

    /**
     * Ejecutar workflow
     */
    async executeWorkflow(workflowId, context) {
        try {
            const workflow = this.workflows.get(workflowId);
            
            if (!workflow) {
                throw new Error(`Workflow ${workflowId} not found`);
            }

            // Verificar condiciones
            if (workflow.conditions) {
                const conditionsMet = this.checkConditions(workflow.conditions, context);
                if (!conditionsMet) {
                    logger.info(`Workflow ${workflowId} conditions not met`);
                    return { skipped: true };
                }
            }

            logger.info(`Executing workflow: ${workflow.name}`);

            // Ejecutar acciones en secuencia
            const results = [];
            for (const action of workflow.actions) {
                const result = await this.executeAction(action, context);
                results.push(result);

                // Si hay delay, esperar
                if (action.delay) {
                    await this.scheduleDelayedAction(action, context, action.delay);
                }
            }

            return { success: true, results };
        } catch (error) {
            logger.error(`Error executing workflow ${workflowId}`, error);
            throw error;
        }
    }

    /**
     * Ejecutar acción individual
     */
    async executeAction(action, context) {
        switch (action.type) {
            case 'send_email':
                return await emailService.send(
                    context.customer.email,
                    action.template,
                    context
                );

            case 'send_whatsapp':
                return await whatsappService.sendTemplate(
                    context.customer.phone,
                    action.template,
                    context
                );

            case 'send_invoice_email':
                return await emailService.sendInvoice(
                    context.invoice,
                    context.customer
                );

            case 'notify_seller':
                // Notificar al vendedor
                logger.info(`Notifying seller: ${context.seller?.name}`);
                return { success: true };

            case 'notify_supervisor':
                // Notificar al supervisor
                logger.info('Notifying supervisor');
                return { success: true };

            case 'create_invoice':
                // Crear factura
                logger.info('Creating invoice');
                return { success: true };

            case 'update_seller_stats':
                // Actualizar estadísticas del vendedor
                logger.info('Updating seller stats');
                return { success: true };

            case 'log_audit':
                logger.info(`Audit log: ${action.category}`);
                return { success: true };

            case 'send_feedback_request':
                logger.info('Sending feedback request');
                return { success: true };

            default:
                logger.warn(`Unknown action type: ${action.type}`);
                return { success: false, error: 'Unknown action' };
        }
    }

    /**
     * Verificar condiciones
     */
    checkConditions(conditions, context) {
        return conditions.every(condition => {
            const value = this.getNestedValue(context, condition.field);

            switch (condition.operator) {
                case 'equals':
                    return value === condition.value;
                case 'not_equals':
                    return value !== condition.value;
                case 'greater_than':
                    return value > condition.value;
                case 'less_than':
                    return value < condition.value;
                case 'older_than':
                    return new Date() - new Date(value) > condition.value * 24 * 60 * 60 * 1000;
                case 'past':
                    return new Date(value) < new Date();
                default:
                    return true;
            }
        });
    }

    /**
     * Get nested value from object
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, prop) => current?.[prop], obj);
    }

    /**
     * Programar acción con delay
     */
    async scheduleDelayedAction(action, context, delay) {
        setTimeout(async () => {
            await this.executeAction(action, context);
        }, delay);
    }

    /**
     * Trigger workflow por evento
     */
    async triggerByEvent(event, context) {
        const workflows = Array.from(this.workflows.values())
            .filter(w => w.trigger === event);

        const results = [];
        for (const workflow of workflows) {
            const result = await this.executeWorkflow(workflow.id, context);
            results.push(result);
        }

        return results;
    }
}

export default new WorkflowService();
