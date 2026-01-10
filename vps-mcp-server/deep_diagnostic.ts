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

console.log("🔍 DIAGNÓSTICO PROFUNDO...");

const conn = new Client();
conn.on("ready", () => {
  const cmd = `
echo "=== PM2 LOGS (errores recientes) ==="
pm2 logs cocolu-dashoffice --err --lines 20 --nostream 2>&1 | tail -20

echo ""
echo "=== VERIFICAR BASE DE DATOS ==="
cd /var/www/cocolu-chatbot
node -e "
const Database = require('better-sqlite3');
const db = new Database('./data/cocolu.db');
console.log('Tablas:', db.prepare('SELECT name FROM sqlite_master WHERE type=\\\"table\\\"').all());
const users = db.prepare('SELECT id, email, name, role FROM users').all();
console.log('Usuarios:', JSON.stringify(users, null, 2));
db.close();
" 2>&1

echo ""
echo "=== TEST MANUAL LOGIN ==="
curl -s -X POST http://127.0.0.1:3009/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cocolu.com","password":"password123"}' -v 2>&1 | grep -E "HTTP|success|error|token" | head -10
    `;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on("data", (d: Buffer) => console.log(d.toString()));
    stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
    stream.on("close", () => {
      console.log("\n✅ Diagnóstico completado");
      conn.end();
    });
  });
}).connect(config);
