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

console.log("✅ FINAL DEPLOYMENT WITH CORRECT PATH...");

const serviceContent = fs.readFileSync(join(__dirname, "sellers.service.corrected.js"), "utf8");

const conn = new Client();
conn.on("ready", () => {
    const serviceBase64 = Buffer.from(serviceContent).toString('base64');

    const cmd = `
echo "${serviceBase64}" | base64 -d > /var/www/cocolu-chatbot/src/services/sellers.service.js

echo "🔄 Restarting..."
pm2 restart cocolu-dashoffice

sleep 3

echo "🧪 Testing /api/sellers..."
curl -s http://localhost:3009/api/sellers

echo ""
echo ""
echo "✅ Deployment Complete"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
