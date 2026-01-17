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

console.log("🛠️ CREANDO TABLA SALES Y DATOS...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db << 'EOF'
-- Crear tabla sales si no existe
CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    client_name TEXT,
    total REAL DEFAULT 0,
    products TEXT DEFAULT '[]',
    payment_method TEXT,
    status TEXT DEFAULT 'completed',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de ejemplo para HOY (solo si la tabla está vacía)
INSERT INTO sales (client_name, total, products, payment_method, created_at)
SELECT 'Juan Pérez', 150.50, '[{"name":"Producto A","quantity":2,"price":75.25}]', 'efectivo', datetime('now', 'localtime')
WHERE NOT EXISTS (SELECT 1 FROM sales WHERE date(created_at, 'localtime') = date('now', 'localtime'));

INSERT INTO sales (client_name, total, products, payment_method, created_at)
SELECT 'María González', 89.99, '[{"name":"Producto B","quantity":1,"price":89.99}]', 'transferencia', datetime('now', 'localtime')
WHERE NOT EXISTS (SELECT 1 FROM sales WHERE client_name = 'María González');

INSERT INTO sales (client_name, total, products, payment_method, created_at)
SELECT 'Carlos Rodríguez', 220.00, '[{"name":"Producto C","quantity":3,"price":73.33}]', 'pago_movil', datetime('now', 'localtime')
WHERE NOT EXISTS (SELECT 1 FROM sales WHERE client_name = 'Carlos Rodríguez');

-- Verificar
SELECT '=== TABLA SALES CREADA ===' as status;
SELECT COUNT(*) as total_sales FROM sales;
SELECT COUNT(*) as today_sales FROM sales WHERE date(created_at, 'localtime') = date('now', 'localtime');
SELECT * FROM sales WHERE date(created_at, 'localtime') = date('now', 'localtime') LIMIT 3;
EOF

echo ""
echo "========================================="
echo "VERIFICANDO ENDPOINT /api/sales/by-period"
echo "========================================="
curl -s "http://localhost:3009/api/sales/by-period?period=daily" | python3 -m json.tool 2>/dev/null || curl -s "http://localhost:3009/api/sales/by-period?period=daily"

echo ""
echo "========================================="
echo "✅ TABLA SALES LISTA"
echo "========================================="
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
