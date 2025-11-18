/**
 * Sistema de persistencia mejorado
 * MEJORA: Guardar datos en disco para no perderlos
 */

import fs from 'fs/promises';
import path from 'path';

class PersistenceService {
    constructor(basePath = './data') {
        this.basePath = basePath;
        this.initialized = false;
    }

    /**
     * Inicializar directorio de datos
     */
    async init() {
        if (this.initialized) return;

        try {
            await fs.mkdir(this.basePath, { recursive: true });
            this.initialized = true;
            console.log(`✅ Persistencia inicializada en: ${this.basePath}`);
        } catch (error) {
            console.error('❌ Error inicializando persistencia:', error);
        }
    }

    /**
     * Guardar datos
     */
    async save(key, data) {
        await this.init();
        
        const filePath = path.join(this.basePath, `${key}.json`);
        const dataToSave = typeof data === 'string' 
            ? data 
            : JSON.stringify(data, this.replacer, 2);

        try {
            await fs.writeFile(filePath, dataToSave, 'utf8');
            console.log(`💾 Datos guardados: ${key}`);
            return true;
        } catch (error) {
            console.error(`❌ Error guardando ${key}:`, error);
            return false;
        }
    }

    /**
     * Cargar datos
     */
    async load(key, defaultValue = null) {
        await this.init();
        
        const filePath = path.join(this.basePath, `${key}.json`);

        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data, this.reviver);
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log(`ℹ️  Archivo ${key} no existe, usando valor por defecto`);
                return defaultValue;
            }
            console.error(`❌ Error cargando ${key}:`, error);
            return defaultValue;
        }
    }

    /**
     * Verificar si existe
     */
    async exists(key) {
        await this.init();
        
        const filePath = path.join(this.basePath, `${key}.json`);
        
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Eliminar datos
     */
    async delete(key) {
        await this.init();
        
        const filePath = path.join(this.basePath, `${key}.json`);
        
        try {
            await fs.unlink(filePath);
            console.log(`🗑️  Datos eliminados: ${key}`);
            return true;
        } catch (error) {
            console.error(`❌ Error eliminando ${key}:`, error);
            return false;
        }
    }

    /**
     * Listar todas las keys
     */
    async listKeys() {
        await this.init();
        
        try {
            const files = await fs.readdir(this.basePath);
            return files
                .filter(f => f.endsWith('.json'))
                .map(f => f.replace('.json', ''));
        } catch (error) {
            console.error('❌ Error listando keys:', error);
            return [];
        }
    }

    /**
     * Backup de todos los datos
     */
    async backup(backupName = `backup_${Date.now()}`) {
        const backupPath = path.join(this.basePath, 'backups', backupName);
        
        try {
            await fs.mkdir(path.join(this.basePath, 'backups'), { recursive: true });
            const keys = await this.listKeys();
            
            for (const key of keys) {
                const data = await this.load(key);
                const backupFile = path.join(backupPath, `${key}.json`);
                await fs.mkdir(path.dirname(backupFile), { recursive: true });
                await fs.writeFile(
                    backupFile,
                    JSON.stringify(data, null, 2),
                    'utf8'
                );
            }
            
            console.log(`📦 Backup creado: ${backupName}`);
            return backupName;
        } catch (error) {
            console.error('❌ Error creando backup:', error);
            return null;
        }
    }

    /**
     * Replacer para JSON.stringify (maneja Sets, Maps, etc.)
     */
    replacer(key, value) {
        if (value instanceof Map) {
            return {
                _type: 'Map',
                value: Array.from(value.entries())
            };
        }
        if (value instanceof Set) {
            return {
                _type: 'Set',
                value: Array.from(value)
            };
        }
        return value;
    }

    /**
     * Reviver para JSON.parse (reconstruye Sets, Maps, etc.)
     */
    reviver(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (value._type === 'Map') {
                return new Map(value.value);
            }
            if (value._type === 'Set') {
                return new Set(value.value);
            }
        }
        return value;
    }
}

const persistence = new PersistenceService();

export default persistence;
