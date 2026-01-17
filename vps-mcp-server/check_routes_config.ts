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

console.log(`Checking Route Configuration on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== CHECKING WHICH ROUTES FILE IS USED ==="
        grep -r "setupRoutes" app-integrated.js | head -5
        
        echo ""
        echo "=== CHECKING IF simple-users.routes.js IS IMPORTED ==="
        grep -n "simple-users" src/api/routes.js
        grep -n "simple-users" src/api/dashboard-routes.js 2>/dev/null || echo "Not in dashboard-routes"
        
        echo ""
        echo "=== CHECKING app-integrated.js FOR ROUTE SETUP ==="
        grep -A 5 -B 5 "api.*routes" app-integrated.js | head -30
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Check complete");
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
