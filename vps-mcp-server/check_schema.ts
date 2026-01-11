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
    readyTimeout: 90000,
};

console.log("🔍 CHECKING USERS TABLE SCHEMA...");

const conn = new Client();
conn.on("ready", () => {
    // Determine column info using pragma_table_info
    // We'll write a node script to query sqlite via better-sqlite3 if possible, 
    // or just assume if sqlite3 cli is installed.
    // Safest: Use the app's db.js logic? No, just a standalone script.

    const checkScript = `
import Database from 'better-sqlite3';
const db = new Database('/var/www/cocolu-chatbot/data/cocolu.db');

try {
    const columns = db.prepare("PRAGMA table_info(users)").all();
    console.log(JSON.stringify(columns, null, 2));
} catch (e) {
    console.error(e);
}
`;

    // We need to run this as module
    // But we can just use json-server file or whatever? 
    // Let's use node with --input-type=module or save .mjs
    const base64Script = Buffer.from(checkScript).toString('base64');

    const cmd = `
echo "${base64Script}" | base64 -d > /var/www/cocolu-chatbot/check_schema.mjs
node /var/www/cocolu-chatbot/check_schema.mjs
rm /var/www/cocolu-chatbot/check_schema.mjs
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
