import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../data/cocolu.db');
const MIGRATION_PATH = path.join(__dirname, '../migrations/009_traceability.sql');

console.log('🔍 Applying Traceability Schema Value...');

if (!fs.existsSync(DB_PATH)) {
    console.error('❌ Database file does not exist!');
    process.exit(1);
}

const db = new Database(DB_PATH, { fileMustExist: true });
const sql = fs.readFileSync(MIGRATION_PATH, 'utf8');

try {
    db.exec(sql);
    console.log(`✅ Traceability Schema Applied!`);
} catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log('⚠️ Migration partially applied already. Skipping.');
    } else {
        console.error('❌ Failed to apply traceability:', error.message);
    }
} finally {
    db.close();
}
