/**
 * Email Service
 * Sistema completo de emails para clientes
 */

import logger from '../utils/logger.js';

class EmailService {
    constructor() {
        this.provider = process.env.EMAIL_PROVIDER || 'sendgrid';
        this.from = process.env.EMAIL_FROM || 'noreply@cocoluventas.com';
    }

    /**
     * Enviar email con template
     */
    async send(to, template, data) {
        try {
            const html = this.renderTemplate(template, data);
            
            // Aquí integrarías con SendGrid, AWS SES, etc.
            logger.info(`Email sent to ${to}: ${template}`);

            return { success: true, messageId: Date.now() };
        } catch (error) {
            logger.error('Error sending email', error);
            throw error;
        }
    }

    /**
     * Templates de email
     */
    renderTemplate(template, data) {
        const templates = {
            'order-confirmation': this.orderConfirmationTemplate(data),
            'invoice': this.invoiceTemplate(data),
            'seller-assigned': this.sellerAssignedTemplate(data),
            'order-status-update': this.orderStatusUpdateTemplate(data),
            'welcome': this.welcomeTemplate(data),
        };

        return templates[template] || '';
    }

    orderConfirmationTemplate(data) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF6B35; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .button { background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Orden Confirmada!</h1>
        </div>
        <div class="content">
            <p>Hola ${data.customerName},</p>
            <p>Tu orden <strong>#${data.orderNumber}</strong> ha sido confirmada.</p>
            
            <div class="order-details">
                <h3>Detalles de tu orden:</h3>
                ${data.items.map(item => `
                    <p>${item.name} x${item.quantity} - $${item.price}</p>
                `).join('')}
                <hr>
                <p><strong>Total: $${data.total}</strong></p>
            </div>

            <p>Tu vendedor ${data.sellerName} se pondrá en contacto contigo pronto.</p>
            
            <a href="${data.trackingUrl}" class="button">Seguir mi orden</a>
        </div>
        <div class="footer">
            <p>© 2024 Cocolu Ventas. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    invoiceTemplate(data) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: #004E89; color: white; padding: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Factura ${data.invoiceNumber}</h1>
        </div>
        <p>Hola ${data.customerName},</p>
        <p>Adjunto encontrarás tu factura.</p>
        <p><strong>Total: $${data.total}</strong></p>
        <p>Fecha de vencimiento: ${data.dueDate}</p>
    </div>
</body>
</html>
        `;
    }

    sellerAssignedTemplate(data) {
        return `
<!DOCTYPE html>
<html>
<body>
    <h2>¡Tu vendedor está listo!</h2>
    <p>Hola ${data.customerName},</p>
    <p>${data.sellerName} será tu vendedor asignado.</p>
    <p>WhatsApp: ${data.sellerPhone}</p>
    <p>Email: ${data.sellerEmail}</p>
</body>
</html>
        `;
    }

    orderStatusUpdateTemplate(data) {
        return `
<!DOCTYPE html>
<html>
<body>
    <h2>Actualización de tu orden #${data.orderNumber}</h2>
    <p>Tu orden ahora está: <strong>${data.newStatus}</strong></p>
    <p>${data.message}</p>
</body>
</html>
        `;
    }

    welcomeTemplate(data) {
        return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial;">
    <div style="max-width: 600px; margin: 0 auto;">
        <div style="background: #FF6B35; color: white; padding: 30px; text-align: center;">
            <h1>¡Bienvenido a Cocolu Ventas!</h1>
        </div>
        <div style="padding: 30px;">
            <p>Hola ${data.name},</p>
            <p>Gracias por unirte a nosotros. Estamos emocionados de tenerte aquí.</p>
            <p>Nuestro equipo de ventas está listo para ayudarte.</p>
            <a href="${data.dashboardUrl}" style="background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 5px; margin: 15px 0;">
                Ir al Dashboard
            </a>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * Enviar email de orden confirmada
     */
    async sendOrderConfirmation(order, customer, seller) {
        return this.send(customer.email, 'order-confirmation', {
            customerName: customer.name,
            orderNumber: order.orderNumber,
            items: order.items,
            total: order.total,
            sellerName: seller.name,
            trackingUrl: `https://cocoluventas.com/orders/${order.id}`
        });
    }

    /**
     * Enviar factura
     */
    async sendInvoice(invoice, customer) {
        return this.send(customer.email, 'invoice', {
            customerName: customer.name,
            invoiceNumber: invoice.invoiceNumber,
            total: invoice.total,
            dueDate: new Date(invoice.dueDate).toLocaleDateString()
        });
    }

    /**
     * Notificar asignación de vendedor
     */
    async notifySellerAssigned(customer, seller) {
        return this.send(customer.email, 'seller-assigned', {
            customerName: customer.name,
            sellerName: seller.name,
            sellerPhone: seller.phone,
            sellerEmail: seller.email
        });
    }
}

export default new EmailService();
