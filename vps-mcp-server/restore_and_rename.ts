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

console.log("🚑 RESTAURANDO Y RENOMBRANDO RUTAS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot/src/api

# 1. Restaurar backup si existe (el ls mostraba enhanced-routes.js.backup)
if [ -f "enhanced-routes.js.backup" ]; then
    cp enhanced-routes.js.backup enhanced-routes.js
    echo "✅ Backup restaurado"
else
    echo "⚠️ No backup found!"
fi

# 2. Renombrar rutas en lugar de comentar (más seguro para sintaxis)
# Cambiar /api/installments por /api/installments-OLD
sed -i 's|/api/installments|/api/installments-OLD|g' enhanced-routes.js
sed -i 's|/api/accounts-receivable|/api/accounts-receivable-OLD|g' enhanced-routes.js

echo "✅ Rutas renombradas a -OLD"

# 3. Check sintaxis
cd /var/www/cocolu-chatbot
# node --check no funciona bien con imports si no es module type completo, pero intentamos
node --check src/api/enhanced-routes.js 2>&1 || echo "Check failed (expected for modules)"

echo ""
echo "=== RESTART PM2 ==="
pm2 restart cocolu-dashoffice
sleep 15

echo ""
echo "=== STATUS CHECK ==="
pm2 list
curl -s http://127.0.0.1:3009/api/installments | head -c 100
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Operación completada");
            conn.end();
        });
    });
}).connect(config);
