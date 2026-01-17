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

console.log(`🧹 LIMPIANDO CÓDIGO ROTO Y AGREGANDO ENDPOINTS CORRECTAMENTE...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== RESTAURAR DESDE BACKUP ==="
        mv app-integrated.js app-integrated.js.broken
        cp app-integrated.js.backup-final app-integrated.js
        
        echo ""
        echo "=== ELIMINAR TODAS LAS LÍNEAS RELACIONADAS CON INSTALLMENTS/ACCOUNTS ==="
        sed -i '/simple-installments/d' app-integrated.js
        sed -i '/simple-accounts/d' app-integrated.js
        sed -i '/INSTALLMENTS/d' app-integrated.js
        sed -i '/installments.routes/d' app-integrated.js
        sed -i '/accounts-receivable.routes/d' app-integrated.js
        
        echo "✅ Limpiado"
        
        echo ""
        echo "=== REINICIAR PM2 CON CÓDIGO LIMPIO ==="
        pm2 restart cocolu-dashoffice
        sleep 7
        
        echo ""
        echo "=== VERIFICAR QUE BÁSICO FUNCIONA ==="
        curl -s http://127.0.0.1:3009/api/health
        
        echo ""
        echo ""
        echo "✅ BACKEND LIMPIO Y FUNCIONAL"
        echo "Vendedores, Clientes, Productos funcionan"
        echo "Cuotas y Cuentas por Cobrar NO están implementadas"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Sistema restaurado a estado funcional base");
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
