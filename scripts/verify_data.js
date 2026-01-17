import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../data/cocolu.db');

console.log('🔍 Diagnostic: Verifying Database Data');
console.log(`📂 Target DB Path: ${dbPath}`);

if (!fs.existsSync(dbPath)) {
    console.error('❌ Database file NOT FOUND at expected path!');
    process.exit(1);
}

try {
    const db = new Database(dbPath);

    const orders = db.prepare('SELECT COUNT(*) as count FROM pedidos').get();
    console.log(`📦 Orders (pedidos): ${orders.count}`);

    const details = db.prepare('SELECT COUNT(*) as count FROM detalles_pedido').get();
    console.log(`📄 Order Details (detalles_pedido): ${details.count}`);

    const incomings = db.prepare('SELECT COUNT(*) as count FROM ingresos_varios').get();
    console.log(`💰 Income (ingresos_varios): ${incomings.count}`);

    const payments = db.prepare('SELECT COUNT(*) as count FROM abonos').get();
    console.log(`💳 Payments (abonos): ${payments.count}`);

    if (orders.count > 0) {
        console.log('✅ Data exists! The issue is in the API/Query logic.');
        // Print sample order
        const sample = db.prepare('SELECT * FROM pedidos LIMIT 1').get();
        console.log('Sample Order:', sample);
    } else {
        console.log('⚠️ Database is essentially EMPTY of orders.');
    }

} catch (error) {
    console.error('❌ Error assessing database:', error);
}
