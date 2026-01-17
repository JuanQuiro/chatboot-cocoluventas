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

console.log("🚑 RESTAURANDO APP-INTEGRATED DESDE GIT/CLEAN...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

# 1. Recuperar archivo base limpio
# Si tenemos un app-integrated.js.clean o .backup reciente, mejor usar ese.
# Si no, revertimos cambios agresivos manuales.
# Vamos a asumir que el .corrupto es el actual y vamos a limpiarlo línea por línea de basura.

# Eliminar líneas que causan error de sintaxis ("pi/clients")
sed -i '/pi\/clients/d' app-integrated.js
sed -i '/clientsFixRouter)\//d' app-integrated.js

# Asegurar que no hay basura colgada
node --check app-integrated.js

if [ $? -eq 0 ]; then
    echo "✅ Archivo limpiado y sintaxis válida."
    
    # Ahora sí, re-inyectar con cuidado extremo
    # Check si ya tiene el import
    if ! grep -q "import clientsFixRouter" app-integrated.js; then
         sed -i "1i import clientsFixRouter from './src/api/clients-fix.routes.js';" app-integrated.js
    fi
    
    # Check si ya tiene el use
    if ! grep -q "use('/api/clients', clientsFixRouter)" app-integrated.js; then
        # Insertar al final del bloque de uses financieros
        LINE=\$(grep -n "apiApp.use('/api/accounts-receivable'" app-integrated.js | head -1 | cut -d: -f1)
        if [ ! -z "\$LINE" ]; then
            sed -i "\${LINE}a\\\\        apiApp.use('/api/clients', clientsFixRouter);" app-integrated.js
        fi
    fi
    
    echo "✅ Rutas re-inyectadas limpio."
else
    echo "❌ Aún corrupto. Restaurando de backup radical..."
    # Si sigue mal, usamos el backup que creamos antes de todo el lío de clientes
    if [ -f "app-integrated.js.old" ]; then 
        cp app-integrated.js.old app-integrated.js
        echo "✅ Restaurado de .old"
    elif [ -f "app-integrated.js.backup" ]; then
        cp app-integrated.js.backup app-integrated.js
        echo "✅ Restaurado de .backup"
    fi
    
    # Y re-aplicamos TODO (Installments, Accounts, Clients)
    # Insert imports
    sed -i "1i import installmentsFixRouter from './src/api/installments-fix.routes.js';" app-integrated.js
    sed -i "1i import accountsFixRouter from './src/api/accounts-fix.routes.js';" app-integrated.js
    sed -i "1i import clientsFixRouter from './src/api/clients-fix.routes.js';" app-integrated.js
    
    # Insert uses (assuming standard location around line 200 or inside setupRoutes)
    # Buscar un punto de anclaje seguro
    LINE=\$(grep -n "const apiApp = express()" app-integrated.js | head -1 | cut -d: -f1)
    if [ ! -z "\$LINE" ]; then
        # Insertar despues de crear apiApp
        sed -i "\${LINE}a\\\\    apiApp.use('/api/installments', installmentsFixRouter);" app-integrated.js
        sed -i "\${LINE}a\\\\    apiApp.use('/api/accounts-receivable', accountsFixRouter);" app-integrated.js
        sed -i "\${LINE}a\\\\    apiApp.use('/api/clients', clientsFixRouter);" app-integrated.js
    fi
fi

echo "=== VERIFICAR SINTAXIS FINAL ==="
node --check app-integrated.js && echo "✅ OK" || echo "❌ ERROR"

echo "=== RESTART PM2 ==="
pm2 restart cocolu-dashoffice
sleep 10
pm2 list
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Done");
            conn.end();
        });
    });
}).connect(config);
