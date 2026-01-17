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

console.log("🔍 COMPLETE SYSTEM AUDIT...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== 1. CHECKING BACKEND FILE THAT'S RUNNING ==="
ps aux | grep "app-integrated\\|node" | grep -v grep | head -5

echo ""
echo "=== 2. CHECKING WHICH APP-INTEGRATED IS ACTIVE ==="
ls -lh /var/www/cocolu-chatbot/app-integrated.js /var/www/cocolu-chatbot/app-integrated*.js 2>/dev/null

echo ""
echo "=== 3. READING FIRST 50 LINES OF ACTIVE APP ==="
head -50 /var/www/cocolu-chatbot/app-integrated.js

echo ""
echo "=== 4. CHECKING FOR SECURITY PACKAGES ==="
grep -i "helmet\\|compression\\|rate-limit" /var/www/cocolu-chatbot/app-integrated.js | head -10 || echo "No security packages found"

echo ""
echo "=== 5. CHECKING PACKAGE.JSON DEPENDENCIES ==="
grep -A 50 '"dependencies"' /var/www/cocolu-chatbot/package.json | head -60
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error('STDERR:', d.toString()));
        stream.on('close', (code) => {
            console.log('Exit code:', code);
            conn.end();
        });
    });
}).connect(config);
