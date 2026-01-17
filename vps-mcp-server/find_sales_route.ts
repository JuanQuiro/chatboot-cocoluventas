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

console.log("🔍 BUSCANDO RUTAS DE VENTAS/SALES...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== FILES IN API ==="
ls -l /var/www/cocolu-chatbot/src/api/

echo "=== SEARCH CONTENT ==="
grep -r "/api/sales" /var/www/cocolu-chatbot/src/api/
grep -r "/api/orders" /var/www/cocolu-chatbot/src/api/
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
