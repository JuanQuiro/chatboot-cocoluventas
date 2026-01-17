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

console.log("🔧 PARCHEANDO ENDPOINT SALES/BY-PERIOD...\n");

const conn = new Client();
conn.on("ready", () => {
    // Vamos a parchear enhanced-routes.js directamente con sed
    const cmd = `
# Backup
cp /var/www/cocolu-chatbot/src/api/enhanced-routes.js /var/www/cocolu-chatbot/src/api/enhanced-routes.js.bak-salesfix2

# Crear el parche usando un script de Node.js en el servidor
cat > /tmp/patch_sales.js << 'PATCH_EOF'
const fs = require('fs');
const path = '/var/www/cocolu-chatbot/src/api/enhanced-routes.js';

try {
    let content = fs.readFileSync(path, 'utf8');
    
    // Buscar el bloque del endpoint sales/by-period
    const startMarker = "app.get('/api/sales/by-period'";
    const startIdx = content.indexOf(startMarker);
    
    if (startIdx === -1) {
        console.error('❌ No se encontró el endpoint');
        process.exit(1);
    }
    
    // Encontrar el cierre del endpoint (próximo app. o final)
    let endIdx = content.indexOf("app.", startIdx + 50);
    if (endIdx === -1) endIdx = content.length;
    
    // Buscar el cierre del handler actual
    let depth = 0;
    let inFunction = false;
    for (let i = startIdx; i < endIdx; i++) {
        if (content[i] === '{') { depth++; inFunction = true; }
        if (content[i] === '}') { 
            depth--;
            if (inFunction && depth === 0) {
                // Encontrar el ; después de }));
                let semiIdx = content.indexOf(';', i);
                if (semiIdx > i && semiIdx < i + 10) {
                    endIdx = semiIdx + 1;
                    break;
                }
            }
        }
    }
    
    // Nuevo código del endpoint  
    const newEndpoint = \`app.get('/api/sales/by-period', asyncHandler(async (req, res) => {
        try {
            const { period } = req.query;
            const Database = require('better-sqlite3');
            const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db', { readonly: true });
            
            let query = "SELECT * FROM pedidos WHERE 1=1";
            
            // Filtro de fecha usando lógica timezone-aware
            if (period === 'daily') {
                query += " AND date(fecha_pedido) = date('now', 'localtime')";
            } else if (period === 'weekly') {
                query += " AND date(fecha_pedido) >= date('now', 'localtime', 'weekday 1', '-7 days')";
            } else if (period === 'monthly') {
                query += " AND strftime('%Y-%m', fecha_pedido) = strftime('%Y-%m', 'now', 'localtime')";
            } else {
                query += " AND date(fecha_pedido) = date('now', 'localtime')";
            }
            
            query += " ORDER BY fecha_pedido DESC";
            
            const pedidos = db.prepare(query).all();
            db.close();
            
            // Calcular total
            const total = pedidos.reduce((sum, p) => sum + (p.total || 0), 0);
            
            // Formatear para el frontend
            const sales = pedidos.map(p => ({
                id: p.id,
                clientName: p.nombre_cliente || 'Cliente',
                total: p.total || 0,
                date: p.fecha_pedido,
                products: p.productos ? (typeof p.productos === 'string' ? JSON.parse(p.productos) : p.productos) : []
            }));
            
            res.json({
                success: true,
                data: { period, total, count: sales.length, sales }
            });
        } catch (error) {
            console.error('Error en sales/by-period:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }));\`;
    
    // Reemplazar
    const newContent = content.substring(0, startIdx) + newEndpoint + content.substring(endIdx);
    
    fs.writeFileSync(path, newContent);
    console.log('✅ Parche aplicado exitosamente');
    
} catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
}
PATCH_EOF

# Ejecutar el parche
node /tmp/patch_sales.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🔄 Reiniciando PM2..."
    pm2 restart cocolu-dashoffice
    
    sleep 4
    
    echo ""
    echo "🧪 VERIFICANDO ENDPOINT..."
    curl -s "http://localhost:3009/api/sales/by-period?period=daily" | python3 -m json.tool 2>/dev/null || curl -s "http://localhost:3009/api/sales/by-period?period=daily"
    
    echo ""
    echo "========================================="
    echo "✅ PARCHE COMPLETADO"
    echo "========================================="
else
    echo "❌ Error aplicando parche"
    cp /var/www/cocolu-chatbot/src/api/enhanced-routes.js.bak-salesfix2 /var/www/cocolu-chatbot/src/api/enhanced-routes.js
fi
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
