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

console.log("🔥 LIMPIEZA NUCLEAR DE RUTAS ANTIGUAS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot/src/api

echo "=== ELIMINAR ARCHIVOS ANTIGUOS ==="
rm -f installments.routes.js
rm -f accounts-receivable.routes.js

# También eliminar versiones compiladas si existen (raro en JS pero posible)
rm -f installments.routes.map
rm -f accounts-receivable.routes.map

echo "✅ Archivos eliminados"

cd /var/www/cocolu-chatbot

echo "=== ASEGURAR APP-INTEGRATED LIMPIO ==="
# Eliminar cualquier línea que importe installments.routes.js (por si sed falló antes)
sed -i '/installments.routes.js/d' app-integrated.js
sed -i '/accounts-receivable.routes.js/d' app-integrated.js

# Eliminar llamadas a funciones setup
sed -i '/setupInstallmentsRoutes/d' app-integrated.js
sed -i '/setupAccountsReceivableRoutes/d' app-integrated.js

echo "✅ Referencias eliminadas totalmente"

echo ""
echo "=== VERIFICAR QUE NUESTRAS RUTAS ESTÁN AHÍ ==="
grep "installments-fix.routes.js" app-integrated.js
grep "api/installments" app-integrated.js

echo ""
echo "=== RESTART PM2 (FORZADO) ==="
pm2 delete cocolu-dashoffice
pm2 start app-integrated.js --name cocolu-dashoffice
sleep 15

echo ""
echo "=== TEST FINAL ==="
curl -s http://127.0.0.1:3009/api/installments | head -c 200

echo ""
echo "🎉 NOW OR NEVER"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Limpieza completada");
            conn.end();
        });
    });
}).connect(config);
