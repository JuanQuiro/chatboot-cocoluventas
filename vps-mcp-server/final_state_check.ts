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

console.log(`🔍 VERIFICACIÓN FINAL - ¿Por qué sigue fallando?`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== 1. VERIFICAR QUE SRC SE REEMPLAZÓ ==="
        ls -la src/api/ | head -10
        
        echo ""
        echo "=== 2. VER ÚLTIMO ERROR EN PM2 ==="
        pm2 logs cocolu-dashoffice --err --lines 100 --nostream 2>&1 | grep -A 20 "installments" | tail -30
        
        echo ""
        echo "=== 3. PROBAR ENDPOINT DIRECTO ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "Testing /api/sellers (works):"
        curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" | jq 'length'
        
        echo ""
        echo "Testing /api/installments/stats (fails):"
        curl -v http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer \$TOKEN" 2>&1 | grep -E "HTTP|installments|error|Error"
        
        echo ""
        echo "=== 4. VERIFICAR SI RUTA EXISTE EN APP-INTEGRATED.JS ==="
        grep -n "installments" app-integrated.js || echo "NO FOUND!"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Verificación completa");
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
