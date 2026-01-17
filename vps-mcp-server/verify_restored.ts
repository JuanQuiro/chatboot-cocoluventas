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

console.log("✅ VERIFICACIÓN POST-RESTAURACIÓN...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "========================================="
echo "PM2 STATUS"
echo "========================================="
pm2 status

echo ""
echo "========================================="
echo "ENDPOINTS BÁSICOS"
echo "========================================="

echo "1. Health:"
curl -s -w "\\nHTTP: %{http_code}\\n" http://localhost:3009/api/health

echo ""
echo "2. Login:"
curl -s -w "\\nHTTP: %{http_code}\\n" -X POST http://localhost:3009/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cocolu.com","password":"password123"}' | head -n 10

echo ""
echo "3. Dashboard:"
curl -s -w "\\nHTTP: %{http_code}\\n" http://localhost:3009/api/dashboard | head -n 10

echo ""
echo "4. Sellers:"
curl -s -w "\\nHTTP: %{http_code}\\n" http://localhost:3009/api/sellers | head -n 5

echo ""
echo "========================================="
echo "VERIFICACIÓN COMPLETA"
echo "========================================="
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
