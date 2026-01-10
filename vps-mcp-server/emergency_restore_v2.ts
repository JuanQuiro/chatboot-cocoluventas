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

console.log(`🚨 RESTAURACIÓN DE EMERGENCIA...`);

const conn = new Client();
conn.on("ready", () => {
    console.log("✅ Conectado");

    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== RESTAURAR BACKUP LIMPIO ==="
# Buscar el backup más reciente que funcione
ls -la app-integrated-backup*.js | head -3

# Restaurar desde backup
cp app-integrated-backup-final.js app-integrated.js

# Limpiar imports rotos
sed -i '/enhanced-routes-addon/d' app-integrated.js
sed -i '/setupInstallmentsEndpoints/d' app-integrated.js
sed -i '/setupAccountsEndpoints/d' app-integrated.js

echo "✅ Limpiado"

echo ""
echo "=== REINICIAR PM2 ==="
pm2 delete all 2>/dev/null || true
pkill -9 node 2>/dev/null || true
sleep 3
pm2 start app-integrated.js --name cocolu-dashoffice
sleep 8

echo ""
echo "=== VERIFICAR ==="
pm2 list
curl -s http://127.0.0.1:3009/api/health | head -c 100

echo ""
echo ""
echo "✅ BACKEND RESTAURADO"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", () => {
            console.log("\n✅ Restauración completa");
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
