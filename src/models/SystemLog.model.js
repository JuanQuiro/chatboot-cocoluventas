/**
 * System Log Model - MongoDB Schema
 * Modelo para logs del sistema con índices optimizados
 */

import mongoose from 'mongoose';

const systemLogSchema = new mongoose.Schema({
    // Información del log
    log_type: {
        type: String,
        required: true,
        enum: ['ERROR', 'WARNING', 'INFO', 'DEBUG', 'PERFORMANCE', 'CRITICAL'],
        index: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    message: {
        type: String,
        required: true
    },
    
    // Contexto
    user_id: {
        type: String,
        index: true,
        sparse: true
    },
    tenant_id: {
        type: String,
        index: true,
        sparse: true
    },
    session_id: String,
    
    // Detalles técnicos
    data: mongoose.Schema.Types.Mixed, // Flexible JSON data
    stack_trace: String,
    error_code: String,
    
    // Metadata de origen
    url: String,
    user_agent: String,
    ip_address: String,
    
    // Performance
    duration_ms: Number,
    
    // Flags
    is_resolved: {
        type: Boolean,
        default: false,
        index: true
    },
    severity: {
        type: Number,
        default: 1, // 1=INFO, 2=WARNING, 3=ERROR, 4=CRITICAL
        index: true
    }
}, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    collection: 'system_logs'
});

// Índices compuestos para queries comunes
systemLogSchema.index({ tenant_id: 1, log_type: 1, createdAt: -1 });
systemLogSchema.index({ severity: -1, createdAt: -1 });
systemLogSchema.index({ is_resolved: 1, createdAt: -1 }, { 
    partialFilterExpression: { is_resolved: false } 
});

// Índice de texto para búsqueda full-text
systemLogSchema.index({ message: 'text', category: 'text' });

// Índice TTL para auto-limpieza (opcional - 90 días)
// systemLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Métodos estáticos útiles
systemLogSchema.statics.findRecent = function(filters = {}, limit = 100) {
    const query = {};
    
    if (filters.log_type) query.log_type = filters.log_type;
    if (filters.category) query.category = filters.category;
    if (filters.severity) query.severity = { $gte: filters.severity };
    if (filters.tenant_id) query.tenant_id = filters.tenant_id;
    if (filters.user_id) query.user_id = filters.user_id;
    if (filters.from_date) query.createdAt = { $gte: new Date(filters.from_date) };
    if (filters.to_date) query.createdAt = { ...query.createdAt, $lte: new Date(filters.to_date) };
    
    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
};

systemLogSchema.statics.findUnresolvedErrors = function(limit = 50) {
    return this.find({
        log_type: { $in: ['ERROR', 'CRITICAL'] },
        is_resolved: false
    })
        .sort({ severity: -1, createdAt: -1 })
        .limit(limit)
        .lean();
};

systemLogSchema.statics.getStats = async function(filters = {}) {
    const match = {};
    
    if (filters.tenant_id) match.tenant_id = filters.tenant_id;
    if (filters.hours) {
        const hoursAgo = new Date();
        hoursAgo.setHours(hoursAgo.getHours() - filters.hours);
        match.createdAt = { $gte: hoursAgo };
    }
    
    return this.aggregate([
        { $match: match },
        {
            $group: {
                _id: { log_type: '$log_type', category: '$category' },
                count: { $sum: 1 },
                last_occurrence: { $max: '$createdAt' }
            }
        },
        { $sort: { count: -1 } },
        {
            $project: {
                _id: 0,
                log_type: '$_id.log_type',
                category: '$_id.category',
                count: 1,
                last_occurrence: 1
            }
        }
    ]);
};

systemLogSchema.statics.cleanup = async function() {
    const results = {
        info_deleted: 0,
        warning_deleted: 0,
        error_deleted: 0
    };
    
    // Eliminar INFO/DEBUG mayores a 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const infoResult = await this.deleteMany({
        log_type: { $in: ['INFO', 'DEBUG'] },
        createdAt: { $lt: thirtyDaysAgo }
    });
    results.info_deleted = infoResult.deletedCount;
    
    // Eliminar WARNING mayores a 90 días
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const warningResult = await this.deleteMany({
        log_type: 'WARNING',
        createdAt: { $lt: ninetyDaysAgo }
    });
    results.warning_deleted = warningResult.deletedCount;
    
    // Eliminar ERROR/CRITICAL mayores a 1 año
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const errorResult = await this.deleteMany({
        log_type: { $in: ['ERROR', 'CRITICAL'] },
        createdAt: { $lt: oneYearAgo }
    });
    results.error_deleted = errorResult.deletedCount;
    
    return results;
};

// Método de instancia para marcar como resuelto
systemLogSchema.methods.resolve = async function() {
    this.is_resolved = true;
    return this.save();
};

const SystemLog = mongoose.model('SystemLog', systemLogSchema);

export default SystemLog;
