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

console.log("🔥 FORCING DB SYNC (STOP -> SEED -> START)...");

const SYNC_SCRIPT = `
import { getDb } from './src/api/lib/db.js';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

console.log('--- SYNC SEED START ---');
try {
   const db = getDb();
   const EMAIL = 'admin@cocolu.com';
   const hash = bcrypt.hashSync('password123', 10);
   const id = randomUUID();

   // 1. Delete
   db.prepare('DELETE FROM users WHERE email = ?').run(EMAIL);

   // 2. Insert
   db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)').run(id, 'Admin Sync', EMAIL, hash, 'admin');
   
   // 3. FORCE CHECKPOINT
   console.log('Checkpointing WAL...');
   db.pragma('wal_checkpoint(RESTART)');
   
   // 4. Verify
   const count = db.prepare('SELECT COUNT(*) as c FROM users WHERE email = ?').get(EMAIL);
   console.log('User Count: ' + count.c);

} catch (e) {
    console.error('ERROR:', e);
}
console.log('--- SYNC SEED END ---');
`;

const conn = new Client();
conn.on("ready", () => {
    const B64 = Buffer.from(SYNC_SCRIPT).toString('base64');
    const cmd = `
echo "${B64}" | base64 -d > /var/www/cocolu-chatbot/sync_seed.js
pm2 stop all
cd /var/www/cocolu-chatbot/
node sync_seed.js
pm2 start app-integrated.js --name cocolu-dashoffice -i max --no-autorestart
pm2 save
sleep 5
pm2 logs cocolu-dashoffice --lines 10 --nostream
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
