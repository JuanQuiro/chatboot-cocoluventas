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

console.log("🔍 DIAGNOSTICANDO ERROR DE SCHEMA...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "========================================="
echo "1. SCHEMA DE TABLAS"
echo "========================================="
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db ".schema cuentas_por_cobrar"
echo ""
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db ".schema cuotas"

echo ""
echo "========================================="
echo "2. VER IMPLEMENTACIÓN DE ROUTES"
echo "========================================="
echo "accounts-receivable.routes.js:"
head -n 30 /var/www/cocolu-chatbot/src/api/accounts-receivable.routes.js

echo ""
echo "installments.routes.js:"
head -n 30 /var/www/cocolu-chatbot/src/api/installments.routes.js

echo ""
echo "========================================="
echo "3. ÚLTIMOS ERRORES PM2"
echo "========================================="
pm2 logs cocolu-dashoffice --err --lines 20 --nostream
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
