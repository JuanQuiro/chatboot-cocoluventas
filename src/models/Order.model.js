/**
 * Order Model
 * IMPLEMENTACIÓN: Mongoose Schema
 */

import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: String,
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        name: {
            type: String,
            required: true
        },
        email: String,
        phone: {
            type: String,
            required: true
        },
        whatsapp: String
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller'
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        default: 0
    },
    shipping: {
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
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'transfer', 'other']
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    notes: String,
    timeline: [{
        status: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String
    }]
}, {
    timestamps: true
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'customer.phone': 1 });
orderSchema.index({ seller: 1 });
orderSchema.index({ createdAt: -1 });

// Pre-save: Generate order number
orderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.orderNumber = `ORD-${timestamp}-${random}`;
    }
    next();
});

// Methods
orderSchema.methods.addTimelineEvent = function(status, note = '') {
    this.timeline.push({ status, note, timestamp: new Date() });
    return this.save();
};

orderSchema.methods.updateStatus = function(newStatus, note = '') {
    this.status = newStatus;
    return this.addTimelineEvent(newStatus, note);
};

orderSchema.methods.calculateTotal = function() {
    this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    this.total = this.subtotal + this.tax + this.shipping - this.discount;
    return this;
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
