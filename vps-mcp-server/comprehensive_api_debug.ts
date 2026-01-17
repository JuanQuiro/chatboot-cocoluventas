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

console.log(`🔍 COMPREHENSIVE API DEBUG on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== 1. GET TOKEN ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        echo "Token: \${TOKEN:0:40}..."
        
        echo ""
        echo "=== 2. TEST INTERNAL (localhost:3009) ==="
        curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" | head -c 300
        
        echo ""
        echo ""
        echo "=== 3. TEST EXTERNAL THROUGH NGINX (with CORS headers) ==="
        curl -vs https://api.emberdrago.com/api/sellers \\
          -H "Authorization: Bearer \$TOKEN" \\
          -H "Origin: https://cocolu.emberdrago.com" \\
          -H "Accept: application/json" \\
          2>&1 | grep -E "(HTTP|Content-Type|Access-Control|Location)" | head -20
        
        echo ""
        echo ""
        echo "=== 4. CHECK NGINX CONFIG FOR /api/ ==="
        grep -A 10 "location /api/" /etc/nginx/sites-enabled/api.emberdrago.com 2>/dev/null || echo "Config not found"
        
        echo ""
        echo "=== 5. CHECK PM2 STATUS ==="
        pm2 status | grep cocolu
        
        echo ""
        echo "=== 6. CHECK BACKEND LOGS FOR ERRORS ==="
        pm2 logs cocolu-dashoffice --lines 20 --nostream 2>&1 | tail -20
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ API debug complete");
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
