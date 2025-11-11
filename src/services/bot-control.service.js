/**
 * Servicio de Control del Bot
 * Permite pausar/reanudar el bot en chats específicos
 */

class BotControlService {
    constructor() {
        // Map de chats donde el bot está pausado
        // Key: número de teléfono, Value: { pausedAt, pausedBy }
        this.pausedChats = new Map();
        
        
        console.log('✅ BotControlService inicializado');
        console.log('📋 Comandos disponibles:');
        console.log('   🔴 PAUSAR: "PAUSAR BOT COCOLU AHORA" o "BOT PAUSA YA"');
        console.log('   🟢 ACTIVAR: "ACTIVAR BOT COCOLU AHORA" o "BOT ACTIVA YA"');
        console.log('   🧪 TESTING: "MODO TEST ACTIVAR" o "TEST MODE ON"');
        console.log('   🐛 DEBUG: "DEBUG MODE ON" o "ACTIVAR DEBUG"');
        console.log('   ⏱️  TIMER: "TIMER 1MIN" o "TIMER 5MIN" o "TIMER NORMAL"');
    }

    /**
     * Verifica si un mensaje es un comando de control
     * @param {string} message - Mensaje del usuario
     * @returns {string|null} - 'pause', 'resume' o null
     */
    checkControlCommand(message) {
        const msg = message.toUpperCase().trim();
        
        // Comandos para pausar
        if (msg.includes('PAUSAR BOT COCOLU AHORA') || msg.includes('BOT PAUSA YA')) {
            return 'pause';
        }
        
        // Comandos para activar
        if (msg.includes('ACTIVAR BOT COCOLU AHORA') || msg.includes('BOT ACTIVA YA')) {
            return 'activate';
        }
        
        // Comandos de testing
        if (msg.includes('MODO TEST ACTIVAR') || msg.includes('TEST MODE ON')) {
            return 'test_on';
        }
        
        if (msg.includes('MODO TEST DESACTIVAR') || msg.includes('TEST MODE OFF')) {
            return 'test_off';
        }
        
        // Comandos de debug
        if (msg.includes('DEBUG MODE ON') || msg.includes('ACTIVAR DEBUG')) {
            return 'debug_on';
        }
        
        if (msg.includes('DEBUG MODE OFF') || msg.includes('DESACTIVAR DEBUG')) {
            return 'debug_off';
        }
        
        // Comandos de timer override
        if (msg.includes('TIMER 1MIN') || msg.includes('TIMER 1MINUTO')) {
            return 'timer_1min';
        }
        
        if (msg.includes('TIMER 5MIN') || msg.includes('TIMER 5MINUTOS')) {
            return 'timer_5min';
        }
        
        if (msg.includes('TIMER 30SEG') || msg.includes('TIMER 30SEGUNDOS')) {
            return 'timer_30sec';
        }
        
        if (msg.includes('TIMER NORMAL') || msg.includes('TIMER RESET')) {
            return 'timer_normal';
        }
        
        // Comandos de estado
        if (msg.includes('ESTADO BOT') || msg.includes('BOT STATUS')) {
            return 'status';
        }
        
        if (msg.includes('VER TIMERS') || msg.includes('SHOW TIMERS')) {
            return 'show_timers';
        }
        
        if (msg.includes('LIMPIAR ESTADO') || msg.includes('CLEAR STATE')) {
            return 'clear_state';
        }
        
        if (msg.includes('VER VENDEDORAS') || msg.includes('SHOW SELLERS')) {
            return 'show_sellers';
        }
        
        if (msg.includes('FORZAR TIMER') || msg.includes('FORCE TIMER')) {
            return 'force_timer';
        }
        
        return null;
    }

    /**
     * Pausa el bot en un chat específico
     * @param {string} userId - ID del usuario
     * @param {string} pausedBy - Quien pausó (opcional)
     * @returns {boolean} - true si se pausó correctamente
     */
    pauseBot(userId, pausedBy = 'Usuario') {
        if (this.pausedUsers.has(userId)) {
            console.log(`⚠️ Bot ya estaba pausado en ${userId}`);
            return false;
        }

        this.pausedUsers.set(userId, {
            pausedAt: new Date().toISOString(),
            pausedBy: pausedBy
        });

        console.log(`⏸️ Bot PAUSADO en chat: ${userId}`);
        console.log(`   Pausado por: ${pausedBy}`);
        console.log(`   Total chats pausados: ${this.pausedUsers.size}`);
        
        return true;
    }

    /**
     * Reanuda el bot en un chat específico
     * @param {string} userId - ID del usuario
     * @returns {boolean} - true si se reanudó correctamente
     */
    resumeBot(userId) {
        if (!this.pausedUsers.has(userId)) {
            console.log(`⚠️ Bot no estaba pausado en ${userId}`);
            return false;
        }

        const pauseInfo = this.pausedUsers.get(userId);
        this.pausedUsers.delete(userId);

        const pauseDuration = new Date() - new Date(pauseInfo.pausedAt);
        const minutes = Math.floor(pauseDuration / 60000);

        console.log(`▶️ Bot REACTIVADO en chat: ${userId}`);
        console.log(`   Estuvo pausado: ${minutes} minutos`);
        console.log(`   Total chats pausados: ${this.pausedUsers.size}`);
        
        return true;
    }

    /**
     * Verifica si el bot está pausado en un chat
     * @param {string} userId - ID del usuario
     * @returns {boolean} - true si está pausado
     */
    isPaused(userId) {
        return this.pausedUsers.has(userId);
    }

    /**
     * Obtiene información de pausa de un chat
     * @param {string} userId - ID del usuario
     * @returns {object|null} - Info de pausa o null
     */
    getPauseInfo(userId) {
        return this.pausedUsers.get(userId) || null;
        return this.pausedChats.get(phoneNumber) || null;
    }

    /**
     * Obtiene lista de todos los chats pausados
     * @returns {Array} - Array de objetos con info de chats pausados
     */
    getPausedChats() {
        const result = [];
        for (const [phone, info] of this.pausedChats.entries()) {
            result.push({
                phone,
                ...info
            });
        }
        return result;
    }

    /**
     * Limpia chats pausados hace más de X días
     * @param {number} days - Días de antigüedad
     * @returns {number} - Cantidad de chats limpiados
     */
    cleanOldPauses(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        let cleaned = 0;
        for (const [phone, info] of this.pausedChats.entries()) {
            const pausedDate = new Date(info.pausedAt);
            if (pausedDate < cutoffDate) {
                this.pausedChats.delete(phone);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Limpiados ${cleaned} chats con pausas antiguas (>${days} días)`);
        }

        return cleaned;
    }

    /**
     * Genera mensaje de confirmación de pausa
     * @returns {string} - Mensaje formateado
     */
    getPauseConfirmationMessage() {
        return [
            '⏸️ *Bot Pausado*',
            '',
            'El bot está pausado en este chat',
            '',
            'No responderé a mensajes',
            'hasta que lo reactives',
            '',
            `✅ Para reactivar escribe:`,
            `*${this.RESUME_COMMAND_ALT}*`,
            '',
            '_Comando en MAYÚSCULAS exacto_'
        ].join('\n');
    }

    /**
     * Genera mensaje de confirmación de reanudación
     * @returns {string} - Mensaje formateado
     */
    getResumeConfirmationMessage() {
        return [
            '▶️ *Bot Activado*',
            '',
            'El bot está activo nuevamente',
            '',
            'Puedo ayudarte con:',
            '*1.* Hablar con Asesor',
            '*2.* Ver Catálogo',
            '*3.* Info de Pedido',
            '*4.* Horarios',
            '*5.* Problemas',
            '',
            `⏸️ Para pausar escribe:`,
            `*${this.PAUSE_COMMAND_ALT}*`,
            '',
            '💝 _Listo para ayudarte_'
        ].join('\n');
    }

    /**
     * Genera mensaje cuando el bot está pausado
     * @returns {string} - Mensaje silencioso (vacío para no molestar)
     */
    getPausedMessage() {
        // Retornamos null para que el bot no responda nada
        return null;
    }
}

// Exportar instancia única (Singleton)
const botControlService = new BotControlService();
export default botControlService;
