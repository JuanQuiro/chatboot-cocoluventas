import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(process.cwd(), 'data', 'cocolu.db');

console.log(`🔌 Connecting to database at ${DB_PATH}...`);
const db = new Database(DB_PATH);

try {
    console.log('🔄 Checking for missing columns in "pedidos" table...');

    const tableInfo = db.pragma('table_info(pedidos)');
    const columns = tableInfo.map(col => col.name);

    const columnsToAdd = [
        { name: 'fecha_entrega', type: 'DATETIME', default: 'NULL' },
        { name: 'delivery_notes', type: 'TEXT', default: 'NULL' },
        { name: 'priority', type: 'TEXT', default: "'normal'" }
    ];

    let changesMade = 0;

    columnsToAdd.forEach(col => {
        if (!columns.includes(col.name)) {
            console.log(`➕ Adding column "${col.name}" (${col.type})...`);
            try {
                let sql = `ALTER TABLE pedidos ADD COLUMN ${col.name} ${col.type}`;
                if (col.default !== 'NULL') {
                    sql += ` DEFAULT ${col.default}`;
                }
                db.exec(sql);
                console.log(`✅ Column "${col.name}" added successfully.`);
                changesMade++;
            } catch (err) {
                console.error(`❌ Error adding column "${col.name}":`, err.message);
            }
        } else {
            console.log(`ℹ️ Column "${col.name}" already exists.`);
        }
    });

    if (changesMade > 0) {
        console.log(`🎉 Schema update complete. Added ${changesMade} columns.`);
    } else {
        console.log('👍 No schema changes needed. All columns exist.');
    }

} catch (error) {
    console.error('❌ Critical error updating database:', error);
} finally {
    db.close();
    console.log('🔌 Database connection closed.');
}
