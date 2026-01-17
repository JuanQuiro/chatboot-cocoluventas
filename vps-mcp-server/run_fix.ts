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

console.log("🚑 UPLOADING FIX SCRIPT...");

const localFilePath = join(__dirname, "fix_corruption.cjs");
const scriptContent = fs.readFileSync(localFilePath, "utf8");

const conn = new Client();
conn.on("ready", () => {
    const base64Script = Buffer.from(scriptContent).toString('base64');

    const cmd = `
echo "${base64Script}" | base64 -d > /var/www/cocolu-chatbot/fix_corruption.cjs
node /var/www/cocolu-chatbot/fix_corruption.cjs
rm /var/www/cocolu-chatbot/fix_corruption.cjs

echo "🔄 Restarting PM2..."
pm2 restart cocolu-dashoffice

echo "⏳ Waiting 5s..."
sleep 5

echo "=== VERIFICATION ==="
echo "1. Sync:"
curl -X POST http://localhost:3009/api/bcv/sync -s
echo ""
echo "2. Rate:"
curl http://localhost:3009/api/bcv/rate -s
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
