import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../database.sqlite');
const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

console.log('🚀 Running Full Migration & Seed Sequence...');
console.log(`📂 Database: ${DB_PATH}`);

try {
    const db = new Database(DB_PATH);

    const files = [
        '001_create_variants_system.sql',
        '002_seed_providers.sql',
        '003_seed_test_variants.sql',
        '004_create_variants_stock_log.sql',
        '005_strict_constraints.sql'
    ];

    db.transaction(() => {
        for (const file of files) {
            const filePath = path.join(MIGRATIONS_DIR, file);
            console.log(`\n📄 Executing ${file}...`);

            if (fs.existsSync(filePath)) {
                const sql = fs.readFileSync(filePath, 'utf8');
                try {
                    db.exec(sql);
                    console.log(`   ✅ ${file} completed.`);
                } catch (e) {
                    // Fail hard for "Rigid" mode if it's not a benign constraint violation
                    const isBenign =
                        e.message.includes('already exists') ||
                        e.message.includes('UNIQUE constraint failed') ||
                        e.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
                        e.code === 'SQLITE_CONSTRAINT_PRIMARYKEY';

                    if (!isBenign) {
                        console.error(`   ❌ Error in ${file}: [${e.code}] ${e.message}`);
                        throw e; // Abort transaction
                    } else {
                        console.warn(`   ⚠️ Warning in ${file} (Skipped): [${e.code}] ${e.message}`);
                    }
                }
            } else {
                console.error(`   ❌ File not found: ${filePath}`);
            }
        }
    })();

    console.log('\n✨ All migrations and seeds executed successfully!');
    db.close();

} catch (error) {
    console.error('❌ Critical Error during migration:', error);
    process.exit(1);
}
