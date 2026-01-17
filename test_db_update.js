
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'cocolu.db');
console.log('Test Update DB at:', DB_PATH);

try {
    const db = new Database(DB_PATH);

    const id = 5;
    const sku = 'TEST-SKU-123';

    console.log('Attempting UPDATE on ID:', id);

    const stmt = db.prepare(`
            UPDATE productos 
            SET nombre = ?, 
                descripcion = ?, 
                precio_usd = ?, 
                stock_actual = ?,
                stock_minimo = ?,
                stock_maximo = ?,
                categoria_id = ?,
                sku = ?
            WHERE id = ?
    `);

    // Simulate data
    const info = stmt.run(
        'Updated Name', // nombre
        'Updated Desc', // descripcion
        100.50,         // precio
        10,             // stock
        5,              // min
        1000,           // max
        1,              // category_id
        sku,            // sku
        id              // id
    );

    console.log('✅ Update Success:', info);

} catch (err) {
    console.error('❌ Update Failed:', err);
}
