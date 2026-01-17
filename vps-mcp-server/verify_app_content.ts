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

console.log("🔍 REMOTE GREP APP INTEGRATED...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "--- CHECKING DASHBOARD IMPORT ---"
grep "dashboard-fix.routes.js" /var/www/cocolu-chatbot/app-integrated.js
echo "--- CHECKING DASHBOARD MOUNT ---"
grep "/api/dashboard" /var/www/cocolu-chatbot/app-integrated.js
echo "--- CHECKING DB LIB ---"
ls -l /var/www/cocolu-chatbot/src/api/lib/db.js
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
