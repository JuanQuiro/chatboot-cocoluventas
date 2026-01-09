
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

console.log(`Checking Alpine Services on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "--- RC-STATUS ---"
        rc-status
        echo "--- POCKETBASE ---"
        rc-service pocketbase status || echo "Pocketbase service not found or error"
        echo "--- PROCESS CHECK ---"
        ps aux | grep pocketbase
        echo "--- GREP DB IN APP ---"
        grep -iE "pocketbase|postgres|redis|mongo" /var/www/cocolu-chatbot/app-integrated.js | head -n 10
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
