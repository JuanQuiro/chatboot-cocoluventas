/**
 * Analytics Worker - Background processing
 * Procesa logs y métricas sin bloquear el API
 */

import mongoose from 'mongoose';
import Redis from 'ioredis';

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dashoffice', {
    maxPoolSize: 3,
    minPoolSize: 1,
});

console.log('📊 Analytics Worker started');

// Procesar métricas cada 5 minutos
setInterval(async () => {
    try {
        console.log('🔄 Computing analytics...');
        
        const { default: SystemLog } = await import('../src/models/SystemLog.model.js');
        
        // Últimas 24 horas
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // Aggregate optimizado
        const stats = await SystemLog.aggregate([
            { $match: { createdAt: { $gte: oneDayAgo } } },
            {
                $group: {
                    _id: '$log_type',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const metrics = {
            totalMessages: stats.reduce((sum, s) => sum + s.count, 0),
            errors: stats.find(s => s._id === 'ERROR')?.count || 0,
            warnings: stats.find(s => s._id === 'WARNING')?.count || 0,
            timestamp: Date.now()
        };
        
        // Guardar en Redis con TTL de 5 minutos
        await redis.setex('analytics:metrics', 300, JSON.stringify(metrics));
        
        console.log(`✅ Analytics cached: ${metrics.totalMessages} messages`);
        
    } catch (error) {
        console.error('❌ Analytics error:', error.message);
    }
}, 300000); // Cada 5 minutos

// Limpiar logs antiguos cada hora
setInterval(async () => {
    try {
        console.log('🧹 Cleaning old logs...');
        
        const { default: SystemLog } = await import('../src/models/SystemLog.model.js');
        
        // Eliminar logs de más de 30 días
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const result = await SystemLog.deleteMany({
            createdAt: { $lt: thirtyDaysAgo },
            log_type: { $in: ['INFO', 'DEBUG'] } // Solo info/debug, mantener errors
        });
        
        console.log(`✅ Deleted ${result.deletedCount} old logs`);
        
    } catch (error) {
        console.error('❌ Cleanup error:', error.message);
    }
}, 3600000); // Cada hora

// Health check
setInterval(() => {
    const memory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    console.log(`💚 Worker alive - Memory: ${memory}MB`);
}, 60000); // Cada minuto

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing worker...');
    await mongoose.connection.close();
    await redis.quit();
    process.exit(0);
});
