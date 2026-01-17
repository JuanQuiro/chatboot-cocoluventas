import { Client } from "ssh2";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

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

console.log("🚀 SUBIENDO CONFIGURACIÓN FUNCIONAL...\n");

// Leer el archivo local que funciona
const localFile = join(__dirname, "app-integrated-fixed.js");
if (!fs.existsSync(localFile)) {
    console.error("❌ No existe app-integrated-fixed.js local");
    process.exit(1);
}

const content = fs.readFileSync(localFile, "utf8");
const base64Content = Buffer.from(content).toString('base64');

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
# Backup del archivo corrupto
cp /var/www/cocolu-chatbot/app-integrated.js /var/www/cocolu-chatbot/app-integrated.js.bak-corrupted

# Subir archivo funcional
echo "${base64Content}" | base64 -d > /var/www/cocolu-chatbot/app-integrated.js

# Verificar sintaxis
echo "Verificando sintaxis..."
node --check /var/www/cocolu-chatbot/app-integrated.js && echo "✅ Sintaxis OK" || echo "❌ Error de sintaxis"

# Eliminar PM2 y reiniciar desde cero
echo ""
echo "🔄 Reinicio completo PM2..."
pm2 delete cocolu-dashoffice 2>/dev/null || true
sleep 2
cd /var/www/cocolu-chatbot
pm2 start app-integrated.js --name cocolu-dashoffice

sleep 8

# Verificar
echo ""
echo "✅ VERIFICACIÓN:"
pm2 status

echo ""
echo "Puerto 3009:"
netstat -tlnp 2>/dev/null | grep 3009 || echo "Esperando puerto..."

sleep 3

echo ""
echo "Test Login:"
curl -s -w "\\nHTTP: %{http_code}\\n" -X POST http://localhost:3009/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cocolu.com","password":"password123"}' | head -n 5

echo ""
echo "========================================="
echo "✅ RESTAURACIÓN COMPLETA"
echo "========================================="
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
