
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

console.log(`Checking Backend Localhost on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    // Try to get the root or a known endpoint
    conn.exec("curl -I http://localhost:3009/api/health || curl -I http://localhost:3009", (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any, signal: any) => {
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        }).stderr.on("data", (data: any) => {
            // ignore stderr
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
