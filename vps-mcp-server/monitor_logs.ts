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

console.log(`Monitoring Backend Logs on ${config.host}...`);
console.log("Watching for login attempts...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== CURRENT PM2 STATUS ==="
        pm2 status
        
        echo ""
        echo "=== WATCHING LOGS (Press Ctrl+C on server to stop) ==="
        echo "Try login now..."
        pm2 logs cocolu-dashoffice --lines 100 --nostream
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        }).stderr.on("data", (data: any) => {
            console.error(data.toString());
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
