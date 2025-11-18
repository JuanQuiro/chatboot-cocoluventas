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
    },
    // Horarios de trabajo
    workSchedule: {
        monday: { enabled: true, startTime: '09:00', endTime: '18:00' },
        tuesday: { enabled: true, startTime: '09:00', endTime: '18:00' },
        wednesday: { enabled: true, startTime: '09:00', endTime: '18:00' },
        thursday: { enabled: true, startTime: '09:00', endTime: '18:00' },
        friday: { enabled: true, startTime: '09:00', endTime: '18:00' },
        saturday: { enabled: false, startTime: '10:00', endTime: '14:00' },
        sunday: { enabled: false, startTime: '10:00', endTime: '14:00' }
    },
    // Días de descanso específicos
    daysOff: [{
        date: Date,
        reason: String
    }],
    // Disponibilidad por hora
    availabilityByHour: {
        type: Map,
        of: Boolean,
        default: new Map()
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
    return this.active && this.status === 'online' && this.currentClients < this.maxClients && this.isWorkingNow();
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

// Método: Verificar si está trabajando ahora
sellerSchema.methods.isWorkingNow = function() {
    if (!this.active) return false;
    
    const now = new Date();
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    const daySchedule = this.workSchedule[dayOfWeek];
    if (!daySchedule || !daySchedule.enabled) return false;
    
    // Verificar si está en horario
    if (currentTime < daySchedule.startTime || currentTime > daySchedule.endTime) return false;
    
    // Verificar si es día de descanso
    const today = new Date().toISOString().split('T')[0];
    const isOffDay = this.daysOff?.some(day => new Date(day.date).toISOString().split('T')[0] === today);
    
    return !isOffDay;
};

// Método: Obtener próxima disponibilidad
sellerSchema.methods.getNextAvailability = function() {
    const now = new Date();
    let checkDate = new Date(now);
    
    for (let i = 0; i < 7; i++) {
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][checkDate.getDay()];
        const daySchedule = this.workSchedule[dayOfWeek];
        
        if (daySchedule && daySchedule.enabled) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const isOffDay = this.daysOff?.some(day => new Date(day.date).toISOString().split('T')[0] === dateStr);
            
            if (!isOffDay) {
                const [hours, minutes] = daySchedule.startTime.split(':');
                const availabilityTime = new Date(checkDate);
                availabilityTime.setHours(parseInt(hours), parseInt(minutes), 0);
                return availabilityTime;
            }
        }
        
        checkDate.setDate(checkDate.getDate() + 1);
    }
    
    return null;
};

// Método: Cambiar estado activo/inactivo
sellerSchema.methods.toggleActive = function(active, reason = null) {
    this.active = active;
    if (!active && reason) {
        this.daysOff.push({
            date: new Date(),
            reason: reason
        });
    }
    return this.save();
};

// Método: Actualizar horario de trabajo
sellerSchema.methods.updateWorkSchedule = function(dayOfWeek, enabled, startTime, endTime) {
    if (this.workSchedule[dayOfWeek]) {
        this.workSchedule[dayOfWeek] = { enabled, startTime, endTime };
        return this.save();
    }
    throw new Error(`Día inválido: ${dayOfWeek}`);
};

const Seller = mongoose.model('Seller', sellerSchema);

export default Seller;
