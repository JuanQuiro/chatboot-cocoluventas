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

console.log(`Testing Users API on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        # First, login to get token
        echo "=== GETTING AUTH TOKEN ==="
        TOKEN=$(curl -s -X POST http://127.0.0.1:3009/api/login \\
          -H "Content-Type: application/json" \\
          -d '{"username":"admin@cocolu.com","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        
        echo "Token: \${TOKEN:0:50}..."
        
        echo ""
        echo "=== TESTING /api/users ENDPOINT ==="
        curl -v http://127.0.0.1:3009/api/users \\
          -H "Authorization: Bearer \$TOKEN" \\
          2>&1 | head -50
        
        echo ""
        echo ""
        echo "=== CHECKING USERS IN DATABASE ==="
        cd /var/www/cocolu-chatbot/data
        sqlite3 cocolu.db "SELECT id, email, name, role, active FROM users;"
        
        echo ""
        echo "=== PM2 LOGS (last 20 lines) ==="
        pm2 logs cocolu-dashoffice --lines 20 --nostream 2>&1 | tail -20
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Test complete");
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
