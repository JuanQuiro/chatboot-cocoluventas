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

console.log("🕵️ INSPECTING DB STANDALONE...");

const CHECK_SCRIPT = `
import Database from 'better-sqlite3';
const DB_PATH = '/var/www/cocolu-chatbot/data/cocolu.db';
console.log('Opening DB: ' + DB_PATH);
try {
    const db = new Database(DB_PATH, { timeout: 10000 });
    const users = db.prepare('SELECT * FROM users').all();
    console.log('Users Found: ' + users.length);
    console.log(JSON.stringify(users, null, 2));
} catch (e) {
    console.error(e);
}
`;

const conn = new Client();
conn.on("ready", () => {
    const B64 = Buffer.from(CHECK_SCRIPT).toString('base64');
    const cmd = `
echo "${B64}" | base64 -d > /var/www/cocolu-chatbot/inspect_standalone.js
cd /var/www/cocolu-chatbot/
node inspect_standalone.js
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
