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

console.log("🔥 UPLOADING SALES FIX MODULE...");

// --- SALES FIX MODULE ---
const SALES_CODE = `
import Database from 'better-sqlite3';
import { Router } from 'express';

const router = Router();
const DB_PATH = '/var/www/cocolu-chatbot/data/cocolu.db';

function getDb() { return new Database(DB_PATH); }

// POST / - Create Sale (Order)
router.post('/', (req, res) => {
    console.log('[SALES] Create request:', JSON.stringify(req.body));
    let db = null;
    try {
        db = getDb();
        
        // Extract body
        const { 
            client_id, 
            products = [], 
            payment_method = 'efectivo',
            total = 0,
            subtotal = 0,
            discount = 0,
            delivery = 0,
            comments = '',
            vendor_id = null
        } = req.body;

        // Validation
        if (!client_id) return res.status(400).json({ error: 'Cliente es requerido' });
        if (!products || products.length === 0) return res.status(400).json({ error: 'No hay productos en la venta' });

        // Get Client Info
        const client = db.prepare('SELECT * FROM clientes WHERE id = ?').get(client_id);
        if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

        // Transaction
        const createSaleTransaction = db.transaction(() => {
             // 1. Insert Pedido
             const stmt = db.prepare(\`
                INSERT INTO pedidos (
                    cliente_id, cliente_cedula, cliente_nombre, cliente_apellido,
                    cliente_telefono, cliente_email, cliente_direccion,
                    subtotal_usd, monto_descuento_usd, monto_delivery_usd, total_usd,
                    metodo_pago, comentarios_generales, vendedor_id,
                    estado_entrega, fecha_pedido
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', CURRENT_TIMESTAMP)
             \`);
             
             const info = stmt.run(
                client.id, client.cedula, client.nombre, client.apellido,
                client.telefono, client.email, client.direccion,
                subtotal, discount, delivery, total,
                payment_method, comments, vendor_id
             );
             
             const pedidoId = info.lastInsertRowid;

             // 2. Insert Details
             const detailStmt = db.prepare(\`
                INSERT INTO detalles_pedido (
                    pedido_id, producto_id, nombre_producto, 
                    cantidad, precio_unitario_usd
                ) VALUES (?, ?, ?, ?, ?)
             \`);
             
             // Update Stock Stmt
             const stockStmt = db.prepare('UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?');

             for (const p of products) {
                 // p might be { id, name, price, quantity, ... }
                 detailStmt.run(
                    pedidoId, 
                    p.id, 
                    p.nombre || p.name || 'Producto',
                    p.cantidad || p.quantity || 1,
                    p.precio_usd || p.price || 0
                 );
                 
                 // Decrease stock
                 if (p.id) {
                     stockStmt.run(p.cantidad || p.quantity || 1, p.id);
                 }
             }
             
             return pedidoId;
        });

        const newOrderId = createSaleTransaction();

        res.status(201).json({
            success: true,
            message: 'Venta creada exitosamente',
            data: { id: newOrderId }
        });

    } catch (error) {
        console.error('[SALES CREATE] Error:', error);
        res.status(500).json({ error: 'Error interno: ' + error.message });
    } finally {
        if (db) try { db.close(); } catch(e) {}
    }
});

// GET / - List Sales (Optional, mostly for debugging or future use)
router.get('/', (req, res) => {
    let db = null;
    try {
        db = getDb();
        const rows = db.prepare('SELECT * FROM pedidos ORDER BY created_at DESC LIMIT 50').all();
        res.json({ success: true, data: rows });
    } catch (e) {
        res.status(500).json({ error: e.message });
    } finally {
        if (db) try { db.close(); } catch(e) {}
    }
});

export default router;
`;

const conn = new Client();
conn.on("ready", () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;

        const s = sftp.createWriteStream('/var/www/cocolu-chatbot/src/api/sales-fix.routes.js');
        s.on('close', () => {
            console.log("✅ Sales Module Uploaded. Updating App Integration...");

            const updateCmd = \`
                cd /var/www/cocolu-chatbot
                
                # Add import
                if ! grep -q "sales-fix.routes.js" app-integrated.js; then
                     sed -i "13i import salesFixRouter from '/var/www/cocolu-chatbot/src/api/sales-fix.routes.js';" app-integrated.js
                fi
                
                # Add mount
                if ! grep -q "/api/sales" app-integrated.js; then
                     LINE=\$(grep -n "apiApp.use('/api/clients'" app-integrated.js | head -1 | cut -d: -f1)
                     sed -i "\${LINE}a\\\\apiApp.use('/api/sales', salesFixRouter);" app-integrated.js
                fi

                # Backup mount for orders
                if ! grep -q "/api/orders" app-integrated.js; then
                     LINE=\$(grep -n "apiApp.use('/api/clients'" app-integrated.js | head -1 | cut -d: -f1)
                     sed -i "\${LINE}a\\\\apiApp.use('/api/orders', salesFixRouter);" app-integrated.js
                fi
                
                echo "✅ App Updated. Restarting..."
                chmod 755 src/api/sales-fix.routes.js
                pm2 restart cocolu-dashoffice && sleep 3 && pm2 list
            \`;
            
            conn.exec(updateCmd, (err, stream) => {
               if (err) throw err;
               stream.on('data', d => console.log(d.toString()));
               stream.on('close', () => conn.end());
            });
        });
        s.end(SALES_CODE);
    });
}).connect(config);
