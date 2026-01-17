import databaseService from './src/config/database.service.js';

function debugClients() {
    console.log('--- DIAGNOSING CLIENT REPORTS ---');
    const db = databaseService.getDatabase();

    // 1. Check a few orders
    console.log('Checking recent orders...');
    const orders = db.prepare('SELECT id, cliente_id, total_usd FROM pedidos ORDER BY created_at DESC LIMIT 5').all();
    console.log('Orders sample:', JSON.stringify(orders, null, 2));

    // 2. Check if those client_ids exist
    if (orders.length > 0) {
        const clientIds = orders.map(o => o.cliente_id).filter(id => id);
        if (clientIds.length > 0) {
            console.log(`Checking clients for IDs: ${clientIds.join(',')}`);
            // Fix: Use separate placeholders for the array
            const placeholders = clientIds.map(() => '?').join(',');
            const clients = db.prepare(`SELECT id, nombre, apellido FROM clientes WHERE id IN (${placeholders})`).all(...clientIds);
            console.log('Found clients:', JSON.stringify(clients, null, 2));
        } else {
            console.log('WARNING: Sample orders have NO cliente_id!');
        }
    }

    // 3. Run the failing query logic specifically
    console.log('Running Top Clients query logic...');
    const topClients = db.prepare(`
        SELECT 
            c.id, c.nombre, c.apellido,
            COALESCE(SUM(p.total_usd), 0) as total_spent,
            COUNT(p.id) as purchase_count
        FROM clientes c
        LEFT JOIN pedidos p ON c.id = p.cliente_id
        WHERE c.activo = 1
        GROUP BY c.id
        ORDER BY total_spent DESC
        LIMIT 5
    `).all();
    console.log('Top Clients Result:', JSON.stringify(topClients, null, 2));
}

debugClients();
