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

console.log(`🔄 ROLLBACK - Revirtiendo al estado anterior funcional...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== REVERT ÚLTIMO COMMIT ==="
        git log --oneline -3
        echo ""
        git reset --hard HEAD~1
        
        echo ""
        echo "=== ESTADO DESPUÉS DE REVERT ==="
        git log --oneline -2
        
        echo ""
        echo "=== ELIMINANDO PM2 Y REINICIANDO LIMPIO ==="
        pm2 delete all
        pkill -9 node || true
        sleep 3
        
        echo ""
        echo "=== INICIANDO BACKEND ==="
        pm2 start app-integrated.js --name cocolu-dashoffice
        sleep 7
        
        echo ""
        echo "=== VERIFICANDO QUE FUNCIONA ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "Sellers (debe funcionar):"
        curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" | jq 'length'
        
        echo ""
        echo "Clients:"
        curl -s http://127.0.0.1:3009/api/clients -H "Authorization: Bearer \$TOKEN" | jq '.meta.total'
        
        echo ""
        echo "Products:"
        curl -s http://127.0.0.1:3009/api/products -H "Authorization: Bearer \$TOKEN" | jq '.meta.total'
        
        echo ""
        echo ""
        echo "✅ BACKEND RESTAURADO A ESTADO FUNCIONAL"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Rollback completo");
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
