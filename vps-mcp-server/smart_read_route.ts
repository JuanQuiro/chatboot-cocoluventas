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

console.log("🔍 LOCATING AND READING ROUTE...");

const conn = new Client();
conn.on("ready", () => {
    // 1. Find line number
    conn.exec('grep -n "/api/sales/by-period" /var/www/cocolu-chatbot/src/api/enhanced-routes.js', (err, stream) => {
        if (err) throw err;
        let output = '';
        stream.on('data', d => output += d.toString());
        stream.on('close', () => {
            const match = output.match(/^(\d+):/);
            if (match) {
                const line = parseInt(match[1]);
                console.log(`Matched line: ${line}`);
                // 2. Read 50 lines starting from there
                const cmd = `head -n ${line + 60} /var/www/cocolu-chatbot/src/api/enhanced-routes.js | tail -n 60`;
                conn.exec(cmd, (err, stream2) => {
                    stream2.on('data', d => console.log(d.toString()));
                    stream2.on('close', () => conn.end());
                });
            } else {
                console.log("Could not find line number");
                conn.end();
            }
        });
    });
}).connect(config);
