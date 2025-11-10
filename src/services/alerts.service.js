/**
 * Servicio de Alertas a Vendedores
 * Envía notificaciones cuando un cliente requiere atención
 */

class AlertsService {
    constructor() {
        // Cola de alertas pendientes
        this.pendingAlerts = [];
        
        // Historial de alertas enviadas
        this.alertHistory = [];
        
        // Provider de WhatsApp (se inyectará)
        this.provider = null;
    }

    /**
     * Configurar provider de WhatsApp
     * @param {Object} provider - Provider de Baileys
     */
    setProvider(provider) {
        this.provider = provider;
        console.log('✅ Provider configurado en AlertsService');
    }

    /**
     * Enviar alerta a vendedor
     * @param {Object} params - Parámetros de la alerta
     * @returns {Promise<boolean>}
     */
    async sendAlert({ sellerPhone, clientPhone, clientName, reason, context = {} }) {
        const alertId = `alert_${Date.now()}`;
        
        const alert = {
            alertId,
            sellerPhone,
            clientPhone,
            clientName: clientName || 'Cliente',
            reason,
            context,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };

        try {
            // Formatear número de vendedor (remover + y agregar @s.whatsapp.net)
            const sellerNumber = sellerPhone.replace('+', '') + '@s.whatsapp.net';
            const clientNumber = clientPhone.replace('+', '').replace('@s.whatsapp.net', '');

            // Construir mensaje de alerta
            const alertMessage = this._buildAlertMessage(alert);

            // Enviar alerta si hay provider configurado
            if (this.provider && this.provider.sendMessage) {
                await this.provider.sendMessage(sellerNumber, { text: alertMessage }, {});
                alert.status = 'sent';
                alert.sentAt = new Date().toISOString();
                console.log(`✅ Alerta enviada a vendedor ${sellerPhone} sobre cliente ${clientName}`);
            } else {
                // Si no hay provider, simular envío (modo desarrollo)
                console.log(`📬 [SIMULADO] Alerta para ${sellerPhone}:`);
                console.log(alertMessage);
                alert.status = 'simulated';
            }

            // Agregar a historial
            this.alertHistory.push(alert);
            
            return true;
        } catch (error) {
            console.error(`❌ Error enviando alerta ${alertId}:`, error);
            alert.status = 'failed';
            alert.error = error.message;
            this.alertHistory.push(alert);
            return false;
        }
    }

    /**
     * Construir mensaje de alerta para vendedor
     * @param {Object} alert - Datos de la alerta
     * @returns {string}
     */
    _buildAlertMessage(alert) {
        const { reason, clientName, clientPhone, context } = alert;
        
        let message = `🚨 *ALERTA DE ATENCIÓN AL CLIENTE*\n\n`;
        message += `👤 *Cliente:* ${clientName}\n`;
        message += `📱 *Teléfono:* ${clientPhone.replace('@s.whatsapp.net', '')}\n`;
        message += `⚠️ *Razón:* ${reason}\n\n`;

        // Agregar contexto adicional según el motivo
        switch (reason) {
            case 'no_atendido':
                message += `El cliente indicó que NO fue atendido.\n`;
                message += `Por favor, contacta de inmediato.\n`;
                break;
            case 'catalogo_interesado':
                message += `El cliente mostró interés en el catálogo.\n`;
                message += `Está listo para ser contactado.\n`;
                break;
            case 'catalogo_no_interesado':
                message += `El cliente revisó el catálogo pero no encontró algo de su interés.\n`;
                message += `Puede necesitar asesoría personalizada.\n`;
                break;
            case 'info_pedido':
                message += `El cliente necesita información sobre su pedido.\n`;
                break;
            case 'problema_pedido':
                message += `⚠️ El cliente reporta un PROBLEMA con su pedido.\n`;
                message += `*ATENCIÓN PRIORITARIA REQUERIDA*\n`;
                break;
            case 'keyword_producto':
                message += `El cliente preguntó por: *${context.keyword || 'producto'}*\n`;
                message += `Tiene dudas adicionales.\n`;
                break;
            default:
                message += `El cliente requiere atención.\n`;
        }

        message += `\n💬 *Acción:* Contacta al cliente lo antes posible.\n`;
        message += `\n_Alerta generada automáticamente por Cocolu Bot_ 🤖`;

        return message;
    }

    /**
     * Obtener historial de alertas
     * @param {Object} filters - Filtros opcionales
     */
    getAlertHistory(filters = {}) {
        let history = this.alertHistory;

        if (filters.sellerPhone) {
            history = history.filter(a => a.sellerPhone === filters.sellerPhone);
        }

        if (filters.status) {
            history = history.filter(a => a.status === filters.status);
        }

        if (filters.reason) {
            history = history.filter(a => a.reason === filters.reason);
        }

        return history.slice(-50); // Últimas 50 alertas
    }

    /**
     * Obtener estadísticas de alertas
     */
    getStats() {
        return {
            totalAlerts: this.alertHistory.length,
            sentAlerts: this.alertHistory.filter(a => a.status === 'sent').length,
            failedAlerts: this.alertHistory.filter(a => a.status === 'failed').length,
            pendingAlerts: this.pendingAlerts.length,
            alertsByReason: this._groupBy(this.alertHistory, 'reason')
        };
    }

    /**
     * Agrupar por campo
     */
    _groupBy(array, field) {
        return array.reduce((acc, item) => {
            const key = item[field] || 'unknown';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    }

    /**
     * Limpiar historial antiguo (más de 7 días)
     */
    cleanOldHistory() {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const before = this.alertHistory.length;
        this.alertHistory = this.alertHistory.filter(
            a => a.createdAt > sevenDaysAgo
        );
        const cleaned = before - this.alertHistory.length;
        if (cleaned > 0) {
            console.log(`🧹 ${cleaned} alertas antiguas limpiadas`);
        }
    }
}

// Singleton
const alertsService = new AlertsService();

export default alertsService;
