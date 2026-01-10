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

console.log(`🔍 EXACT SELLERS RESPONSE TEST on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== GETTING FRESH TOKEN ==="
        TOKEN=\$(curl -s -X POST https://api.emberdrago.com/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        echo "Token obtained: \${TOKEN:0:40}..."
        
        echo ""
        echo "=== EXACT RESPONSE FROM https://api.emberdrago.com/api/sellers ==="
        curl -v https://api.emberdrago.com/api/sellers \\
          -H "Authorization: Bearer \$TOKEN" \\
          -H "Origin: https://cocolu.emberdrago.com" \\
          -H "Accept: application/json" \\
          2>&1 | head -80
        
        echo ""
        echo ""
        echo "=== CHECKING PM2 LOGS FOR CRASH ==="
        pm2 logs cocolu-dashoffice --lines 15 --nostream 2>&1 | grep -i "error" | tail -10
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Response test complete");
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
