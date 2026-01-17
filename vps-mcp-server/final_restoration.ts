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
    readyTimeout: 60000,
};

console.log("🔥 FINAL RESTORATION TO STABLE STATE...");

const conn = new Client();
conn.on("ready", () => {

    const cmd = `
cd /var/www/cocolu-chatbot
git reset --hard HEAD
pm2 delete all
pm2 start app-integrated.js --name cocolu-dashoffice
pm2 save
sleep 5
curl -X POST http://localhost:3009/api/login -H "Content-Type: application/json" -d '{"email":"admin@cocolu.com","password":"password123"}' | head -c 200
echo ""
echo "--- HEALTH CHECK ---"
curl http://localhost:3009/health
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
