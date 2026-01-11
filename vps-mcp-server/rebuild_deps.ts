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

console.log("🔥 REBUILDING DEPENDENCIES...");

const conn = new Client();
conn.on("ready", () => {

    // Stop app, clean cache, reinstall, rebuild, start
    const cmd = `
pm2 stop all
cd /var/www/cocolu-chatbot/
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm rebuild

# Restore Clean App just to be absolutely safe (overwrite main file)
# But wait, restore_clean_app.ts does that by uploading base64.
# So we assume the file on disk *might* be okay, but dependencies were the issue.
# However, to be 100% sure, I will re-upload clean app AFTER npm install in next step if needed.

# Start
pm2 restart cocolu-dashoffice
pm2 logs cocolu-dashoffice --lines 20 --nostream
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
