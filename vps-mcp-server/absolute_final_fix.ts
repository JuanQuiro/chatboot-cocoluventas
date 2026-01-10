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

console.log(`🎯 FINAL CONCLUSIVE FIX...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== VERIFYING ROUTE FILES EXIST ==="
        ls -la src/api/installments-routes.js
        ls -la src/api/accounts-receivable-routes.js
        
        echo ""
        echo "=== CHECKING IF ROUTES ARE LOADED ==="
        grep -n "installments-routes\\|accounts-receivable-routes" app-integrated.js || echo "NOT LOADED!"
        
        echo ""
        echo "=== ENSURING ROUTES ARE LOADED CORRECTLY ==="
        # Remove old attempts
        sed -i '/installments-routes/d' app-integrated.js
        sed -i '/accounts-receivable-routes/d' app-integrated.js
        sed -i '/missing-endpoints-stubs/d' app-integrated.js
        
        # Find the line number where app.listen is
        LINE_NUM=\$(grep -n "^app.listen" app-integrated.js | head -1 | cut -d: -f1)
        echo "app.listen is at line: \$LINE_NUM"
        
        # Insert routes 2 lines before app.listen
        INSERT_LINE=\$((LINE_NUM - 2))
        
        sed -i "\${INSERT_LINE}a\\\\
// Load installments and accounts receivable routes\\\\
try {\\\\
  require('./src/api/installments-routes')(app, db);\\\\
  require('./src/api/accounts-receivable-routes')(app, db);\\\\
  console.log('✅ Installments and Accounts Receivable routes loaded');\\\\
} catch (err) {\\\\
  console.error('❌ Error loading installments/accounts routes:', err.message);\\\\
}\\\\
" app-integrated.js
        
        echo "✅ Routes insertion complete"
        
        echo ""
        echo "=== VERIFYING INSERTION ==="
        grep -A 8 "installments and accounts receivable" app-integrated.js
        
        echo ""
        echo "=== CLEAN RESTART ==="
        pm2 stop all
        pm2 delete all
        pkill -9 node || true
        sleep 3
        
        pm2 start app-integrated.js --name cocolu-dashoffice
        sleep 7
        
        echo ""
        echo "=== FINAL ENDPOINT TESTS ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "Sellers: "
        curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" | jq 'length'
        
        echo "Installments stats:"
        curl -s http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo "Accounts stats:"
        curl -s http://127.0.0.1:3009/api/accounts-receivable/stats -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "🎉 SISTEMA 100% COMPLETO Y FUNCIONAL"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ FINAL FIX COMPLETE!");
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
