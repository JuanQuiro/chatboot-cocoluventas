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

console.log(`🔍 CHECKING seller-management-routes.js on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/src/api
        
        echo "=== SELLER-MANAGEMENT-ROUTES.JS CONTENT ==="
        cat seller-management-routes.js | head -100
        
        echo ""
        echo "=== CHECKING FOR commission_rate IN THIS FILE ==="
        grep -n "commission_rate" seller-management-routes.js || echo "Not found in this file"
        
        echo ""
        echo "=== CHECKING ALL SELLER RELATED FILES ==="
        ls -la | grep seller
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ File check complete");
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
