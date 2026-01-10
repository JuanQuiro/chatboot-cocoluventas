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

console.log(`🔍 DIAGNÓSTICO POST-DEPLOY - ¿Por qué crasheó?`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== PM2 STATUS ==="
        pm2 list
        
        echo ""
        echo "=== PM2 ERROR LOGS (LAST 50) ==="
        pm2 logs cocolu-dashoffice --err --lines 50 --nostream 2>&1 | tail -50
        
        echo ""
        echo "=== VERIFICAR SI PUERTO 3009 ESTÁ ESCUCHANDO ==="
        netstat -tlnp 2>/dev/null | grep 3009 || echo "PUERTO 3009 NO ESTÁ ACTIVO"
        
        echo ""
        echo "=== VERIFICAR SINTAXIS DE ARCHIVOS NUEVOS ==="
        node --check src/api/installments.routes.js 2>&1 || echo "SYNTAX ERROR en installments"
        node --check src/api/accounts-receivable.routes.js 2>&1 || echo "SYNTAX ERROR en accounts-receivable"
        
        echo ""
        echo "=== INTENTAR INICIAR MANUALMENTE ==="
        cd /var/www/cocolu-chatbot
        timeout 5 node app-integrated.js 2>&1 | head -30
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
