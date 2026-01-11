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

console.log("🔥 RESTORING FROM GIT (Emergency Reset)...");

const conn = new Client();
conn.on("ready", () => {

    // We assume the git repo is in /var/www/cocolu-chatbot
    // We will stash any changes (like my injected mess) and pull/reset

    const cmd = `
cd /var/www/cocolu-chatbot/
pm2 delete all
git stash
git clean -fd
git checkout .
git pull origin main

# Re-install deps just in case
npm install

# Start Fresh
pm2 start app-integrated.js --name cocolu-dashoffice
pm2 save

sleep 5
pm2 status
netstat -tulpn | grep 3009
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
