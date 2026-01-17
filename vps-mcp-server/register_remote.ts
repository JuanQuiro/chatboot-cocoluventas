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
    readyTimeout: 90000,
};

console.log("🔧 REGISTRANDO RUTAS CON SCRIPT REMOTO...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
# Crear script Node en el servidor
cat > /tmp/register_routes.js << 'SCRIPT_EOF'
const fs = require('fs');
const path = '/var/www/cocolu-chatbot/app-integrated.js';

try {
    const data = fs.readFileSync(path, 'utf8');
    const lines = data.split('\\n');
    
    // Buscar import de sellersRoutes
    const sellersImportIdx = lines.findIndex(l => l.includes("import sellersRoutes from"));
    
    if (sellersImportIdx === -1) {
        console.error('❌ No encontrado sellersRoutes');
        process.exit(1);
    }
    
    // Agregar imports
    lines.splice(sellersImportIdx + 1, 0, 
        "import tasasRoutes from './src/api/tasas.routes.js';",
        "import clientsImprovedRoutes from './src/api/clients-improved.routes.js';",
        "import paymentsImprovedRoutes from './src/api/payments-improved.routes.js';",
        "import salesImprovedRoutes from './src/api/sales-improved.routes.js';"
    );
    
    // Buscar apiApp.use sellers
    const sellersUseIdx = lines.findIndex(l => l.includes("apiApp.use('/api/sellers'"));
    
    if (sellersUseIdx === -1) {
        console.error('❌ No encontrado sellers use');
        process.exit(1);
    }
    
    // Agregar registros
    lines.splice(sellersUseIdx + 1, 0,
        "apiApp.use('/api/tasas', tasasRoutes);",
        "apiApp.use('/api/clients-improved', clientsImprovedRoutes);",
        "apiApp.use('/api/payments-improved', paymentsImprovedRoutes);",
        "apiApp.use('/api/sales-improved', salesImprovedRoutes);"
    );
    
    const modified = lines.join('\\n');
    
    // Backup
    fs.copyFileSync(path, path + '.bak-joyeria');
    
    // Escribir
    fs.writeFileSync(path, modified, 'utf8');
    
    console.log('✅ Rutas registradas correctamente');
    
} catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
}
SCRIPT_EOF

# Ejecutar script
node /tmp/register_routes.js

if [ $? -eq 0 ]; then
    echo "✅ Script ejecutado correctamente"
    
    # Verificar sintaxis
    node --check /var/www/cocolu-chatbot/app-integrated.js
    
    if [ $? -eq 0 ]; then
        echo "✅ Sintaxis correcta"
        
        # Reiniciar
        pm2 restart cocolu-dashoffice
        
        sleep 6
        
        echo ""
        echo "🧪 VERIFICANDO NUEVOS ENDPOINTS:"
        
        echo "1. Tasa actual:"
        curl -s http://localhost:3009/api/tasas/actual
        
        echo ""
        echo "2. Búsqueda clientes:"
        curl -s "http://localhost:3009/api/clients-improved/search?q=a" | head -n 3
        
        echo ""
        echo "========================================="
        echo "✅ SISTEMA JOYERÍA IMPLEMENTADO"
        echo "========================================="
        echo ""
        echo "📊 NUEVOS ENDPOINTS DISPONIBLES:"
        echo "  • GET  /api/tasas/actual"
        echo "  • POST /api/tasas"
        echo "  • GET  /api/clients-improved/search?q=nombre"
        echo "  • POST /api/clients-improved"
        echo "  • POST /api/payments-improved"
        echo "  • POST /api/payments-improved/abono"
        echo "  • POST /api/sales-improved/nueva"
        echo "  • GET  /api/sales-improved/:id/resumen"
    else
        echo "❌ Error de sintaxis - Restaurando"
        cp /var/www/cocolu-chatbot/app-integrated.js.bak-joyeria /var/www/cocolu-chatbot/app-integrated.js
    fi
else
    echo "❌ Error en script de registro"
fi
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
