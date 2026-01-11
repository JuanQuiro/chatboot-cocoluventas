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

console.log("🧹 FORCING CLEAN REBUILD...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot/dashboard
echo "🗑️ Removing old build..."
rm -rf build/

echo "🏗️ Starting FRESH build..."
npm run build

echo "✅ Build finished. Updating timestamp..."
touch build/index.html

echo "🔄 Restarting Server..."
pm2 restart cocolu-dashoffice
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
