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

console.log(`🚨 EMERGENCY: Checking why backend is returning 502...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== PM2 STATUS ==="
        pm2 status
        
        echo ""
        echo "=== PM2 LOGS (LAST 50 LINES - LOOKING FOR CRASH) ==="
        pm2 logs cocolu-dashoffice --lines 50 --nostream 2>&1 | tail -50
        
        echo ""
        echo "=== CHECKING IF PORT 3009 IS LISTENING ==="
        netstat -tulpn | grep :3009 || echo "❌ PORT 3009 NOT LISTENING - BACKEND IS DOWN!"
        
        echo ""
        echo "=== RESTARTING BACKEND FORCEFULLY ==="
        pm2 stop all
        pm2 delete all
        pkill -9 node || true
        sleep 3
        
        cd /var/www/cocolu-chatbot
        pm2 start app-integrated.js --name cocolu-dashoffice --no-automation
        sleep 6
        
        echo ""
        echo "=== VERIFYING RESTART ==="
        pm2 status
        netstat -tulpn | grep :3009
        
        echo ""
        echo "=== TESTING HEALTH ENDPOINT ==="
        curl -s http://127.0.0.1:3009/api/health || echo "❌ BACKEND NOT RESPONDING"
        
        echo ""
        echo "=== IF STILL FAILING, CHECK WHAT'S WRONG ==="
        pm2 logs cocolu-dashoffice --lines 20 --nostream 2>&1 | tail -20
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
