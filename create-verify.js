import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'cocolu.db');
console.log('Using DB Path:', dbPath);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL'); // Ensure WAL mode

console.log('--- Creating and Verifying Test Sale ---');

try {
    // 1. Create Sale
    const now = new Date();
    // Force year to be 2026 just in case, but new Date() should follow system time which is 2026.
    const isoString = now.toISOString();

    console.log('Inserting sale with date:', isoString);

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
        1, '30391154', 'Test', 'Auto-Gen', '04241234567',
        250, 250,
        'efectivo', 36.5, 'entregado',
        isoString, isoString.replace('T', ' ').split('.')[0], isoString.replace('T', ' ').split('.')[0]
    );

    console.log(`Created order ID: ${info.lastInsertRowid}`);

    // 2. Verify Insert
    const row = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(info.lastInsertRowid);
    console.log('Retrieved Row:', row);

    // 3. Verify Dashboard Logic
    // Daily
    const daily = db.prepare(`
        SELECT COALESCE(SUM(total_usd), 0) as total, COUNT(*) as count 
        FROM pedidos 
        WHERE date(fecha_pedido) >= date('now', 'localtime') 
        AND estado_entrega != 'anulado'
    `).get();
    console.log('Daily Stats (Localtime):', daily);

    // Explicit Date check
    const dailyExplicit = db.prepare(`
        SELECT COALESCE(SUM(total_usd), 0) as total, COUNT(*) as count 
        FROM pedidos 
        WHERE date(fecha_pedido) >= date(?) 
        AND estado_entrega != 'anulado'
    `).get(isoString);
    console.log('Daily Stats (Explicit Date):', dailyExplicit);

} catch (error) {
    console.error('Error:', error.message);
}
