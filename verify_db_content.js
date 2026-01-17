import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = './data/cocolu.db';
const db = new Database(DB_PATH);

console.log(`Checking database at: ${DB_PATH}`);

try {
    const orders = db.prepare('SELECT * FROM pedidos ORDER BY id DESC LIMIT 5').all();
    console.log(`Found ${orders.length} recent orders:`);

    orders.forEach(o => {
        console.log(`\nOrder #${o.id}:`);
        console.log(`- Date: ${o.fecha_pedido}`);
        console.log(`- Total: ${o.total_usd}`);
        console.log(`- Client: ${o.cliente_nombre} ${o.cliente_apellido}`);
        console.log(`- Raw Row:`, JSON.stringify(o));
    });

} catch (e) {
    console.error('Error reading DB:', e);
}
