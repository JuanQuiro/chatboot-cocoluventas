/**
 * Servicio de gestión de configuración Meta WhatsApp
 * Persistencia de tokens y credenciales en SQLite
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MetaConfigService {
    constructor() {
        // Usar misma base de datos que sellers
        // Intentar múltiples rutas para encontrar la DB
        const possiblePaths = [
            path.join(process.cwd(), 'database', 'sellers.db'), // Local / Production default
            path.join(process.cwd(), '..', 'database', 'sellers.db'), // Parent dir
            '/app/database/sellers.db', // Docker volume mount standard
            path.join(__dirname, '../../database/sellers.db') // Relative to service file
        ];

        let dbPath = possiblePaths[0];
        for (const p of possiblePaths) {
            try {
                // Verificar si el directorio existe (para creación) o el archivo existe
                const dir = path.dirname(p);
                if (fs.existsSync(dir)) {
                    dbPath = p;
                    // Si el archivo existe, preferimos esta ruta
                    if (fs.existsSync(p)) {
                        console.log(`📦 Database encontrada en: ${p}`);
                        break;
                    }
                }
            } catch (e) { }
        }

        this.db = new Database(dbPath);

        console.log(`📦 MetaConfigService initialized with database: ${dbPath}`);

        // Crear tabla si no existe
        this.initializeDatabase();
    }

    /**
     * Inicializar tabla meta_config y meta_config_history
     */
    initializeDatabase() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS meta_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT NOT NULL UNIQUE,
                value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_meta_config_key ON meta_config(key);
            
            CREATE TABLE IF NOT EXISTS meta_config_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT NOT NULL,
                value TEXT,
                changed_by TEXT DEFAULT 'admin',
                changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_meta_config_history_key ON meta_config_history(key);
            CREATE INDEX IF NOT EXISTS idx_meta_config_history_changed_at ON meta_config_history(changed_at);
        `);

        console.log('✅ Tablas meta_config y meta_config_history inicializadas');
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

export default MetaConfigService;
