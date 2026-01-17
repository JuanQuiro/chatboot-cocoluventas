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

console.log("🔍 VERIFICANDO ERROR 500 DEL BACKEND...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "========================================="
echo "1. PM2 STATUS"
echo "========================================="
pm2 status

echo ""
echo "========================================="
echo "2. ÚLTIMOS LOGS DE ERROR"
echo "========================================="
pm2 logs cocolu-dashoffice --lines 50 --nostream --err

echo ""
echo "========================================="
echo "3. VERIFICAR SCHEMA DE CLIENTES"
echo "========================================="
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db "PRAGMA table_info(clientes);" | grep -E "(id|nombre|apellido|telefono|email)"

echo ""
echo "========================================="
echo "4. TEST ENDPOINT CLIENTS"
echo "========================================="
curl -s -w "\\nHTTP_CODE:%{http_code}\\n" http://localhost:3009/api/clients | head -n 10

echo ""
echo "========================================="
echo "5. TEST ENDPOINT CLIENTS-IMPROVED"
echo "========================================="
curl -s -w "\\nHTTP_CODE:%{http_code}\\n" http://localhost:3009/api/clients-improved/search?q=test | head -n 10
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
