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

console.log("🔥 NUCLEAR WAL RESET & SEED...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
pm2 stop all
rm /var/www/cocolu-chatbot/data/cocolu.db-wal
rm /var/www/cocolu-chatbot/data/cocolu.db-shm
ls -l /var/www/cocolu-chatbot/data/

cd /var/www/cocolu-chatbot/
node seed_admin_safe.js

pm2 start app-integrated.js --name cocolu-dashoffice -i max --no-autorestart
pm2 save
sleep 5
pm2 list
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
