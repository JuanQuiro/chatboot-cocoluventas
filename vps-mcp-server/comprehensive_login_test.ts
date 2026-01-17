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

console.log(`Comprehensive Login Test on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== TEST 1: Direct Backend Login (Internal) ==="
        time curl -v -X POST http://127.0.0.1:3009/api/login \\
          -H "Content-Type: application/json" \\
          -d '{"username":"admin@cocolu.com","password":"password123"}' \\
          --max-time 10 2>&1 | head -100
        
        echo ""
        echo ""
        echo "=== TEST 2: Nginx Proxy Login (External Domain) ==="
        time curl -v -X POST https://api.emberdrago.com/api/login \\
          -H "Content-Type: application/json" \\
          -H "Origin: https://cocolu.emberdrago.com" \\
          -d '{"username":"admin@cocolu.com","password":"password123"}' \\
          --max-time 10 2>&1 | head -100
        
        echo ""
        echo ""
        echo "=== NGINX ACCESS LOG (last 10 lines) ==="
        tail -10 /var/log/nginx/access.log 2>/dev/null || echo "No access log"
        
        echo ""
        echo "=== NGINX ERROR LOG (last 10 lines) ==="
        tail -10 /var/log/nginx/error.log 2>/dev/null || echo "No error log"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Tests complete");
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
