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

console.log("📤 SUBIENDO ARCHIVO PARCHEADO...\n");

// Leer archivo parcheado
const patchedFile = join(__dirname, "app-integrated-patched.js");
const content = fs.readFileSync(patchedFile, 'utf8');
const base64Content = Buffer.from(content).toString('base64');

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
# Backup del archivo actual
echo "📦 Creando backup..."
cp /var/www/cocolu-chatbot/app-integrated.js /var/www/cocolu-chatbot/app-integrated.js.bak-before-accounts

# Subir archivo parcheado
echo "📤 Subiendo archivo parcheado..."
echo "${base64Content}" | base64 -d > /var/www/cocolu-chatbot/app-integrated.js

# Verificar sintaxis
echo ""
echo "🔍 Verificando sintaxis..."
node --check /var/www/cocolu-chatbot/app-integrated.js
if [ $? -eq 0 ]; then
    echo "✅ Sintaxis correcta"
else
    echo "❌ Error de sintaxis - Restaurando backup"
    cp /var/www/cocolu-chatbot/app-integrated.js.bak-before-accounts /var/www/cocolu-chatbot/app-integrated.js
    exit 1
fi

# Reiniciar PM2
echo ""
echo "🔄 Reiniciando PM2..."
pm2 restart cocolu-dashoffice

sleep 6

# Verificar endpoints
echo ""
echo "✅ VERIFICANDO ENDPOINTS:"

echo "1. Health:"
curl -s -w " [HTTP: %{http_code}]\\n" http://localhost:3009/api/health

echo ""
echo "2. Sellers:"
curl -s -w " [HTTP: %{http_code}]\\n" http://localhost:3009/api/sellers | head -n 3

echo ""
echo "3. Accounts Receivable:"
curl -s -w " [HTTP: %{http_code}]\\n" "http://localhost:3009/api/accounts-receivable?page=1&limit=10"

echo ""
echo "4. Accounts Receivable Stats:"
curl -s -w " [HTTP: %{http_code}]\\n" http://localhost:3009/api/accounts-receivable/stats

echo ""
echo "5. Installments:"
curl -s -w " [HTTP: %{http_code}]\\n" "http://localhost:3009/api/installments?status=all&page=1&limit=10"

echo ""
echo "6. Installments Stats:"
curl -s -w " [HTTP: %{http_code}]\\n" http://localhost:3009/api/installments/stats

echo ""
echo "========================================="
echo "✅ TODOS LOS ENDPOINTS AGREGADOS"
echo "========================================="
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
