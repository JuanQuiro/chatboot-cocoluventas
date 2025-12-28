/**
 * Flow Manager Service
 * Gestiona los flujos de conversación del bot desde el dashboard
 */

import logger from '../utils/logger.js';
import { EventEmitter } from 'events';

class FlowManager extends EventEmitter {
    constructor() {
        super();
        this.flows = new Map(); // flowId -> flowConfig
        this.flowStats = new Map(); // flowId -> stats
        this.activeFlows = new Set(); // flowIds activos
    }

    /**
     * Registrar un flujo
     */
    registerFlow(flowId, flowConfig) {
        logger.info(`Registering flow: ${flowId}`);

        this.flows.set(flowId, {
            flowId,
            name: flowConfig.name || flowId,
            description: flowConfig.description || '',
            keywords: flowConfig.keywords || [],
            category: flowConfig.category || 'general',
            priority: flowConfig.priority || 0,
            registeredAt: new Date(),
            botId: flowConfig.botId,
        });

        this.flowStats.set(flowId, {
            timesTriggered: 0,
            lastTriggered: null,
            averageResponseTime: 0,
            completionRate: 0,
            activeUsers: 0,
        });

        this.activeFlows.add(flowId);

        this.emit('flow:registered', { flowId, config: flowConfig });
        return { success: true, flowId };
    }

    /**
     * Obtener todos los flujos de un bot
     */
    getFlows(botId = null) {
        const result = [];
        
        for (const [flowId, config] of this.flows.entries()) {
            if (botId && config.botId !== botId) {
                continue;
            }

            const stats = this.flowStats.get(flowId);
            const isActive = this.activeFlows.has(flowId);

            result.push({
                ...config,
                stats,
                isActive,
            });
        }

        return result.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Obtener un flujo específico
     */
    getFlow(flowId) {
        const config = this.flows.get(flowId);
        if (!config) return null;

        const stats = this.flowStats.get(flowId);
        const isActive = this.activeFlows.has(flowId);

        return {
            ...config,
            stats,
            isActive,
        };
    }

    /**
     * Activar un flujo
     */
    activateFlow(flowId) {
        if (!this.flows.has(flowId)) {
            return { success: false, error: 'Flow not found' };
        }

        this.activeFlows.add(flowId);
        this.emit('flow:activated', { flowId });
        logger.info(`Flow activated: ${flowId}`);

        return { success: true, flowId };
    }

    /**
     * Desactivar un flujo
     */
    deactivateFlow(flowId) {
        if (!this.flows.has(flowId)) {
            return { success: false, error: 'Flow not found' };
        }

        this.activeFlows.delete(flowId);
        this.emit('flow:deactivated', { flowId });
        logger.info(`Flow deactivated: ${flowId}`);

        return { success: true, flowId };
    }

    /**
     * Registrar que un flujo fue activado
     */
    recordFlowTriggered(flowId, userId) {
        const stats = this.flowStats.get(flowId);
        if (!stats) return;

        stats.timesTriggered++;
        stats.lastTriggered = new Date();
        stats.activeUsers++;

        this.flowStats.set(flowId, stats);
        this.emit('flow:triggered', { flowId, userId });
    }

    /**
     * Registrar que un usuario completó un flujo
     */
    recordFlowCompleted(flowId, userId, responseTime) {
        const stats = this.flowStats.get(flowId);
        if (!stats) return;

        // Calcular promedio de tiempo de respuesta
        const currentAvg = stats.averageResponseTime || 0;
        const count = stats.timesTriggered;
        stats.averageResponseTime = (currentAvg * (count - 1) + responseTime) / count;

        // Actualizar tasa de completación (simplificado)
        stats.completionRate = ((stats.completionRate * (count - 1)) + 100) / count;

        stats.activeUsers = Math.max(0, stats.activeUsers - 1);

        this.flowStats.set(flowId, stats);
        this.emit('flow:completed', { flowId, userId, responseTime });
    }

    /**
     * Obtener estadísticas globales de flujos
     */
    getGlobalStats(botId = null) {
        const flows = this.getFlows(botId);

        const stats = {
            totalFlows: flows.length,
            activeFlows: flows.filter(f => f.isActive).length,
            inactiveFlows: flows.filter(f => !f.isActive).length,
            totalTriggers: 0,
            totalActiveUsers: 0,
            avgResponseTime: 0,
            avgCompletionRate: 0,
        };

        let validFlows = 0;

        for (const flow of flows) {
            if (flow.stats) {
                stats.totalTriggers += flow.stats.timesTriggered || 0;
                stats.totalActiveUsers += flow.stats.activeUsers || 0;
                
                if (flow.stats.averageResponseTime > 0) {
                    stats.avgResponseTime += flow.stats.averageResponseTime;
                    validFlows++;
                }
                
                stats.avgCompletionRate += flow.stats.completionRate || 0;
            }
        }

        if (validFlows > 0) {
            stats.avgResponseTime = stats.avgResponseTime / validFlows;
        }

        if (flows.length > 0) {
            stats.avgCompletionRate = stats.avgCompletionRate / flows.length;
        }

        return stats;
    }

    /**
     * Obtener flujos más populares
     */
    getTopFlows(limit = 10, botId = null) {
        const flows = this.getFlows(botId);

        return flows
            .sort((a, b) => {
                const aCount = a.stats?.timesTriggered || 0;
                const bCount = b.stats?.timesTriggered || 0;
                return bCount - aCount;
            })
            .slice(0, limit);
    }

    /**
     * Actualizar configuración de un flujo
     */
    updateFlowConfig(flowId, updates) {
        const config = this.flows.get(flowId);
        if (!config) {
            return { success: false, error: 'Flow not found' };
        }

        const updated = {
            ...config,
            ...updates,
            updatedAt: new Date(),
        };

        this.flows.set(flowId, updated);
        this.emit('flow:updated', { flowId, config: updated });
        logger.info(`Flow updated: ${flowId}`);

        return { success: true, flowId, config: updated };
    }

    /**
     * Eliminar un flujo
     */
    deleteFlow(flowId) {
        if (!this.flows.has(flowId)) {
            return { success: false, error: 'Flow not found' };
        }

        this.flows.delete(flowId);
        this.flowStats.delete(flowId);
        this.activeFlows.delete(flowId);

        this.emit('flow:deleted', { flowId });
        logger.info(`Flow deleted: ${flowId}`);

        return { success: true, flowId };
    }

    /**
     * Obtener flujos por categoría
     */
    getFlowsByCategory(category, botId = null) {
        return this.getFlows(botId).filter(f => f.category === category);
    }

    /**
     * Buscar flujos por keyword
     */
    searchFlows(query, botId = null) {
        const lowerQuery = query.toLowerCase();
        
        return this.getFlows(botId).filter(f => {
            return (
                f.name.toLowerCase().includes(lowerQuery) ||
                f.description.toLowerCase().includes(lowerQuery) ||
                f.keywords.some(k => k.toLowerCase().includes(lowerQuery))
            );
        });
    }

    /**
     * Limpiar estadísticas
     */
    resetStats(flowId = null) {
        if (flowId) {
            // Reset de un flujo específico
            this.flowStats.set(flowId, {
                timesTriggered: 0,
                lastTriggered: null,
                averageResponseTime: 0,
                completionRate: 0,
                activeUsers: 0,
            });
            logger.info(`Stats reset for flow: ${flowId}`);
        } else {
            // Reset de todos
            for (const flowId of this.flowStats.keys()) {
                this.flowStats.set(flowId, {
                    timesTriggered: 0,
                    lastTriggered: null,
                    averageResponseTime: 0,
                    completionRate: 0,
                    activeUsers: 0,
                });
            }
            logger.info('All flow stats reset');
        }

        this.emit('stats:reset', { flowId });
        return { success: true };
    }
}

// Singleton
const flowManager = new FlowManager();

export default flowManager;
