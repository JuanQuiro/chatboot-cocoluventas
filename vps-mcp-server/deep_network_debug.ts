
import { Client } from "ssh2";
import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
};

console.log(`Deep Network Debug on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    // 1. Check DNS (dig)
    // 2. Curl Public URL from Localhost (Hairpin check)
    // 3. Check Nginx Error Logs (Last 50 lines)
    // 4. Check Open Ports again
    const cmd = `
        echo "--- DNS CHECK (Local) ---"
        nslookup api.emberdrago.com 8.8.8.8
        echo "--- CURL PUBLIC SELF ---"
        curl -v --max-time 5 https://api.emberdrago.com/api/health || echo "CURL FAILED"
        echo "--- NGINX ERROR LOGS ---"
        tail -n 30 /var/log/nginx/error.log
        echo "--- NGINX ACCESS LOGS (Last 5 Hits) ---"
        tail -n 5 /var/log/nginx/access.log
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any, signal: any) => {
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        }).stderr.on("data", (data: any) => {
            // console.log("STDERR: " + data);
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
