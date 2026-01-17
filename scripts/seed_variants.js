import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
// Using absolute path or relative to script location
const DB_PATH = path.join(__dirname, '../database.sqlite');
const SQL_PATH = path.join(__dirname, '../migrations/003_seed_test_variants.sql');

console.log('🌱 Seeding Test Data for Variants System...');
console.log(`📂 Database: ${DB_PATH}`);
console.log(`📄 SQL File: ${SQL_PATH}`);

try {
    const db = new Database(DB_PATH);
    const seedSql = fs.readFileSync(SQL_PATH, 'utf8');

    // Split and execute statements one by one for safety/better error reporting
    const statements = seedSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    db.transaction(() => {
        for (const stmt of statements) {
            db.exec(stmt);
        }
    })();

    console.log(`✅ Success! Executed ${statements.length} SQL statements.`);
    console.log('   - Manufacturers created.');
    console.log('   - Base Products created.');
    console.log('   - Variants (Standard, Premium, Luxury) created.');

    db.close();

} catch (error) {
    console.error('❌ Error executing seed script:', error);
    process.exit(1);
}
