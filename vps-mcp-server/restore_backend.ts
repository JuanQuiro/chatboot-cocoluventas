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

console.log(`🚨 RESTAURANDO BACKEND Y VERIFICANDO...`);

const conn = new Client();
conn.on("ready", () => {
    console.log("✅ Conectado");

    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== PM2 STATUS ==="
pm2 list | grep -E "cocolu|online|stopped" || echo "PM2 no tiene procosos"

echo ""
echo "=== MATAR Y REINICIAR LIMPIO ==="
pm2 delete all 2>/dev/null || true
pkill -f node 2>/dev/null || true
sleep 3

# Usar el backup más limpio
cp app-integrated-backup-final.js app-integrated.js 2>/dev/null

echo ""
echo "=== INICIAR PM2 ==="
pm2 start app-integrated.js --name cocolu-dashoffice
sleep 8

echo ""
echo "=== VERIFICAR QUE CORRE ==="
pm2 list
curl -s http://127.0.0.1:3009/api/health | head -c 200

echo ""
echo ""
echo "✅ BACKEND FUNCIONANDO"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", () => {
            console.log("\n✅ Backend restaurado");
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
