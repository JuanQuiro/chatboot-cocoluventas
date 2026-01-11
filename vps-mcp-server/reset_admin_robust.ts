import { Client } from "ssh2";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import bcrypt from 'bcrypt';

// Note: We need to generate hash locally or on server. 
// Generating on server ensures consistency with server's bcrypt version/salt, but local is fine if standard.
// For simplicity, we'll run a script on server that imports bcrypt.

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

console.log("🔥 RESETTING ADMIN USER (FORCE RE-CREATE)...");

const RESET_SCRIPT = `
import { getDb } from './src/api/lib/db.js';
import bcrypt from 'bcrypt';

const db = getDb();
const EMAIL = 'admin@cocolu.com';
const PASS = 'password123';
const NAME = 'Cocolu Admin';
const ROLE = 'admin';

(async () => {
    try {
        console.log('--- RESETTING ADMIN ---');
        // 1. Delete
        const delInfo = db.prepare('DELETE FROM users WHERE email = ?').run(EMAIL);
        console.log('Deleted existing rows: ' + delInfo.changes);

        // 2. Hash
        const hash = await bcrypt.hash(PASS, 10);
        console.log('Generated Hash length: ' + hash.length);

        // 3. Insert
        const insertInfo = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(NAME, EMAIL, hash, ROLE);
        console.log('Inserted Admin ID: ' + insertInfo.lastInsertRowid);
        
        console.log('--- DONE ---');
    } catch (e) {
        console.error('ERROR:', e);
    }
})();
`;

const conn = new Client();
conn.on("ready", () => {
    const B64 = Buffer.from(RESET_SCRIPT).toString('base64');
    const cmd = `
echo "${B64}" | base64 -d > /var/www/cocolu-chatbot/reset_admin.js
cd /var/www/cocolu-chatbot/
node reset_admin.js
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
