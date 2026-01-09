
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'cocolu.db');
console.log('Checking DB at:', dbPath);
try {
    const db = new Database(dbPath, { readonly: true });
    const info = db.pragma('table_info(clientes)');
    console.log('Columns in clients table:');
    info.forEach(col => console.log(`- ${col.name} (${col.type})`));
} catch (error) {
    console.error('Error opening DB:', error);
}
