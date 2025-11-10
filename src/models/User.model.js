/**
 * User Model - Multi-tenant aware
 */

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    // Tenant al que pertenece
    tenantId: {
        type: String,
        required: true,
        index: true
    },

    // Información básica
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    avatar: {
        type: String,
        default: null
    },

    // Roles y permisos
    role: {
        type: String,
        required: true,
        default: 'agent'
    },
    customPermissions: {
        type: [String],
        default: []
    },

    // Estado
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'pending'],
        default: 'pending'
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Reset password
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Invitación
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    invitationToken: String,
    invitationExpires: Date,
    invitationAccepted: {
        type: Boolean,
        default: false
    },

    // Sesión
    lastLogin: Date,
    lastActivity: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockedUntil: Date,

    // Preferencias
    preferences: {
        language: {
            type: String,
            default: 'es'
        },
        timezone: {
            type: String,
            default: 'America/Mexico_City'
        },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            sms: { type: Boolean, default: false }
        },
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'light'
        }
    },

    // Metadata
    metadata: {
        department: String,
        position: String,
        phone: String,
        location: String
    }
}, {
    timestamps: true
});

// Indexes
userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, role: 1 });
userSchema.index({ tenantId: 1, status: 1 });
userSchema.index({ invitationToken: 1 });
userSchema.index({ resetPasswordToken: 1 });

// Virtual: Is locked
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockedUntil && this.lockedUntil > Date.now());
});

// Virtual: Full name
userSchema.virtual('fullName').get(function() {
    return this.name;
});

// Methods
userSchema.methods.incrementLoginAttempts = function() {
    // Reset attempts if lock has expired
    if (this.lockedUntil && this.lockedUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockedUntil: 1 }
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockedUntil: Date.now() + 2 * 60 * 60 * 1000 };
    }

    return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockedUntil: 1 }
    });
};

userSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save();
};

userSchema.methods.updateLastActivity = function() {
    this.lastActivity = new Date();
    return this.save();
};

// Don't return sensitive data
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.passwordHash;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    delete obj.emailVerificationToken;
    delete obj.emailVerificationExpires;
    delete obj.invitationToken;
    return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
