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

console.log("🔍 CHECKING DNS AND GIT STATUS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== 1. CHECK DOMAIN RESOLUTION ==="
nslookup cocolu.emberdrago.com || ping -c 1 cocolu.emberdrago.com

echo "=== 2. CHECK VPS IP ==="
curl -s ifconfig.me

echo "=== 3. CHECK GIT STATUS IN DASHBOARD ==="
cd /var/www/cocolu-chatbot
git status
echo "---"
cd /var/www/cocolu-chatbot/dashboard
git status
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
