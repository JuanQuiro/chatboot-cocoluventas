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

console.log("🕵️ DEBUGGING ADMIN INSERTION...");

const DEBUG_SCRIPT = `
import { getDb } from './src/api/lib/db.js';
import bcrypt from 'bcrypt';

const db = getDb();
const EMAIL = 'admin@cocolu.com';

console.log('--- SCHEMA INFO ---');
const cols = db.pragma('table_info(users)');
console.log(JSON.stringify(cols));

console.log('--- CURRENT COUNT ---');
const count = db.prepare('SELECT COUNT(*) as c FROM users').get();
console.log('Total Users: ' + count.c);

console.log('--- ATTEMPTING INSERT ---');
try {
   const hash = bcrypt.hashSync('password123', 10);
   // Check if exists
   const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(EMAIL);
   if (exists) {
       console.log('User exists (ID ' + exists.id + '), updating...');
       db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, exists.id);
   } else {
       console.log('User does not exist, inserting...');
       const info = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Admin Force', EMAIL, hash, 'admin');
       console.log('Inserted ID: ' + info.lastInsertRowid);
   }
} catch (e) {
    console.error('INSERT ERROR:', e.message);
}

console.log('--- VERIFICATION ---');
const finalUser = db.prepare('SELECT id, email, password FROM users WHERE email = ?').get(EMAIL);
console.log('User Found: ' + (finalUser ? 'YES' : 'NO'));
`;

const conn = new Client();
conn.on("ready", () => {
    const B64 = Buffer.from(DEBUG_SCRIPT).toString('base64');
    const cmd = `
echo "${B64}" | base64 -d > /var/www/cocolu-chatbot/debug_insert.js
cd /var/www/cocolu-chatbot/
node debug_insert.js
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
