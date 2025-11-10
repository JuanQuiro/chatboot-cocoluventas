/**
 * API REST Routes
 * Endpoints para el Dashboard Web
 */

import sellersManager from '../services/sellers.service.js';
import analyticsService from '../services/analytics.service.js';
import { getAllOrders, getOrderStatus } from '../services/orders.service.js';
import { getProducts } from '../services/products.service.js';
import { getPendingTickets } from '../services/support.service.js';
import botsRouter from './bots.routes.js';
import flowsRouter from './flows.routes.js';
import logsRouter from '../../routes/logs.routes.js';

/**
 * Configurar rutas de la API
 * @param {Object} app - Instancia de Express
 */
export const setupRoutes = (app) => {
    
    // ============================================
    // BOTS - Gestión de Chatbots
    // ============================================
    app.use('/api/bots', botsRouter);
    
    // ============================================
    // FLOWS - Gestión de Flujos
    // ============================================
    app.use('/api/flows', flowsRouter);
    
    // ============================================
    // LOGS - Sistema de logs persistente
    // ============================================
    app.use('/api/logs', logsRouter);
    
    // ============================================
    // DASHBOARD - Información general
    // ============================================
    
    app.get('/api/dashboard', (req, res) => {
        try {
            const summary = {
                analytics: analyticsService.getExecutiveSummary(),
                sellers: sellersManager.getStats(),
                workload: sellersManager.getWorkload(),
                timestamp: new Date().toISOString()
            };
            
            res.json({
                success: true,
                data: summary
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // ============================================
    // VENDEDORES
    // ============================================
    
    // Obtener todos los vendedores
    app.get('/api/sellers', (req, res) => {
        try {
            const sellers = sellersManager.getAllSellers();
            res.json({
                success: true,
                data: sellers
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // Obtener vendedor por ID
    app.get('/api/sellers/:id', (req, res) => {
        try {
            const seller = sellersManager.getAllSellers()
                .find(s => s.id === req.params.id);
            
            if (!seller) {
                return res.status(404).json({
                    success: false,
                    error: 'Vendedor no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: seller
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // Agregar vendedor
    app.post('/api/sellers', (req, res) => {
        try {
            const newSeller = sellersManager.addSeller(req.body);
            res.status(201).json({
                success: true,
                data: newSeller
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // Actualizar estado de vendedor
    app.patch('/api/sellers/:id/status', (req, res) => {
        try {
            const { status } = req.body;
            sellersManager.updateSellerStatus(req.params.id, status);
            
            res.json({
                success: true,
                message: 'Estado actualizado'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // Obtener carga de trabajo
    app.get('/api/sellers/workload', (req, res) => {
        try {
            const workload = sellersManager.getWorkload();
            res.json({
                success: true,
                data: workload
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // ============================================
    // ANALYTICS
    // ============================================
    
    // Obtener métricas completas
    app.get('/api/analytics/metrics', (req, res) => {
        try {
            const metrics = analyticsService.getMetrics();
            res.json({
                success: true,
                data: metrics
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // Obtener resumen ejecutivo
    app.get('/api/analytics/summary', (req, res) => {
        try {
            const summary = analyticsService.getExecutiveSummary();
            res.json({
                success: true,
                data: summary
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // Obtener eventos recientes
    app.get('/api/analytics/events', (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const events = analyticsService.getRecentEvents(limit);
            
            res.json({
                success: true,
                data: events
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // ============================================
    // PEDIDOS
    // ============================================
    
    // Obtener todos los pedidos
    app.get('/api/orders', async (req, res) => {
        try {
            const orders = await getAllOrders();
            res.json({
                success: true,
                data: orders
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // Obtener pedido por ID
    app.get('/api/orders/:id', async (req, res) => {
        try {
            const order = await getOrderStatus(req.params.id);
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: 'Pedido no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: order
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // ============================================
    // PRODUCTOS
    // ============================================
    
    // Obtener todos los productos
    app.get('/api/products', async (req, res) => {
        try {
            const searchTerm = req.query.search;
            const products = await getProducts(searchTerm);
            
            res.json({
                success: true,
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // ============================================
    // SOPORTE
    // ============================================
    
    // Obtener tickets pendientes
    app.get('/api/support/pending', async (req, res) => {
        try {
            const tickets = await getPendingTickets();
            res.json({
                success: true,
                data: tickets
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // ============================================
    // HEALTH CHECK
    // ============================================
    
    app.get('/api/health', (req, res) => {
        res.json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: '1.0.0'
        });
    });

    // ============================================
    // WEBSOCKET (información en tiempo real)
    // ============================================
    
    // Endpoint para SSE (Server-Sent Events)
    app.get('/api/stream', (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        // Enviar datos cada 5 segundos
        const interval = setInterval(() => {
            const data = {
                sellers: sellersManager.getStats(),
                analytics: analyticsService.getExecutiveSummary()
            };
            
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        }, 5000);
        
        // Limpiar al cerrar conexión
        req.on('close', () => {
            clearInterval(interval);
        });
    });

    console.log('✅ API Routes configuradas');
};

export default setupRoutes;
