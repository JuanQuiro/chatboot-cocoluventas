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

console.log("🔍 INSPECCIONANDO SCHEMA DE BASE DE DATOS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

node -e "
const Database = require('better-sqlite3');
const db = new Database('./data/cocolu.db');

console.log('=== TABLA USERS ===');
const tableInfo = db.prepare(\"SELECT sql FROM sqlite_master WHERE type='table' AND name='users'\").get();
console.log(tableInfo ? tableInfo.sql : 'TABLA NO ENCONTRADA');

console.log('');
console.log('=== TRIGGERS ===');
const triggers = db.prepare(\"SELECT name, sql FROM sqlite_master WHERE type='trigger' AND tbl_name='users'\").all();
console.log(JSON.stringify(triggers, null, 2));

console.log('');
console.log('=== COLUMNAS (PRAGMA) ===');
try {
    const columns = db.pragma('table_info(users)');
    console.log(JSON.stringify(columns, null, 2));
} catch(e) {
    console.log('Error pragma:', e.message);
}

db.close();
" 2>&1
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Inspección completada");
            conn.end();
        });
    });
}).connect(config);
