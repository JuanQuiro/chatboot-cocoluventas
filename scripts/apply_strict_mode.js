import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolves to C:\Users\grana\chatboot-cocoluventas\data\cocolu.db
const DB_PATH = path.join(__dirname, '../data/cocolu.db');
const MIGRATION_PATH = path.join(__dirname, '../migrations/005_strict_constraints.sql');

console.log('🔥 Applying Strict Mode Constraints...');
console.log('📂 Target DB:', DB_PATH);

if (!fs.existsSync(DB_PATH)) {
    console.error('❌ Database file does not exist at path!');
    process.exit(1);
}

try {
    const db = new Database(DB_PATH, { fileMustExist: true });

    // Debug: List tables to confirm we are in the right DB
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('📊 Tables found:', tables.map(t => t.name).join(', '));

    const sql = fs.readFileSync(MIGRATION_PATH, 'utf8');

    // Execute
    db.exec(sql);

    console.log('✅ Strict Constraints Applied Successfully!');
    db.close();
} catch (error) {
    if (error.message && error.message.includes('already exists')) {
        console.log('✅ strict constraints already active (skipped)');
    } else {
        console.error('❌ Failed to apply strict constraints:', error.message);
        // Clean error object for logging
        const errObj = {};
        Object.getOwnPropertyNames(error).forEach(key => {
            errObj[key] = error[key];
        });
        console.error('Full Error:', JSON.stringify(errObj, null, 2));
        process.exit(1);
    }
}
