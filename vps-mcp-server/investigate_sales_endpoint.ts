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

console.log("🔍 BUSCANDO IMPLEMENTACIÓN DE /api/sales/by-period...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "========================================="
echo "1. BUSCAR DEFINICIÓN DEL ENDPOINT"
echo "========================================="
grep -rn "sales/by-period" /var/www/cocolu-chatbot/src/api/ 2>/dev/null | head -n 5

echo ""
echo "========================================="
echo "2. VER IMPLEMENTACIÓN EN enhanced-routes.js"
echo "========================================="
grep -A 30 "sales/by-period" /var/www/cocolu-chatbot/src/api/enhanced-routes.js 2>/dev/null | head -n 35

echo ""
echo "========================================="
echo "3. VERIFICAR DATOS CON SQL DIRECTO"
echo "========================================="
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db "SELECT * FROM sales WHERE date(created_at, 'localtime') = date('now', 'localtime');"

echo ""
echo "========================================="
echo "4. VERIFICAR ESTRUCTURA DE LA TABLA"
echo "========================================="
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db ".schema sales"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
