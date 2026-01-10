import { Client } from "ssh2";
import dotenv from "dotenv";
import { join } from "path";
import { file URLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
};

console.log(`📤 SUBIENDO ARCHIVOS EXACTOS DE LOCAL AL VPS...`);

const conn = new Client();
conn.on("ready", () => {
    console.log("✅ Conectado al VPS");

    conn.sftp((err, sftp) => {
        if (err) throw err;

        const localBase = join(__dirname, "..");
        const files = [
            { local: join(localBase, "src/api/installments.routes.js"), remote: "/var/www/cocolu-chatbot/src/api/installments.routes.js" },
            { local: join(localBase, "src/api/accounts-receivable.routes.js"), remote: "/var/www/cocolu-chatbot/src/api/accounts-receivable.routes.js" },
            { local: join(localBase, "app-integrated.js"), remote: "/var/www/cocolu-chatbot/app-integrated.js" }
        ];

        let uploaded = 0;
        files.forEach(file => {
            if (!fs.existsSync(file.local)) {
                console.log(`❌ ${file.local} no existe localmente`);
                uploaded++;
                if (uploaded === files.length) finishUpload();
                return;
            }

            console.log(`📤 Subiendo ${file.local.split("\\").pop()}...`);
            sftp.fastPut(file.local, file.remote, (err) => {
                if (err) {
                    console.error(`❌ Error subiendo ${file.local.split("\\").pop()}:`, err.message);
                } else {
                    console.log(`✅ ${file.local.split("\\").pop()} subido`);
                }
                uploaded++;
                if (uploaded === files.length) finishUpload();
            });
        });

        function finishUpload() {
            console.log("\n✅ Todos los archivos procesados");

            // Reiniciar PM2
            conn.exec("cd /var/www/cocolu-chatbot && pm2 restart cocolu-dashoffice && sleep 7 && curl -s http://127.0.0.1:3009/api/health", (err, stream) => {
                stream.on("data", (data) => console.log(data.toString()));
                stream.on("close", () => {
                    console.log("\n🎉 DEPLOY COMPLETO - Recarga la página");
                    conn.end();
                });
            });
        }
    });
}).connect(config);
