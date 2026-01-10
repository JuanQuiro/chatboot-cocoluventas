import { Client } from "ssh2";
import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__filename, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
};

console.log(`🔧 ARREGLANDO NOMBRES DE TABLAS EN RUTAS...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/src/api
        
        echo "=== MODIFICANDO installments.routes.js para usar 'cuotas' ==="
        sed -i 's/FROM installments/FROM cuotas/g' installments.routes.js
        sed -i 's/table: installments/table: cuotas/g' installments.routes.js
        
        echo "=== MODIFICANDO accounts-receivable.routes.js para usar 'cuentas_por_cobrar' ==="
        sed -i 's/FROM accounts_receivable/FROM cuentas_por_cobrar/g' accounts-receivable.routes.js
        sed -i 's/FROM accounts-receivable/FROM cuentas_por_cobrar/g' accounts-receivable.routes.js
        sed -i 's/table: accounts/table: cuentas_por_cobrar/g' accounts-receivable.routes.js
        
        echo "✅ Nombres de tablas actualizados"
        
        echo ""
        echo "=== REINICIAR PM2 ==="
        cd /var/www/cocolu-chatbot
        pm2 restart cocolu-dashoffice
        sleep 7
        
        echo ""
        echo "=== PROBAR ENDPOINTS ==="
        curl -s http://127.0.0.1:3009/api/installments/stats 2>&1
        
        echo ""
        echo ""
        echo "🎉 ¡ARREGLADO! - Recarga la página"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Fix aplicado");
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
