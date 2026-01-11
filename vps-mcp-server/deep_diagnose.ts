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

console.log("🔍 DEEP DIVE DIAGNOSIS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== 1. CHECK SERVING PATH IN APP ==="
grep "express.static" /var/www/cocolu-chatbot/app-integrated.js

echo "=== 2. SEARCH FOR NEW CODE IN BUILD ==="
# Search for a unique class from the new modal in the build directory
grep -r "bg-gradient-to-br from-emerald-500" /var/www/cocolu-chatbot/dashboard/build/static/js/ || echo "❌ New code NOT found in build"

echo "=== 3. CHECK FOR SERVICE WORKER ==="
ls /var/www/cocolu-chatbot/dashboard/build/service-worker.js 2>/dev/null && echo "⚠️ Service Worker EXISTS" || echo "✅ No Service Worker file"

echo "=== 4. LIST BUILD DIR ==="
ls -l /var/www/cocolu-chatbot/dashboard/build/
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
