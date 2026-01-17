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

console.log("🔥 FINAL PM2 FIX (CWD)...");

const conn = new Client();
conn.on("ready", () => {

    const cmd = `
pm2 delete all
cd /var/www/cocolu-chatbot/
pm2 start npm --name cocolu-dashoffice -- start
pm2 save
sleep 5
pm2 list
pm2 logs cocolu-dashoffice --lines 20 --nostream
netstat -tulpn | grep 3009
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
