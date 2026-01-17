import { Client } from "ssh2";
import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
};

console.log(`Populating ALL Missing Tables on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/data
        
        echo "=== CHECKING CURRENT DATA ==="
        sqlite3 cocolu.db << 'SQL'
SELECT '.tables' as check;
.tables
SELECT '' as sep;
SELECT 'Current counts:' as info;
SELECT 'movimientos_inventario: ' || COUNT(*) FROM movimientos_inventario;
SELECT 'pedidos: ' || COUNT(*) FROM pedidos;
SELECT 'abonos: ' || COUNT(*) FROM abonos;
SQL

        echo ""
        echo "=== POPULATING MISSING DATA ==="
        sqlite3 cocolu.db << 'SEEDSQL'
-- MOVIMIENTOS DE INVENTARIO (entradas y salidas)
INSERT INTO movimientos_inventario (producto_id, tipo, cantidad, costo_unitario, usuario, notas, fecha)
SELECT 
    p.id,
    'entrada',
    CASE WHEN p.id % 3 = 0 THEN 10 ELSE 20 END,
    p.precio_usd * 0.6,
    'admin',
    'Compra inicial de inventario',
    datetime('now', '-' || (p.id * 5) || ' days')
FROM productos p
WHERE p.id <= 15
LIMIT 15;

-- Salidas de inventario (ventas)
INSERT INTO movimientos_inventario (producto_id, tipo, cantidad, costo_unitario, usuario, notas, fecha)
SELECT 
    p.id,
    'salida',
    CASE WHEN p.id % 4 = 0 THEN 2 ELSE 1 END,
    p.precio_usd,
    'roberto@cocolu.com',
    'Venta a cliente - pedido #' || p.id,
    datetime('now', '-' || (p.id * 2) || ' days')
FROM productos p
WHERE p.id <= 20
LIMIT 20;

-- PEDIDOS (órdenes de compra)
INSERT INTO pedidos (cliente_id, total, estado, metodo_pago, fecha_pedido, created_at)
SELECT 
    c.id,
    ROUND((RANDOM() % 5000) + 1000, 2),
    CASE (c.id % 4)
        WHEN 0 THEN 'completado'
        WHEN 1 THEN 'pendiente'
        WHEN 2 THEN 'en_proceso'
        ELSE 'completado'
    END,
    CASE (c.id % 3)
        WHEN 0 THEN 'transferencia'
        WHEN 1 THEN 'efectivo'
        ELSE 'zelle'
    END,
    datetime('now', '-' || (c.id * 3) || ' days'),
    datetime('now', '-' || (c.id * 3) || ' days')
FROM clientes c
WHERE c.id <= 15
LIMIT 15;

-- ABONOS (pagos parciales)
INSERT INTO abonos (ingreso_id, monto, fecha, metodo_pago, referencia, notas)
SELECT 
    i.id,
    ROUND(i.monto * 0.3, 2),
    datetime(i.fecha, '+5 days'),
    'transferencia',
    'ABONO-' || i.id || '-001',
    'Primer abono - 30%'
FROM ingresos_varios i
WHERE i.id % 5 = 0
LIMIT 10;

SELECT 'SEED COMPLETED';
SEEDSQL

        echo ""
        echo "=== VERIFICATION ==="
        sqlite3 cocolu.db << 'SQL'
SELECT 'movimientos_inventario: ' || COUNT(*) FROM movimientos_inventario;
SELECT 'pedidos: ' || COUNT(*) FROM pedidos;
SELECT 'abonos: ' || COUNT(*) FROM abonos;
SQL

        echo ""
        echo "=== RESTARTING PM2 ==="
        cd /var/www/cocolu-chatbot
        pm2 restart cocolu-dashoffice --update-env
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ All tables populated");
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        }).stderr.on("data", (data: any) => {
            console.error("STDERR:", data.toString());
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
