/**
 * API REST Routes
 * Endpoints para el Dashboard Web
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import sellersManager from '../services/sellers.service.js';
import analyticsService from '../services/analytics.service.js';
import botManager from '../services/bot-manager.service.js';
import { getAllOrders, getOrderStatus } from '../services/orders.service.js';
import { getProducts } from '../services/products.service.js';
import { getPendingTickets } from '../services/support.service.js';
import botsRouter from './bots.routes.js';
import flowsRouter from './flows.routes.js';
// import logsRouter from '../routes/logs.routes.js';

/**
 * Configurar rutas de la API
 * @param {Object} app - Instancia de Express
 */
const envPath = path.resolve(process.cwd(), '.env');
const allowedMetaKeys = [
    'META_JWT_TOKEN',
    'META_NUMBER_ID',
    'META_BUSINESS_ACCOUNT_ID',
    'META_VERIFY_TOKEN',
    'META_API_VERSION',
    'PHONE_NUMBER'
];

const readEnvConfig = () => {
    if (!fs.existsSync(envPath)) {
        throw new Error('.env file not found');
    }
    const raw = fs.readFileSync(envPath, 'utf8');
    return dotenv.parse(raw);
};

const updateEnvVariables = (updates = {}) => {
    if (!fs.existsSync(envPath)) {
        throw new Error('.env file not found');
    }
    let content = fs.readFileSync(envPath, 'utf8');
    Object.entries(updates).forEach(([key, value]) => {
        const sanitizedValue = String(value ?? '').replace(/\r?\n/g, '');
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(content)) {
            content = content.replace(regex, `${key}=${sanitizedValue}`);
        } else {
            content = content.trimEnd() + `\n${key}=${sanitizedValue}\n`;
        }
    });
    fs.writeFileSync(envPath, content, 'utf8');
};

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
    // app.use('/api/logs', logsRouter);

    // ============================================
    // COMANDOS - Listado de comandos del bot
    // ============================================
    app.get('/api/comandos', (req, res) => {
        const comandos = {
            control: {
                pause: {
                    command: 'BOT PAUSA YA',
                    alternative: 'PAUSAR BOT COCOLU AHORA',
                    description: 'Pausa el bot en este chat',
                    caseSensitive: true,
                    exactMatch: true
                },
                resume: {
                    command: 'BOT ACTIVA YA',
                    alternative: 'ACTIVAR BOT COCOLU AHORA',
                    description: 'Reactiva el bot en este chat',
                    caseSensitive: true,
                    exactMatch: true
                }
            },
            navigation: {
                menu: {
                    commands: ['hola', 'hi', 'hello', 'inicio', 'empezar', 'comenzar', 'menu', 'menú', 'start'],
                    description: 'Muestra el menú principal con 5 opciones'
                },
                help: {
                    commands: ['comandos', 'ayuda', 'help', 'comando'],
                    description: 'Muestra la lista de comandos disponibles'
                }
            },
            menuOptions: {
                asesor: {
                    number: '1',
                    keywords: ['asesor', 'hablar', 'atención'],
                    description: 'Conecta con un asesor personal'
                },
                catalogo: {
                    number: '2',
                    keywords: ['catalogo', 'catálogo', 'productos'],
                    description: 'Ver catálogo completo de productos'
                },
                pedido: {
                    number: '3',
                    keywords: ['pedido', 'información pedido', 'info pedido'],
                    description: 'Información sobre tu pedido'
                },
                horarios: {
                    number: '4',
                    keywords: ['horario', 'horarios', 'hora'],
                    description: 'Horarios de atención'
                },
                problema: {
                    number: '5',
                    keywords: ['problema', 'queja', 'reclamo'],
                    description: 'Reportar un problema (atención prioritaria)'
                }
            },
            productKeywords: {
                relicario: {
                    keywords: ['RELICARIO', 'relicario'],
                    description: 'Información sobre relicarios'
                },
                dije: {
                    keywords: ['DIJE', 'dije'],
                    description: 'Información sobre dijes'
                },
                cadena: {
                    keywords: ['CADENA', 'cadena'],
                    description: 'Información sobre cadenas'
                },
                pulsera: {
                    keywords: ['PULSERA', 'pulsera'],
                    description: 'Información sobre pulseras'
                },
                anillo: {
                    keywords: ['ANILLO', 'anillo'],
                    description: 'Información sobre anillos'
                }
            },
            tips: [
                'Los comandos de control (BOT PAUSA YA) DEBEN escribirse en MAYÚSCULAS exactas',
                'Puedes escribir "menu" en cualquier momento para volver al inicio',
                'Los números (1-5) son atajos rápidos para las opciones del menú',
                'Las keywords de productos funcionan en mayúsculas o minúsculas'
            ]
        };

        res.json({
            success: true,
            comandos,
            timestamp: new Date().toISOString()
        });
    });

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

    // Eliminar vendedor
    app.delete('/api/sellers/:id', (req, res) => {
        try {
            const result = sellersManager.deleteSeller(req.params.id);
            res.json({
                success: true,
                message: `Vendedor ${result.deletedSeller.name} eliminado correctamente`
            });
        } catch (error) {
            res.status(400).json({
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
        try {
            const bots = botManager.getGlobalStats();
            const sellersStats = sellersManager.getStats();
            const analyticsSummary = analyticsService.getExecutiveSummary();

            console.log('📊 [HEALTH CHECK] Vendedores en memoria:', JSON.stringify(sellersStats.sellersStats, null, 2));

            res.json({
                success: true,
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                version: '1.0.0',
                bots,
                sellers: sellersStats,
                analytics: analyticsSummary,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                status: 'error',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                version: '1.0.0',
                error: error.message,
            });
        }
    });

    // ============================================
    // CAMBIAR ESTADO DE VENDEDOR
    // ============================================

    app.post('/api/seller/:id/status', (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Obtener el vendedor
            const seller = sellersManager.getAllSellers().find(s => s.id === id);

            if (!seller) {
                return res.status(404).json({
                    success: false,
                    error: 'Vendedor no encontrado'
                });
            }

            // Cambiar el estado
            if (status === 'active') {
                seller.active = true;
                seller.status = 'available';
            } else if (status === 'inactive') {
                seller.active = false;
                seller.status = 'offline';
            }

            res.json({
                success: true,
                message: `Vendedor ${id} actualizado a ${status}`,
                seller: {
                    id: seller.id,
                    name: seller.name,
                    active: seller.active,
                    status: seller.status
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // ============================================
    // GUARDAR EDICIÓN DE VENDEDOR
    // ============================================

    app.post('/api/seller/:id/update', (req, res) => {
        console.log('\n========== SELLER UPDATE REQUEST ==========');
        console.log('📍 Endpoint: POST /api/seller/:id/update');
        console.log('⏰ Timestamp:', new Date().toISOString());

        try {
            const { id } = req.params;
            const updates = req.body;

            console.log('📦 ID Recibido:', id);
            console.log('📦 Datos Recibidos:', JSON.stringify(updates, null, 2));

            // Llamar al servicio para hacer UPDATE en SQLite
            const updated = sellersManager.updateSeller(id, updates);

            console.log('✅ Vendedor actualizado exitosamente en BD');
            console.log('📝 Datos actualizados:', JSON.stringify(updated, null, 2));
            console.log('==========================================\n');

            res.json({
                success: true,
                message: `Vendedor ${updated.name} actualizado correctamente`,
                seller: updated
            });
        } catch (error) {
            console.error('❌ ERROR en actualización:', error);
            console.error('Stack:', error.stack);
            console.log('==========================================\n');
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    // ============================================
    // ENDPOINTS ABIERTOS PARA DASHBOARD SIMPLE
    // ============================================

    // Obtener mensajes recibidos/enviados y errores (para módulo Mensajes/Logs)
    app.get('/api/open/messages', async (req, res) => {
        try {
            const mod = await import('../../app-integrated.js');
            const log = mod.messageLog;
            const data = log && typeof log.getAll === 'function'
                ? log.getAll()
                : { received: [], sent: [], errors: [] };

            res.json({
                success: true,
                data,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });

    // Obtener último código de emparejamiento (pairing code) para la página de conexión
    app.get('/api/open/pairing-code', async (req, res) => {
        try {
            const mod = await import('../../app-integrated.js');
            const code = mod.pairingCode || null;

            res.json({
                success: true,
                code,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });

    // ============================================
    // SERVER-SENT EVENTS (SSE) - Tiempo real
    // ============================================

    app.get('/api/events', (req, res) => {
        // Configurar SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Enviar heartbeat cada 30 segundos
        const heartbeat = setInterval(() => {
            res.write(': heartbeat\n\n');
        }, 30000);

        // Función para enviar eventos
        const sendEvent = (event, data) => {
            res.write(`event: ${event}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        // Enviar datos iniciales
        (async () => {
            try {
                // Mensajes
                const mod = await import('../../app-integrated.js');
                const log = mod.messageLog;
                const messages = log && typeof log.getAll === 'function'
                    ? log.getAll()
                    : { received: [], sent: [], errors: [] };

                sendEvent('messages', messages);

                // Logs recientes
                const logsService = (await import('../../services/logs.service.js')).default;
                const recentLogs = await logsService.getRecentLogs({ limit: 50 });
                sendEvent('logs', recentLogs);

                // Métricas
                const metrics = analyticsService.getMetrics();
                sendEvent('metrics', metrics);
            } catch (error) {
                console.error('Error en SSE inicial:', error);
            }
        })();

        // Polling para actualizar datos cada 2 segundos
        const pollInterval = setInterval(async () => {
            try {
                // Mensajes
                const mod = await import('../../app-integrated.js');
                const log = mod.messageLog;
                const messages = log && typeof log.getAll === 'function'
                    ? log.getAll()
                    : { received: [], sent: [], errors: [] };

                sendEvent('messages', messages);

                // Logs recientes (solo los últimos 20)
                const logsService = (await import('../../services/logs.service.js')).default;
                const recentLogs = await logsService.getRecentLogs({ limit: 20 });
                sendEvent('logs', recentLogs);

                // Métricas
                const metrics = analyticsService.getMetrics();
                sendEvent('metrics', metrics);
            } catch (error) {
                console.error('Error en SSE polling:', error);
            }
        }, 2000);

        // Limpiar al cerrar conexión
        req.on('close', () => {
            clearInterval(heartbeat);
            clearInterval(pollInterval);
            res.end();
        });
    });

    // ============================================
    // META BILLING - Facturación de Meta
    // ============================================
    app.get('/api/meta/billing/summary', async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            const metaBillingService = (await import('../services/meta-billing.service.js')).default;
            const summary = metaBillingService.getBillingSummary(start, end);

            res.json({
                success: true,
                data: summary,
            });
        } catch (error) {
            console.error('Error obteniendo resumen de facturación:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });

    app.get('/api/meta/billing/history', async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;

            const metaBillingService = (await import('../services/meta-billing.service.js')).default;
            const history = metaBillingService.getMessageHistory(limit, offset);

            res.json({
                success: true,
                data: history,
            });
        } catch (error) {
            console.error('Error obteniendo historial de facturación:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });

    app.get('/api/meta/billing/monthly', async (req, res) => {
        try {
            const months = parseInt(req.query.months) || 6;

            const metaBillingService = (await import('../services/meta-billing.service.js')).default;
            const stats = metaBillingService.getMonthlyStats(months);

            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            console.error('Error obteniendo estadísticas mensuales:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });

    app.get('/api/meta/billing/pricing', async (req, res) => {
        try {
            const metaBillingService = (await import('../services/meta-billing.service.js')).default;
            const pricing = metaBillingService.getPricing();

            res.json({
                success: true,
                data: pricing,
            });
        } catch (error) {
            console.error('Error obteniendo precios:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });

    // ============================================
    // META - CONFIGURACIÓN Y DIAGNÓSTICO
    // ============================================

    app.get('/api/meta/config', (req, res) => {
        try {
            const envConfig = readEnvConfig();
            const data = {};
            allowedMetaKeys.forEach((key) => {
                if (envConfig[key]) {
                    data[key] = envConfig[key];
                }
            });
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.post('/api/meta/config', (req, res) => {
        try {
            const payload = req.body || {};
            const updates = {};
            allowedMetaKeys.forEach((key) => {
                if (Object.prototype.hasOwnProperty.call(payload, key)) {
                    updates[key] = String(payload[key] ?? '').trim();
                }
            });

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ success: false, error: 'No valid keys provided' });
            }

            updateEnvVariables(updates);
            Object.assign(process.env, updates);

            res.json({ success: true, message: 'Meta configuration updated', data: updates });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    app.post('/api/meta/test-message', async (req, res) => {
        try {
            const envConfig = readEnvConfig();
            const token = envConfig.META_JWT_TOKEN || process.env.META_JWT_TOKEN;
            const numberId = envConfig.META_NUMBER_ID || process.env.META_NUMBER_ID;
            const apiVersion = envConfig.META_API_VERSION || process.env.META_API_VERSION || 'v18.0';
            const defaultRecipient = envConfig.PHONE_NUMBER || process.env.PHONE_NUMBER;

            if (!token || !numberId) {
                return res.status(400).json({ success: false, error: 'Meta token or number ID not configured' });
            }

            const { to, message } = req.body || {};
            const recipient = to || defaultRecipient;

            if (!recipient) {
                return res.status(400).json({ success: false, error: 'Recipient number is required' });
            }

            const body = {
                messaging_product: 'whatsapp',
                to: recipient,
                type: 'text',
                text: {
                    preview_url: false,
                    body: message || 'Ping de prueba desde dashboard Cocolu',
                },
            };

            const response = await fetch(`https://graph.facebook.com/${apiVersion}/${numberId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const result = await response.json();
            const success = response.ok && !result.error;

            res.status(response.status).json({
                success,
                data: result,
            });
        } catch (error) {
            console.error('Error en test-message:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ============================================
    // WEBSOCKET (información en tiempo real)
    // ============================================

    console.log('✅ API Routes configuradas');
};

export default setupRoutes;
