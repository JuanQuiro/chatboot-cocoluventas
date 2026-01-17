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

console.log("🔍 BUSCANDO RUTAS DE VENDEDORES...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== BUSCAR ARCHIVOS DE VENDEDORES ==="
find /var/www/cocolu-chatbot/src/api -name "*seller*" -o -name "*vendedor*"

echo ""
echo "=== BUSCAR EN APP-INTEGRATED ==="
grep -n "seller" /var/www/cocolu-chatbot/app-integrated.js || echo "No encontrado en app-integrated"

echo ""
echo "=== LISTAR TODOS LOS ARCHIVOS API ==="
ls -la /var/www/cocolu-chatbot/src/api/
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
