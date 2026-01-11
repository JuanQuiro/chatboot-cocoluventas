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

console.log("🚑 REPARANDO APP-INTEGRATED.JS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

# 1. Hacemos backup del archivo corrupto por si acaso
cp app-integrated.js app-integrated.js.corrupto

# 2. Eliminar la línea corrupta que contiene "clientsFixRouter)/"
sed -i '/clientsFixRouter)\//d' app-integrated.js

# 3. Eliminar cualquier línea que monte clientsFixRouter para empezar limpio
sed -i "/apiApp.use('\/api\/clients', clientsFixRouter)/d" app-integrated.js

# 4. Eliminar imports repetidos de clientsFixRouter (dejamos solo 1 si hay varios)
# Esto es un truco con awk para deducplicar lineas de import especificas si existieran
sed -i "/import clientsFixRouter/d" app-integrated.js

# 5. Insertar el import correctamente
LINE_IMP=\$(grep -n "import accountsFixRouter" app-integrated.js | head -1 | cut -d: -f1)
if [ ! -z "\$LINE_IMP" ]; then
    sed -i "\${LINE_IMP}a\\\\import clientsFixRouter from './src/api/clients-fix.routes.js';" app-integrated.js
    echo "✅ Import restaurado"
else
    echo "⚠️ No encontre accountsFixRouter, insertando al inicio"
    sed -i "1i import clientsFixRouter from './src/api/clients-fix.routes.js';" app-integrated.js
fi

# 6. Insertar el mount correctamente
LINE_MNT=\$(grep -n "apiApp.use('/api/accounts-receivable'" app-integrated.js | head -1 | cut -d: -f1)
if [ ! -z "\$LINE_MNT" ]; then
    sed -i "\${LINE_MNT}a\\\\        apiApp.use('/api/clients', clientsFixRouter);" app-integrated.js
    echo "✅ Mount restaurado"
else 
    echo "⚠️ Fallback mount search"
    # Si falla, buscar donde termina la funcion setupRoutes
    LINE_MNT=\$(grep -n "console.log('✅ Routes setup complete')" app-integrated.js | head -1 | cut -d: -f1)
    sed -i "\${LINE_MNT}i\\\\        apiApp.use('/api/clients', clientsFixRouter);" app-integrated.js
fi

echo "=== VERIFICAR SINTAXIS ==="
node --check app-integrated.js && echo "✅ Sintaxis OK" || echo "❌ Sintaxis ERROR"

echo "=== RESTART PM2 ==="
pm2 restart cocolu-dashoffice
sleep 5

echo "=== VERIFICAR QUE LEVANTO ==="
pm2 list
pm2 logs cocolu-dashoffice --lines 10 --nostream
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Reparación completada");
            conn.end();
        });
    });
}).connect(config);
