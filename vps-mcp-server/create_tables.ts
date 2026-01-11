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

console.log("🔍 INIT TABLAS FALTANTES...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

cat > /tmp/init_missing_tables.js << 'ENDINIT'
const Database = require('better-sqlite3');
const db = new Database('./data/cocolu.db');

try {
  // Tabla INSTALLMENTS
  db.exec(\`
    CREATE TABLE IF NOT EXISTS installments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT NOT NULL,
      amount REAL NOT NULL,
      due_date DATE NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  \`);
  console.log('✅ Created installments');

  // Tabla PAYMENT_PLANS (por si acaso)
  db.exec(\`
    CREATE TABLE IF NOT EXISTS payment_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  \`);
  console.log('✅ Created payment_plans');
  
  // Tabla ACCOUNTS (para accounts receivable)
  db.exec(\`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      balance REAL DEFAULT 0,
      status TEXT DEFAULT 'active'
    );
  \`);
  console.log('✅ Created accounts');

  console.log('Tablas actuales:', db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());
  
} catch (e) {
  console.error('Error:', e.message);
}
ENDINIT

node /tmp/init_missing_tables.js
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Done");
            conn.end();
        });
    });
}).connect(config);
