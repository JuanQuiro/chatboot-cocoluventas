/**
 * Product Model
 * IMPLEMENTACIÓN: Mongoose Schema
 */

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    category: {
        type: String,
        required: true,
        enum: ['electronics', 'clothing', 'food', 'home', 'other']
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    cost: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    minStock: {
        type: Number,
        default: 10,
        min: 0
    },
    images: [{
        url: String,
        alt: String
    }],
    active: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    tags: [String],
    metadata: {
        weight: Number,
        dimensions: {
            length: Number,
            width: Number,
            height: Number
        },
        manufacturer: String,
        warranty: String
    }
}, {
    timestamps: true
});

// Indexes
productSchema.index({ sku: 1 });
productSchema.index({ category: 1, active: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1 });

// Virtual: Profit margin
productSchema.virtual('profitMargin').get(function() {
    return ((this.price - this.cost) / this.cost) * 100;
});

// Virtual: Is low stock
productSchema.virtual('isLowStock').get(function() {
    return this.stock <= this.minStock;
});

// Virtual: Is out of stock
productSchema.virtual('isOutOfStock').get(function() {
    return this.stock === 0;
});

// Methods
productSchema.methods.addStock = function(quantity) {
    this.stock += quantity;
    return this.save();
};

productSchema.methods.removeStock = function(quantity) {
    if (this.stock >= quantity) {
        this.stock -= quantity;
        return this.save();
    }
    throw new Error('Insufficient stock');
};

const Product = mongoose.model('Product', productSchema);

export default Product;
