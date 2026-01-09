// Script para actualizar base de datos local
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'data', 'cocolu.db');
const db = new Database(dbPath);

console.log('📦 Actualizando base de datos local...');

try {
    // Verificar columnas nuevas
    const columnsToCheck = [
        { name: 'instagram', type: 'TEXT' },
        { name: 'ciudad', type: 'TEXT' },
        { name: 'tipo_precio', type: "TEXT DEFAULT 'detal'" },
        { name: 'limite_credito', type: 'REAL DEFAULT 0' },
        { name: 'dias_credito', type: 'INTEGER DEFAULT 0' }
    ];

    const tableInfo = db.prepare('PRAGMA table_info(clientes)').all();
    const existingColumns = new Set(tableInfo.map(c => c.name));

    for (const col of columnsToCheck) {
        if (!existingColumns.has(col.name)) {
            console.log(`➕ Agregando columna ${col.name} a tabla clientes...`);
            db.prepare(`ALTER TABLE clientes ADD COLUMN ${col.name} ${col.type}`).run();
            console.log(`✅ Columna ${col.name} agregada`);
        } else {
            console.log(`✅ Columna ${col.name} ya existe`);
        }
    }

    // Verificar tablas críticas
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    console.log('\n📋 Tablas en la base de datos:');
    tables.forEach(t => console.log(`  - ${t.name}`));

    console.log('\n✅ Base de datos actualizada correctamente');
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
} finally {
    db.close();
}
