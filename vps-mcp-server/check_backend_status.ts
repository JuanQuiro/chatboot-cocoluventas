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

console.log(`Checking Backend Status on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== PM2 STATUS ==="
        pm2 status
        
        echo ""
        echo "=== PM2 LOGS (last 50 lines) ==="
        pm2 logs cocolu-dashoffice --lines 50 --nostream
        
        echo ""
        echo "=== PORT 3009 LISTENING ==="
        netstat -tuln | grep 3009 || echo "Port 3009 NOT listening"
        
        echo ""
        echo "=== HEALTH CHECK (internal) ==="
        curl -s http://127.0.0.1:3009/api/health || echo "Health check FAILED"
        
        echo ""
        echo "=== NODE PROCESSES ==="
        ps aux | grep node | grep -v grep
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
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
