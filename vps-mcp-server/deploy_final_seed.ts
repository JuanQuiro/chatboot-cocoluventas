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

console.log(`Creating Schema-Matched Seed on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/data
        
        sqlite3 cocolu.db << 'SQLEND'
-- ================================
-- SEED DATA - Schema Matched
-- ================================

-- SELLERS (matching actual schema: id, name, email, phone, password, rating, activo)
INSERT OR IGNORE INTO sellers (name, email, phone, activo) VALUES
('Roberto Chávez', 'roberto@cocolu.com', '04241234567', 1),
('Luisa Fernández', 'luisa@cocolu.com', '04142345678', 1),
('Miguel Torres', 'miguel@cocolu.com', '04263456789', 1),
('Carmen Rodríguez', 'carmen@cocolu.com', '04124567890', 1),
('Diego Morales (Inactivo)', 'diego@cocolu.com', '04145678901', 0);

-- CLIENTS (nombre, telefono, direccion, notas, created_at)
INSERT INTO clientes (nombre, telefono, direccion, created_at) VALUES
('María González', '04241001001', 'Av. Principal #1, Caracas', datetime('now', '-90 days')),
('José Pérez', '04241001002', 'Calle 5, Valencia', datetime('now', '-80 days')),
('Ana Martínez', '04241001003', 'Urb. Los Pinos, Maracay', datetime('now', '-70 days')),
('Carlos López', '04241001004', NULL, datetime('now', '-60 days')),
('Laura Rodríguez', '04241001005', 'Av. Bolívar, Caracas', datetime('now', '-50 days')),
('Pedro Sánchez', '04241001006', NULL, datetime('now', '-40 days')),
('Carmen Díaz', '04241001007', 'Sector Centro', datetime('now', '-30 days')),
('Miguel Torres', '04241001008', 'Residencias El Sol', datetime('now', '-25 days')),
('Isabel Ramírez', '04241001009', 'Calle Principal', datetime('now', '-20 days')),
('Diego Morales', '04241001010', NULL, datetime('now', '-15 days')),
('Sofía Castro', '04241001011', 'Urb. La Florida', datetime('now', '-10 days')),
('Andrés Vargas', '04241001012', 'Av. Libertador', datetime('now', '-8 days')),
('Valentina Ruiz', '04241001013', NULL, datetime('now', '-6 days')),
('Javier Fernández', '04241001014', 'Calle 10, Valencia', datetime('now', '-5 days')),
('Camila Gómez', '04241001015', 'Residencias Premium', datetime('now', '-3 days')),
('Leonardo Silva', '04241001016', NULL, datetime('now', '-2 days')),
('Gabriela Mendoza', '04241001017', 'Sector Norte', datetime('now', '-1 days')),
('Ricardo Herrera', '04241001018', 'Av. Principal #99', datetime('now')),
('Cliente VIP', '04241001019', 'Torre Empresarial', datetime('now')),
('Cliente Nuevo', '04241001020', NULL, datetime('now'));

-- PRODUCTS (codigo or sku, nombre, precio, stock, fabricante, categoria, descripcion)
INSERT INTO productos (sku, nombre, precio, stock, categoria, descripcion, created_at) VALUES
('P-0001', 'RELICARIO Oro 18k Premium', 4500.00, 5, 'RELICARIO', 'Relicario de oro 18k de alta calidad', datetime('now', '-180 days')),
('P-0002', 'DIJE Plata 925', 850.00, 12, 'DIJE', NULL, datetime('now', '-170 days')),
('P-0003', 'CADENA Oro Blanco 18k', 3200.00, 8, 'CADENA', 'Importado de Italia', datetime('now', '-160 days')),
('P-0004', 'PULSERA Acero Inoxidable', 650.00, 20, 'PULSERA', NULL, datetime('now', '-150 days')),
('P-0005', 'ANILLO Platino Premium', 5500.00, 3, 'ANILLO', 'Diseño exclusivo premium', datetime('now', '-140 days')),
('P-0006', 'ARETES Oro 18k', 2800.00, 15, 'ARETES', NULL, datetime('now', '-130 days')),
('P-0007', 'COLLAR Plata 925 Premium', 1200.00, 0, 'COLLAR', 'AGOTADO - Reorden pendiente', datetime('now', '-120 days')),
('P-0008', 'DIJE Oro Rosa', 1850.00, 10, 'DIJE', NULL, datetime('now', '-110 days')),
('P-0009', 'RELICARIO Plata 925', 980.00, 18, 'RELICARIO', NULL, datetime('now', '-100 days')),
('P-0010', 'CADENA Acero Premium', 720.00, 25, 'CADENA', NULL, datetime('now', '-90 days')),
('P-0011', 'PULSERA Oro 18k', 3500.00, 6, 'PULSERA', NULL, datetime('now', '-80 days')),
('P-0012', 'ANILLO Plata 925', 680.00, 22, 'ANILLO', NULL, datetime('now', '-70 days')),
('P-0013', 'ARETES Acero Inoxidable', 450.00, 0, 'ARETES', 'AGOTADO', datetime('now', '-60 days')),
('P-0014', 'COLLAR Oro Blanco', 4200.00, 4, 'COLLAR', 'Importado', datetime('now', '-50 days')),
('P-0015', 'DIJE Personalizado', 920.00, 14, 'DIJE', 'Con grabado personalizado', datetime('now', '-40 days')),
('P-0016', 'RELICARIO Oro 18k', 4100.00, 7, 'RELICARIO', NULL, datetime('now', '-30 days')),
('P-0017', 'CADENA Plata 925', 890.00, 19, 'CADENA', NULL, datetime('now', '-25 days')),
('P-0018', 'PULSERA Platino', 5200.00, 2, 'PULSERA', 'Edición limitada', datetime('now', '-20 days')),
('P-0019', 'ANILLO Oro Rosa Premium', 3800.00, 0, 'ANILLO', 'AGOTADO - Stock en camino', datetime('now', '-15 days')),
('P-0020', 'ARETES Plata 925', 780.00, 16, 'ARETES', NULL, datetime('now', '-10 days'));

-- SALES/INCOME (descripcion, monto, fecha, categoria, metodo_pago, referencia, notas)
INSERT INTO ingresos_varios (descripcion, monto, fecha, categoria, metodo_pago, referencia, created_at) VALUES
('Venta RELICARIO Oro 18k x1 - Cliente: María González', 4500.00, datetime('now', '-85 days'), 'venta', 'transferencia', 'REF-001', datetime('now', '-85 days')),
('Venta DIJE Plata 925 x2 - Cliente: José Pérez', 1700.00, datetime('now', '-75 days'), 'venta', 'efectivo', NULL, datetime('now', '-75 days')),
('Venta CADENA Oro Blanco x1 - Cliente: Ana Martínez', 3200.00, datetime('now', '-65 days'), 'venta', 'zelle', 'REF-002', datetime('now', '-65 days')),
('Venta PULSERA Acero x3 - Cliente: Carlos López', 1950.00, datetime('now', '-55 days'), 'venta', 'pago_movil', 'REF-003', datetime('now', '-55 days')),
('Venta ANILLO Platino x1 - Cliente VIP', 5500.00, datetime('now', '-45 days'), 'venta', 'transferencia', 'REF-004', datetime('now', '-45 days')),
('Reparación Cadena Oro - Cliente: Laura Rodríguez', 350.00, datetime('now', '-40 days'), 'reparacion', 'efectivo', NULL, datetime('now', '-40 days')),
('Venta ARETES Oro x1 - Cliente: Pedro Sánchez', 2800.00, datetime('now', '-35 days'), 'venta', 'punto_venta', 'REF-005', datetime('now', '-35 days')),
('Venta DIJE Oro Rosa x1 - Cliente: Carmen Díaz', 1850.00, datetime('now', '-30 days'), 'venta', 'transferencia', 'REF-006', datetime('now', '-30 days')),
('Venta RELICARIO Plata x2 - Cliente: Miguel Torres', 1960.00, datetime('now', '-25 days'), 'venta', 'efectivo', NULL, datetime('now', '-25 days')),
('Venta PULSERA Oro x1 - Cliente: Isabel Ramírez', 3500.00, datetime('now', '-20 days'), 'venta', 'zelle', 'REF-007', datetime('now', '-20 days')),
('Servicio Limpieza Joyas', 120.00, datetime('now', '-18 days'), 'servicio', 'efectivo', NULL, datetime('now', '-18 days')),
('Venta ANILLO Plata x3 - Cliente: Diego Morales', 2040.00, datetime('now', '-15 days'), 'venta', 'pago_movil', 'REF-008', datetime('now', '-15 days')),
('Venta COLLAR Oro Blanco x1 - Cliente VIP', 4200.00, datetime('now', '-12 days'), 'venta', 'transferencia', 'REF-009', datetime('now', '-12 days')),
('Venta DIJE Personalizado x1 - Cliente: Sofía Castro', 920.00, datetime('now', '-10 days'), 'venta', 'efectivo', NULL, datetime('now', '-10 days')),
('Venta CADENA Plata x2 - Cliente: Andrés Vargas', 1780.00, datetime('now', '-8 days'), 'venta', 'punto_venta', 'REF-010', datetime('now', '-8 days')),
('Venta PULSERA Platino x1 - Cliente VIP', 5200.00, datetime('now', '-6 days'), 'venta', 'zelle', 'REF-011', datetime('now', '-6 days')),
('Venta ARETES Plata x2 - Cliente: Valentina Ruiz', 1560.00, datetime('now', '-5 days'), 'venta', 'transferencia', 'REF-012', datetime('now', '-5 days')),
('Venta Múltiple - Cliente: Javier Fernández', 8500.00, datetime('now', '-3 days'), 'venta', 'transferencia', 'REF-013', datetime('now', '-3 days')),
('Venta RELICARIO Oro x1 - Cliente: Camila Gómez', 4100.00, datetime('now', '-2 days'), 'venta', 'pago_movil', 'REF-014', datetime('now', '-2 days')),
('Venta DIJE Plata x1 - Cliente: Leonardo Silva', 850.00, datetime('now', '-1 days'), 'venta', 'efectivo', NULL, datetime('now', '-1 days')),
('Venta CADENA Oro x1 - Cliente: Gabriela Mendoza', 3200.00, datetime('now'), 'venta', 'transferencia', 'REF-015', datetime('now'));

SELECT '✅ SEED COMPLETED SUCCESSFULLY';
SQLEND

        echo ""
        echo "=== VERIFICATION ==="
        sqlite3 cocolu.db "SELECT 'Users: ' || COUNT(*) FROM users;"
        sqlite3 cocolu.db "SELECT 'Sellers: ' || COUNT(*) FROM sellers;"
        sqlite3 cocolu.db "SELECT 'Clients: ' || COUNT(*) FROM clientes;"
        sqlite3 cocolu.db "SELECT 'Products: ' || COUNT(*) FROM productos;"
        sqlite3 cocolu.db "SELECT 'Sales: ' || COUNT(*) FROM ingresos_varios;"
        
        echo ""
        echo "=== SAMPLE DATA ==="
        echo "First 3 clients:"
        sqlite3 cocolu.db "SELECT nombre, telefono FROM clientes LIMIT 3;"
        
        echo ""
        echo "First 3 products:"
        sqlite3 cocolu.db "SELECT sku, nombre, precio FROM productos LIMIT 3;"
        
        echo ""
        echo "Latest 3 sales:"
        sqlite3 cocolu.db "SELECT descripcion, monto FROM ingresos_varios ORDER BY created_at DESC LIMIT 3;"
        
        echo ""
        echo "=== RESTARTING PM2 ==="
        cd /var/www/cocolu-chatbot
        pm2 restart cocolu-dashoffice
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Schema-matched seed complete");
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
