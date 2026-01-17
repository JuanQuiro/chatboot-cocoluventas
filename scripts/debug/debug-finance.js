import financeService from './src/services/finance.service.js';
import databaseService from './src/config/database.service.js';

async function testIncome() {
    console.log('--- STARTING DIAGNOSTIC ---');
    try {
        const db = databaseService.getDatabase();
        const start = '2026-01-01';
        const end = '2026-01-12';

        // TEST 1: Pedidos
        try {
            console.log('TEST 1: Querying Pedidos...');
            const orders = db.prepare(`
                SELECT SUM(total_usd) as total 
                FROM pedidos 
                WHERE date(fecha_pedido) BETWEEN date(?) AND date(?)
                AND estado_entrega != 'anulado'
            `).get(start, end);
            console.log('✅ Pedidos Sum Result:', JSON.stringify(orders));

            // Inspect individual rows
            const sample = db.prepare(`SELECT id, fecha_pedido, total_usd FROM pedidos WHERE date(fecha_pedido) BETWEEN date(?) AND date(?) LIMIT 5`).all(start, end);
            console.log('🔍 Sample Order Rows:', JSON.stringify(sample, null, 2));

        } catch (e) {
            console.error('❌ Pedidos Failed:', e.message);
        }

        // TEST 2: Ingresos Varios
        try {
            console.log('TEST 2: Querying Ingresos Varios (misc)...');
            // NOTE: I suspect the column is created_at, not fecha. Checking both.
            try {
                const x = db.prepare('SELECT created_at FROM ingresos_varios LIMIT 1').get();
                console.log('✅ Column created_at exists in ingresos_varios');
            } catch (e) { console.log('⚠️ Column created_at MISSING'); }

            const misc = db.prepare(`
                SELECT SUM(monto_usd) as total 
                FROM ingresos_varios 
                WHERE date(created_at) BETWEEN date(?) AND date(?)
            `).get(start, end);
            console.log('✅ Misc Result:', JSON.stringify(misc));
        } catch (e) {
            console.error('❌ Misc Failed:', e.message);
        }

    } catch (e) {
        console.error('CRITICAL INIT FAILURE:', e);
    }
    console.log('--- DIAGNOSTIC COMPLETE ---');
}

testIncome();
