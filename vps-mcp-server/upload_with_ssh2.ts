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

console.log("📤 SUBIENDO app-integrated.js AL VPS...");

const localFile = join(__dirname, "..", "app-integrated.js");
const remoteFile = "/var/www/cocolu-chatbot/app-integrated.js";

const conn = new Client();
conn.on("ready", () => {
    console.log("✅ Conectado");

    conn.sftp((err, sftp) => {
        if (err) throw err;

        console.log("📤 Subiendo archivo...");
        sftp.fastPut(localFile, remoteFile, (err) => {
            if (err) {
                console.error("Error subiendo:", err.message);
                conn.end();
                return;
            }

            console.log("✅ Archivo subido");

            // Reiniciar PM2
            console.log("🔄 Reiniciando PM2...");
            conn.exec(`
cd /var/www/cocolu-chatbot
echo "=== VERIFICAR SINTAXIS ==="
node --check app-integrated.js && echo "✅ SINTAXIS OK" || echo "❌ ERROR"

echo ""
echo "=== REINICIAR PM2 ==="
pm2 delete all 2>/dev/null
pm2 kill 2>/dev/null
pkill -9 node 2>/dev/null || true
sleep 3
pm2 start app-integrated.js --name cocolu-dashoffice
sleep 10

echo ""
echo "=== PM2 STATUS ==="
pm2 list

echo ""
echo "=== TEST LOGIN ==="
curl -s http://127.0.0.1:3009/api/login -X POST -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}'

echo ""
echo ""
echo "🎉 SI VES TOKEN = FUNCIONA"
            `, (err, stream) => {
                if (err) throw err;
                stream.on("data", (d: Buffer) => console.log(d.toString()));
                stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
                stream.on("close", () => {
                    console.log("\n✅ Proceso completado");
                    conn.end();
                });
            });
        });
    });
}).connect(config);
