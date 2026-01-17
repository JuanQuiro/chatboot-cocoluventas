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

console.log("📥 DESCARGANDO APP-INTEGRATED.JS ACTUAL...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `cat /var/www/cocolu-chatbot/app-integrated.js`;

    let data = '';
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: Buffer) => {
            data += d.toString('utf8');
        });
        stream.on('close', () => {
            // Guardar localmente
            fs.writeFileSync(join(__dirname, "app-integrated-current.js"), data, 'utf8');
            console.log("✅ Archivo descargado:", data.length, "bytes");

            // Buscar dónde están registradas las rutas
            const sellersImport = data.match(/import.*sellers.*from.*routes\.js/i);
            const sellersUse = data.match(/apiApp\.use\(['"]\/api\/sellers['"]/i);
            const bcvImport = data.match(/import.*bcv.*from.*routes\.js/i);
            const bcvUse = data.match(/apiApp\.use\(['"]\/api\/bcv['"]/i);

            console.log("\n📍 ESTRUCTURA ACTUAL:");
            console.log("Sellers Import:", sellersImport ? "✅ Encontrado" : "❌ No encontrado");
            console.log("Sellers Use:", sellersUse ? "✅ Encontrado" : "❌ No encontrado");
            console.log("BCV Import:", bcvImport ? "✅ Encontrado" : "❌ No encontrado");
            console.log("BCV Use:", bcvUse ? "✅ Encontrado" : "❌ No encontrado");

            // Buscar línea de apiApp.use('/api/sellers'
            const lines = data.split('\n');
            let sellersLine = -1;
            let bcvLine = -1;

            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes("apiApp.use('/api/sellers'")) sellersLine = i + 1;
                if (lines[i].includes("apiApp.use('/api/bcv'")) bcvLine = i + 1;
            }

            console.log("\n📍 UBICACIÓN DE REGISTROS:");
            console.log("Sellers registrado en línea:", sellersLine);
            console.log("BCV registrado en línea:", bcvLine);

            conn.end();
        });
    });
}).connect(config);
