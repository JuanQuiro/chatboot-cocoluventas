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
    readyTimeout: 90000,
};

console.log("🚨 DIAGNÓSTICO DE EMERGENCIA - SERVER DOWN\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "========================================="
echo "1. ESTADO PM2"
echo "========================================="
pm2 status

echo ""
echo "========================================="
echo "2. ÚLTIMOS ERRORES PM2"
echo "========================================="
pm2 logs cocolu-dashoffice --err --lines 30 --nostream

echo ""
echo "========================================="
echo "3. VERIFICAR SINTAXIS app-integrated.js"
echo "========================================="
node --check /var/www/cocolu-chatbot/app-integrated.js 2>&1 || echo "❌ SINTAXIS ERROR DETECTADO"

echo ""
echo "========================================="
echo "4. VER LÍNEAS CERCA DE DONDE SE REGISTRARON RUTAS"
echo "========================================="
grep -n -A 3 -B 3 "accounts-receivable" /var/www/cocolu-chatbot/app-integrated.js | head -n 20

echo ""
echo "========================================="
echo "5. BUSCAR BACKUPS DISPONIBLES"
echo "========================================="
ls -lht /var/www/cocolu-chatbot/*.bak* | head -n 5
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
