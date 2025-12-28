
import orderRepository from './src/repositories/order.repository.js';
import databaseService from './src/config/database.service.js';
import path from 'path';

// Fix DB path
process.env.DB_PATH = path.join(process.cwd(), 'data', 'cocolu.db');

async function testReceivables() {
    try {
        console.log('Testing getPendingByClient...');
        // Use the same method used by paymentsService.getPendingPayments
        const result = orderRepository.getPendingByClient('', { page: 1, limit: 10 });

        console.log('Total Clients Found:', result.total);
        console.log('First 2 Items:', JSON.stringify(result.items.slice(0, 2), null, 2));

        if (result.total === 0) {
            console.log('⚠️ No pending payments found. Checking raw orders...');
            const db = databaseService.getDatabase();
            const rawOrders = db.prepare('SELECT COUNT(*) as count FROM pedidos').get();
            console.log('Total Orders in DB:', rawOrders.count);
        }

    } catch (error) {
        console.error('Error testing receivables:', error);
    }
}

testReceivables();
