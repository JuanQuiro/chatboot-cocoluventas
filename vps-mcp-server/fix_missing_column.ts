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

console.log("🔍 INSPECCIONANDO SCHEMA Y CÓDIGO...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== CONTENIDO ACTUAL auth-simple.routes.js ==="
cat src/api/auth-simple.routes.js

echo ""
echo "=== SCHEMA DB ==="
node -e "
const Database = require('better-sqlite3');
const db = new Database('/var/www/cocolu-chatbot/data/cocolu.db');
console.log('Columns:', db.pragma('table_info(users)'));
" 2>&1

echo ""
echo "=== INTENTAR ARREGLAR (AGREGAR COLUMNA) ==="
node -e "
const Database = require('better-sqlite3');
const db = new Database('/var/www/cocolu-chatbot/data/cocolu.db');
try {
  db.prepare('ALTER TABLE users ADD COLUMN last_login DATE').run();
  console.log('✅ Columna last_login agregada');
} catch (e) {
  console.log('Info:', e.message);
}
" 2>&1

echo ""
echo "=== RESTART PM2 ==="
pm2 restart cocolu-dashoffice
sleep 5

echo ""
echo "=== FINAL TEST ==="
curl -s -X POST http://127.0.0.1:3009/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cocolu.com","password":"password123"}'
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
