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

console.log("🔧 FASE 2: CREANDO APIS BACKEND...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
# 1. CREAR API DE TASAS DE CAMBIO
cat > /var/www/cocolu-chatbot/src/api/tasas.routes.js << 'EOF'
import express from 'express';
import Database from 'better-sqlite3';

const router = express.Router();

// GET /api/tasas/actual - Obtener tasa vigente
router.get('/actual', async (req, res) => {
    try {
        const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db', { readonly: true });
        const tasa = db.prepare('SELECT * FROM tasas_cambio WHERE activa = 1 ORDER BY fecha DESC LIMIT 1').get();
        db.close();
        
        if (!tasa) {
            return res.status(404).json({ success: false, error: 'No hay tasa activa configurada' });
        }
        
        res.json({ success: true, data: tasa });
    } catch (error) {
        console.error('Error en /api/tasas/actual:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/tasas - Lista todas las tasas
router.get('/', async (req, res) => {
    try {
        const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db', { readonly: true });
        const tasas = db.prepare('SELECT * FROM tasas_cambio ORDER BY fecha DESC LIMIT 50').all();
        db.close();
        res.json({ success: true, data: tasas });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/tasas - Crear nueva tasa
router.post('/', async (req, res) => {
    try {
        const { tasa_oficial, tasa_paralelo, activar } = req.body;
        
        if (!tasa_oficial || !tasa_paralelo) {
            return res.status(400).json({ success: false, error: 'Faltan datos: tasa_oficial y tasa_paralelo son obligatorios' });
        }
        
        const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db');
        
        // Si activar = true, desactivar todas las demás
        if (activar) {
            db.prepare('UPDATE tasas_cambio SET activa = 0').run();
        }
        
        const result = db.prepare(\`
            INSERT INTO tasas_cambio (tasa_oficial, tasa_paralelo, activa)
            VALUES (?, ?, ?)
        \`).run(tasa_oficial, tasa_paralelo, activar ? 1 : 0);
        
        const nueva_tasa = db.prepare('SELECT * FROM tasas_cambio WHERE id = ?').get(result.lastInsertRowid);
        db.close();
        
        res.json({ success: true, data: nueva_tasa });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/tasas/:id/activar - Activar tasa específica
router.put('/:id/activar', async (req, res) => {
    try {
        const { id } = req.params;
        const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db');
        
        // Desactivar todas
        db.prepare('UPDATE tasas_cambio SET activa = 0').run();
        
        // Activar la seleccionada
        db.prepare('UPDATE tasas_cambio SET activa = 1 WHERE id = ?').run(id);
        
        const tasa = db.prepare('SELECT * FROM tasas_cambio WHERE id = ?').get(id);
        db.close();
        
        res.json({ success: true, data: tasa });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
EOF

# 2. CREAR API DE CLIENTES CON APELLIDO
cat > /var/www/cocolu-chatbot/src/api/clients-improved.routes.js << 'EOF'
import express from 'express';
import Database from 'better-sqlite3';

const router = express.Router();

// GET /api/clients/search - Búsqueda por nombre+apellido
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.length < 2) {
            return res.json({ success: true, data: [] });
        }
        
        const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db', { readonly: true });
        
        const query = \`
            SELECT 
                id,
                nombre,
                apellido,
                nombre || ' ' || COALESCE(apellido, '') as nombre_completo,
                telefono,
                email,
                cedula
            FROM clientes
            WHERE 
                nombre LIKE ? OR 
                apellido LIKE ? OR 
                (nombre || ' ' || COALESCE(apellido, '')) LIKE ? OR
                telefono LIKE ? OR
                cedula LIKE ?
            ORDER BY nombre, apellido
            LIMIT 20
        \`;
        
        const searchTerm = \`%\${q}%\`;
        const results = db.prepare(query).all(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        db.close();
        
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Error en /api/clients/search:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/clients - Lista todos los clientes
router.get('/', async (req, res) => {
    try {
        const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db', { readonly: true });
        const clientes = db.prepare(\`
            SELECT 
                id,
                nombre,
                apellido,
                nombre || ' ' || COALESCE(apellido, '') as nombre_completo,
                telefono,
                email,
                cedula
            FROM clientes
            ORDER BY nombre, apellido
        \`).all();
        db.close();
        
        res.json({ success: true, data: clientes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/clients - Crear cliente (apellido obligatorio)
router.post('/', async (req, res) => {
    try {
        const { nombre, apellido, telefono, email, cedula } = req.body;
        
        if (!nombre || !apellido) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nombre y Apellido son obligatorios' 
            });
        }
        
        const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db');
        
        const result = db.prepare(\`
            INSERT INTO clientes (nombre, apellido, telefono, email, cedula)
            VALUES (?, ?, ?, ?, ?)
        \`).run(nombre, apellido, telefono, email, cedula);
        
        const nuevo_cliente = db.prepare(\`
            SELECT 
                id,
                nombre,
                apellido,
                nombre || ' ' || apellido as nombre_completo,
                telefono,
                email,
                cedula
            FROM clientes WHERE id = ?
        \`).get(result.lastInsertRowid);
        db.close();
        
        res.json({ success: true, data: nuevo_cliente });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
EOF

# 3. CREAR API DE PAGOS MEJORADA
cat > /var/www/cocolu-chatbot/src/api/payments-improved.routes.js << 'EOF'
import express from 'express';
import Database from 'better-sqlite3';

const router = express.Router();

// POST /api/payments - Registrar pago con conversión automática
router.post('/', async (req, res) => {
    try {
        const { venta_id, monto, moneda, metodo, nota } = req.body;
        
        if (!venta_id || !monto || !moneda || !metodo) {
            return res.status(400).json({ 
                success: false, 
                error: 'Faltan datos: venta_id, monto, moneda y metodo son obligatorios' 
            });
        }
        
        const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db');
        
        // 1. Obtener tasa del día
        const tasa = db.prepare('SELECT tasa_paralelo FROM tasas_cambio WHERE activa = 1 LIMIT 1').get();
        
        if (!tasa && moneda === 'BS') {
            db.close();
            return res.status(400).json({ success: false, error: 'No hay tasa de cambio configurada' });
        }
        
        // 2. Convertir a USD si es Bs
        const monto_usd = moneda === 'BS' ? monto / tasa.tasa_paralelo : parseFloat(monto);
        const tasa_usada = moneda === 'BS' ? tasa.tasa_paralelo : null;
        
        // 3. Registrar pago
        const result = db.prepare(\`
            INSERT INTO pagos (venta_id, monto, moneda, monto_usd, tasa_cambio, metodo, tipo, nota)
            VALUES (?, ?, ?, ?, ?, ?, 'pago', ?)
        \`).run(venta_id, monto, moneda, monto_usd, tasa_usada, metodo, nota);
        
        // 4. Calcular nuevo saldo
        const venta = db.prepare('SELECT total FROM ventas WHERE id = ?').get(venta_id);
        const pagos_totales = db.prepare('SELECT SUM(monto_usd) as total FROM pagos WHERE venta_id = ?').get(venta_id);
        const saldo_pendiente = venta.total - (pagos_totales.total || 0);
        
        // 5. Actualizar saldo en la venta
        db.prepare('UPDATE ventas SET saldo_pendiente = ? WHERE id = ?').run(saldo_pendiente, venta_id);
        
        const nuevo_pago = db.prepare('SELECT * FROM pagos WHERE id = ?').get(result.lastInsertRowid);
        db.close();
        
        res.json({ 
            success: true, 
            data: {
                pago: nuevo_pago,
                saldo_pendiente,
                conversion: moneda === 'BS' ? {
                    monto_bs: monto,
                    tasa: tasa_usada,
                    monto_usd
                } : null
            }
        });
    } catch (error) {
        console.error('Error en /api/payments:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/payments/abono - Abono libre
router.post('/abono', async (req, res) => {
    try {
        const { venta_id, monto, moneda, metodo, nota } = req.body;
        
        const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db');
        
        const tasa = db.prepare('SELECT tasa_paralelo FROM tasas_cambio WHERE activa = 1 LIMIT 1').get();
        const monto_usd = moneda === 'BS' ? monto / tasa.tasa_paralelo : parseFloat(monto);
        
        db.prepare(\`
            INSERT INTO pagos (venta_id, monto, moneda, monto_usd, tasa_cambio, metodo, tipo, nota)
            VALUES (?, ?, ?, ?, ?, ?, 'abono_libre', ?)
        \`).run(venta_id, monto, moneda, monto_usd, tasa?.tasa_paralelo, metodo, nota);
        
        // Actualizar saldo
        const venta = db.prepare('SELECT total FROM ventas WHERE id = ?').get(venta_id);
        const pagos_totales = db.prepare('SELECT SUM(monto_usd) as total FROM pagos WHERE venta_id = ?').get(venta_id);
        const saldo = venta.total - pagos_totales.total;
        
        db.prepare('UPDATE ventas SET saldo_pendiente = ? WHERE id = ?').run(saldo, venta_id);
        db.close();
        
        res.json({ success: true, nuevo_saldo: saldo });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/payments/venta/:id - Historial de pagos
router.get('/venta/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db', { readonly: true });
        
        const pagos = db.prepare(\`
            SELECT 
                id,
                monto,
                moneda,
                monto_usd,
                tasa_cambio,
                metodo,
                tipo,
                nota,
                created_at
            FROM pagos
            WHERE venta_id = ?
            ORDER BY created_at DESC
        \`).all(id);
        
        const total_pagado = db.prepare('SELECT SUM(monto_usd) as total FROM pagos WHERE venta_id = ?').get(id);
        const venta = db.prepare('SELECT total, saldo_pendiente FROM ventas WHERE id = ?').get(id);
        db.close();
        
        res.json({ 
            success: true, 
            data: {
                pagos,
                total_pagado: total_pagado.total || 0,
                total_venta: venta.total,
                saldo_pendiente: venta.saldo_pendiente
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
EOF

echo "✅ APIs creadas correctamente"
echo ""
echo "📝 Archivos creados:"
echo "  - tasas.routes.js"
echo "  - clients-improved.routes.js"
echo "  - payments-improved.routes.js"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
