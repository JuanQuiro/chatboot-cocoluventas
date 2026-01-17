import { Client } from "ssh2";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

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

console.log("🔧 FIXING AND REDEPLOYING...");

const serviceContent = fs.readFileSync(join(__dirname, "sellers.service.js"), "utf8");

const conn = new Client();
conn.on("ready", () => {
    const serviceBase64 = Buffer.from(serviceContent).toString('base64');

    const cmd = `
echo "📝 Updating sellers.service.js..."
echo "${serviceBase64}" | base64 -d > /var/www/cocolu-chatbot/src/services/sellers.service.js

echo "🔄 Restarting PM2..."
pm2 restart cocolu-dashoffice

sleep 2

echo ""
echo "🧪 Testing endpoint..."
curl -s http://localhost:3009/api/sellers | jq '.data | length'
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
