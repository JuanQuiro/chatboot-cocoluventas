/**
 * Servicio de Control del Bot
 * Permite pausar/reanudar el bot en chats específicos
 */

class BotControlService {
    constructor() {
        // Map de chats donde el bot está pausado
        // Key: número de teléfono, Value: { pausedAt, pausedBy }
        this.pausedChats = new Map();
        
        // Comandos de control (EXACTOS y en MAYÚSCULAS)
        this.PAUSE_COMMAND = 'PAUSAR BOT COCOLU AHORA';
        this.RESUME_COMMAND = 'ACTIVAR BOT COCOLU AHORA';
        
        // Comando alternativo más simple pero aún seguro
        this.PAUSE_COMMAND_ALT = 'BOT PAUSA YA';
        this.RESUME_COMMAND_ALT = 'BOT ACTIVA YA';
        
        console.log('✅ BotControlService inicializado');
        console.log(`📋 Comando pausar: "${this.PAUSE_COMMAND}" o "${this.PAUSE_COMMAND_ALT}"`);
        console.log(`📋 Comando activar: "${this.RESUME_COMMAND}" o "${this.RESUME_COMMAND_ALT}"`);
    }

    /**
     * Verifica si un mensaje es un comando de control
     * @param {string} message - Mensaje del usuario
     * @returns {string|null} - 'pause', 'resume' o null
     */
    checkControlCommand(message) {
        const cleanMessage = message.trim();
        
        // Verificar comandos de pausa
        if (cleanMessage === this.PAUSE_COMMAND || cleanMessage === this.PAUSE_COMMAND_ALT) {
            return 'pause';
        }
        
        // Verificar comandos de reanudación
        if (cleanMessage === this.RESUME_COMMAND || cleanMessage === this.RESUME_COMMAND_ALT) {
            return 'resume';
        }
        
        return null;
    }

    /**
     * Pausa el bot en un chat específico
     * @param {string} phoneNumber - Número de teléfono del chat
     * @param {string} pausedBy - Quien pausó (opcional)
     * @returns {boolean} - true si se pausó correctamente
     */
    pauseBot(phoneNumber, pausedBy = 'Usuario') {
        if (this.pausedChats.has(phoneNumber)) {
            console.log(`⚠️ Bot ya estaba pausado en ${phoneNumber}`);
            return false;
        }

        this.pausedChats.set(phoneNumber, {
            pausedAt: new Date().toISOString(),
            pausedBy: pausedBy
        });

        console.log(`⏸️ Bot PAUSADO en chat: ${phoneNumber}`);
        console.log(`   Pausado por: ${pausedBy}`);
        console.log(`   Total chats pausados: ${this.pausedChats.size}`);
        
        return true;
    }

    /**
     * Reanuda el bot en un chat específico
     * @param {string} phoneNumber - Número de teléfono del chat
     * @returns {boolean} - true si se reanudó correctamente
     */
    resumeBot(phoneNumber) {
        if (!this.pausedChats.has(phoneNumber)) {
            console.log(`⚠️ Bot no estaba pausado en ${phoneNumber}`);
            return false;
        }

        const pauseInfo = this.pausedChats.get(phoneNumber);
        this.pausedChats.delete(phoneNumber);

        const pauseDuration = new Date() - new Date(pauseInfo.pausedAt);
        const minutes = Math.floor(pauseDuration / 60000);

        console.log(`▶️ Bot REACTIVADO en chat: ${phoneNumber}`);
        console.log(`   Estuvo pausado: ${minutes} minutos`);
        console.log(`   Total chats pausados: ${this.pausedChats.size}`);
        
        return true;
    }

    /**
     * Verifica si el bot está pausado en un chat
     * @param {string} phoneNumber - Número de teléfono del chat
     * @returns {boolean} - true si está pausado
     */
    isPaused(phoneNumber) {
        return this.pausedChats.has(phoneNumber);
    }

    /**
     * Obtiene información de pausa de un chat
     * @param {string} phoneNumber - Número de teléfono
     * @returns {object|null} - Info de pausa o null
     */
    getPauseInfo(phoneNumber) {
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
