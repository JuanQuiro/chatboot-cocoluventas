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

console.log(`🔍 CHECKING which endpoints exist on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/src/api
        
        echo "=== ALL ROUTE FILES ==="
        ls -la *.js | awk '{print $9}'
        
        echo ""
        echo "=== SEARCHING FOR accounts-receivable ==="
        grep -r "accounts-receivable" . 2>/dev/null || echo "NOT FOUND"
        
        echo ""
        echo "=== SEARCHING FOR installments ==="
        grep -r "installments" . 2>/dev/null || echo "NOT FOUND"
        
        echo ""
        echo "=== ALL APP.GET ROUTES IN APP-INTEGRATED.JS ==="
        grep -n "app.get\\|app.post\\|app.put\\|app.delete" /var/www/cocolu-chatbot/app-integrated.js | grep "/api/" | head -30
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Endpoint check complete");
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
