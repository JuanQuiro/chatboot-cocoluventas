import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'src', 'data', 'cocolu.db');
const db = new Database(dbPath);

console.log('🔄 Migrando tabla clientes (Instagram)...');

try {
    db.prepare(`ALTER TABLE clientes ADD COLUMN instagram TEXT`).run();
    console.log(`✅ Columna instagram agregada.`);
} catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log(`ℹ️  Columna instagram ya existe.`);
    } else {
        console.log(`❌ Error al agregar instagram: ${error.message}`);
    }
}

console.log('✨ Migración completada.');
