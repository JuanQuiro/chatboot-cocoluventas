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

console.log(`🔍 Debugging installments endpoint on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== CHECKING IF STUBS FILE EXISTS ==="
        ls -la src/api/missing-endpoints-stubs.js || echo "FILE NOT FOUND!"
        
        echo ""
        echo "=== CHECKING IF LOADED IN APP-INTEGRATED.JS ==="
        grep "missing-endpoints-stubs" app-integrated.js || echo "NOT LOADED!"
        
        echo ""
        echo "=== PM2 LOGS (last 30 lines) ==="
        pm2 logs cocolu-dashoffice --lines 30 --nostream 2>&1 | grep -E "(error|Error|installments|500)" | tail -20
        
        echo ""
        echo "=== TESTING ENDPOINT DIRECTLY ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "Testing /api/installments/stats:"
        curl -v http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer \$TOKEN" 2>&1 | head -50
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
