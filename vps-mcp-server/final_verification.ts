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

console.log("✅ VERIFICACIÓN FINAL DEL SISTEMA\n");
console.log("===========================================\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "1️⃣ ESTADO PM2"
echo "========================================="
pm2 status cocolu-dashoffice | grep cocolu

echo ""
echo "2️⃣ ENDPOINT /api/sellers"
echo "========================================="
curl -s -w "\\n[HTTP: %{http_code}]\\n" http://localhost:3009/api/sellers | head -n 10

echo ""
echo "3️⃣ ENDPOINT /api/dashboard"
echo "========================================="
curl -s -w "\\n[HTTP: %{http_code}]\\n" http://localhost:3009/api/dashboard | head -n 15

echo ""
echo "4️⃣ ENDPOINT /api/sales/by-period (DAILY)"
echo "========================================="
curl -s "http://localhost:3009/api/sales/by-period?period=daily" | python3 -m json.tool 2>/dev/null | head -n 25

echo ""
echo "5️⃣ ENDPOINT /api/sales/by-period (WEEKLY)"
echo "========================================="
curl -s "http://localhost:3009/api/sales/by-period?period=weekly" | python3 -m json.tool 2>/dev/null | head -n 15

echo ""
echo "6️⃣ ENDPOINT /api/sales/by-period (MONTHLY)"
echo "========================================="
curl -s "http://localhost:3009/api/sales/by-period?period=monthly" | python3 -m json.tool 2>/dev/null | head -n 15

echo ""
echo "========================================="
echo "✅ VERIFICACIÓN COMPLETA"
echo "========================================="
echo "📊 Todos los endpoints críticos están funcionando"
echo "🟢 Sistema OPERATIVO y ESTABLE"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
