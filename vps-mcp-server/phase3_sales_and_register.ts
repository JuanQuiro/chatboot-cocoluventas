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

console.log("🔧 FASE 3: CREANDO API DE VENTAS Y REGISTRANDO RUTAS...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
# 1. CREAR API DE VENTAS CON CÁLCULOS CORRECTOS
cat > /var/www/cocolu-chatbot/src/api/sales-improved.routes.js << 'EOF'
import express from 'express';
import Database from 'better-sqlite3';

const router = express.Router();

// POST /api/sales/nueva - Crear venta con cálculos automáticos
router.post('/nueva', async (req, res) => {
    try {
        const { 
            cliente_id, 
            productos, 
            descuento_porcentaje = 0,
            incluir_iva = false,
            delivery_monto = 0,
            metodo_pago,
            abono_inicial = 0
        } = req.body;
        
        if (!cliente_id || !productos || productos.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Cliente y productos son obligatorios' 
            });
        }
        
        // CÁLCULOS CORRECTOS
        // 1. Subtotal
        const subtotal = productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        
        // 2. Descuento
        const descuento_monto = subtotal * (parseFloat(descuento_porcentaje) / 100);
        const base_imponible = subtotal - descuento_monto;
        
        // 3. IVA (solo si incluir_iva = true)
        const iva_monto = incluir_iva ? base_imponible * 0.16 : 0;
        
        // 4. Delivery
        const delivery = parseFloat(delivery_monto) || 0;
        
        // 5. TOTAL FINAL
        const total = base_imponible + iva_monto + delivery;
        
        // 6. Saldo pendiente (total - abono inicial)
        const saldo_pendiente = total - parseFloat(abono_inicial);
        
        const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db');
        
        // Guardar venta
        const result = db.prepare(\`
            INSERT INTO ventas (
                cliente_id, 
                productos, 
                subtotal,
                descuento_porcentaje,
                descuento_monto,
                iva_monto,
                delivery_monto,
                total,
                saldo_pendiente,
                metodo_pago,
                fecha_pedido
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        \`).run(
            cliente_id,
            JSON.stringify(productos),
            subtotal.toFixed(2),
            descuento_porcentaje,
            descuento_monto.toFixed(2),
            iva_monto.toFixed(2),
            delivery,
            total.toFixed(2),
            saldo_pendiente.toFixed(2),
            metodo_pago
        );
        
        const venta_id = result.lastInsertRowid;
        
        // Si hay abono inicial, registrarlo
        if (abono_inicial > 0) {
            db.prepare(\`
                INSERT INTO pagos (venta_id, monto, moneda, monto_usd, metodo, tipo)
                VALUES (?, ?, 'USD', ?, ?, 'abono_inicial')
            \`).run(venta_id, abono_initial, abono_inicial, metodo_pago);
        }
        
        const nueva_venta = db.prepare(\`
            SELECT v.*, c.nombre || ' ' || COALESCE(c.apellido, '') as cliente_nombre
            FROM ventas v
            INNER JOIN clientes c ON v.cliente_id = c.id
            WHERE v.id = ?
        \`).get(venta_id);
        
        db.close();
        
        res.json({ 
            success: true, 
            data: {
                ...nueva_venta,
                productos: JSON.parse(nueva_venta.productos),
                desglose: {
                    subtotal: parseFloat(subtotal.toFixed(2)),
                    descuento: parseFloat(descuento_monto.toFixed(2)),
                    base_imponible: parseFloat(base_imponible.toFixed(2)),
                    iva: parseFloat(iva_monto.toFixed(2)),
                    delivery: parseFloat(delivery),
                    total: parseFloat(total.toFixed(2)),
                    abono_inicial: parseFloat(abono_inicial),
                    saldo_pendiente: parseFloat(saldo_pendiente.toFixed(2))
                }
            }
        });
    } catch (error) {
        console.error('Error en /api/sales/nueva:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/sales/:id/resumen - Obtener desglose de venta
router.get('/:id/resumen', async (req, res) => {
    try {
        const { id } = req.params;
        const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db', { readonly: true });
        
        const venta = db.prepare(\`
            SELECT 
                v.*,
                c.nombre || ' ' || COALESCE(c.apellido, '') as cliente_nombre,
                c.telefono as cliente_telefono
            FROM ventas v
            INNER JOIN clientes c ON v.cliente_id = c.id
            WHERE v.id = ?
        \`).get(id);
        
        if (!venta) {
            db.close();
            return res.status(404).json({ success: false, error: 'Venta no encontrada' });
        }
        
        const pagos = db.prepare(\`
            SELECT * FROM pagos WHERE venta_id = ? ORDER BY created_at DESC
        \`).all(id);
        
        db.close();
        
        res.json({
            success: true,
            data: {
                ...venta,
                productos: JSON.parse(venta.productos || '[]'),
                pagos,
                desglose: {
                    subtotal: parseFloat(venta.subtotal),
                    descuento: parseFloat(venta.descuento_monto),
                    iva: parseFloat(venta.iva_monto),
                    delivery: parseFloat(venta.delivery_monto),
                    total: parseFloat(venta.total),
                    saldo_pendiente: parseFloat(venta.saldo_pendiente)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
EOF

# 2. REGISTRAR TODAS LAS NUEVAS RUTAS EN APP-INTEGRATED.JS
echo ""
echo "📝 Descargando app-integrated.js actual..."
cat /var/www/cocolu-chatbot/app-integrated.js > /tmp/app-integrated-backup.js

echo "📝 Agregando imports de nuevas rutas..."
# Buscar línea de sellersRoutes y agregar después
sed -i "/import sellersRoutes from/a\\
import tasasRoutes from './src/api/tasas.routes.js';\\
import clientsImprovedRoutes from './src/api/clients-improved.routes.js';\\
import paymentsImprovedRoutes from './src/api/payments-improved.routes.js';\\
import salesImprovedRoutes from './src/api/sales-improved.routes.js';" /var/www/cocolu-chatbot/app-integrated.js

echo "📝 Registrando rutas en apiApp..."
# Buscar línea de apiApp.use sellers y agregar después
sed -i "/apiApp.use('\/api\/sellers'/a\\
apiApp.use('/api/tasas', tasasRoutes);\\
apiApp.use('/api/clients-improved', clientsImprovedRoutes);\\
apiApp.use('/api/payments-improved', paymentsImprovedRoutes);\\
apiApp.use('/api/sales-improved', salesImprovedRoutes);" /var/www/cocolu-chatbot/app-integrated.js

# Verificar sintaxis
echo ""
echo "🔍 Verificando sintaxis..."
node --check /var/www/cocolu-chatbot/app-integrated.js

if [ $? -eq 0 ]; then
    echo "✅ Sintaxis correcta"
    
    # Reiniciar PM2
    echo ""
    echo "🔄 Reiniciando PM2..."
    pm2 restart cocolu-dashoffice
    
    sleep 6
    
    # Verificar endpoints
    echo ""
    echo "✅ VERIFICANDO NUEVOS ENDPOINTS:"
    
    echo ""
    echo "1. Tasa actual:"
    curl -s http://localhost:3009/api/tasas/actual | head -n 3
    
    echo ""
    echo "2. Búsqueda de clientes:"
    curl -s "http://localhost:3009/api/clients-improved/search?q=juan" | head -n 5
    
    echo ""
    echo "========================================="
    echo "✅ IMPLEMENTACIÓN COMPLETADA"
    echo "========================================="
    echo ""
    echo "📊 ENDPOINTS DISPONIBLES:"
    echo "  - GET  /api/tasas/actual"
    echo "  - POST /api/tasas"
    echo "  - GET  /api/clients-improved/search?q=nombre"
    echo "  - POST /api/clients-improved"
    echo "  - POST /api/payments-improved"
    echo "  - POST /api/payments-improved/abono"
    echo "  - GET  /api/payments-improved/venta/:id"
    echo "  - POST /api/sales-improved/nueva"
    echo "  - GET  /api/sales-improved/:id/resumen"
else
    echo "❌ Error de sintaxis - Restaurando backup"
    mv /tmp/app-integrated-backup.js /var/www/cocolu-chatbot/app-integrated.js
fi
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
