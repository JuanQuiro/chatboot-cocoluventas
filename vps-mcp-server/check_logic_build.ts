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

console.log("🔍 CHECKING BACKEND DATE LOGIC...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
# Read the part of dashboard-routes.js that calculates daily stats
grep -C 20 "const today" /var/www/cocolu-chatbot/src/api/dashboard-routes.js

# Check dashboard package.json for build script
cat /var/www/cocolu-chatbot/dashboard/package.json
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
