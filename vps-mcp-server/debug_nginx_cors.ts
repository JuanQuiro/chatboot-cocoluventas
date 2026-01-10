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

console.log(`🔍 DEBUGGING NGINX AND CORS on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== NGINX CONFIGURATION FOR API ==="
        cat /etc/nginx/sites-enabled/api.emberdrago.com
        
        echo ""
        echo ""
        echo "=== TESTING WITH CURL (exact same as browser) ==="
        TOKEN=$(curl -s -X POST https://api.emberdrago.com/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "Testing /api/sellers with CORS headers:"
        curl -v https://api.emberdrago.com/api/sellers \\
          -H "Authorization: Bearer $TOKEN" \\
          -H "Origin: https://cocolu.emberdrago.com" \\
          -H "Accept: application/json" \\
          2>&1 | head -80
        
        echo ""
        echo ""
        echo "=== CHECKING NGINX ERROR LOGS ==="
        tail -20 /var/log/nginx/error.log
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Debug complete");
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
