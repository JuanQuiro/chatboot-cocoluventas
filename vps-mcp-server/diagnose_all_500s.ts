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

console.log("🔍 DIAGNÓSTICO DE ENDPOINTS FALLANDO...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "========================================="
echo "1. TEST /api/accounts-receivable/stats"
echo "========================================="
curl -s -w "\\nHTTP: %{http_code}\\n" http://localhost:3009/api/accounts-receivable/stats 2>&1 | head -n 30

echo ""
echo "========================================="
echo "2. TEST /api/accounts-receivable"
echo "========================================="
curl -s -w "\\nHTTP: %{http_code}\\n" "http://localhost:3009/api/accounts-receivable?search=&page=1&limit=15" 2>&1 | head -n 30

echo ""
echo "========================================="
echo "3. TEST /api/installments"
echo "========================================="
curl -s -w "\\nHTTP: %{http_code}\\n" "http://localhost:3009/api/installments?status=all&start_date=&end_date=&page=1&limit=50" 2>&1 | head -n 30

echo ""
echo "========================================="
echo "4. TEST /api/installments/stats"
echo "========================================="
curl -s -w "\\nHTTP: %{http_code}\\n" http://localhost:3009/api/installments/stats 2>&1 | head -n 30

echo ""
echo "========================================="
echo "5. BUSCAR RUTAS EN CÓDIGO"
echo "========================================="
echo "Buscando accounts-receivable:"
grep -r "accounts-receivable" /var/www/cocolu-chatbot/src/api/*.js 2>/dev/null | head -n 5

echo ""
echo "Buscando installments:"
grep -r "installments" /var/www/cocolu-chatbot/src/api/*.js 2>/dev/null | head -n 5

echo ""
echo "========================================="
echo "6. VERIFICAR TABLAS EN BD"
echo "========================================="
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db ".tables" | grep -E "(cuentas|installments|cuotas)"

echo ""
echo "========================================="
echo "7. ÚLTIMOS ERRORES PM2"
echo "========================================="
pm2 logs cocolu-dashoffice --err --lines 20 --nostream
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
