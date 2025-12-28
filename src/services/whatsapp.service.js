/**
 * WhatsApp Service
 * Envío de mensajes WhatsApp a clientes
 */

import logger from '../utils/logger.js';

class WhatsAppService {
    constructor() {
        this.provider = process.env.WHATSAPP_PROVIDER || 'baileys';
    }

    /**
     * Enviar mensaje de texto
     */
    async sendText(phone, message) {
        try {
            // Aquí integras con Baileys, Twilio, etc.
            logger.info(`WhatsApp sent to ${phone}`);

            return { success: true, messageId: Date.now() };
        } catch (error) {
            logger.error('Error sending WhatsApp', error);
            throw error;
        }
    }

    /**
     * Enviar mensaje con botones
     */
    async sendButtons(phone, message, buttons) {
        const buttonText = buttons.map((btn, i) => `${i + 1}. ${btn.text}`).join('\n');
        const fullMessage = `${message}\n\n${buttonText}`;

        return this.sendText(phone, fullMessage);
    }

    /**
     * Enviar imagen
     */
    async sendImage(phone, imageUrl, caption = '') {
        logger.info(`WhatsApp image sent to ${phone}`);
        return { success: true };
    }

    /**
     * Enviar documento (PDF)
     */
    async sendDocument(phone, documentUrl, filename) {
        logger.info(`WhatsApp document sent to ${phone}: ${filename}`);
        return { success: true };
    }

    /**
     * Enviar ubicación
     */
    async sendLocation(phone, latitude, longitude, name) {
        logger.info(`WhatsApp location sent to ${phone}`);
        return { success: true };
    }

    /**
     * Templates predefinidos
     */
    async sendTemplate(phone, template, data) {
        const templates = {
            'order-confirmation': `¡Hola ${data.name}! 🎉\n\nTu orden #${data.orderNumber} ha sido confirmada.\n\nTotal: $${data.total}\n\nTu vendedor ${data.seller} se contactará pronto.`,
            
            'seller-assigned': `Hola ${data.customerName}! 👋\n\nSoy ${data.sellerName}, tu vendedor asignado.\n\n¿En qué puedo ayudarte?`,
            
            'order-ready': `Tu orden #${data.orderNumber} está lista para recoger! 📦\n\nDirección: ${data.address}\n\nHorario: ${data.hours}`,
            
            'payment-reminder': `Hola ${data.name},\n\nRecordatorio: Factura #${data.invoiceNumber}\nMonto: $${data.total}\nVencimiento: ${data.dueDate}`,
        };

        return this.sendText(phone, templates[template] || '');
    }

    /**
     * Notificaciones automáticas
     */
    async notifyOrderConfirmed(customer, order, seller) {
        return this.sendTemplate(customer.phone, 'order-confirmation', {
            name: customer.name,
            orderNumber: order.orderNumber,
            total: order.total,
            seller: seller.name
        });
    }

    async notifySellerAssigned(customer, seller) {
        return this.sendTemplate(customer.phone, 'seller-assigned', {
            customerName: customer.name,
            sellerName: seller.name
        });
    }

    async notifyOrderReady(customer, order, pickupInfo) {
        return this.sendTemplate(customer.phone, 'order-ready', {
            orderNumber: order.orderNumber,
            address: pickupInfo.address,
            hours: pickupInfo.hours
        });
    }
}

export default new WhatsAppService();
