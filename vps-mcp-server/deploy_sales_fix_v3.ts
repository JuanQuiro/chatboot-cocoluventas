import { Client } from "ssh2";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

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

console.log("🔥 REDEPLOYING SALES FIX (GRAND UNIFICATION V3)...");

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

        const newSale = createSaleTransaction();

        res.status(201).json({
            success: true,
            id: newSale,
            message: 'Venta creada exitosamente',
            data: { id: newSale }
        });

    } catch (error) {
        console.error('[SALES CREATE] Error:', error);
        res.status(500).json({ error: 'Error interno: ' + error.message });
    } finally {
        if (db) try { db.close(); } catch(e) {}
    }
});

// GET / - List Sales
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

// --- UPDATED APP INTEGRATED ---
const APP_CODE = `
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// --- ABSOLUTE IMPORTS ---
import authSimpleRouter from '/var/www/cocolu-chatbot/src/api/auth-simple.routes.js';
import installmentsFixRouter from '/var/www/cocolu-chatbot/src/api/installments-fix.routes.js';
import accountsFixRouter from '/var/www/cocolu-chatbot/src/api/accounts-fix.routes.js';
import clientsFixRouter from '/var/www/cocolu-chatbot/src/api/clients-fix.routes.js';
import bcvFixRouter from '/var/www/cocolu-chatbot/src/api/bcv-fix.routes.js';
import logsFixRouter from '/var/www/cocolu-chatbot/src/api/logs-fix.routes.js';
import productsFixRouter from '/var/www/cocolu-chatbot/src/api/products-fix.routes.js';
import salesFixRouter from '/var/www/cocolu-chatbot/src/api/sales-fix.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiApp = express();
const PORT = 3009;

// --- MIDDLEWARE ---
apiApp.use(cors({
    origin: ['https://cocolu.emberdrago.com', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

apiApp.use(express.json());
apiApp.use(express.urlencoded({ extended: true }));

// --- ROUTES ---
console.log('🚀 Mounting All Routes (Included Sales)...');

apiApp.use('/api', authSimpleRouter); 
apiApp.use('/api/installments', installmentsFixRouter);
apiApp.use('/api/accounts-receivable', accountsFixRouter);
apiApp.use('/api/clients', clientsFixRouter);
apiApp.use('/api/bcv', bcvFixRouter);
apiApp.use('/api/logs', logsFixRouter);
apiApp.use('/api/products', productsFixRouter);
apiApp.use('/api/sales', salesFixRouter);

// Fallback aliases
apiApp.use('/api/orders', salesFixRouter); // Alias for sales
apiApp.use('/api/inventory', productsFixRouter); // Alias for products

console.log('✅ Routes Mounted.');

// --- HEALTH CHECK ---
apiApp.get('/health', (req, res) => {
    res.json({ status: 'ok', mode: 'SALES_ADDED', timestamp: new Date() });
});

// --- SERVER START ---
const httpServer = http.createServer(apiApp);
const io = new Server(httpServer, { cors: { origin: "*" } });

httpServer.listen(PORT, () => {
    console.log(\`🚀 Server running on port \${PORT}\`);
});
`;

const conn = new Client();
conn.on("ready", () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;

        let pending = 2;
        function check() {
            pending--;
            if (pending === 0) {
                console.log("✅ Files Uploaded. Restarting...");
                conn.exec('chmod -R 755 /var/www/cocolu-chatbot/src/api && pm2 restart cocolu-dashoffice && sleep 3 && pm2 list && pm2 logs cocolu-dashoffice --lines 20 --nostream', (err, stream) => {
                    stream.on('data', d => console.log(d.toString()));
                    stream.on('close', () => conn.end());
                });
            }
        }

        sftp.createWriteStream('/var/www/cocolu-chatbot/src/api/sales-fix.routes.js').end(SALES_CODE, check);
        sftp.createWriteStream('/var/www/cocolu-chatbot/app-integrated.js').end(APP_CODE, check);
    });
}).connect(config);
