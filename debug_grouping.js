import Database from 'better-sqlite3';
import path from 'path';

// CORRECT DB PATH based on src/config/database.service.js
const dbPath = path.resolve('c:/Users/grana/chatboot-cocoluventas/data/cocolu.db');
const db = new Database(dbPath);

const query = `
    SELECT 
        p.id, 
        p.cliente_id, 
        p.cliente_nombre, 
        p.cliente_apellido,
        p.total_usd,
        p.estado_entrega
    FROM pedidos p
    WHERE p.cliente_nombre LIKE '%asas%'
    LIMIT 20
`;

try {
    const rows = db.prepare(query).all();
    console.log("Found rows for 'asas':");
    console.table(rows);

    // Check distinct client IDs
    const distinctIds = [...new Set(rows.map(r => r.cliente_id))];
    console.log("Distinct Client IDs:", distinctIds);
} catch (err) {
    console.error(err);
}
