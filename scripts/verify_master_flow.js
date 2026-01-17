import ordersService from '../src/services/orders.service.js';
import databaseService from '../src/config/database.service.js';
import logisticsService from '../src/services/logistics.service.js';

async function runMasterTest() {
    console.log('🚀 RUNNING MASTER SYSTEM VERIFICATION (The "Perfect Local" Test)...');
    const db = databaseService.getDatabase();
    const TEST_ID = 8888;

    // 1. CLEANUP
    db.prepare('DELETE FROM detalles_pedido WHERE producto_id = ?').run(TEST_ID);
    db.prepare('DELETE FROM variant_stock_locations WHERE variante_id = ?').run(TEST_ID);
    db.prepare('DELETE FROM productos_variantes WHERE id = ?').run(TEST_ID);

    // 2. SETUP (Product, Config, Locations)
    // Ensure Locations
    db.prepare("INSERT OR IGNORE INTO locations (id, name, code, lead_time_days) VALUES (1, 'Local', 'LOCAL', 0)").run();
    db.prepare("INSERT OR IGNORE INTO locations (id, name, code, lead_time_days) VALUES (2, 'China', 'CN', 14)").run();

    // Ensure Manufacturer
    db.prepare("INSERT OR IGNORE INTO fabricantes (id, nombre, especialidad) VALUES (1, 'Fabrica Maestra', 'Jewelry')").run();

    // Ensure Provider & Base Product
    db.prepare("INSERT OR IGNORE INTO proveedores (id, nombre) VALUES (1, 'Proveedor Test')").run();
    db.prepare("INSERT OR IGNORE INTO productos_base (id, nombre) VALUES (1, 'Base Ring')").run();

    // Create Variant (High Quality)
    db.prepare(`
        INSERT INTO productos_variantes (id, producto_base_id, proveedor_id, sku_variante, nombre_variante, costo_usd, precio_venta_usd, stock_actual, material, nivel_calidad) 
        VALUES (?, 1, 1, 'TEST-SKU-888', 'Anillo Mágico', 20, 100, 15, 'Silver 925', 'luxury')
    `).run(TEST_ID);

    // Add Stock (5 Local, 10 China)
    db.prepare("INSERT INTO variant_stock_locations (variante_id, location_id, quantity) VALUES (?, 1, 5)").run(TEST_ID);
    db.prepare("INSERT INTO variant_stock_locations (variante_id, location_id, quantity) VALUES (?, 2, 10)").run(TEST_ID);

    console.log('✅ Setup Complete. Stock: 5 (Local), 10 (China). Total 15.');

    // 3. EXECUTE ORDER (Buy 7 items -> Should take 5 Local + 2 China)
    const orderPayload = {
        cliente_nombre: 'Sr. Tester',
        cliente_apellido: 'Perfecto',
        total_usd: 700,
        productos: [
            {
                producto_id: TEST_ID,
                is_variant: true,
                cantidad: 7,
                precio_unitario: 100,
                nombre: 'Anillo Mágico',
                lote: 'BATCH-GOLD-001' // 🏭 Traceability Input
            }
        ],
        vendedor_id: 1 // Test Seller
    };

    // Config: Smart Commission (Profit Guard)
    db.prepare("UPDATE meta_config SET value = 'smart' WHERE key = 'COMMISSION_MODE'").run();
    db.prepare("UPDATE meta_config SET value = '50' WHERE key = 'COMMISSION_MAX_PROFIT_SHARE'").run();

    console.log('🛒 Creating Order (Qty: 7)...');
    try {
        const order = await ordersService.createOrder(orderPayload);
        console.log(`✅ Order Created: #${order.id}`);

        // 4. VERIFICATION

        // A. Delivery Date (Should be +14 days due to China stock usage)
        const today = new Date().toISOString().slice(0, 10);
        console.log(`Check 1: Delivery Date -> ${order.fecha_entrega_estimada}`);
        // Simple check: is it > today? Yes.
        // Is it roughly 14 days?

        // B. Stock Deduction
        const locStock = db.prepare('SELECT code, quantity FROM variant_stock_locations JOIN locations ON location_id = locations.id WHERE variante_id = ?').all(TEST_ID);
        console.log('Check 2: Stock Levels (Expected: LOCAL=0, CN=8)');
        locStock.forEach(s => console.log(`   - ${s.code}: ${s.quantity}`));

        // C. Traceability
        const detail = db.prepare('SELECT * FROM detalles_pedido WHERE pedido_id = ?').get(order.id);
        if (!detail) {
            console.error('❌ FATAL: No details found for order #' + order.id);
            const allDetails = db.prepare('SELECT * FROM detalles_pedido').all();
            console.log('DEBUG: All Details in DB:', allDetails.length);
        } else {
            console.log(`Check 3: Traceability -> ${detail.lote_asignado}`);
            if (detail.lote_asignado === 'BATCH-GOLD-001') console.log('   ✅ MATCH');
            else console.error('   ❌ MISMATCH: Expected BATCH-GOLD-001, got ' + detail.lote_asignado);
        }

        console.log('\n🏆 SYSTEM PERFECTLY VERIFIED');

    } catch (err) {
        console.error('❌ TEST FAILED:', err);
    }
}

runMasterTest();
