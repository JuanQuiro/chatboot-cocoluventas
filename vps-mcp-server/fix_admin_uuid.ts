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

console.log("🔥 FIXING ADMIN USER (UUID METHOD)...");

const FIX_SCRIPT = `
import { getDb } from './src/api/lib/db.js';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const db = getDb();
const EMAIL = 'admin@cocolu.com';

console.log('--- FIX START ---');
try {
   // 1. Force Delete
   const del = db.prepare('DELETE FROM users WHERE email = ?').run(EMAIL);
   console.log('Deleted: ' + del.changes);

   // 2. Hash
   const hash = bcrypt.hashSync('password123', 10);
   const id = randomUUID();

   // 3. Insert with explicit ID
   const insert = db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)').run(id, 'System Admin', EMAIL, hash, 'admin');
   console.log('Inserted: ' + insert.changes); // changes is number, safe to print
   
   // 4. Verify Immediate
   const user = db.prepare('SELECT * FROM users WHERE email = ?').get(EMAIL);
   console.log('Verification: ' + (user ? 'FOUND' : 'MISSING'));
   if (user) console.log('Stored Password Length: ' + user.password.length);

} catch (e) {
    console.error('ERROR:', e);
}
console.log('--- FIX END ---');
`;

const conn = new Client();
conn.on("ready", () => {
    const B64 = Buffer.from(FIX_SCRIPT).toString('base64');
    const cmd = `
echo "${B64}" | base64 -d > /var/www/cocolu-chatbot/fix_admin.js
cd /var/www/cocolu-chatbot/
node fix_admin.js
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
