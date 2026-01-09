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

console.log(`Cleaning and Restarting Backend on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== STOPPING PM2 ==="
        pm2 stop all
        pm2 delete all
        
        echo ""
        echo "=== KILLING ALL NODE PROCESSES ==="
        pkill -9 node || echo "No node processes to kill"
        
        echo ""
        echo "=== WAITING 2 SECONDS ==="
        sleep 2
        
        echo ""
        echo "=== VERIFYING CLEAN STATE ==="
        ps aux | grep node | grep -v grep || echo "✓ No node processes running"
        
        echo ""
        echo "=== STARTING BACKEND VIA PM2 ==="
        cd /var/www/cocolu-chatbot
        pm2 start app-integrated.js --name cocolu-dashoffice
        
        echo ""
        echo "=== WAITING FOR STARTUP ==="
        sleep 3
        
        echo ""
        echo "=== PM2 STATUS ==="
        pm2 status
        
        echo ""
        echo "=== HEALTH CHECK ==="
        curl -s http://127.0.0.1:3009/api/health
        
        echo ""
        echo "=== SAVE PM2 CONFIG ==="
        pm2 save
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Backend cleaned and restarted");
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
