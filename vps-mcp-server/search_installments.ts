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

console.log(`🔍 Searching for existing installments code on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== SEARCHING FOR INSTALLMENTS in ALL FILES ==="
        grep -r "installments" src/api/*.js | grep -E "(app.get|app.post|router.get)" | head -20
        
        echo ""
        echo "=== FILES THAT MIGHT HAVE INSTALLMENTS ==="
        grep -l "installments" src/api/*.js
        
        echo ""
        echo "=== CHECKING ENHANCED-ROUTES.JS FOR INSTALLMENTS ==="
        grep -n "installments" src/api/enhanced-routes.js | head -10
        
        echo ""
        echo "=== GET EXACT LINE CAUSING ERROR ==="
        pm2 logs cocolu-dashoffice --lines 50 --nostream 2>&1 | grep -A 5 "installments" | head -30
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Search complete");
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
