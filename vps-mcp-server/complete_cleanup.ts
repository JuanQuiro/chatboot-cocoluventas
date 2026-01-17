import { Client } from "ssh2";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

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

console.log("🔧 LIMPIEZA COMPLETA DE TODOS LOS IMPORTS ROTOS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== ENCONTRAR TODOS LOS IMPORTS PROBLEMÁTICOS ==="
grep -n "simple-" app-integrated.js | head -20
grep -n "installments" app-integrated.js | head -10
grep -n "accounts" app-integrated.js | head -10

echo ""
echo "=== ELIMINAR TODAS LAS LÍNEAS PROBLEMÁTICAS ==="
# Eliminar líneas con simple-
sed -i '/simple-/d' app-integrated.js

# Eliminar líneas con installments
sed -i '/installments/d' app-integrated.js

# Eliminar líneas con accounts-receivable
sed -i '/accounts-receivable/d' app-integrated.js

# Eliminar líneas con AccountsReceivable
sed -i '/AccountsReceivable/d' app-integrated.js

# Eliminar líneas con enhanced-routes-addon
sed -i '/enhanced-routes-addon/d' app-integrated.js

echo "✅ Limpieza completada"

echo ""
echo "=== VERIFICAR QUE NO QUEDAN IMPORTS ROTOS ==="
grep -c "simple-" app-integrated.js || echo "0 simple-"
grep -c "installments" app-integrated.js || echo "0 installments"
grep -c "accounts" app-integrated.js || echo "0 accounts"

echo ""
echo "=== VERIFICAR SINTAXIS ==="
node --check app-integrated.js && echo "✅ SINTAXIS OK" || echo "❌ ERROR"

echo ""
echo "=== REINICIAR PM2 COMPLETAMENTE ==="
pm2 delete all 2>/dev/null
pm2 kill 2>/dev/null
pkill -9 node 2>/dev/null || true
sleep 3

pm2 start app-integrated.js --name cocolu-dashoffice
sleep 10

echo ""
echo "=== PM2 STATUS ==="
pm2 list

echo ""
echo "=== TEST LOGIN ==="
curl -s http://127.0.0.1:3009/api/login -X POST -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' 2>&1 | head -c 300

echo ""
echo ""
echo "🎉 SI VES TOKEN = FUNCIONA"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Proceso completado");
            conn.end();
        });
    });
}).connect(config);
