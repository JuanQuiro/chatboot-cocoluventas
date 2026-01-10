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

console.log(`🔄 COMPLETE CODE REFRESH on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== STOPPING PM2 ==="
        pm2 stop all
        pm2 delete all
        pkill -9 node || true
        sleep 2
        
        echo ""
        echo "=== GIT STATUS ==="
        git status
        
        echo ""
        echo "=== RESETTING TO CLEAN STATE ==="
        git reset --hard
        git pull origin master || true
        
        echo ""
        echo "=== VERIFYING SELLERS ROUTES CODE ==="
        grep -n "SELECT.*FROM sellers" src/api/*.js 2>/dev/null | head -10
        
        echo ""
        echo "=== STARTING PM2 WITH CLEAN NODE ==="
        pm2 start app-integrated.js --name cocolu-dashoffice --update-env --no-automation
        sleep 5
        
        echo ""
        echo "=== TESTING AFTER RESTART ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "Testing /api/sellers:"
        curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" | head -c 200
        
        echo ""
        echo ""
        echo "=== PM2 STATUS ==="
        pm2 status
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Complete code refresh done");
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
