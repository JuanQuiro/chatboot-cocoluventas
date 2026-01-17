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

console.log(`🚨 EMERGENCY: Checking Backend Status on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== PM2 STATUS ==="
        pm2 status
        
        echo ""
        echo "=== PM2 LOGS (last 30 lines) ==="
        pm2 logs cocolu-dashoffice --lines 30 --nostream
        
        echo ""
        echo "=== TESTING ENDPOINT DIRECTLY ==="
        curl -s http://127.0.0.1:3009/api/health | head -c 500
        
        echo ""
        echo ""
        echo "=== IF CRASHED, RESTARTING ==="
        pm2 restart cocolu-dashoffice --update-env
        sleep 3
        
        echo ""
        echo "=== POST-RESTART TEST ==="
        curl -s http://127.0.0.1:3009/api/health
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Emergency check complete");
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        }).stderr.on("data", (data: any) => {
            console.error("STDERR:", data.toString());
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
