
import databaseService from './src/config/database.service.js';
import path from 'path';

process.env.DB_PATH = path.join(process.cwd(), 'data', 'cocolu.db');

async function debugOrders() {
    try {
        const db = databaseService.getDatabase();
        const orders = db.prepare(`
            SELECT id, cliente_id, total_usd, total_abono_usd, estado_entrega 
            FROM pedidos 
            LIMIT 20
        `).all();

        console.log('--- Orders Dump ---');
        console.table(orders);

        // Check the specific query used in getPendingByClient manually
        const grouped = db.prepare(`
            SELECT 
                p.cliente_id,
                COUNT(p.id) as pending_orders,
                SUM(p.total_usd) as total_sales,
                SUM(COALESCE(p.total_abono_usd, 0)) as total_paid,
                SUM(p.total_usd - COALESCE(p.total_abono_usd, 0)) as total_pending
            FROM pedidos p
            WHERE (p.total_usd - COALESCE(p.total_abono_usd, 0)) > 0.01
            GROUP BY p.cliente_id
        `).all();

        console.log('--- Grouped Result (Manual Query) ---');
        console.table(grouped);

    } catch (error) {
        console.error(error);
    }
}

debugOrders();
