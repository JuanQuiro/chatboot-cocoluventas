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

console.log("🔍 POST-DEPLOYMENT CHECK...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== PM2 ERROR LOG (Latest 15 lines) ==="
pm2 logs cocolu-dashoffice --err --lines 15 --nostream

echo ""
echo "=== PM2 OUT LOG (Latest 10 lines) ==="
pm2 logs cocolu-dashoffice --out --lines 10 --nostream

echo ""
echo "=== DIRECT CURL TEST ==="
curl -s -w "\\nHTTP_CODE: %{http_code}\\n" http://localhost:3009/api/sellers
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
