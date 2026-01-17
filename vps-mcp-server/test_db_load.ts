import { Client } from "ssh2";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
    readyTimeout: 60000,
};

console.log("🕵️ TESTING DB MODULE LOAD...");

const conn = new Client();
conn.on("ready", () => {
    // Create a simple test file
    const TEST_CODE = `
import { getDb } from './src/api/lib/db.js';
console.log('Attempts to load DB...');
try {
    const db = getDb();
    console.log('✅ DB Loaded: ' + (db ? 'OK' : 'NULL'));
    const rows = db.prepare('SELECT 1 as val').get();
    console.log('✅ Query Result: ' + JSON.stringify(rows));
} catch (e) {
    console.error('❌ DB LOAD ERROR:', e);
}
    `;
    const B64 = Buffer.from(TEST_CODE).toString('base64');

    const cmd = `
echo "${B64}" | base64 -d > /var/www/cocolu-chatbot/test_db_load.js
cd /var/www/cocolu-chatbot/
node test_db_load.js
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
