/**
 * Seller Model
 * IMPLEMENTACIÓN: Mongoose Schema
 */

import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    specialty: {
        type: String,
        enum: ['general', 'premium', 'vip', 'technical'],
        default: 'general'
    },
    active: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'busy', 'away'],
        default: 'offline'
    },
    currentClients: {
        type: Number,
        default: 0,
        min: 0
    },
    maxClients: {
        type: Number,
        default: 10,
        min: 1
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalSales: {
        type: Number,
        default: 0
    },
    completedOrders: {
        type: Number,
        default: 0
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
sellerSchema.index({ email: 1 });
sellerSchema.index({ active: 1, status: 1 });
sellerSchema.index({ specialty: 1 });
sellerSchema.index({ rating: -1 });

// Virtual: Load percentage
sellerSchema.virtual('loadPercentage').get(function() {
    return (this.currentClients / this.maxClients) * 100;
});

// Virtual: Is available
sellerSchema.virtual('isAvailable').get(function() {
    return this.active && this.status === 'online' && this.currentClients < this.maxClients;
});

// Methods
sellerSchema.methods.assignClient = function() {
    this.currentClients++;
    return this.save();
};

sellerSchema.methods.releaseClient = function() {
    if (this.currentClients > 0) {
        this.currentClients--;
    }
    return this.save();
};

sellerSchema.methods.updateRating = function(newRating) {
    // Promedio ponderado
    const totalRatings = this.completedOrders || 1;
    this.rating = ((this.rating * totalRatings) + newRating) / (totalRatings + 1);
    return this.save();
};

const Seller = mongoose.model('Seller', sellerSchema);

export default Seller;
