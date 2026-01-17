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

console.log(`Checking CORS Configuration on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== CHECKING CORS IN app-integrated.js ==="
        grep -A 20 "cors" app-integrated.js | head -30
        
        echo ""
        echo ""
        echo "=== TESTING CORS WITH ORIGIN HEADER ==="
        curl -v -X OPTIONS https://api.emberdrago.com/api/login \\
          -H "Origin: https://cocolu.emberdrago.com" \\
          -H "Access-Control-Request-Method: POST" \\
          -H "Access-Control-Request-Headers: content-type" \\
          2>&1 | grep -i "access-control"
        
        echo ""
        echo ""
        echo "=== TESTING ACTUAL POST WITH ORIGIN ==="
        curl -v -X POST https://api.emberdrago.com/api/login \\
          -H "Origin: https://cocolu.emberdrago.com" \\
          -H "Content-Type: application/json" \\
          -d '{"username":"admin@cocolu.com","password":"password123"}' \\
          --max-time 10 2>&1 | grep -E "(HTTP|access-control|success)"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ CORS check complete");
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        }).stderr.on("data", (data: any) => {
            console.error("ERR:", data.toString());
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
