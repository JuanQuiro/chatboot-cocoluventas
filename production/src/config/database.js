/**
 * Database Configuration
 * IMPLEMENTACIÓN: MongoDB Connection
 */

import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cocolu-ventas';

class Database {
    constructor() {
        this.connection = null;
        this.isConnected = false;
    }

    /**
     * Conectar a MongoDB
     */
    async connect() {
        try {
            if (this.isConnected) {
                logger.info('Already connected to MongoDB');
                return this.connection;
            }

            const options = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            };

            this.connection = await mongoose.connect(MONGODB_URI, options);
            this.isConnected = true;

            logger.info('MongoDB connected successfully', {
                uri: MONGODB_URI.replace(/\/\/.*@/, '//***:***@') // Ocultar credenciales
            });

            // Event listeners
            mongoose.connection.on('error', (error) => {
                logger.error('MongoDB connection error', error);
            });

            mongoose.connection.on('disconnected', () => {
                logger.warn('MongoDB disconnected');
                this.isConnected = false;
            });

            mongoose.connection.on('reconnected', () => {
                logger.info('MongoDB reconnected');
                this.isConnected = true;
            });

            return this.connection;
        } catch (error) {
            logger.error('Failed to connect to MongoDB', error);
            throw error;
        }
    }

    /**
     * Desconectar
     */
    async disconnect() {
        try {
            if (!this.isConnected) {
                return;
            }

            await mongoose.disconnect();
            this.isConnected = false;
            
            logger.info('MongoDB disconnected successfully');
        } catch (error) {
            logger.error('Error disconnecting from MongoDB', error);
            throw error;
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            if (!this.isConnected) {
                return { status: 'disconnected', message: 'Not connected to database' };
            }

            await mongoose.connection.db.admin().ping();
            
            return {
                status: 'healthy',
                message: 'Database connection is healthy',
                details: {
                    readyState: mongoose.connection.readyState,
                    host: mongoose.connection.host,
                    name: mongoose.connection.name
                }
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                message: 'Database health check failed',
                error: error.message
            };
        }
    }
}

// Singleton
const database = new Database();

export default database;
