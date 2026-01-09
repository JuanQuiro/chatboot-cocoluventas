import { Client } from "ssh2";
import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
};

console.log(`Auditing Database Schema on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        cat > audit_db.js <<'ENDOFSCRIPT'
const Database = require('better-sqlite3');
const db = new Database('./data/cocolu.db', { readonly: true });

console.log('=== DATABASE INFO ===');
console.log('Tables:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(JSON.stringify(tables, null, 2));

console.log('\\n=== USERS TABLE SCHEMA ===');
const schema = db.prepare("PRAGMA table_info(users)").all();
console.log(JSON.stringify(schema, null, 2));

console.log('\\n=== ALL USERS ===');
const users = db.prepare("SELECT id, email, name, role, active FROM users").all();
console.log(JSON.stringify(users, null, 2));

console.log('\\n=== ADMIN USER HASH (first 50 chars) ===');
const admin = db.prepare("SELECT email, substr(password_hash, 1, 50) as hash_preview FROM users WHERE email = 'admin@cocolu.com'").get();
console.log(JSON.stringify(admin, null, 2));

db.close();
ENDOFSCRIPT
        
        node audit_db.js
        rm audit_db.js
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Audit complete");
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        }).stderr.on("data", (data: any) => {
            console.error("STDERR:", data.toString());
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
