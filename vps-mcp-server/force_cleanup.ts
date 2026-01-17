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

console.log("🔧 LIMPIEZA FORZADA DE IMPORTS ROTOS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== ANTES: Líneas con installments ==="
grep -n "installments" app-integrated.js | head -10

echo ""
echo "=== ELIMINANDO TODAS LAS LÍNEAS CON 'installments' ==="
sed -i '/installments/d' app-integrated.js

echo "=== ELIMINANDO TODAS LAS LÍNEAS CON 'accounts-receivable' ==="
sed -i '/accounts-receivable/d' app-integrated.js

echo "=== ELIMINANDO TODAS LAS LÍNEAS CON 'AccountsReceivable' ==="
sed -i '/AccountsReceivable/d' app-integrated.js

echo ""
echo "=== DESPUÉS: Líneas con installments ==="
grep -n "installments" app-integrated.js | head -5 || echo "0 ENCONTRADAS (OK)"

echo ""
echo "=== VERIFICAR SINTAXIS ==="
node --check app-integrated.js && echo "✅ SINTAXIS OK" || echo "❌ ERROR DE SINTAXIS"

echo ""
echo "=== MATAR TODO Y REINICIAR ==="
pm2 delete all 2>/dev/null
pm2 kill 2>/dev/null
pkill -9 node 2>/dev/null || true
sleep 3
pm2 start app-integrated.js --name cocolu-dashoffice
sleep 10

echo ""
echo "=== VERIFICAR QUE FUNCIONA ==="
pm2 list
echo ""
curl -s http://127.0.0.1:3009/api/health 2>&1 | head -c 300

echo ""
echo ""
echo "🎉 FIN"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Terminado");
            conn.end();
        });
    });
}).connect(config);
