
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'cocolu.db');
console.log(`🔌 Connecting to database at: ${dbPath}`);

if (!fs.existsSync(dbPath)) {
    console.error('❌ Database file not found at:', dbPath);
    process.exit(1);
}

const db = new Database(dbPath);

const columns = [
    { name: 'ciudad', type: 'TEXT' },
    { name: 'tipo_precio', type: "TEXT DEFAULT 'detal'" },
    { name: 'limite_credito', type: 'REAL DEFAULT 0' },
    { name: 'dias_credito', type: 'INTEGER DEFAULT 0' },
    { name: 'instagram', type: 'TEXT' }
];

console.log('🛠️  Starting schema patch...');

columns.forEach(col => {
    try {
        const check = db.prepare(`SELECT ${col.name} FROM clientes LIMIT 1`).get();
        console.log(`✅ Column '${col.name}' already exists.`);
    } catch (e) {
        if (e.message.includes('no such column')) {
            try {
                console.log(`➕ Adding column '${col.name}'...`);
                db.prepare(`ALTER TABLE clientes ADD COLUMN ${col.name} ${col.type}`).run();
                console.log(`   -> Success`);
            } catch (alterError) {
                console.error(`   ❌ Failed to add '${col.name}':`, alterError.message);
            }
        } else {
            console.error(`❌ Error checking '${col.name}':`, e.message);
        }
    }
});

console.log('✨ Schema patch completed.');
