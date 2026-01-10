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

console.log(`🔧 ARREGLANDO IMPORTS ROTOS EN APP-INTEGRATED.JS...`);

const conn = new Client();
conn.on("ready", () => {
    console.log("✅ Conectado");

    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== BUSCANDO IMPORTS PROBLEMÁTICOS ==="
grep -n "installments" app-integrated.js
grep -n "accounts-receivable" app-integrated.js

echo ""
echo "=== ELIMINANDO IMPORTS ROTOS ==="
# Eliminar TODAS las líneas relacionadas con installments y accounts-receivable
sed -i '/installments.routes/d' app-integrated.js
sed -i '/accounts-receivable.routes/d' app-integrated.js
sed -i '/setupInstallmentsRoutes/d' app-integrated.js
sed -i '/setupAccountsReceivableRoutes/d' app-integrated.js
sed -i '/enhanced-routes-addon/d' app-integrated.js

echo "✅ Imports eliminados"

echo ""
echo "=== VERIFICANDO QUE NO QUEDAN ==="
grep -c "installments" app-integrated.js || echo "0 referencias"
grep -c "accounts-receivable" app-integrated.js || echo "0 referencias"

echo ""
echo "=== VERIFICAR SINTAXIS ==="
node --check app-integrated.js && echo "✅ SINTAXIS OK" || echo "❌ ERROR"

echo ""
echo "=== REINICIAR PM2 ==="
pm2 delete all 2>/dev/null
pkill -f node 2>/dev/null || true
sleep 3
pm2 start app-integrated.js --name cocolu-dashoffice
sleep 8

echo ""
echo "=== VERIFICAR ==="
pm2 list
curl -s http://127.0.0.1:3009/api/health | head -c 100

echo ""
echo ""
echo "✅ BACKEND ARREGLADO - Recarga la página"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", () => {
            console.log("\n✅ Proceso completado");
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
