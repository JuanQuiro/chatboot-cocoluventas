import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'cocolu.db');
const db = new Database(dbPath);

console.log('--- Creating Test Sale (Today) ---');

try {
    const now = new Date().toISOString(); // UTC
    // create a fake order
    const stmt = db.prepare(`
        INSERT INTO pedidos (
            cliente_id, cliente_cedula, cliente_nombre, cliente_apellido, cliente_telefono,
            subtotal_usd, total_usd, 
            metodo_pago, tasa_bcv, estado_entrega, 
            fecha_pedido, created_at, updated_at
        ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?,
            ?, ?, ?,
            ?, ?, ?
        )
    `);

    const info = stmt.run(
        1, '30391154', 'Test', 'User', '04240000000',
        100, 100,
        'efectivo', 36.5, 'entregado',
        now, now.replace('T', ' ').split('.')[0], now.replace('T', ' ').split('.')[0]
    );

    console.log(`Created order ID: ${info.lastInsertRowid} at ${now}`);

} catch (error) {
    console.error('Error:', error.message);
}
