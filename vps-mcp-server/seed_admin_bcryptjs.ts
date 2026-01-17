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

console.log("🔥 SEEDING ADMIN (BCRYPTJS)...");

const SEED_SCRIPT = `
import { getDb } from './src/api/lib/db.js';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const db = getDb();
const EMAIL = 'admin@cocolu.com';
const PASS = 'password123';

console.log('--- SEEDING ---');
try {
   const del = db.prepare('DELETE FROM users WHERE email = ?').run(EMAIL);
   console.log('Deleted: ' + del.changes);

   // bcryptjs hashSync
   const hash = bcrypt.hashSync(PASS, 10);
   const id = randomUUID();

   const insert = db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)').run(id, 'Admin User', EMAIL, hash, 'admin');
   console.log('Inserted: ' + insert.changes);
   
   // Check
   const user = db.prepare('SELECT email, password FROM users WHERE email = ?').get(EMAIL);
   console.log('User Exists: ' + (user ? 'YES' : 'NO'));
   if (user) console.log('Hash len: ' + user.password.length);

} catch (e) {
    console.error('ERROR:', e);
}
console.log('--- DONE ---');
`;

const conn = new Client();
conn.on("ready", () => {
    const B64 = Buffer.from(SEED_SCRIPT).toString('base64');
    const cmd = `
echo "${B64}" | base64 -d > /var/www/cocolu-chatbot/seed_admin_safe.js
cd /var/www/cocolu-chatbot/
node seed_admin_safe.js
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
