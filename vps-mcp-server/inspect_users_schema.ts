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

console.log("🕵️ INSPECTING USERS TABLE...");

const conn = new Client();
conn.on("ready", () => {
    // We use a small node script to inspect via better-sqlite3 to be consistent
    const cmd = `
node -e "
const Database = require('better-sqlite3');
const db = new Database('/var/www/cocolu-chatbot/data/cocolu.db');
const cols = db.pragma('table_info(users)');
console.log(JSON.stringify(cols, null, 2));
const users = db.prepare('SELECT * FROM users LIMIT 1').all();
console.log('--- DATA ---');
console.log(JSON.stringify(users, null, 2));
"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
