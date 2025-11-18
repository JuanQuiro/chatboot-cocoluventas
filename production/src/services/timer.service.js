/**
 * Servicio de Timers
 * Gestiona los timers de seguimiento para cada flujo
 * Soporta overrides para testing
 */

import testingCommandsService from './testing-commands.service.js';

class TimerService {
    constructor() {
        // Map para almacenar timers activos
        this.activeTimers = new Map();
        
        // Historial de timers ejecutados
        this.timerHistory = [];
    }

    /**
     * Crear un timer para seguimiento
     * @param {string} userId - ID del usuario
     * @param {Function} callback - Función a ejecutar
     * @param {number} delayMinutes - Minutos de espera
     * @param {string} timerType - Tipo de timer (followup_15, followup_20, etc)
     * @returns {string} timerId
     */
    createTimer(userId, callback, delayMinutes, timerType = 'followup') {
        const timerId = `timer_${userId}_${Date.now()}`;
        const delayMs = delayMinutes * 60 * 1000;

        // Cancelar timer anterior del mismo tipo si existe
        this.cancelUserTimer(userId, timerType);

        const timeoutId = setTimeout(async () => {
            try {
                console.log(`⏰ Ejecutando timer ${timerType} para usuario ${userId}`);
                
                if (testingCommandsService.isDebugMode()) {
                    console.log(`🐛 [DEBUG] Timer callback ejecutándose para ${userId}`);
                }
                
                await callback();
                
                // Registrar en historial
                this.timerHistory.push({
                    timerId,
                    userId,
                    timerType,
                    executedAt: new Date().toISOString(),
                    status: 'completed'
                });

                // Remover de activos
                this.activeTimers.delete(timerId);
            } catch (error) {
                console.error(`❌ Error ejecutando timer ${timerId}:`, error);
                this.timerHistory.push({
                    timerId,
                    userId,
                    timerType,
                    executedAt: new Date().toISOString(),
                    status: 'error',
                    error: error.message
                });
            }
        }, delayMs);

        // Almacenar timer
        this.activeTimers.set(timerId, {
            timerId,
            userId,
            timerType,
            timeoutId,
            scheduledFor: new Date(Date.now() + delayMs).toISOString(),
            createdAt: new Date().toISOString()
        });

        console.log(`✅ Timer ${timerType} creado para ${userId} (ejecutará en ${delayMinutes} min)`);
        return timerId;
    }

    /**
     * Cancelar un timer específico
     * @param {string} timerId - ID del timer
     */
    cancelTimer(timerId) {
        const timer = this.activeTimers.get(timerId);
        if (timer) {
            clearTimeout(timer.timeoutId);
            this.activeTimers.delete(timerId);
            console.log(`🛑 Timer ${timerId} cancelado`);
            return true;
        }
        return false;
    }

    /**
     * Cancelar todos los timers de un usuario
     * @param {string} userId - ID del usuario
     * @param {string} timerType - Tipo específico (opcional)
     */
    cancelUserTimer(userId, timerType = null) {
        let cancelled = 0;
        for (const [timerId, timer] of this.activeTimers.entries()) {
            if (timer.userId === userId) {
                if (!timerType || timer.timerType === timerType) {
                    clearTimeout(timer.timeoutId);
                    this.activeTimers.delete(timerId);
                    cancelled++;
                }
            }
        }
        if (cancelled > 0) {
            console.log(`🛑 ${cancelled} timer(s) cancelados para usuario ${userId}`);
        }
        return cancelled;
    }

    /**
     * Obtener timers activos de un usuario
     * @param {string} userId - ID del usuario
     */
    getUserTimers(userId) {
        const timers = [];
        for (const timer of this.activeTimers.values()) {
            if (timer.userId === userId) {
                timers.push({
                    timerId: timer.timerId,
                    timerType: timer.timerType,
                    scheduledFor: timer.scheduledFor,
                    createdAt: timer.createdAt
                });
            }
        }
        return timers;
    }

    /**
     * Obtener estadísticas de timers
     */
    getStats() {
        return {
            activeTimers: this.activeTimers.size,
            completedTimers: this.timerHistory.filter(t => t.status === 'completed').length,
            failedTimers: this.timerHistory.filter(t => t.status === 'error').length,
            totalHistorySize: this.timerHistory.length
        };
    }

    /**
     * Limpiar historial antiguo (más de 24 horas)
     */
    cleanOldHistory() {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const before = this.timerHistory.length;
        this.timerHistory = this.timerHistory.filter(
            t => t.executedAt > oneDayAgo
        );
        const cleaned = before - this.timerHistory.length;
        if (cleaned > 0) {
            console.log(`🧹 ${cleaned} entradas antiguas limpiadas del historial de timers`);
        }
    }
}

// Singleton
const timerService = new TimerService();

// Limpiar historial cada 6 horas
setInterval(() => {
    timerService.cleanOldHistory();
}, 6 * 60 * 60 * 1000);

export default timerService;
