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

console.log("🔥 LAUNCHING DETACHED MANUAL PROCESS...");

const conn = new Client();
conn.on("ready", () => {

    // Kill existing PM2 and manual processes
    const cmd = `
pm2 delete all
pm2 kill
pkill -f "node app-integrated.js"

cd /var/www/cocolu-chatbot/
# Start with nohup and redirect output
nohup /usr/bin/node app-integrated.js > app.log 2>&1 &
echo "Process Launched"
sleep 5
cat app.log
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
