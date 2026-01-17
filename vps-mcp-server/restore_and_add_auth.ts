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
    readyTimeout: 60000,
};

console.log("🔧 RESTAURAR Y AGREGAR AUTH LIMPIO...");

const localFile = join(__dirname, "..", "app-integrated.js");
const remoteFile = "/var/www/cocolu-chatbot/app-integrated.js";

const conn = new Client();
conn.on("ready", () => {
    console.log("✅ Conectado - subiendo app-integrated.js limpio...");

    conn.sftp((err, sftp) => {
        if (err) throw err;

        sftp.fastPut(localFile, remoteFile, (err) => {
            if (err) {
                console.error("Error:", err.message);
                conn.end();
                return;
            }

            console.log("✅ Archivo limpio subido");

            // Ahora agregar auth routing
            conn.exec(`
cd /var/www/cocolu-chatbot

echo "=== AGREGAR IMPORT DE auth-simple ==="
# Buscar línea después de financeRouter import
LINE=\$(grep -n "import financeRouter" app-integrated.js | head -1 | cut -d: -f1)
sed -i "\${LINE}a\\\\import authSimpleRouter from './src/api/auth-simple.routes.js';" app-integrated.js

echo "✅ Import agregado"

echo ""
echo "=== MONTAR ROUTER ==="
# Buscar donde montar (después de enhanced routes)
LINE=\$(grep -n "setupEnhancedRoutes(apiApp)" app-integrated.js | head -1 | cut -d: -f1)
sed -i "\${LINE}a\\\\\\\\        apiApp.use('/api/auth', authSimpleRouter);\\\\        console.log('✅ Simple auth mounted at /api/auth');" app-integrated.js

echo "✅ Router montado"

echo ""
echo "=== VERIFICAR ==="
node --check app-integrated.js && echo "✅ SINTAXIS OK" || echo "❌ ERROR"

echo ""
echo "=== RESTART PM2 ==="
pm2 restart cocolu-dashoffice
sleep 15

echo ""
echo "=== TEST LOGIN ==="
curl -s -X POST http://127.0.0.1:3009/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cocolu.com","password":"password123"}'

echo ""
echo ""
echo "🎉 LISTO"
            `, (err, stream) => {
                if (err) throw err;
                stream.on("data", (d: Buffer) => console.log(d.toString()));
                stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
                stream.on("close", () => {
                    console.log("\n✅ Completado");
                    conn.end();
                });
            });
        });
    });
}).connect(config);
