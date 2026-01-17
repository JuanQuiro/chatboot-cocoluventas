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

console.log(`Restarting Backend on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== STOPPING PM2 ==="
        pm2 stop all
        pm2 delete all
        
        echo ""
        echo "=== WAITING 2s ==="
        sleep 2
        
        echo ""
        echo "=== STARTING BACKEND ==="
        pm2 start app-integrated.js --name cocolu-dashoffice --update-env
        
        echo ""
        echo "=== WAITING FOR STARTUP (5s) ==="
        sleep 5
        
        echo ""
        echo "=== TESTING /api/users ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login \\
          -H "Content-Type: application/json" \\
          -d '{"username":"admin@cocolu.com","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        
        echo "Got token: \${TOKEN:0:30}..."
        
        curl -v http://127.0.0.1:3009/api/users \\
          -H "Authorization: Bearer \$TOKEN" \\
          2>&1 | head -40
        
        echo ""
        echo ""
        echo "=== PM2 STATUS ==="
        pm2 status
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Backend restarted");
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
