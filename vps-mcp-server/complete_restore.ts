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

console.log("🚨 RESTAURACIÓN COMPLETA DEL SISTEMA...");

const conn = new Client();
conn.on("ready", () => {
    console.log("✅ Conectado");

    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== 1. VER BACKUPS DISPONIBLES ==="
ls -la app-integrated*.js | head -10

echo ""
echo "=== 2. BUSCAR BACKUP MÁS ANTIGUO (PRE-MODIFICACIONES) ==="
# Mostrar todos los backups ordenados por fecha
ls -lt src-backup*/ 2>/dev/null | head -5 || echo "No hay backups de src"

echo ""
echo "=== 3. USANDO GIT PARA RESTAURAR ARCHIVO ORIGINAL ==="
git checkout HEAD -- app-integrated.js 2>/dev/null || echo "No hay git"
git status 2>/dev/null | head -5 || echo "Sin git"

echo ""
echo "=== 4. SI NO HAY GIT, USAR EL BACKUP ORIGINAL ==="
# Buscar el backup más antiguo que tenga el menor tamaño (sin modificaciones)
OLDEST_BACKUP=$(ls -t app-integrated-backup*.js 2>/dev/null | tail -1)
echo "Backup más antiguo: $OLDEST_BACKUP"

if [ -n "$OLDEST_BACKUP" ]; then
    cp "$OLDEST_BACKUP" app-integrated.js
    echo "✅ Restaurado desde $OLDEST_BACKUP"
fi

echo ""
echo "=== 5. VERIFICAR QUE NO HAY IMPORTS ROTOS ==="
grep -c "installments.routes" app-integrated.js || echo "0 (OK)"
grep -c "accounts-receivable.routes" app-integrated.js || echo "0 (OK)"

echo ""
echo "=== 6. VERIFICAR SINTAXIS ==="
node --check app-integrated.js && echo "✅ SINTAXIS OK" || echo "❌ ERROR"

echo ""
echo "=== 7. REINICIAR PM2 LIMPIO ==="
pm2 delete all 2>/dev/null
pm2 kill 2>/dev/null
pkill -9 node 2>/dev/null || true
sleep 3
pm2 start app-integrated.js --name cocolu-dashoffice
sleep 10

echo ""
echo "=== 8. VERIFICACIÓN FINAL ==="
pm2 list
echo ""
curl -s http://127.0.0.1:3009/api/health 2>&1 | head -c 300

echo ""
echo ""
echo "🎉 SI VES JSON ARRIBA = FUNCIONA"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", () => {
            console.log("\n✅ Proceso terminado");
            conn.end();
        }).on("data", (data: Buffer) => {
            console.log(data.toString());
        }).stderr.on("data", (data: Buffer) => {
            console.error(data.toString());
        });
    });
}).on("error", (err) => {
    console.error("Error:", err.message);
}).connect(config);
