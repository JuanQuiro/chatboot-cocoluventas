import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../data/cocolu.db');

console.log('📊 Verification: Financial Calculations');
console.log(`📂 DB Path: ${dbPath}`);

const db = new Database(dbPath);

// 1. Verify Orders and totalIngresos
console.log('\n--- 1. Orders & Revenue (PaymentsService Simulation) ---');
const orders = db.prepare('SELECT * FROM pedidos').all();
console.log(`📦 Loaded ${orders.length} orders.`);

if (orders.length > 0) {
    const totalVentas = orders.reduce((sum, o) => sum + (o.total_usd || 0), 0);
    const totalCobrado = orders.reduce((sum, o) => sum + (o.total_abono_usd || 0), 0);
    const count = orders.length;
    const averageTicket = totalVentas / count;

    console.log(`✅ Total Sales (total_usd sum): $${totalVentas.toFixed(2)}`);
    console.log(`✅ Total Collected (total_abono_usd sum): $${totalCobrado.toFixed(2)}`);
    console.log(`✅ Order Count: ${count}`);
    console.log(`✅ Average Ticket: $${averageTicket.toFixed(2)}`);

    console.log('\nSample Order Data (First 1):');
    console.log(orders[0]); // Check if fields like total_usd exist
} else {
    console.error('❌ No orders found. Verification failed prematurely.');
}

// 2. Verify Top Products
console.log('\n--- 2. Top Products (ProductRepository Simulation) ---');
try {
    const stmt = db.prepare(`
        SELECT p.nombre as name, p.sku as code, SUM(dp.cantidad) as quantitySold, SUM(dp.cantidad * dp.precio_unitario_usd) as revenue
        FROM detalles_pedido dp
        JOIN productos p ON dp.producto_id = p.id
        GROUP BY p.id
        ORDER BY quantitySold DESC
        LIMIT 5
    `);
    const topProducts = stmt.all();
    console.log(`🏆 Top ${topProducts.length} Products Found:`);
    topProducts.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} (SKU: ${p.code}) - Sold: ${p.quantitySold}, Rev: $${p.revenue?.toFixed(2)}`);
    });

} catch (error) {
    console.error('❌ Error executing Top Products query:', error.message);
}

// 3. Verify Clients
console.log('\n--- 3. Top Clients ---');
try {
    const stmt = db.prepare('SELECT * FROM clientes LIMIT 5').all();
    console.log(`👥 Loaded ${stmt.length} clients sample.`);
} catch (error) {
    console.error('❌ Error loading clients:', error.message);
}

console.log('\n✅ Verification Complete.');
