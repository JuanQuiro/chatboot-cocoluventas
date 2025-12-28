/**
 * Bot Service
 * Gestión de chatbots desde el dashboard
 */

import apiClient from './api';

class BotService {
    /**
     * Obtener todos los bots del tenant
     */
    async getBots() {
        try {
            const response = await apiClient.get('/bots');
            return {
                success: true,
                bots: response.data.bots || [],
                count: response.data.count || 0,
            };
        } catch (error) {
            // Fallback con datos mock
            return this.getMockBots();
        }
    }

    /**
     * Datos mock para desarrollo
     */
    getMockBots() {
        return {
            success: true,
            bots: [
                {
                    botId: 'bot_principal_cocolu',
                    name: 'Bot Principal Cocolu',
                    adapter: 'baileys',
                    status: 'connected',
                    phoneNumber: '+1234567890',
                    tenantId: 'cocolu',
                    flows: 9,
                    messagesCount: 1234,
                    conversationsCount: 156,
                    connectedAt: new Date().toISOString()
                }
            ],
            count: 1
        };
    }

    /**
     * Obtener bot específico
     */
    async getBot(botId) {
        try {
            const response = await apiClient.get(`/bots/${botId}`);
            return {
                success: true,
                bot: response.data.bot,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener bot',
            };
        }
    }

    /**
     * Obtener QR code de un bot
     */
    async getQRCode(botId) {
        try {
            const response = await apiClient.get(`/bots/${botId}/qr`);
            return {
                success: true,
                qr: response.data.qr,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'QR no disponible',
            };
        }
    }

    /**
     * Obtener estadísticas globales
     */
    async getStats() {
        try {
            const response = await apiClient.get('/bots/stats');
            return {
                success: true,
                stats: response.data.stats,
            };
        } catch (error) {
            // Fallback con stats mock
            return {
                success: true,
                stats: {
                    total: 1,
                    connected: 1,
                    disconnected: 0,
                    error: 0,
                    totalMessages: 1234,
                    totalConversations: 156
                }
            };
        }
    }

    /**
     * Crear nuevo bot
     */
    async createBot(botData) {
        try {
            const response = await apiClient.post('/bots', botData);
            return {
                success: true,
                botId: response.data.botId,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al crear bot',
            };
        }
    }

    /**
     * Iniciar bot
     */
    async startBot(botId) {
        try {
            const response = await apiClient.post(`/bots/${botId}/start`);
            return {
                success: true,
                message: response.data.message,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al iniciar bot',
            };
        }
    }

    /**
     * Detener bot
     */
    async stopBot(botId) {
        try {
            const response = await apiClient.post(`/bots/${botId}/stop`);
            return {
                success: true,
                message: response.data.message,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al detener bot',
            };
        }
    }

    /**
     * Reiniciar bot
     */
    async restartBot(botId) {
        try {
            const response = await apiClient.post(`/bots/${botId}/restart`);
            return {
                success: true,
                message: response.data.message,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al reiniciar bot',
            };
        }
    }

    /**
     * Enviar mensaje desde un bot
     */
    async sendMessage(botId, to, message) {
        try {
            const response = await apiClient.post(`/bots/${botId}/message`, {
                to,
                message,
            });
            return {
                success: true,
                message: response.data.message,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al enviar mensaje',
            };
        }
    }

    /**
     * Eliminar bot
     */
    async deleteBot(botId) {
        try {
            const response = await apiClient.delete(`/bots/${botId}`);
            return {
                success: true,
                message: response.data.message,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al eliminar bot',
            };
        }
    }

    /**
     * Obtener estado legible
     */
    getStatusLabel(status) {
        const labels = {
            'registered': 'Registrado',
            'starting': 'Iniciando',
            'connecting': 'Conectando',
            'qr_ready': 'QR Listo',
            'connected': 'Conectado',
            'disconnected': 'Desconectado',
            'stopped': 'Detenido',
            'error': 'Error',
            'failed': 'Fallido',
        };
        return labels[status] || status;
    }

    /**
     * Obtener color del estado
     */
    getStatusColor(status) {
        const colors = {
            'registered': 'gray',
            'starting': 'blue',
            'connecting': 'blue',
            'qr_ready': 'yellow',
            'connected': 'green',
            'disconnected': 'red',
            'stopped': 'gray',
            'error': 'red',
            'failed': 'red',
        };
        return colors[status] || 'gray';
    }

    /**
     * Formatear uptime
     */
    formatUptime(milliseconds) {
        if (!milliseconds) return '0s';
        
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
}

// Singleton
const botService = new BotService();

export default botService;
