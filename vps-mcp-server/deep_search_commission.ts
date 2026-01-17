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

console.log(`🔍 DEEP SEARCH for commission_rate on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== SEARCHING ENTIRE CODEBASE ==="
        grep -r "commission_rate" src/ --include="*.js" 2>/dev/null || echo "Not found in src/"
        
        echo ""
        echo "=== SEARCHING ROOT FILES ==="
        grep -r "commission_rate" *.js 2>/dev/null || echo "Not found in root"
        
        echo ""
        echo "=== CHECKING APP-INTEGRATED.JS FOR SELLERS ROUTE ==="
        grep -n "sellers" app-integrated.js | head -20
        
        echo ""
        echo "=== CHECKING WHAT ROUTES ARE LOADED ==="
        grep -n "require.*routes" app-integrated.js | head -20
        
        echo ""
        echo "=== PM2 ERROR LOGS (commission_rate errors) ==="
        pm2 logs cocolu-dashoffice --lines 50 --nostream 2>&1 | grep -i "commission_rate" | head -10
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Deep search complete");
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
