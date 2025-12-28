import orderRepository from './src/repositories/order.repository.js';
import databaseService from './src/config/database.service.js';
import dotenv from 'dotenv';
import path from 'path';

// Fix for imports if needed
dotenv.config();

// Ensure DB path is correct for the script context
// Adjust databaseService to force load for debug script if needed, 
// usually it picks up checks.

async function verify() {
    try {
        console.log('--- Debugging Report Statistics ---');
        console.log('Database Path:', databaseService.dbPath);

        const stats = orderRepository.getReceivableStatistics();
        console.log('Raw Stats Result:', JSON.stringify(stats, null, 2));

        if (stats.totalSales === 0) {
            console.warn('⚠️ Warning: Total Sales is 0. Checking database content...');
            const db = databaseService.getDatabase();
            const sample = db.prepare('SELECT id, total_usd FROM pedidos LIMIT 5').all();
            console.log('Sample Pedidos:', sample);
        } else {
            console.log('✅ Stats look populated.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

verify();
