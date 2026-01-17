/**
 * Servicio de gestión de configuración Meta WhatsApp
 * Persistencia de tokens y credenciales en SQLite
 */

import databaseService from '../config/database.service.js';

class MetaConfigService {
    constructor() {
        this.db = databaseService.getDatabase();
        console.log('📦 MetaConfigService initialized with shared database');
    }

    /**
     * Obtener configuración por clave
     * @param {string} key - Nombre de la variable
     * @returns {string|null} - Valor o null si no existe
     */
    getConfig(key) {
        const stmt = this.db.prepare('SELECT value FROM meta_config WHERE key = ?');
        const row = stmt.get(key);
        return row ? row.value : null;
    }

    /**
     * Obtener todas las configuraciones
     * @returns {Object} - Objeto con todas las configs {key: value}
     */
    getAllConfigs() {
        const stmt = this.db.prepare('SELECT key, value FROM meta_config');
        const rows = stmt.all();

        const config = {};
        rows.forEach(row => {
            config[row.key] = row.value || '';
        });

        return config;
    }

    /**
     * Guardar/actualizar una configuración
     * @param {string} key - Nombre de la variable
     * @param {string} value - Valor
     */
    setConfig(key, value) {
        const stmt = this.db.prepare(`
            INSERT INTO meta_config (key, value, updated_at) 
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET 
                value = excluded.value,
                updated_at = CURRENT_TIMESTAMP
        `);

        stmt.run(key, value || '');
        console.log(`✓ Meta config actualizada: ${key}`);
    }

    /**
     * Guardar múltiples configuraciones en una transacción + histórico
     * @param {Object} configObj - Objeto con configs {key: value}
     */
    setConfigs(configObj) {
        const configStmt = this.db.prepare(`
            INSERT INTO meta_config (key, value, updated_at) 
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET 
                value = excluded.value,
                updated_at = CURRENT_TIMESTAMP
        `);

        const historyStmt = this.db.prepare(`
            INSERT INTO meta_config_history (key, value, changed_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        `);

        const transaction = this.db.transaction((configs) => {
            for (const [key, value] of Object.entries(configs)) {
                // Guardar en meta_config
                configStmt.run(key, value || '');
                // Guardar en histórico
                historyStmt.run(key, value || '');
            }
        });

        transaction(configObj);
        console.log(`✅ ${Object.keys(configObj).length} configuraciones Meta actualizadas + histórico guardado`);
    }

    /**
     * Obtener histórico de una configuración
     * @param {string} key - Nombre de la variable
     * @param {number} limit - Límite de registros (default: 10)
     * @returns {Array} - Lista de cambios ordenados por fecha descendente
     */
    getHistory(key, limit = 10) {
        const stmt = this.db.prepare(`
            SELECT value, changed_at, changed_by
            FROM meta_config_history 
            WHERE key = ? 
            ORDER BY changed_at DESC 
            LIMIT ?
        `);

        return stmt.all(key, limit);
    }

    /**
     * Eliminar una configuración
     * @param {string} key - Nombre de la variable
     */
    deleteConfig(key) {
        const stmt = this.db.prepare('DELETE FROM meta_config WHERE key = ?');
        const info = stmt.run(key);

        if (info.changes > 0) {
            console.log(`✓ Config eliminada: ${key}`);
        }

        return info.changes > 0;
    }

    /**
     * Verificar si una clave existe
     * @param {string} key - Nombre de la variable
     * @returns {boolean}
     */
    hasConfig(key) {
        const stmt = this.db.prepare('SELECT COUNT(*) as count FROM meta_config WHERE key = ?');
        const row = stmt.get(key);
        return row.count > 0;
    }

    /**
     * Obtener timestamp de última actualización
     * @param {string} key - Nombre de la variable
     * @returns {string|null} - Timestamp o null
     */
    getLastUpdated(key) {
        const stmt = this.db.prepare('SELECT updated_at FROM meta_config WHERE key = ?');
        const row = stmt.get(key);
        return row ? row.updated_at : null;
    }

    /**
     * Limpiar todas las configuraciones (usar con cuidado)
     */
    clearAll() {
        const stmt = this.db.prepare('DELETE FROM meta_config');
        const info = stmt.run();
        console.log(`⚠️ ${info.changes} configuraciones Meta eliminadas`);
        return info.changes;
    }

    /**
     * Obtener estadísticas
     * @returns {Object}
     */
    getStats() {
        const countStmt = this.db.prepare('SELECT COUNT(*) as total FROM meta_config');
        const lastStmt = this.db.prepare('SELECT MAX(updated_at) as last_update FROM meta_config');

        const count = countStmt.get();
        const last = lastStmt.get();

        return {
            totalConfigs: count.total,
            lastUpdate: last.last_update
        };
    }

    /**
     * Migrar desde process.env
     * @param {Array<string>} keys - Lista de claves a migrar
     */
    migrateFromEnv(keys) {
        let migratedCount = 0;

        keys.forEach(key => {
            const value = process.env[key];
            if (value && !this.hasConfig(key)) {
                this.setConfig(key, value);
                migratedCount++;
            }
        });

        console.log(`✅ Migradas ${migratedCount} configuraciones desde .env`);
        return migratedCount;
    }
}

export default new MetaConfigService(); // Exporting instance since class uses singleton pattern effectively
