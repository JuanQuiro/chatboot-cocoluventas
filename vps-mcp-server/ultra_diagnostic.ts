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

console.log(`🔍 ULTRA DEEP DIAGNOSTIC...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== 1. CHECKING PM2 CURRENT STATUS ==="
        pm2 describe cocolu-dashoffice | grep -E "status|restart|uptime"
        
        echo ""
        echo "=== 2. LAST 30 PM2 LOG LINES ==="
        pm2 logs cocolu-dashoffice --lines 30 --nostream 2>&1
        
        echo ""
        echo "=== 3. CHECK IF ROUTES ARE ACTUALLY LOADED ==="
        grep -n "installments\\|accounts" app-integrated.js | tail -15
        
        echo ""
        echo "=== 4. VERIFY ROUTE FILES EXIST ==="
        ls -la src/api/ | grep -E "installments|accounts"
        
        echo ""
        echo "=== 5. TEST IF NODE CAN LOAD THE ROUTES ==="
        node -e "
        const db = require('better-sqlite3')('./data/cocolu.db');
        console.log('DB loaded OK');
        
        const express = require('express');
        const app = express();
        
        try {
          const routes = require('./src/api/installments-routes');
          console.log('installments-routes required:', typeof routes);
          routes(app, db);
          console.log('✅ Installments routes executed successfully');
        } catch (err) {
          console.error('❌ ERROR:', err.message);
        }
        " 2>&1
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Ultra diagnostic done");
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
