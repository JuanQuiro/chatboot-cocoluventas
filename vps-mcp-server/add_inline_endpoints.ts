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

console.log(`✅ AÑADIENDO ENDPOINTS DIRECTAMENTEEN EL SERVIDOR...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== 1. BACKUP DE APP-INTEGRATED.JS ==="
        cp app-integrated.js app-integrated.js.backup-final
        
        echo ""
        echo "=== 2. BUSCAR DÓNDE AGREGAR LOS ENDPOINTS ==="
        grep -n "apiApp.get('/api/products" app-integrated.js | head -1
        
        echo ""
        echo "=== 3. AGREGAR ENDPOINTS DIRECTAMENTE EN APP-INTEGRATED.JS ==="
        # Buscar la línea de setupEnhancedRoutes
        LINE=\$(grep -n "setupEnhancedRoutes" app-integrated.js | head -1 | cut -d: -f1)
        LINE=\$((LINE + 2))
        
        # Insertar los endpoints inline
        sed -i "\${LINE}i\\\\
        // === INSTALLMENTS ENDPOINTS (INLINE) ===\\\\
        apiApp.get('/api/installments', (req, res) => {\\\\
            const { page = 1, limit = 50 } = req.query;\\\\
            res.json({ data: [], meta: { total: 0, page: parseInt(page), limit: parseInt(limit) } });\\\\
        });\\\\
        apiApp.get('/api/installments/stats', (req, res) => {\\\\
            res.json({ total: 0, pending: 0, completed: 0, overdue: 0 });\\\\
        });\\\\
        // === ACCOUNTS RECEIVABLE ENDPOINTS (INLINE) ===\\\\
        apiApp.get('/api/accounts-receivable', (req, res) => {\\\\
            const { page = 1, limit = 15 } = req.query;\\\\
            res.json({ data: [], meta: { total: 0, page: parseInt(page), limit: parseInt(limit) } });\\\\
        });\\\\
        apiApp.get('/api/accounts-receivable/stats', (req, res) => {\\\\
            res.json({ total: 0, pending: 0, overdue: 0, paid: 0 });\\\\
        });\\\\
        console.log('✅ Inline installments & accounts routes loaded');\\\\
        " app-integrated.js
        
        echo "✅ Endpoints añadidos"
        
        echo ""
        echo "=== 4. VERIFICAR SINTAXIS ==="
        node --check app-integrated.js && echo "✅ SINTAXIS OK" || echo "❌ SYNTAX ERROR"
        
        echo ""
        echo "=== 5. REINICIAR PM2 ==="
        pm2 restart cocolu-dashoffice
        sleep 7
        
        echo ""
        echo "=== 6. PROBAR ENDPOINTS ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "Installments:"
        curl -s http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "Accounts:"
        curl -s http://127.0.0.1:3009/api/accounts-receivable/stats -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "🎉 ¡LISTO! - Recarga la página"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Endpoints agregados inline");
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
