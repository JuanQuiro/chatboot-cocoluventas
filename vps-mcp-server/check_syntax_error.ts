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

console.log("🔍 VERIFICANDO ERROR DE SINTAXIS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== ERROR EXACTO ==="
node --check app-integrated.js 2>&1

echo ""
echo "=== LÍNEAS ALREDEDOR DE 243 ==="
sed -n '238,248p' app-integrated.js

echo ""
echo "=== VERIFICAR SI auth-simple.routes.js EXISTE ==="
ls -lh src/api/auth-simple.routes.js 2>&1 || echo "No existe"

echo ""
echo "=== CONTENIDO auth-simple.routes.js ==="
head -20 src/api/auth-simple.routes.js 2>/dev/null || echo "No se puede leer"
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
