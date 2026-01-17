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

console.log(`🔍 POR QUÉ NO CORRE EL BACKEND?`);

const conn = new Client();
conn.on("ready", () => {
    console.log("✅ Conectado");

    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== PM2 LOGS DE ERROR ==="
pm2 logs cocolu-dashoffice --err --lines 30 --nostream 2>&1 | tail -30

echo ""
echo "=== PM2 DESCRIBE ==="
pm2 describe cocolu-dashoffice | grep -E "status|restarts|error"

echo ""
echo "=== INTENTAR INICIAR MANUALMENTE ==="
timeout 10 node app-integrated.js 2>&1 | head -50

echo ""
echo "=== FIN DEL DIAGNÓSTICO ==="
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", () => {
            console.log("\n✅ Diagnóstico terminado");
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
