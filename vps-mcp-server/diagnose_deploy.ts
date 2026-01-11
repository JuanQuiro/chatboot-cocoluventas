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

console.log("🔍 DIAGNOSING DEPLOYMENT FAILURE...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== 1. CHECK FILE CONTENT ==="
head -n 10 /var/www/cocolu-chatbot/dashboard/src/components/modals/SalesBreakdownModal.jsx

echo "=== 2. CHECK BUILD TIMESTAMP ==="
ls -l /var/www/cocolu-chatbot/dashboard/build/index.html
ls -l /var/www/cocolu-chatbot/dashboard/build/static/js/main.*.js

echo "=== 3. CHECK LAST BUILD LOG ==="
# Attempt to see if there's any log, or just checking if the previous command left any artifact (unlikely)
echo "Done"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
