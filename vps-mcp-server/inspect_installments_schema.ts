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

console.log("🔍 INSPECCIONANDO SCHEMA VS CODIGO...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== CODIGO ROUTE INSTALLMENTS (Primeras 50 lineas) ==="
cat src/api/installments.routes.js | head -50

echo ""
echo "=== SCHEMA ACTUAL INSTALLMENTS ==="
node -e "
const Database = require('better-sqlite3');
const db = new Database('./data/cocolu.db');
console.log(db.pragma('table_info(installments)'));
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
