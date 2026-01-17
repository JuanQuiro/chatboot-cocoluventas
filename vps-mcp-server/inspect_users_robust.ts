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

console.log("🕵️ INSPECTING USERS (ROBUST)...");

const INSPECT_SCRIPT = `
import { getDb } from './src/api/lib/db.js';

console.log('--- START INSPECTION ---');
try {
    const db = getDb();
    const rows = db.prepare('SELECT id, name, email, password, role FROM users').all();
    console.log(JSON.stringify(rows, null, 2));
} catch (e) {
    console.error('ERROR:', e);
}
console.log('--- END INSPECTION ---');
`;

const conn = new Client();
conn.on("ready", () => {
    // Write script to file using base64 to avoid escaping issues
    const B64 = Buffer.from(INSPECT_SCRIPT).toString('base64');
    const cmd = `
echo "${B64}" | base64 -d > /var/www/cocolu-chatbot/inspect_users_real.js
cd /var/www/cocolu-chatbot/
node inspect_users_real.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
