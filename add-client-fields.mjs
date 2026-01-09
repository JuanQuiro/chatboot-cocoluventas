import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'src', 'data', 'cocolu.db');
const db = new Database(dbPath);

console.log('🔄 Migrando tabla clientes...');

const columns = [
    { name: 'direccion', type: 'TEXT' },
    { name: 'ciudad', type: 'TEXT' },
    { name: 'tipo_precio', type: 'TEXT DEFAULT "detal"' },
    { name: 'limite_credito', type: 'REAL DEFAULT 0' },
    { name: 'dias_credito', type: 'INTEGER DEFAULT 0' }
];

import fs from 'fs';

function log(msg) {
    console.log(msg);
    fs.appendFileSync('migration.log', msg + '\n');
}

columns.forEach(col => {
    try {
        db.prepare(`ALTER TABLE clientes ADD COLUMN ${col.name} ${col.type}`).run();
        log(`✅ Columna ${col.name} agregada.`);
    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            log(`ℹ️  Columna ${col.name} ya existe.`);
        } else {
            log(`❌ Error al agregar ${col.name}: ${error.message}`);
        }
    }
});

log('✨ Migración completada.');
