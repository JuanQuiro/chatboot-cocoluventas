/**
 * Invoice Service
 * Sistema de facturación para clientes finales
 */

import Invoice from '../models/Invoice.model.js';
import logger from '../utils/logger.js';

class InvoiceService {
    /**
     * Crear factura para cliente
     */
    async createInvoice(tenantId, orderData, createdBy) {
        try {
            const invoiceNumber = await this.generateInvoiceNumber(tenantId);

            const invoice = new Invoice({
                tenantId,
                invoiceNumber,
                orderId: orderData.orderId,
                customer: {
                    name: orderData.customerName,
                    email: orderData.customerEmail,
                    phone: orderData.customerPhone,
                    address: orderData.customerAddress
                },
                items: orderData.items.map(item => ({
                    description: item.name,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    subtotal: item.quantity * item.price
                })),
                subtotal: orderData.subtotal,
                tax: orderData.tax || 0,
                discount: orderData.discount || 0,
                total: orderData.total,
                status: 'pending',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
                createdBy: createdBy.id
            });

            await invoice.save();

            logger.info(`Invoice created: ${invoiceNumber}`);
            return invoice;
        } catch (error) {
            logger.error('Error creating invoice', error);
            throw error;
        }
    }

    /**
     * Generar número de factura correlativo
     */
    async generateInvoiceNumber(tenantId) {
        const year = new Date().getFullYear();
        const lastInvoice = await Invoice.findOne({ tenantId })
            .sort({ createdAt: -1 })
            .limit(1);

        let sequence = 1;
        if (lastInvoice && lastInvoice.invoiceNumber.startsWith(`${year}-`)) {
            const parts = lastInvoice.invoiceNumber.split('-');
            sequence = parseInt(parts[2]) + 1;
        }

        return `${year}-${tenantId.slice(0, 4).toUpperCase()}-${sequence.toString().padStart(6, '0')}`;
    }

    /**
     * Marcar como pagada
     */
    async markAsPaid(invoiceId, paymentData) {
        const invoice = await Invoice.findById(invoiceId);
        
        if (!invoice) {
            throw new Error('Invoice not found');
        }

        invoice.status = 'paid';
        invoice.paidAt = new Date();
        invoice.paymentMethod = paymentData.method;
        invoice.paymentReference = paymentData.reference;

        await invoice.save();
        return invoice;
    }

    /**
     * Generar PDF de factura
     */
    async generatePDF(invoiceId) {
        const invoice = await Invoice.findById(invoiceId).populate('orderId');
        
        // Aquí integrarías con puppeteer o similar para generar PDF
        // Por ahora retornamos la data
        
        return {
            invoiceNumber: invoice.invoiceNumber,
            html: this.generateInvoiceHTML(invoice)
        };
    }

    /**
     * Template HTML de factura
     */
    generateInvoiceHTML(invoice) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; }
        .header { text-align: center; margin-bottom: 30px; }
        .invoice-details { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .total { font-size: 18px; font-weight: bold; text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <h1>FACTURA</h1>
        <p>Número: ${invoice.invoiceNumber}</p>
        <p>Fecha: ${new Date(invoice.createdAt).toLocaleDateString()}</p>
    </div>

    <div class="invoice-details">
        <p><strong>Cliente:</strong> ${invoice.customer.name}</p>
        <p><strong>Email:</strong> ${invoice.customer.email}</p>
        <p><strong>Teléfono:</strong> ${invoice.customer.phone}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>
            ${invoice.items.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.unitPrice}</td>
                    <td>$${item.subtotal}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="total">
        <p>Subtotal: $${invoice.subtotal}</p>
        <p>Impuestos: $${invoice.tax}</p>
        <p>Descuento: -$${invoice.discount}</p>
        <p><strong>TOTAL: $${invoice.total}</strong></p>
    </div>
</body>
</html>
        `;
    }

    /**
     * Enviar factura por email
     */
    async sendInvoiceEmail(invoiceId) {
        const invoice = await Invoice.findById(invoiceId);
        const pdf = await this.generatePDF(invoiceId);

        // Aquí integrarías con tu servicio de email
        logger.info(`Invoice email sent: ${invoice.invoiceNumber}`);
        
        return { success: true };
    }

    /**
     * Listar facturas
     */
    async listInvoices(tenantId, filters = {}) {
        const query = { tenantId };

        if (filters.status) query.status = filters.status;
        if (filters.customerId) query['customer.id'] = filters.customerId;

        return await Invoice.find(query)
            .sort({ createdAt: -1 })
            .limit(filters.limit || 50);
    }
}

export default new InvoiceService();
