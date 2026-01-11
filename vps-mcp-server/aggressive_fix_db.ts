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

console.log("🔥 AGGRESSIVE DB FIX & RESTART...");

const conn = new Client();
conn.on("ready", () => {

    // Sed to comment out db.close anywhere
    const cmd = `
find /var/www/cocolu-chatbot/src/api -name "*.js" -exec sed -i 's/db\\.close/\\/\\/ db.close/g' {} +
echo "Fixed DB closures."

# Restart PM2
pm2 restart cocolu-dashoffice
sleep 5
echo "PM2 Restarted."
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
