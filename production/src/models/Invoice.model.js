/**
 * Invoice Model
 * Facturas para clientes finales
 */

import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unitPrice: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    }
});

const invoiceSchema = new mongoose.Schema({
    tenantId: {
        type: String,
        required: true,
        index: true
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    customer: {
        name: {
            type: String,
            required: true
        },
        email: String,
        phone: String,
        address: String
    },
    items: [invoiceItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled', 'overdue'],
        default: 'pending'
    },
    dueDate: Date,
    paidAt: Date,
    paymentMethod: String,
    paymentReference: String,
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes
invoiceSchema.index({ tenantId: 1, invoiceNumber: 1 });
invoiceSchema.index({ tenantId: 1, status: 1 });
invoiceSchema.index({ 'customer.email': 1 });
invoiceSchema.index({ createdAt: -1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
