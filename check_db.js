
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'cocolu.db');
console.log('Checking DB at:', DB_PATH);

try {
    const db = new Database(DB_PATH);

    // Check Categories
    const categories = db.prepare('SELECT * FROM categorias_producto').all();
    console.log('Categories found:', categories);

    const cat1 = categories.find(c => c.id === 1);
    if (!cat1) {
        console.error('❌ CRITICAL: Category 1 (General) matches null but is MISSING from DB!');
        console.log('Attempting to fix...');
        db.prepare("INSERT INTO categorias_producto (id, nombre, descripcion) VALUES (1, 'General', 'Categoría Default')").run();
        console.log('✅ FIXED: Created Category 1');
    } else {
        console.log('✅ Category 1 exists.');
    }

    // Check Products
    const products = db.prepare('SELECT id, sku, nombre, categoria_id FROM productos').all();
    console.log('Products found:', products);

} catch (err) {
    console.error('Script Error:', err);
}
