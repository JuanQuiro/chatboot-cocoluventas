import paymentsService from './src/services/payments.service.js';
import databaseService from './src/config/database.service.js';
import path from 'path';

// Fix DB path similar to other scripts
process.env.DB_PATH = path.join(process.cwd(), 'data', 'cocolu.db');

async function testStats() {
    try {
        console.log('Testing getGlobalIncomeStats...');
        const stats = await paymentsService.getGlobalIncomeStats();
        console.log('Stats Result:', stats);
    } catch (error) {
        console.error('Error testing stats:', error);
    }
}

testStats();
