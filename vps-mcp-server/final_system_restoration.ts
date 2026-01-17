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
    keepaliveInterval: 10000,
};

console.log("🔥 FINAL SYSTEM RESTORATION...");

const conn = new Client();

conn.on("error", (err) => {
    console.error("SSH Connection Error:", err.message);
});

conn.on("ready", () => {
    console.log("✅ SSH Connected");

    const cmd = `
cd /var/www/cocolu-chatbot
git reset --hard HEAD
git clean -fd
pm2 restart cocolu-dashoffice
sleep 10
echo "=== LOGIN TEST ==="
curl -s -X POST http://localhost:3009/api/login -H "Content-Type: application/json" -d '{"email":"admin@cocolu.com","password":"password123"}' | head -c 300
echo ""
echo "=== HEALTH CHECK ==="
curl -s http://localhost:3009/health
echo ""
echo "=== PM2 STATUS ==="
pm2 list
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) {
            console.error("Exec Error:", err);
            conn.end();
            return;
        }

        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error('STDERR:', d.toString()));
        stream.on('close', (code) => {
            console.log('Exit code:', code);
            conn.end();
        });
    });
}).connect(config);
