/**
 * Logs Service
 * Gestiona el registro de mensajes del bot
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LogsService {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000; // Máximo de logs en memoria
        this.logsFilePath = path.join(__dirname, '../../data/logs.json');
        this.initializeLogsFile();
    }

    /**
     * Inicializa el archivo de logs
     */
    initializeLogsFile() {
        try {
            const logsDir = path.dirname(this.logsFilePath);
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }

            if (fs.existsSync(this.logsFilePath)) {
                const data = fs.readFileSync(this.logsFilePath, 'utf8');
                this.logs = JSON.parse(data);
            } else {
                fs.writeFileSync(this.logsFilePath, JSON.stringify([], null, 2));
            }
        } catch (error) {
            console.error('Error inicializando logs:', error);
            this.logs = [];
        }
    }

    /**
     * Agrega un log
     */
    addLog(logEntry) {
        const log = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...logEntry
        };

        this.logs.unshift(log);

        // Mantener solo los últimos maxLogs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }

        this.persistLogs();
        return log;
    }

    /**
     * Obtiene logs filtrados
     */
    getLogs(filters = {}) {
        let filteredLogs = [...this.logs];

        if (filters.type) {
            filteredLogs = filteredLogs.filter(log => log.type === filters.type);
        }

        if (filters.userId) {
            filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
        }

        if (filters.limit) {
            filteredLogs = filteredLogs.slice(0, filters.limit);
        }

        return filteredLogs;
    }

    /**
     * Obtiene estadísticas de logs
     */
    getStats() {
        const total = this.logs.length;
        const received = this.logs.filter(log => log.type === 'received').length;
        const sent = this.logs.filter(log => log.type === 'sent').length;
        const errors = this.logs.filter(log => log.type === 'error').length;

        return {
            total,
            received,
            sent,
            errors,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Limpia logs antiguos
     */
    clearOldLogs(daysOld = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        this.logs = this.logs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= cutoffDate;
        });

        this.persistLogs();
        return this.logs.length;
    }

    /**
     * Persiste logs a archivo
     */
    persistLogs() {
        try {
            fs.writeFileSync(this.logsFilePath, JSON.stringify(this.logs, null, 2));
        } catch (error) {
            console.error('Error persistiendo logs:', error);
        }
    }

    /**
     * Limpia todos los logs
     */
    clearAll() {
        this.logs = [];
        this.persistLogs();
    }
}

// Singleton
const logsService = new LogsService();
export default logsService;
