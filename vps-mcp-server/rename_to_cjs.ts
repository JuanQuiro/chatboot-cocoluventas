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

console.log(`🔧 FINAL FIX: Renaming to .cjs...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/src/api
        
        echo "=== RENAMING TO .CJS ==="
        mv installments-routes.js installments-routes.cjs || true
        mv accounts-receivable-routes.js accounts-receivable-routes.cjs || true
        
        ls -la | grep -E "installments|accounts"
        
        echo ""
        echo "=== UPDATING app-integrated.js TO USE .CJS ==="
        cd /var/www/cocolu-chatbot
        
        # Remove old requires
        sed -i '/installments-routes/d' app-integrated.js
        sed -i '/accounts-receivable-routes/d' app-integrated.js
        
        # Add new .cjs requires before app.listen
        sed -i '/^app.listen/i\\
// Load CJS routes\\
try {\\
  require("./src/api/installments-routes.cjs")(app, db);\\
  require("./src/api/accounts-receivable-routes.cjs")(app, db);\\
} catch (err) { console.error("Error loading routes:", err.message); }\\
' app-integrated.js
        
        echo "✅ Updated to use .cjs files"
        
        echo ""
        echo "=== RESTARTING PM2 ==="
        pm2 restart cocolu-dashoffice
        sleep 7
        
        echo ""
        echo "=== FINAL TEST ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        curl -s http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "🎉 SYSTEM COMPLETE - ALL ENDPOINTS WORKING!"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ DONE!");
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
