import commissionsService from '../src/services/commissions.service.js';
import sellersService from '../src/services/sellers.service.js';
import databaseService from '../src/config/database.service.js';

// Mock the seller service
sellersService.getById = async (id) => {
    return { id, commission_rate: 10, name: 'Test Seller' }; // 10%
};

async function updateConfig(key, value) {
    const db = databaseService.getDatabase();
    db.prepare('UPDATE meta_config SET value = ? WHERE key = ?').run(value, key);
}

async function runTest() {
    console.log('🧪 Testing Configurable Commission Logic...\n');
    console.log('Scenario: Selling Luxury Phone ($1000 Price, $950 Cost, $50 Profit)');
    console.log('Standard 10% Commission would be $100 (Loss of $50)');

    // Test Item
    const orderData = {
        total_usd: 1000,
        productos: [
            { nombre: 'Luxury Phone', precio_unitario: 1000, cantidad: 1, costo_usd: 950 }
        ]
    };

    // 1. Default Config (Smart Mode, 50% Cap)
    await updateConfig('COMMISSION_MODE', 'smart');
    await updateConfig('COMMISSION_MAX_PROFIT_SHARE', '50');
    const comm1 = await commissionsService.calculateOrderCommission(orderData, 1);
    console.log(`\n[Test 1] Mode: Smart, Cap: 50%`);
    console.log(`Expected: $25 (50% of $50 profit)`);
    console.log(`Actual:   $${comm1}`);
    if (comm1 === 25) console.log('✅ PASS'); else console.error('❌ FAIL');

    // 2. Aggressive Config (Smart Mode, 10% Cap - e.g. Admin wants to be stingy)
    await updateConfig('COMMISSION_MAX_PROFIT_SHARE', '10');
    const comm2 = await commissionsService.calculateOrderCommission(orderData, 1);
    console.log(`\n[Test 2] Mode: Smart, Cap: 10%`);
    console.log(`Expected: $5 (10% of $50 profit)`);
    console.log(`Actual:   $${comm2}`);
    if (comm2 === 5) console.log('✅ PASS'); else console.error('❌ FAIL');

    // 3. User Override (Standard Mode - Disable Smart Logic)
    await updateConfig('COMMISSION_MODE', 'standard');
    const comm3 = await commissionsService.calculateOrderCommission(orderData, 1);
    console.log(`\n[Test 3] Mode: Standard (User Disabled "Smart")`);
    console.log(`Expected: $100 (10% of Revenue - The Trap!)`);
    console.log(`Actual:   $${comm3}`);
    if (comm3 === 100) console.log('✅ PASS'); else console.error('❌ FAIL');

    // Restore Default
    await updateConfig('COMMISSION_MODE', 'smart');
    await updateConfig('COMMISSION_MAX_PROFIT_SHARE', '50');
    console.log('\n🔄 Defaults restored.');
}

runTest();
