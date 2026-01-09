
import { Client } from "ssh2";
import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
};

console.log(`Testing Login via CURL on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    // We increase timeout to 12s to see if it's just slow or dead
    const cmd = `
        echo "--- CURL LOGIN TEST ---"
        curl -v -X POST \
             -H "Content-Type: application/json" \
             -d '{"username":"admin@cocolu.com","password":"password123"}' \
             --max-time 12 \
             http://127.0.0.1:3009/api/login
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any, signal: any) => {
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
