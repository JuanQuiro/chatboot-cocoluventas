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

console.log("🔍 DIAGNÓSTICO RUTA INSTALLMENTS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== PM2 LOGS (ERROR) ==="
pm2 logs cocolu-dashoffice --err --lines 50 --nostream 2>&1 | tail -50

echo ""
echo "=== CHECK ROUTE IN APP ==="
# Ver si hay imports relacionados con installments
grep -n "installments" app-integrated.js

echo ""
echo "=== CHECK ROUTE FILE ==="
ls -l src/api/installments.routes.js 2>/dev/null
head -20 src/api/installments.routes.js 2>/dev/null || echo "No se puede leer archivo"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Diagnóstico completado");
            conn.end();
        });
    });
}).connect(config);
