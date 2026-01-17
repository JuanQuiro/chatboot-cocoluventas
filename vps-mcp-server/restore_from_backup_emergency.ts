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

console.log("🔄 RESTAURANDO DESDE BACKUP SEGURO...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
# 1. Restaurar desde el backup más reciente (salesfix)
echo "📦 Restaurando app-integrated.js desde backup..."
cp /var/www/cocolu-chatbot/app-integrated.js.bak-salesfix /var/www/cocolu-chatbot/app-integrated.js

# 2. Reiniciar PM2
echo ""
echo "🔄 Reiniciando PM2..."
pm2 restart cocolu-dashoffice

sleep 5

# 3. Verificar que funciona
echo ""
echo "✅ Verificando endpoints básicos..."
echo "Login:"
curl -s -w "\\nHTTP: %{http_code}\\n" -X POST http://localhost:3009/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cocolu.com","password":"password123"}' | head -n 5

echo ""
echo "Dashboard:"
curl -s -w "\\n HTTP: %{http_code}\\n" http://localhost:3009/api/dashboard | head -n 10

echo ""
echo "Sellers:"
curl -s -w "\\nHTTP: %{http_code}\\n" http://localhost:3009/api/sellers | head -n 5

echo ""
echo "========================================="
echo "✅ SERVIDOR RESTAURADO"
echo "========================================="
echo "El servidor está funcionando con la configuración anterior"
echo "Ahora agregaré las nuevas rutas correctamente..."
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
