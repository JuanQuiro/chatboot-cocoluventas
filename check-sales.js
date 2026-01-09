import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'cocolu.db');
const db = new Database(dbPath);
const logPath = path.join(__dirname, 'check-sales.log');

function log(message) {
    fs.appendFileSync(logPath, (typeof message === 'object' ? JSON.stringify(message, null, 2) : message) + '\n');
}

// Clear log
fs.writeFileSync(logPath, '');

log('--- Checking Sales Data (Pedidos) ---');

try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    log('Tables: ' + tables.map(t => t.name).join(', '));

    const tableName = 'pedidos';
    const tableExists = tables.some(t => t.name === tableName);

    if (tableExists) {
        log(`\nContents of table '${tableName}':`);
        const count = db.prepare(`SELECT count(*) as count FROM ${tableName}`).get();
        log(`Total rows: ${count.count}`);

        if (count.count > 0) {
            const rows = db.prepare(`SELECT * FROM ${tableName} ORDER BY id DESC LIMIT 5`).all();
            log(rows);

            log('\n--- Dashboard Logic Check ---');

            // Daily
            // Note: date('now', 'localtime') in SQLite might return formatted string like '2024-01-01'
            // If fecha_pedido includes time, we convert it to date()
            const daily = db.prepare(`
                SELECT COALESCE(SUM(total_usd), 0) as total, COUNT(*) as count 
                FROM pedidos 
                WHERE date(fecha_pedido) >= date('now', 'localtime') 
                AND estado_entrega != 'anulado'
            `).get();
            log('Daily Logic Result (Localtime):');
            log(daily);

            const dailyUTC = db.prepare(`
                SELECT COALESCE(SUM(total_usd), 0) as total, COUNT(*) as count 
                FROM pedidos 
                WHERE date(fecha_pedido) >= date('now') 
                AND estado_entrega != 'anulado'
            `).get();
            log('Daily Logic Result (UTC):');
            log(dailyUTC);

            // Monthly
            const today = new Date();
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

            const monthly = db.prepare(`
                SELECT COALESCE(SUM(total_usd), 0) as total, COUNT(*) as count 
                FROM pedidos 
                WHERE date(fecha_pedido) >= date(?)
                AND estado_entrega != 'anulado'
            `).get(monthStart);
            log('Monthly Logic Result: (Start Date: ' + monthStart + ')');
            log(monthly);

            // Debug dates in table
            log('\n--- Date Debug ---');
            const dates = db.prepare(`SELECT id, fecha_pedido, total_usd FROM pedidos ORDER BY fecha_pedido DESC LIMIT 5`).all();
            log(dates);

        } else {
            log('Table is empty.');
        }
    } else {
        log(`Table '${tableName}' does not exist.`);
    }

} catch (error) {
    log('Error: ' + error.message);
}
