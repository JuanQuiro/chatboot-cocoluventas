import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../data/cocolu.db');
const MIGRATION_PATH = path.join(__dirname, '../migrations/007_seed_commission_config.sql');

console.log('⚙️ Applying Commission Configuration...');

if (!fs.existsSync(DB_PATH)) {
    console.error('❌ Database file does not exist!');
    process.exit(1);
}

const db = new Database(DB_PATH, { fileMustExist: true });
const sql = fs.readFileSync(MIGRATION_PATH, 'utf8');

// Simple execution since these are INSERT OR IGNORE
try {
    const statements = sql.split(';').filter(s => s.trim());
    let applied = 0;

    db.transaction(() => {
        for (const stmt of statements) {
            if (stmt.trim()) {
                db.prepare(stmt).run();
                applied++;
            }
        }
    })();

    console.log(`✅ Configuration Applied! (${applied} statements executed)`);
} catch (error) {
    console.error('❌ Failed to seed config:', error.message);
} finally {
    db.close();
}
