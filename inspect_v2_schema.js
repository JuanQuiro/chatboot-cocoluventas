import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'data', 'cocolu.db');
const db = new Database(dbPath);

console.log(`\n📊 Database: ${dbPath}`);

// Get all tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

console.log(`\nFound ${tables.length} tables:`);
tables.forEach(t => console.log(` - ${t.name}`));

const tablesToInspect = [
    'pedidos',
    'clientes',
    'productos',
    'movimientos_stock',
    'abonos',
    'ingresos_varios',
    'detalle_pedidos' // checking for product relations
];

console.log('\n🔍 Detailed Schema Inspection:');

tablesToInspect.forEach(tableName => {
    // Check if table exists
    const exists = tables.find(t => t.name === tableName);
    if (exists) {
        console.log(`\nTable: [${tableName}]`);
        const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
        columns.forEach(col => {
            console.log(`   - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
        });
    } else {
        console.log(`\nTable: [${tableName}] - NOT FOUND (Need to create or identify alias)`);
    }
});

db.close();
