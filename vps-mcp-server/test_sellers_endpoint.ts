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

console.log(`Testing Sellers Endpoint on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        
        echo "Token: \${TOKEN:0:40}..."
        echo ""
        echo "=== TESTING /api/sellers ==="
        curl -v http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" 2>&1 | head -60
        
        echo ""
        echo ""
        echo "=== CHECKING DATABASE ==="
        sqlite3 /var/www/cocolu-chatbot/data/cocolu.db "SELECT * FROM sellers LIMIT 2;"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Sellers endpoint test complete");
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
