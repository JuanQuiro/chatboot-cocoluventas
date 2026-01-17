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

console.log("🚀 DEPLOYING FIXED APP...");

const content = fs.readFileSync(join(__dirname, "app-integrated-fixed.js"), "utf8");

const conn = new Client();
conn.on("ready", () => {
    const base64Content = Buffer.from(content).toString('base64');

    const cmd = `
# Backup current app just in case
cp /var/www/cocolu-chatbot/app-integrated.js /var/www/cocolu-chatbot/app-integrated.js.bak-failed-inject

# Overwrite with fixed version
echo "${base64Content}" | base64 -d > /var/www/cocolu-chatbot/app-integrated.js

echo "🔄 Restarting PM2..."
pm2 restart cocolu-dashoffice

sleep 4

echo "✅ App Status:"
pm2 status cocolu-dashoffice

echo ""
echo "🧪 Final API Test:"
curl -v http://localhost:3009/api/sellers
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
