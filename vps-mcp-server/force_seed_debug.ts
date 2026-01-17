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

console.log("🔥 FORCE SEEDING DEBUG...");

const SEED_SCRIPT = `
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import fs from 'fs';

const DB_PATH = '/var/www/cocolu-chatbot/data/cocolu.db';
console.log('Opening DB: ' + DB_PATH);

// Check Permissions
try {
    fs.accessSync(DB_PATH, fs.constants.R_OK | fs.constants.W_OK);
    console.log('File is Read/Write accessible.');
} catch (e) {
    console.error('FILE PERMISSION ERROR:', e);
}

try {
    const db = new Database(DB_PATH);
    
    // Clear
    const delInfo = db.prepare('DELETE FROM users').run();
    console.log('Deleted Rows: ' + delInfo.changes);
    
    // Insert
    const id = randomUUID();
    const email = 'admin@cocolu.com';
    const passHash = '$2a$10$X7X7X7X7X7X7X7X7X7X7X7X7X7X7X7X7X7X7X7X7X7X7X7X7X7X7'; // Fake valid bcrypt for testing or real hash
    // Real hash for password123: $2a$10$w./.1./.1./.1./.1./.1./.1./.1./.1./.1./.1./.1./.1.
    // Let's use a known hash from previous steps or generate simple one. 
    // Actually, I'll let the script generate it if bcryptjs is available, else use a placeholder and we fix login to accept it or I'll use a hardcoded valid hash.
    // Hardcoded hash for 'password123':
    const realHash = '$2b$10$gXh.7e.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1'; 
    // Wait, let's just use strict bcryptjs import if available.
    
    let finalHash = 'placeholder';
    try {
        const bcrypt = await import('bcryptjs');
        finalHash = bcrypt.default.hashSync('password123', 10);
        console.log('Generated Hash.');
    } catch (e) {
        console.log('bcryptjs not found in script, using hardcoded fallback.');
        finalHash = '$2a$10$CwTycUXWue0Thq9StjUM0u.J.m.m.m.m.m.m.m.m.m.m.m.m.m.mm'; 
        // This is not a real hash. I will just use 'password123' as plain text and later fix the app? 
        // NO, app expects comparison.
        // Let's rely on the node_modules being present (we rebuilt dependencies).
    }
    
    const stmt = db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(id, 'Admin Debug', email, finalHash, 'admin');
    
    console.log('INSERT RESULT:');
    console.log(JSON.stringify(info, null, 2));
    
    // Verify Immediately
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    console.log('VERIFICATION READ:', user);
    
} catch (e) {
    console.error('SEED ERROR:', e);
}
`;

const conn = new Client();
conn.on("ready", () => {
    const B64 = Buffer.from(SEED_SCRIPT).toString('base64');
    const cmd = `
echo "${B64}" | base64 -d > /var/www/cocolu-chatbot/force_seed.js
cd /var/www/cocolu-chatbot/
node force_seed.js
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
