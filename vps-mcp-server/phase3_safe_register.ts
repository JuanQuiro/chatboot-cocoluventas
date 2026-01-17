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

console.log("📥 DESCARGANDO Y MODIFICANDO APP-INTEGRATED.JS CORRECTAMENTE...\n");

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
            console.log("✅ Archivo descargado:", data.length, "bytes");

            // Modificar localmente
            const lines = data.split('\\n');

            // 1. Buscar import de sellersRoutes
            let sellersImportLine = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes("import sellersRoutes from")) {
                    sellersImportLine = i;
                    break;
                }
            }

            if (sellersImportLine === -1) {
                console.error("❌ No se encontró import de sellersRoutes");
                conn.end();
                return;
            }

            // 2. Insertar imports DESPUÉS de sellersRoutes
            const newImports = [
                "import tasasRoutes from './src/api/tasas.routes.js';",
                "import clientsImprovedRoutes from './src/api/clients-improved.routes.js';",
                "import paymentsImprovedRoutes from './src/api/payments-improved.routes.js';",
                "import salesImprovedRoutes from './src/api/sales-improved.routes.js';"
            ];

            lines.splice(sellersImportLine + 1, 0, ...newImports);

            // 3. Buscar apiApp.use('/api/sellers')
            let sellersUseLine = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes("apiApp.use('/api/sellers'")) {
                    sellersUseLine = i;
                    break;
                }
            }

            if (sellersUseLine === -1) {
                console.error("❌ No se encontró registro de sellers");
                conn.end();
                return;
            }

            // 4. Insertar registros DESPUÉS de sellers
            const newRegistrations = [
                "apiApp.use('/api/tasas', tasasRoutes);",
                "apiApp.use('/api/clients-improved', clientsImprovedRoutes);",
                "apiApp.use('/api/payments-improved', paymentsImprovedRoutes);",
                "apiApp.use('/api/sales-improved', salesImprovedRoutes);"
            ];

            lines.splice(sellersUseLine + 1, 0, ...newRegistrations);

            // 5. Guardar modificado
            const modifiedContent = lines.join('\\n');
            const localPath = join(__dirname, "app-integrated-joyeria.js");
            fs.writeFileSync(localPath, modifiedContent, 'utf8');

            console.log("✅ Archivo modificado localmente");
            console.log("📤 Subiendo al servidor...");

            // 6. Subir modificado
            const base64Content = Buffer.from(modifiedContent).toString('base64');

            const uploadCmd = \`
# Backup
cp /var/www/cocolu-chatbot/app-integrated.js /var/www/cocolu-chatbot/app-integrated.js.bak-joyeria

# Subir
echo "\${base64Content}" | base64 -d > /var/www/cocolu-chatbot/app-integrated.js

# Verificar sintaxis
node --check /var/www/cocolu-chatbot/app-integrated.js

if [ $? -eq 0 ]; then
    echo "✅ Sintaxis correcta"
    pm2 restart cocolu-dashoffice
    sleep 6
    
    echo ""
    echo "✅ VERIFICANDO NUEVOS ENDPOINTS:"
    curl -s http://localhost:3009/api/tasas/actual | head -n 3
    
    echo ""
    echo "========================================="
    echo "✅ IMPLEMENTACIÓN COMPLETADA"
    echo "========================================="
else
    echo "❌ Error de sintaxis - Restaurando"
    cp /var/www/cocolu-chatbot/app-integrated.js.bak-joyeria /var/www/cocolu-chatbot/app-integrated.js
fi
            \`;
            
            const conn2 = new Client();
            conn2.on('ready', () => {
                conn2.exec(uploadCmd, (err2, stream2) => {
                    if (err2) throw err2;
                    stream2.on('data', (d: any) => console.log(d.toString()));
                    stream2.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
                    stream2.on('close', () => {
                        conn2.end();
                        conn.end();
                    });
                });
            }).connect(config);
        });
    });
}).connect(config);
