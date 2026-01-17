import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(process.cwd(), 'data', 'cocolu.db');

console.log(`📊 Connecting to database: ${DB_PATH}\n`);

const db = new Database(DB_PATH);

// Get all sellers
const sellers = db.prepare('SELECT id, name, email, days_off, work_schedule FROM sellers').all();

console.log(`Found ${sellers.length} sellers:\n`);

sellers.forEach(seller => {
    console.log(`Seller ID: ${seller.id}`);
    console.log(`Name: ${seller.name}`);
    console.log(`Email: ${seller.email}`);
    console.log(`days_off (raw): "${seller.days_off}"`);
    console.log(`days_off (type): ${typeof seller.days_off}`);
    console.log(`work_schedule (raw): "${seller.work_schedule}"`);

    let needsFix = false;

    // Check days_off
    if (seller.days_off) {
        try {
            const parsed = JSON.parse(seller.days_off);
            console.log(`✅ days_off is valid JSON:`, parsed);
        } catch (e) {
            console.log(`❌ days_off is INVALID JSON: ${e.message}`);
            needsFix = true;
        }
    } else {
        console.log(`⚠️ days_off is NULL or empty`);
        needsFix = true;
    }

    // Check work_schedule
    if (seller.work_schedule) {
        try {
            const parsed = JSON.parse(seller.work_schedule);
            console.log(`✅ work_schedule is valid JSON:`, parsed);
        } catch (e) {
            console.log(`❌ work_schedule is INVALID JSON: ${e.message}`);
            needsFix = true;
        }
    } else {
        console.log(`⚠️ work_schedule is NULL or empty`);
    }

    if (needsFix) {
        console.log(`\n🔧 Fixing seller ${seller.id}...`);
        db.prepare('UPDATE sellers SET days_off = ?, work_schedule = ? WHERE id = ?')
            .run('[]', '{}', seller.id);
        console.log(`✅ Fixed!`);
    }

    console.log('---\n');
});

// Verify fix
console.log('\n✅ Verification after fix:');
const sellersAfter = db.prepare('SELECT id, name, days_off, work_schedule FROM sellers').all();
sellersAfter.forEach(s => {
    console.log(`${s.name}:`);
    console.log(`  days_off = ${s.days_off}`);
    console.log(`  work_schedule = ${s.work_schedule}`);
});

db.close();
console.log('\n✅ Done! Please restart your application.');
