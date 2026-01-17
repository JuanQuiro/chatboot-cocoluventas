
import databaseService from './src/config/database.service.js';
import fs from 'fs';

try {
    const db = databaseService.getDatabase();
    console.log('Dumping orders...');
    const orders = db.prepare(`
        SELECT id, total_usd, fecha_pedido, estado_entrega 
        FROM pedidos 
        ORDER BY id DESC 
        LIMIT 20
    `).all();

    fs.writeFileSync('debug_orders.json', JSON.stringify(orders, null, 2));
    console.log('✅ Wrote debug_orders.json');
} catch (e) {
    console.error(e);
}
