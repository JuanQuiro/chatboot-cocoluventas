import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'src', 'data', 'cocolu.db');
const db = new Database(dbPath);

console.log('Checking instagram column in clientes...');
try {
    const tableInfo = db.prepare("PRAGMA table_info(clientes)").all();
    const hasInstagram = tableInfo.some(col => col.name === 'instagram');
    console.log(`Instagram column exists: ${hasInstagram}`);
    if (!hasInstagram) {
        console.log('Available columns:', tableInfo.map(c => c.name).join(', '));
    }
} catch (error) {
    console.error('Error checking schema:', error);
}
