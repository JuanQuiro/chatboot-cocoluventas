import logisticsService from '../src/services/logistics.service.js';
import databaseService from '../src/config/database.service.js';

// Setup Mock Data directly in tables for test
function seedLogisticsData() {
    const db = databaseService.getDatabase();

    // 1. Ensure Locations exist
    db.prepare("INSERT OR IGNORE INTO locations (name, code, lead_time_days) VALUES ('Loc1', 'L1', 0)").run(); // Local
    db.prepare("INSERT OR IGNORE INTO locations (name, code, lead_time_days) VALUES ('Loc2', 'L2', 14)").run(); // China

    const loc1 = db.prepare("SELECT id FROM locations WHERE code = 'L1'").get().id;
    const loc2 = db.prepare("SELECT id FROM locations WHERE code = 'L2'").get().id;

    // 2. Mock Variant (ID 9999) - Ensure Parents Exist
    try {
        db.prepare("INSERT OR IGNORE INTO productos_base (id, nombre, categoria_id) VALUES (9999, 'Test Base', 1)").run();
        db.prepare("INSERT OR IGNORE INTO proveedores (id, nombre, pais) VALUES (9999, 'Test Prov', 'CN')").run();
        db.prepare("INSERT OR REPLACE INTO productos_variantes (id, producto_base_id, proveedor_id, nivel_calidad, precio_venta_usd) VALUES (9999, 9999, 9999, 'estandar', 10)").run();

        // Clear stock for clean test
        db.prepare("DELETE FROM variant_stock_locations WHERE variante_id = 9999").run();

        // Scenario: 5 Local, 10 China.
        db.prepare("INSERT INTO variant_stock_locations (variante_id, location_id, quantity) VALUES (9999, ?, 5)").run(loc1);
        db.prepare("INSERT INTO variant_stock_locations (variante_id, location_id, quantity) VALUES (9999, ?, 10)").run(loc2);

        console.log('✅ logistics test data seeded.');
        return { loc1, loc2 };
    } catch (err) {
        console.warn('Skipping seed, table might check FK', err.message);
        return null;
    }
}

async function testLogistics() {
    console.log('🧪 Testing Logistics Engine...');

    // Attempt seed
    seedLogisticsData();

    // TEST 1: Request 3 items (Should fit in Local)
    // Expect: Max Lead Time = 0
    const res1 = logisticsService.findStockSources(9999, 3);
    console.log(`\n[Test 1] Request 3 items (Available Local: 5)`);
    console.log(`Lead Time: ${res1.max_lead_time} days (Expected 0)`);
    console.log(`Allocation:`, res1.allocation.map(a => `${a.code}:${a.taken}`));

    // TEST 2: Request 7 items (5 Local + 2 China)
    // Expect: Max Lead Time = 14
    const res2 = logisticsService.findStockSources(9999, 7);
    console.log(`\n[Test 2] Request 7 items (5 Local + 2 China)`);
    console.log(`Lead Time: ${res2.max_lead_time} days (Expected 14)`);
    console.log(`Allocation:`, res2.allocation.map(a => `${a.code}:${a.taken}`));

    // TEST 3: Calculate Date
    const date = logisticsService.calculateDeliveryDate(res2.max_lead_time);
    console.log(`\n[Test 3] Calculated Date: ${date} (Today + ${res2.max_lead_time} days)`);
}

testLogistics();
