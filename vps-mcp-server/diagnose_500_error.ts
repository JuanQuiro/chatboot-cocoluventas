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

console.log(`🔍 DIAGNÓSTICO DEL ERROR 500...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== PM2 STATUS ==="
        pm2 list | grep cocolu
        
        echo ""
        echo "=== ÚLTIMOS 50 LOGS DE ERROR ==="
        pm2 logs cocolu-dashoffice --err --lines 50 --nostream 2>&1 | tail -50
        
        echo ""
        echo "=== VERIFICAR ARCHIVOS SUBIDOS ==="
        ls -la src/api/installments.routes.js src/api/accounts-receivable.routes.js 2>/dev/null || echo "Archivos NO existen"
        
        echo ""
        echo "=== PROBAR ENDPOINT DIRECTO DESDE SERVIDOR ==="
        curl -v http://127.0.0.1:3009/api/installments/stats 2>&1 | grep -E "HTTP|Content|error|Error"
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
