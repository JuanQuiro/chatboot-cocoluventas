import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolves to active DB
const DB_PATH = path.join(__dirname, '../data/cocolu.db');
const MIGRATION_PATH = path.join(__dirname, '../migrations/006_deep_hardening.sql');

console.log('🔥 Applying DEEP Hardening (Indexes & Triggers)...');
console.log('📂 Target DB:', DB_PATH);

if (!fs.existsSync(DB_PATH)) {
    console.error('❌ Database file does not exist at path!');
    process.exit(1);
}

try {
    const db = new Database(DB_PATH, { fileMustExist: true });

    const sql = fs.readFileSync(MIGRATION_PATH, 'utf8');

    // Execute
    db.exec(sql);

    console.log('✅ Deep Hardening Applied Successfully!');
    console.log('   - Indexes created');
    console.log('   - variante_id column added');
    console.log('   - Financial Integrity Triggers installed');
    db.close();
} catch (error) {
    if (error.message && (error.message.includes('duplicate column') || error.message.includes('already exists'))) {
        console.log('✅ Deep hardening already active (skipped parts)');
    } else {
        console.error('❌ Failed to apply deep hardening:', error.message);
        const errObj = {};
        Object.getOwnPropertyNames(error).forEach(key => {
            errObj[key] = error[key];
        });
        console.error('Full Error:', JSON.stringify(errObj, null, 2));
        process.exit(1);
    }
}
