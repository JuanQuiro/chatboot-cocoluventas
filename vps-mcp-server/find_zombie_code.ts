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

console.log("🔍 BUSCANDO CÓDIGO ZOMBIE...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== BUSCAR 'cliente_id' (Culpable) ==="
grep -n "cliente_id" app-integrated.js

echo ""
echo "=== BUSCAR TODAS LAS REFERENCIAS A INSTALLMENTS ==="
grep -n "installments" app-integrated.js

echo ""
echo "=== BUSCAR SI HAY OTROS ARCHIVOS JS EN API QUE NO VIMOS ==="
ls -l src/api/
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Búsqueda completada");
            conn.end();
        });
    });
}).connect(config);
