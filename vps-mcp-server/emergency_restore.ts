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

console.log(`🚨 RESTAURANDO BACKEND INMEDIATAMENTE...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== PM2 STATUS ==="
        pm2 list | grep cocolu || echo "PM2 NO CORRIENDO"
        
        echo ""
        echo "=== RESTAURAR DESDE BACKUP ==="
        cp app-integrated-backup-final.js app-integrated.js
        
        echo ""
        echo "=== MATAR TODO NODE Y PM2 ==="
        pm2 delete all
        pkill -9 node || true
        sleep 3
        
        echo ""
        echo "=== INICIAR PM2 LIMPIO ==="
        pm2 start app-integrated.js --name cocolu-dashoffice
        sleep 10
        
        echo ""
        echo "=== VERIFICAR ==="
        pm2 list
        
        echo ""
        echo "=== PROBAR HEALTH ==="
        curl -s http://127.0.0.1:3009/api/health
        
        echo ""
        echo ""
        echo "✅ BACKEND RESTAURADO - Prueba login ahora"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Restauración completa");
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
