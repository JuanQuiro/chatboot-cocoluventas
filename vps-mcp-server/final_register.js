const { Client } = require("ssh2");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config({ path: path.join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
    readyTimeout: 90000,
};

console.log("🔧 REGISTRANDO RUTAS - MÉTODO SEGURO...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `cat /var/www/cocolu-chatbot/app-integrated.js`;

    let data = '';
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d) => {
            data += d.toString('utf8');
        });
        stream.on('close', () => {
            console.log("✅ Descargado:", data.length, "bytes");

            const lines = data.split('\n');

            // Buscar import de sellersRoutes
            let sellersImportIdx = lines.findIndex(l => l.includes("import sellersRoutes from"));

            if (sellersImportIdx === -1) {
                console.error("❌ No encontrado sellersRoutes import");
                conn.end();
                return;
            }

            // Agregar imports
            lines.splice(sellersImportIdx + 1, 0,
                "import tasasRoutes from './src/api/tasas.routes.js';",
                "import clientsImprovedRoutes from './src/api/clients-improved.routes.js';",
                "import paymentsImprovedRoutes from './src/api/payments-improved.routes.js';",
                "import salesImprovedRoutes from './src/api/sales-improved.routes.js';"
            );

            // Buscar apiApp.use sellers
            let sellersUseIdx = lines.findIndex(l => l.includes("apiApp.use('/api/sellers'"));

            if (sellersUseIdx === -1) {
                console.error("❌ No encontrado sellers use");
                conn.end();
                return;
            }

            // Agregar registros
            lines.splice(sellersUseIdx + 1, 0,
                "apiApp.use('/api/tasas', tasasRoutes);",
                "apiApp.use('/api/clients-improved', clientsImprovedRoutes);",
                "apiApp.use('/api/payments-improved', paymentsImprovedRoutes);",
                "apiApp.use('/api/sales-improved', salesImprovedRoutes);"
            );

            const modified = lines.join('\n');
            const b64 = Buffer.from(modified).toString('base64');

            console.log("✅ Modificado localmente");
            console.log("📤 Subiendo...");

            const conn2 = new Client();
            conn2.on('ready', () => {
                const uploadCmd = `
cp /var/www/cocolu-chatbot/app-integrated.js /var/www/cocolu-chatbot/app-integrated.js.bak-joyeria
echo '${b64}' | base64 -d > /var/www/cocolu-chatbot/app-integrated.js
node --check /var/www/cocolu-chatbot/app-integrated.js && echo "✅ OK" || (cp /var/www/cocolu-chatbot/app-integrated.js.bak-joyeria /var/www/cocolu-chatbot/app-integrated.js && echo "❌ ERROR")
pm2 restart cocolu-dashoffice
sleep 6
echo ""
echo "🧪 VERIFICANDO:"
curl -s http://localhost:3009/api/tasas/actual
echo ""
echo "✅ COMPLETADO"
                `;

                conn2.exec(uploadCmd, (err2, stream2) => {
                    if (err2) throw err2;
                    stream2.on('data', (d) => console.log(d.toString()));
                    stream2.stderr.on('data', (d) => console.error("STDERR:", d.toString()));
                    stream2.on('close', () => {
                        conn2.end();
                        conn.end();
                    });
                });
            }).connect(config);
        });
    });
}).connect(config);
