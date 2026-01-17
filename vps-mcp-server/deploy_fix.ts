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

console.log("🚀 UPLOADING AND REBUILDING...");

const localFilePath = join(__dirname, "SalesBreakdownModal.jsx");
const modalContent = fs.readFileSync(localFilePath, "utf8");

const conn = new Client();
conn.on("ready", () => {
    const base64Content = Buffer.from(modalContent).toString('base64');

    // Commands:
    // 1. Overwrite Modal
    // 2. Build Dashboard (This takes time!)
    // 3. Restart PM2

    const cmd = `
echo "${base64Content}" | base64 -d > /var/www/cocolu-chatbot/dashboard/src/components/modals/SalesBreakdownModal.jsx
echo "✅ Modal file updated."

echo "🏗️ STARTING DASHBOARD BUILD (This may take 1-2 mins)..."
cd /var/www/cocolu-chatbot/dashboard
npm run build || echo "❌ Build Failed"

echo "✅ Build complete. Moving to root if needed? No, app serves from dashboard/build"

echo "🔄 Restarting PM2..."
pm2 restart cocolu-dashoffice
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
