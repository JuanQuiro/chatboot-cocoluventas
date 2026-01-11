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

console.log("🔥 APPLYING EXTERNAL SCHEMA FIX...");

const FIX_SCRIPT = `
import Database from 'better-sqlite3';
import { join } from 'path';

const DB_PATH = '/var/www/cocolu-chatbot/data/cocolu.db';
console.log('Opening DB: ' + DB_PATH);

try {
    const db = new Database(DB_PATH);
    
    // Check columns
    const cols = db.pragma('table_info(users)');
    const hasPass = cols.some(c => c.name === 'password');
    console.log('Has password column? ' + hasPass);
    
    if (!hasPass) {
        console.log('Adding password column...');
        db.prepare('ALTER TABLE users ADD COLUMN password TEXT').run();
        console.log('ALTER TABLE executed.');
    }
    
    // Verify
    const newCols = db.pragma('table_info(users)');
    const passCheck = newCols.some(c => c.name === 'password');
    console.log('Verification: ' + (passCheck ? 'SUCCESS' : 'FAILED'));
    
    db.close();

} catch (e) {
    console.error('ERROR:', e);
}
`;

const conn = new Client();
conn.on("ready", () => {
    const B64 = Buffer.from(FIX_SCRIPT).toString('base64');
    const cmd = `
echo "${B64}" | base64 -d > /var/www/cocolu-chatbot/fix_schema_standalone.js
cd /var/www/cocolu-chatbot/
node fix_schema_standalone.js
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
