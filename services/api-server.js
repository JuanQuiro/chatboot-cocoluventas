/**
 * API Server - Optimizado y ligero
 * Solo API REST, sin bot
 */

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Redis from 'ioredis';

const app = express();
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: 3,
    lazyConnect: true
});

// Middlewares mínimos
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '1mb' })); // Límite estricto

// MongoDB connection pool pequeño
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dashoffice', {
    maxPoolSize: 5, // Reducido de 10
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
});

// Caché middleware
const cacheMiddleware = (duration) => async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
        const cached = await redis.get(key);
        if (cached) {
            return res.json(JSON.parse(cached));
        }
        
        // Override res.json para guardar en caché
        const originalJson = res.json.bind(res);
        res.json = (data) => {
            redis.setex(key, duration, JSON.stringify(data)).catch(() => {});
            return originalJson(data);
        };
        
        next();
    } catch (error) {
        next(); // Si Redis falla, continuar sin caché
    }
};

// Health check ligero
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: Date.now(),
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
    });
});

// Routes con caché
import analyticsRoutes from '../routes/analytics.routes.js';
import botsRoutes from '../routes/bots.routes.js';
import ordersRoutes from '../routes/orders.routes.js';
import productsRoutes from '../routes/products.routes.js';
import sellersRoutes from '../routes/sellers.routes.js';
import usersRoutes from '../routes/users.routes.js';

// Analytics con caché de 5 minutos
app.use('/api/analytics', cacheMiddleware(300), analyticsRoutes);

// Bots con caché de 30 segundos
app.use('/api/bots', cacheMiddleware(30), botsRoutes);

// Sin caché para operaciones que modifican
app.use('/api/orders', ordersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/sellers', sellersRoutes);
app.use('/api/users', usersRoutes);

// Logs sin caché (tiempo real)
import logsRoutes from '../routes/logs.routes.js';
app.use('/api/logs', logsRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({ 
        success: false, 
        error: err.message || 'Internal server error' 
    });
});

const PORT = process.env.API_PORT || 3009;

app.listen(PORT, () => {
    console.log(`✅ API Server running on port ${PORT}`);
    console.log(`📊 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing...');
    await mongoose.connection.close();
    await redis.quit();
    process.exit(0);
});
