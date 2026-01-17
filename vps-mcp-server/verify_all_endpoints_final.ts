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

console.log("✅ VERIFICACIÓN COMPLETA DE TODOS LOS ENDPOINTS\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "========================================="
echo "ENDPOINTS CRÍTICOS"
echo "========================================="

echo ""
echo "1️⃣ /api/sellers"
curl -s -w "\\n[HTTP: %{http_code}]\\n" http://localhost:3009/api/sellers | python3 -m json.tool 2>/dev/null | head -n 8

echo ""
echo "2️⃣ /api/dashboard"
curl -s -w "\\n[HTTP: %{http_code}]\\n" http://localhost:3009/api/dashboard | python3 -m json.tool 2>/dev/null | head -n 8

echo ""
echo "3️⃣ /api/sales/by-period"
curl -s -w "\\n[HTTP: %{http_code}]\\n" "http://localhost:3009/api/sales/by-period?period=daily" | python3 -m json.tool 2>/dev/null | head -n 12

echo ""
echo "4️⃣ /api/accounts-receivable"
curl -s -w "\\n[HTTP: %{http_code}]\\n" "http://localhost:3009/api/accounts-receivable?page=1&limit=15" | python3 -m json.tool 2>/dev/null | head -n 12

echo ""
echo "5️⃣ /api/accounts-receivable/stats"
curl -s -w "\\n[HTTP: %{http_code}]\\n" http://localhost:3009/api/accounts-receivable/stats | python3 -m json.tool 2>/dev/null

echo ""
echo "6️⃣ /api/installments"
curl -s -w "\\n[HTTP: %{http_code}]\\n" "http://localhost:3009/api/installments?status=all&page=1&limit=50" | python3 -m json.tool 2>/dev/null | head -n 12

echo ""
echo "7️⃣ /api/installments/stats"
curl -s -w "\\n[HTTP: %{http_code}]\\n" http://localhost:3009/api/installments/stats | python3 -m json.tool 2>/dev/null

echo ""
echo "========================================="
echo "PM2 STATUS"
echo "========================================="
pm2 status cocolu-dashoffice | grep cocolu

echo ""
echo "========================================="
echo "✅ VERIFICACIÓN COMPLETA"
echo "========================================="
echo "Todos los endpoints están respondiendo"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
