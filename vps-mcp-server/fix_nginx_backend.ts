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

console.log(`🔧 FIXING NGINX-BACKEND CONNECTION on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== PROBLEM: Nginx can't connect to backend ==="
        echo "Nginx says: 'upstream server temporarily disabled'"
        echo ""
        
        echo "=== CHECKING BACKEND PORT ==="
        netstat -tulpn | grep :3009 || echo "❌ Nothing listening on port 3009!"
        
        echo ""
        echo "=== CHECKING PM2 STATUS ==="
        pm2 status
        
        echo ""
        echo "=== RESTARTING BACKEND AND NGINX ==="
        pm2 restart all
        sleep 5
        
        echo ""
        echo "Verifying port 3009 is listening:"
        netstat -tulpn | grep :3009
        
        echo ""
        echo "=== RESTARTING NGINX ==="
        systemctl restart nginx
        sleep 2
        
        echo ""
        echo "=== TESTING CONNECTION ==="
        curl -s http://127.0.0.1:3009/api/health | head -c 100
        
        echo ""
        echo ""
        echo "=== TESTING THROUGH NGINX ==="
        curl -s https://api.emberdrago.com/api/health | head -c 100
        
        echo ""
        echo ""
        echo "=== FINAL TEST WITH TOKEN ==="
        TOKEN=$(curl -s -X POST https://api.emberdrago.com/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        echo "Token: \${TOKEN:0:40}..."
        
        curl -s https://api.emberdrago.com/api/sellers -H "Authorization: Bearer \$TOKEN" -H "Origin: https://cocolu.emberdrago.com" | head -c 200
        
        echo ""
        echo ""
        echo "✅ If you see JSON above, it's fixed!"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Nginx-Backend fix complete");
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
