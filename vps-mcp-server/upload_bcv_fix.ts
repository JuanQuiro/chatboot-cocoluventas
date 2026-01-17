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

console.log("🚀 UPLOADING BCV SERVICE FIX...");

// Read the local file content
const localFilePath = join(__dirname, "temp_bcv_service.js");
const serviceContent = fs.readFileSync(localFilePath, "utf8");

const conn = new Client();
conn.on("ready", () => {
    // Escape single quotes for bash heredoc if necessary, but using base64 is safer
    const base64Content = Buffer.from(serviceContent).toString('base64');

    const cmd = `
echo "${base64Content}" | base64 -d > /var/www/cocolu-chatbot/src/services/bcv.service.js

echo "✅ Service file updated."

echo "🔄 Restarting PM2..."
pm2 restart cocolu-dashoffice

echo "⏳ Waiting 5s..."
sleep 5

echo "🔄 Triggering Sync..."
curl -X POST http://localhost:3009/api/bcv/sync

echo ""
echo "🔍 Checking Rate..."
curl http://localhost:3009/api/bcv/rate
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
