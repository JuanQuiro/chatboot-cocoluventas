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

console.log(`Adding Users Route Directly to VPS on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/src/api
        
        # Check if the route file properly exports
        echo "=== CHECKING simple-users.routes.js EXPORT ==="
        tail -5 simple-users.routes.js
        
        echo ""
        echo "=== CHECKING routes.js IMPORT ==="
        grep -A 2 "simple-users" routes.js | head -6
        
        echo ""
        echo "=== CHECKING IF routes.js IS CALLING app.use ==="
        grep "app.use.*users" routes.js
        
        echo ""
        echo "=== RESTARTING BACKEND WITH DEBUG ==="
        cd /var/www/cocolu-chatbot
        pm2 restart cocolu-dashoffice --update-env
        sleep 4
        
        echo ""
        echo "=== TESTING AGAIN ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        curl -s http://127.0.0.1:3009/api/users -H "Authorization: Bearer \$TOKEN"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Check complete");
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
