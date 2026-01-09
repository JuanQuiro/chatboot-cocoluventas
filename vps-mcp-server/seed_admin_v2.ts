
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

console.log(`Checking PB Version & Creating Superuser on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    // 1. Check version
    // 2. Try 'superuser create' (newer) or 'admin create' (older) based on version, 
    //    but since 'admin' failed, assume 'superuser' or interactive-only?
    //    We'll try to pass input via pipe if interactive.
    const cmd = `
        echo "--- ATTEMPTING ARGUMENT CREATE ---"
        /opt/pocketbase/pocketbase superuser create "admin@cocolu.com" "password123"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any, signal: any) => {
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        }).stderr.on("data", (data: any) => {
            console.log("STDERR: " + data);
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
