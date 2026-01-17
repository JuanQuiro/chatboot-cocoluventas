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

console.log(`🚀 DEPLOYANDO CÓDIGO DESDE GITHUB...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== PULL FROM GITHUB ==="
        git pull origin master
        
        echo ""
        echo "=== VERIFICANDO ARCHIVOS NUEVOS ==="
        ls -la src/api/installments.routes.js src/api/accounts-receivable.routes.js
        
        echo ""
        echo "=== REINICIANDO PM2 ==="
        pm2 restart cocolu-dashoffice
        sleep 7
        
        echo ""
        echo "=== TESTING ENDPOINTS ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "1. Sellers (debe funcionar):"
        curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" | jq 'length'
        
        echo ""
        echo "2. Installments stats (AHORA DEBE FUNCIONAR):"
        curl -s http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "3. Accounts stats (AHORA DEBE FUNCIONAR):"
        curl -s http://127.0.0.1:3009/api/accounts-receivable/stats -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "🎉 DEPLOY COMPLETO - RECARGA LA PÁGINA"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ DEPLOY COMPLETADO");
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
