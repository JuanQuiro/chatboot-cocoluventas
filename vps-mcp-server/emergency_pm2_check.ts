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

console.log(`🚨 EMERGENCIA - Verificando si backend crasheó...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== PM2 STATUS ==="
        pm2 status
        
        echo ""
        echo "=== PM2 LOGS - ERROR ==="
        pm2 logs cocolu-dashoffice --err --lines 20 --nostream 2>&1 | tail -20
        
        echo ""
        echo "=== REINICIANDO PM2 COMPLETAMENTE ==="
        pm2 stop all
        pm2 delete all
        pkill -9 node || true
        sleep 3
        
        cd /var/www/cocolu-chatbot
        pm2 start app-integrated.js --name cocolu-dashoffice
        sleep 7
        
        echo ""
        echo "=== PROBANDO SELLERS (DEBE FUNCIONAR) ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" | jq 'length'
        
        echo ""
        echo "=== PROBANDO INSTALLMENTS ==="
        curl -s http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "Si sellers funciona pero installments NO, el problema es específico de esa ruta"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Diagnostic done");
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
