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

console.log(`🔍 VERIFICACIÓN POST-F IX...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== PM2 LOGS - ÚLTIMOS ERRORES ==="
        pm2 logs cocolu-dashoffice --err --lines 30 --nostream 2>&1 | tail -30
        
        echo ""
        echo "=== VERIFICAR CONTENIDO DE ARCHIVO installments.routes.js ==="
        grep "FROM" /var/www/cocolu-chatbot/src/api/installments.routes.js | head -3
        
        echo ""
        echo "=== VERIFICAR CONTENIDO DE ARCHIVO accounts-receivable.routes.js ==="
        grep "FROM" /var/www/cocolu-chatbot/src/api/accounts-receivable.routes.js | head -3
        
        echo ""
        echo "=== PROBAR ENDPOINT DIRECTO ==="
        curl http://127.0.0.1:3009/api/installments/stats 2>&1
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
