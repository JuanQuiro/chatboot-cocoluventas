import commissionsService from '../src/services/commissions.service.js';
import sellersService from '../src/services/sellers.service.js';

// Mock the seller service to return a fixed rate
sellersService.getById = async (id) => {
    return { id, commission_rate: 10, name: 'Test Seller' }; // 10% Commission Rate
};

async function runTest() {
    console.log('🧪 Testing Smart Commission Logic...\n');

    // Case 1: High Margin Item (Standard Behavior)
    // Price: $100, Cost: $10. Profit: $90.
    // Standard Commission (10%): $10.
    // Cap (50% of Profit): $45.
    // Result should be $10 (Standard is lower than cap).
    const highMarginOrder = {
        total_usd: 100,
        productos: [
            { nombre: 'Cheap Cable', precio_unitario: 100, cantidad: 1, costo_usd: 10 }
        ]
    };

    const commHigh = await commissionsService.calculateOrderCommission(highMarginOrder, 1);
    console.log(`CASE 1 [High Margin]: Price $100, Cost $10 -> Profit $90`);
    console.log(`   Expected: $10 (10% of Revenue)`);
    console.log(`   Actual:   $${commHigh}`);
    if (commHigh === 10) console.log('   ✅ PASS'); else console.error('   ❌ FAIL');

    // Case 2: Low Margin / Luxury Item (The Trap)
    // Price: $1000, Cost: $950. Profit: $50.
    // Standard Commission (10%): $100. (LOSS of $50!!)
    // Cap (50% of Profit): $25.
    // Result should be $25 (Cap is lower than standard).
    const lowMarginOrder = {
        total_usd: 1000,
        productos: [
            { nombre: 'Luxury Phone', precio_unitario: 1000, cantidad: 1, costo_usd: 950 }
        ]
    };

    const commLow = await commissionsService.calculateOrderCommission(lowMarginOrder, 1);
    console.log(`\nCASE 2 [Low Margin]: Price $1000, Cost $950 -> Profit $50`);
    console.log(`   Expected: $25 (Capped at 50% of Profit)`);
    console.log(`   Actual:   $${commLow}`);
    if (commLow === 25) console.log('   ✅ PASS'); else console.error('   ❌ FAIL');
}

runTest();
