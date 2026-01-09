
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

console.log(`Wiping and Resetting PocketBase on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    // 1. Stop service
    // 2. Delete pb_data
    // 3. Start service (recreates pb_data)
    // 4. Create superuser
    const cmd = `
        echo "--- STOPPING SERVICE ---"
        rc-service pocketbase stop
        echo "--- REMOVING DATA ---"
        rm -rf /opt/pocketbase/pb_data
        echo "--- STARTING SERVICE ---"
        rc-service pocketbase start
        sleep 5
        echo "--- CREATING SUPERUSER ---"
        /opt/pocketbase/pocketbase superuser create "admin@cocolu.com" "password123" --dir="/opt/pocketbase/pb_data"
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
