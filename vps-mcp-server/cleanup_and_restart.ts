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

console.log("🧹 CLEANUP AND RESTART...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "🗑️  Removing old problematic files..."
rm -f /var/www/cocolu-chatbot/src/services/sellers.service.js

echo "🔄 Restarting PM2..."
pm2 restart cocolu-dashoffice

sleep 3

echo ""
echo "🧪 Testing sellers endpoint..."
curl -s -w "\\nHTTP_CODE: %{http_code}\\n" http://localhost:3009/api/sellers
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
