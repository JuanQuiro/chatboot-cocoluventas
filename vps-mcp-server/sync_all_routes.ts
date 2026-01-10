import { Client } from "ssh2";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
    readyTimeout: 120000,
};

console.log("📤 SINCRONIZANDO TODOS LOS ARCHIVOS DE src/api/...");

const localApiDir = join(__dirname, "..", "src", "api");
const remoteApiDir = "/var/www/cocolu-chatbot/src/api";

const conn = new Client();
conn.on("ready", () => {
    console.log("✅ Conectado");

    conn.sftp((err, sftp) => {
        if (err) throw err;

        // Get list of .js files in local src/api
        const files = fs.readdirSync(localApiDir).filter(f => f.endsWith('.js'));
        console.log(`📁 Encontrados ${files.length} archivos .js para subir`);

        let uploaded = 0;
        let errors = 0;

        const uploadNext = () => {
            if (uploaded + errors >= files.length) {
                console.log(`\n✅ Subidos: ${uploaded}, Errores: ${errors}`);

                // Restart PM2
                console.log("🔄 Reiniciando PM2...");
                conn.exec(`
cd /var/www/cocolu-chatbot
pm2 delete all 2>/dev/null
pm2 kill 2>/dev/null
pkill -9 node 2>/dev/null || true
sleep 3
pm2 start app-integrated.js --name cocolu-dashoffice
sleep 10
pm2 list
echo ""
curl -s http://127.0.0.1:3009/api/health
echo ""
echo "🎉 LISTO"
                `, (err, stream) => {
                    if (err) throw err;
                    stream.on("data", (d: Buffer) => console.log(d.toString()));
                    stream.on("close", () => {
                        console.log("\n✅ Proceso completado");
                        conn.end();
                    });
                });
                return;
            }

            const file = files[uploaded + errors];
            const localPath = join(localApiDir, file);
            const remotePath = `${remoteApiDir}/${file}`;

            sftp.fastPut(localPath, remotePath, (err) => {
                if (err) {
                    console.error(`❌ Error subiendo ${file}:`, err.message);
                    errors++;
                } else {
                    console.log(`✅ ${file}`);
                    uploaded++;
                }
                uploadNext();
            });
        };

        uploadNext();
    });
}).connect(config);
