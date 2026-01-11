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

console.log("🔧 PATCHING APP-INTEGRATED.JS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
# 1. Add Import
sed -i "/import 'dotenv\/config';/a import bcvRoutes from './src/api/bcv.routes.js';" /var/www/cocolu-chatbot/app-integrated.js

# 2. Add Route Mount (searching for a good anchor point, e.g., before apiServer = )
# Using a unique string seen in previous output: "// Iniciar servidor API"
sed -i "/\/\/ Iniciar servidor API/i \        apiApp.use('/api/bcv', bcvRoutes);" /var/www/cocolu-chatbot/app-integrated.js

echo "✅ App patched."

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
