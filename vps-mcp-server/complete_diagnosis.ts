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

console.log("🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "========================================="
echo "1. STATUS PM2"
echo "========================================="
pm2 status cocolu-dashoffice

echo ""
echo "========================================="
echo "2. ÚLTIMOS ERRORES PM2"
echo "========================================="
pm2 logs cocolu-dashoffice --err --lines 15 --nostream

echo ""
echo "========================================="
echo "3. TEST ENDPOINT /api/sellers"
echo "========================================="
curl -s -w "\\nHTTP_CODE: %{http_code}\\n" http://localhost:3009/api/sellers | head -n 20

echo ""
echo "========================================="
echo "4. TEST ENDPOINT /api/dashboard"
echo "========================================="
curl -s -w "\\nHTTP_CODE: %{http_code}\\n" http://localhost:3009/api/dashboard | head -n 20

echo ""
echo "========================================="
echo "5. TEST ENDPOINT /api/sales/by-period"
echo "========================================="
curl -s -w "\\nHTTP_CODE: %{http_code}\\n" "http://localhost:3009/api/sales/by-period?period=daily"

echo ""
echo "========================================="
echo "6. VERIFICAR ARCHIVOS CLAVE"
echo "========================================="
ls -lh /var/www/cocolu-chatbot/src/api/sellers.routes.js
ls -lh /var/www/cocolu-chatbot/src/services/sellers.service.js

echo ""
echo "========================================="
echo "7. VERIFICAR DB SALES"
echo "========================================="
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db "SELECT COUNT(*) as total_sales FROM sales;"
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db "SELECT COUNT(*) as today_sales FROM sales WHERE date(created_at) = date('now');"

echo ""
echo "========================================="
echo "DIAGNÓSTICO COMPLETO"
echo "========================================="
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
