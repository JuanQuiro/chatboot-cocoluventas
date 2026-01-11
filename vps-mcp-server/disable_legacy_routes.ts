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

console.log("🔧 FIX: DESACTIVAR RUTAS ANTIGUAS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== BUSCAR RUTAS ANTIGUAS ==="
grep -n "setupInstallmentsRoutes" app-integrated.js

echo ""
echo "=== COMENTAR RUTAS ANTIGUAS ==="
# Comentar la importación
sed -i 's/import { setupInstallmentsRoutes }/\\/\\/ import { setupInstallmentsRoutes }/' app-integrated.js

# Comentar la llamada a la función
sed -i 's/setupInstallmentsRoutes(apiApp)/\\/\\/ setupInstallmentsRoutes(apiApp)/' app-integrated.js

# También Accounts Receivable
sed -i 's/import { setupAccountsReceivableRoutes }/\\/\\/ import { setupAccountsReceivableRoutes }/' app-integrated.js
sed -i 's/setupAccountsReceivableRoutes(apiApp)/\\/\\/ setupAccountsReceivableRoutes(apiApp)/' app-integrated.js

echo "✅ Rutas antiguas comentadas"

echo ""
echo "=== VERIFICAR INTEGRACIÓN NUEVA ==="
grep "installmentsFixRouter" app-integrated.js

echo ""
echo "=== SINTAXIS CHECK ==="
node --check app-integrated.js && echo "✅ OK" || echo "❌ ERROR"

echo ""
echo "=== RESTART PM2 ==="
pm2 restart cocolu-dashoffice
sleep 8

echo ""
echo "=== TEST ==="
curl -s http://127.0.0.1:3009/api/installments | head -c 100

echo ""
echo "🎉 DONE"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Fix aplicado");
            conn.end();
        });
    });
}).connect(config);
