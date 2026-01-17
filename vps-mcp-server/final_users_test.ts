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

console.log(`Final Test of /api/users on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== TESTING /api/users (Authenticated) ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        echo "Token obtained: \${TOKEN:0:30}..."
        curl -s http://127.0.0.1:3009/api/users -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "=== TESTING via External Domain ==="
        curl -s https://api.emberdrago.com/api/users -H "Authorization: Bearer \$TOKEN" -H "Origin: https://cocolu.emberdrago.com"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Final test complete");
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
