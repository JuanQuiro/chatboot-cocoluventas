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

console.log("🔥 SEEDING ADMIN PASSWORD...");

const conn = new Client();
conn.on("ready", () => {
    // We use a node script to hash and update
    const SEED_SCRIPT = `
import { getDb } from './src/api/lib/db.js';
import bcrypt from 'bcrypt';

const db = getDb();
console.log('Seeding password...');

(async () => {
    const hash = await bcrypt.hash('password123', 10);
    const info = db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hash, 'admin@cocolu.com');
    console.log('Updated rows: ' + info.changes);
    
    // Verify
    const user = db.prepare('SELECT password FROM users WHERE email = ?').get('admin@cocolu.com');
    console.log('New Password Hash Length: ' + (user ? user.password.length : 'NULL'));
})();
`;

    const B64 = Buffer.from(SEED_SCRIPT).toString('base64');

    const cmd = `
echo "${B64}" | base64 -d > /var/www/cocolu-chatbot/seed_password.js
cd /var/www/cocolu-chatbot/
node seed_password.js
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
