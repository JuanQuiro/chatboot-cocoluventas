
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'cocolu.db');
console.log(`Fixing database at: ${DB_PATH}`);

try {
    const db = new Database(DB_PATH);

    const createSellersTable = `
    CREATE TABLE IF NOT EXISTS sellers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password TEXT,
        active INTEGER DEFAULT 1,
        status TEXT DEFAULT 'offline',
        specialty TEXT DEFAULT 'general',
        max_clients INTEGER DEFAULT 50,
        current_clients INTEGER DEFAULT 0,
        rating REAL DEFAULT 5.0,
        work_schedule TEXT,
        days_off TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `;

    db.exec(createSellersTable);
    console.log('✅ Created sellers table successfully');

    // Verify
    const sellers = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sellers'").get();
    if (sellers) {
        console.log('✅ Verified: sellers table exists');
    } else {
        console.error('❌ Failed to verify sellers table creation');
    }

    db.close();
} catch (error) {
    console.error('Database fix failed:', error);
}
