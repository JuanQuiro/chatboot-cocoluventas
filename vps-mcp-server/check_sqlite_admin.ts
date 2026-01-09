
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'cocolu.db');
console.log(`Checking SQLite DB at ${DB_PATH}...`);

try {
    const db = new Database(DB_PATH, { verbose: console.log });
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@cocolu.com');

    if (user) {
        console.log('✅ Admin User FOUND:', user);
    } else {
        console.log('❌ Admin User NOT FOUND');
    }
} catch (err) {
    console.error('❌ Error reading DB:', err);
}
