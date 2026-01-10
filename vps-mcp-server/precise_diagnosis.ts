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

console.log(`🔍 DIAGNÓSTICO PRECISO DEL ERROR...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== 1. ESTADO ACTUAL PM2 ==="
        pm2 list
        
        echo ""
        echo "=== 2. ÚLTIMOS 100 LOGS (BUSCAR ERROR) ==="
        pm2 logs cocolu-dashoffice --lines 100 --nostream 2>&1 | grep -E "Error|error|ERROR|SyntaxError|Cannot|Failed" | tail -30
        
        echo ""
        echo "=== 3. NGINX ERROR LOG ==="
        tail -50 /var/log/nginx/error.log | grep "installments\\|accounts"
        
        echo ""
        echo "=== 4. TESTEANDO DIRECTO DESDE SERVIDOR ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "Probando sellers (funciona):"
        curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" | head -c 100
        
        echo ""
        echo ""
        echo "Probando installments (FALLA):"
        curl -v http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer \$TOKEN" 2>&1 | grep -E "HTTP|conn|error|Error"
        
        echo ""
        echo "=== 5. VERIFICAR SI ARCHIVOS DE RUTAS EXISTEN ==="
        ls -la src/api/simple-* 2>/dev/null || echo "NO EXISTEN"
        
        echo ""
        echo "=== 6. VERIFICAR CARGA EN APP-INTEGRATED.JS ==="
        grep -n "simple-installments\\|simple-accounts" app-integrated.js
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Diagnóstico completo");
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
