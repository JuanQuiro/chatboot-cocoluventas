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

console.log("🕵️ DIAGNOSING ENV & DEPS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot/
echo "--- PACKAGE.JSON TYPE ---"
grep '"type":' package.json || echo "No type field"
echo "--- DEPENDENCIES ---"
npm list bcrypt jsonwebtoken express better-sqlite3 --depth=0 || echo "NPM LIST FAILED"
echo "--- TEST LOAD AGAIN (WITH STDERR) ---"
node test_auth_load.js 2>&1
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
