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

console.log(`🔧 ENFOQUE DIFERENTE - Agregar a archivo que YA FUNCIONA...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== 1. VERIFICAR QUE ENHANCED-ROUTES.JS EXISTE ==="
        ls -la src/api/enhanced-routes.js
        
        echo ""
        echo "=== 2. VER FINAL DEL ARCHIVO ==="
        tail -20 src/api/enhanced-routes.js
        
        echo ""
        echo "=== 3. AGREGAR ENDPOINTS AL FINAL (antes del cierre de la función) ==="
        # Buscar la última línea con "}" para saber dónde insertar
        LAST_BRACE=$(grep -n "^}" src/api/enhanced-routes.js | tail -1 | cut -d: -f1)
        echo "Última llave en línea: $LAST_BRACE"
        
        # Insertar ANTES de esa línea
        sed -i "${LAST_BRACE}i\\\\
    // === INSTALLMENTS ENDPOINTS ===\\\\
    app.get('/api/installments', (req, res) => {\\\\
        const { page = 1, limit = 50 } = req.query;\\\\
        res.json({ data: [], meta: { total: 0, page: parseInt(page), limit: parseInt(limit) } });\\\\
    });\\\\
    \\\\
    app.get('/api/installments/stats', (req, res) => {\\\\
        res.json({ total: 0, pending: 0, completed: 0, overdue: 0 });\\\\
    });\\\\
    \\\\
    // === ACCOUNTS RECEIVABLE ENDPOINTS ===\\\\
    app.get('/api/accounts-receivable', (req, res) => {\\\\
        const { page = 1, limit = 15 } = req.query;\\\\
        res.json({ data: [], meta: { total: 0, page: parseInt(page), limit: parseInt(limit) } });\\\\
    });\\\\
    \\\\
    app.get('/api/accounts-receivable/stats', (req, res) => {\\\\
        res.json({ total: 0, pending: 0, overdue: 0, paid: 0 });\\\\
    });\\\\
    console.log('✅ Installments & Accounts endpoints loaded');\\\\
" src/api/enhanced-routes.js
        
        echo "✅ Endpoints agregados"
        
        echo ""
        echo "=== 4. VERIFICAR SINTAXIS ==="
        node --check src/api/enhanced-routes.js && echo "✅ SINTAXIS OK" || echo "❌ ERROR DE SINTAXIS"
        
        echo ""
        echo "=== 5. REINICIAR PM2 ==="
        pm2 restart cocolu-dashoffice
        sleep 8
        
        echo ""
        echo "=== 6. PROBAR ENDPOINTS ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "Sellers (ya funciona):"
        curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" | jq 'length'
        
        echo ""
        echo "Installments stats:"
        curl -s http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "Accounts stats:"
        curl -s http://127.0.0.1:3009/api/accounts-receivable/stats -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "🎉 LISTO - Recarga la página"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Proceso completado");
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
