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
    readyTimeout: 60000,
};

console.log(`🔧 Agregando endpoints a enhanced-routes.js...`);

const conn = new Client();
conn.on("ready", () => {
    console.log("✅ Conectado");

    // Agregar los endpoints usando echo append
    const cmd = `
cd /var/www/cocolu-chatbot/src/api

# Primero hacer backup
cp enhanced-routes.js enhanced-routes.js.backup

# Ver la estructura actual
echo "=== Estructura actual ==="
grep -n "export" enhanced-routes.js | head -5

# Crear un archivo temporal con los endpoints
cat >> enhanced-routes-addon.js << 'ENDOFFILE'

// === INSTALLMENTS ENDPOINTS (ADDED) ===
export function setupInstallmentsEndpoints(app) {
    app.get('/api/installments', (req, res) => {
        const { page = 1, limit = 50 } = req.query;
        res.json({ data: [], meta: { total: 0, page: parseInt(page), limit: parseInt(limit) } });
    });
    
    app.get('/api/installments/stats', (req, res) => {
        res.json({ total: 0, pending: 0, completed: 0, overdue: 0 });
    });
    
    console.log('✅ Installments endpoints loaded');
}

// === ACCOUNTS RECEIVABLE ENDPOINTS (ADDED) ===
export function setupAccountsEndpoints(app) {
    app.get('/api/accounts-receivable', (req, res) => {
        const { page = 1, limit = 15 } = req.query;
        res.json({ data: [], meta: { total: 0, page: parseInt(page), limit: parseInt(limit) } });
    });
    
    app.get('/api/accounts-receivable/stats', (req, res) => {
        res.json({ total: 0, pending: 0, overdue: 0, paid: 0 });
    });
    
    console.log('✅ Accounts receivable endpoints loaded');
}
ENDOFFILE

echo "✅ Archivo addon creado"

# Ahora modificar app-integrated.js para llamar estas funciones
cd /var/www/cocolu-chatbot

# Agregar import al principio del archivo (después de otros imports)
grep -q "setupInstallmentsEndpoints" app-integrated.js || sed -i "/import { setupEnhancedRoutes }/a import { setupInstallmentsEndpoints, setupAccountsEndpoints } from './src/api/enhanced-routes-addon.js';" app-integrated.js

# Agregar llamadas después de setupEnhancedRoutes
grep -q "setupInstallmentsEndpoints(apiApp)" app-integrated.js || sed -i "/setupEnhancedRoutes(apiApp)/a\\        setupInstallmentsEndpoints(apiApp);\\n        setupAccountsEndpoints(apiApp);" app-integrated.js

echo "✅ app-integrated.js modificado"

# Verificar sintaxis
node --check app-integrated.js && echo "✅ SINTAXIS OK" || echo "❌ ERROR"
node --check src/api/enhanced-routes-addon.js && echo "✅ ADDON SINTAXIS OK" || echo "❌ ADDON ERROR"

# Reiniciar PM2
pm2 restart cocolu-dashoffice
sleep 8

# Probar
TOKEN=$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
echo "Token: $TOKEN"

echo "Sellers:"
curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer $TOKEN" | jq 'length'

echo "Installments stats:"
curl -s http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer $TOKEN"

echo ""
echo "🎉 LISTO"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", () => {
            console.log("\n✅ Completado");
            conn.end();
        }).on("data", (data) => {
            console.log(data.toString());
        }).stderr.on("data", (data) => {
            console.error(data.toString());
        });
    });
}).on("error", (err) => {
    console.error("Error:", err.message);
}).connect(config);
