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

console.log(`Creating COMPLETE Database Seed on ${config.host}...`);
console.log("This will populate ALL tables with test data.\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/data
        
        sqlite3 cocolu.db << 'SEEDEND'
-- ======================================
-- COMPLETE DATABASE SEED
-- ======================================

-- SELLERS (name, email required)
INSERT INTO sellers (name, email, phone, active, status, specialty, rating) VALUES
('Roberto Chávez', 'roberto@cocolu.com', '04241234567', 1, 'online', 'joyas_oro', 4.8),
('Luisa Fernández', 'luisa@cocolu.com', '04142345678', 1, 'online', 'joyas_plata', 4.9),
('Miguel Torres', 'miguel@cocolu.com', '04263456789', 1, 'offline', 'general', 4.5),
('Carmen Rodríguez', 'carmen@cocolu.com', '04124567890', 1, 'busy', 'joyas_premium', 5.0),
('Diego Morales', 'diego@cocolu.com', '04145678901', 0, 'offline', 'general', 4.2);

-- CLIENTS (cedula, nombre, apellido required)
INSERT INTO clientes (cedula, nombre, apellido, telefono, email, direccion, activo) VALUES
('V-12345678', 'María', 'González', '04241001001', 'maria.g@email.com', 'Av. Principal #1, Caracas', 1),
('V-23456789', 'José', 'Pérez', '04241001002', 'jose.p@email.com', 'Calle 5, Valencia', 1),
('V-34567890', 'Ana', 'Martínez', '04241001003', 'ana.m@email.com', 'Urb. Los Pinos, Maracay', 1),
('V-45678901', 'Carlos', 'López', '04241001004', NULL, NULL, 1),
('V-56789012', 'Laura', 'Rodríguez', '04241001005', 'laura.r@email.com', 'Av. Bolívar, Caracas', 1),
('V-67890123', 'Pedro', 'Sánchez', '04241001006', NULL, 'Sector Centro', 1),
('V-78901234', 'Carmen', 'Díaz', '04241001007', 'carmen.d@email.com', 'Residencias Premium', 1),
('V-89012345', 'Miguel', 'Torres', '04241001008', NULL, NULL, 1),
('V-90123456', 'Isabel', 'Ramírez', '04241001009', 'isabel.r@email.com', 'Calle Principal #5', 1),
('V-01234567', 'Diego', 'Morales', '04241001010', NULL, NULL, 1),
('V-11223344', 'Sofía', 'Castro', '04241001011', 'sofia.c@email.com', 'Urb. La Florida', 1),
('V-22334455', 'Andrés', 'Vargas', '04241001012', 'andres.v@email.com', 'Av. Libertador #99', 1),
('V-33445566', 'Valentina', 'Ruiz', '04241001013', NULL, NULL, 1),
('V-44556677', 'Javier', 'Fernández', '04241001014', 'javier.f@email.com', 'Calle 10, Valencia', 1),
('V-55667788', 'Camila', 'Gómez', '04241001015', 'camila.g@email.com', 'Torre Empresarial', 1),
('V-66778899', 'Leonardo', 'Silva', '04241001016', NULL, NULL, 1),
('V-77889900', 'Gabriela', 'Mendoza', '04241001017', 'gaby.m@email.com', 'Sector Norte', 1),
('V-88990011', 'Ricardo', 'Herrera', '04241001018', NULL, 'Av. Principal #200', 1),
('V-99001122', 'VIP', 'Premium', '04241001019', 'vip@email.com', 'Penthouse Centro', 1),
('V-10111213', 'Cliente', 'Nuevo', '04241001020', NULL, NULL, 1);

-- PRODUCTS (nombre, precio_usd required)
INSERT INTO productos (sku, nombre, descripcion, precio_usd, stock_actual, stock_minimo, categoria_id, activo) VALUES
('P-0001', 'RELICARIO Oro 18k Premium', 'Relicario de oro 18k con detalles grabados', 4500.00, 5, 2, 1, 1),
('P-0002', 'DIJE Plata 925 Corazón', 'Dije en forma de corazón, plata de ley', 850.00, 12, 5, 1, 1),
('P-0003', 'CADENA Oro Blanco 18k', 'Cadena tipo cubana de oro blanco', 3200.00, 8, 3, 1, 1),
('P-0004', 'PULSERA Acero Inoxidable', 'Pulsera moderna acero quirúrgico', 650.00, 20, 10, 1, 1),
('P-0005', 'ANILLO Platino Premium', 'Anillo solitario platino con circonita', 5500.00, 3, 1, 1, 1),
('P-0006', 'ARETES Oro 18k Circulares', 'Aretes tipo argolla oro 18k', 2800.00, 15, 5, 1, 1),
('P-0007', 'COLLAR Plata 925 Premium', 'Collar cadena veneciana plata', 1200.00, 0, 3, 1, 1),
('P-0008', 'DIJE Oro Rosa Infinito', 'Dije símbolo infinito oro rosa', 1850.00, 10, 3, 1, 1),
('P-0009', 'RELICARIO Plata 925 Oval', 'Relicario ovalado grabable', 980.00, 18, 5, 1, 1),
('P-0010', 'CADENA Acero Premium', 'Cadena eslabones acero pulido', 720.00, 25, 10, 1, 1),
('P-0011', 'PULSERA Oro 18k Eslabones', 'Pulsera eslabones gruesos oro', 3500.00, 6, 2, 1, 1),
('P-0012', 'ANILLO Plata 925 Banda', 'Anillo banda lisa plata', 680.00, 22, 10, 1, 1),
('P-0013', 'ARETES Acero Studs', 'Aretes pequeños acero inoxidable', 450.00, 0, 5, 1, 1),
('P-0014', 'COLLAR Oro Blanco Cadena', 'Collar cadena fina oro blanco', 4200.00, 4, 2, 1, 1),
('P-0015', 'DIJE Plata Personalizado', 'Dije con grabado personalizable', 920.00, 14, 5, 1, 1),
('P-0016', 'RELICARIO Oro 18k Redondo', 'Relicario redondo oro 18k', 4100.00, 7, 2, 1, 1),
('P-0017', 'CADENA Plata 925 Fina', 'Cadena delgada elegante', 890.00, 19, 10, 1, 1),
('P-0018', 'PULSERA Platino Eslabones', 'Pulsera premium platino', 5200.00, 2, 1, 1, 1),
('P-0019', 'ANILLO Oro Rosa Solitario', 'Anillo solitario oro rosa', 3800.00, 0, 2, 1, 1),
('P-0020', 'ARETES Plata 925 Largos', 'Aretes colgantes plata', 780.00, 16, 8, 1, 1),
('P-0021', 'DIJE Oro 18k Cruz', 'Dije cruz oro macizo', 2200.00, 8, 3, 1, 1),
('P-0022', 'CADENA Oro 18k Gruesa', 'Cadena gruesa tipo cubana', 5800.00, 3, 1, 1, 1),
('P-0023', 'PULSERA Plata Dijes', 'Pulsera con 5 dijes incluidos', 1150.00, 11, 5, 1, 1),
('P-0024', 'ANILLO Acero Negro', 'Anillo acero negro mate', 380.00, 30, 15, 1, 1),
('P-0025', 'COLLAR Perlas Cultivadas', 'Collar perlas naturales', 3400.00, 5, 2, 1, 1);

SELECT '✅ COMPREHENSIVE SEED COMPLETE';
SEEDEND

        echo ""
        echo "=== FINAL STATISTICS ==="
        sqlite3 cocolu.db "SELECT 'Users: ' || COUNT(*) FROM users;"
        sqlite3 cocolu.db "SELECT 'Sellers: ' || COUNT(*) FROM sellers;"
        sqlite3 cocolu.db "SELECT 'Clients: ' || COUNT(*) FROM clientes;"
        sqlite3 cocolu.db "SELECT 'Products: ' || COUNT(*) FROM productos;"
        sqlite3 cocolu.db "SELECT 'Sales: ' || COUNT(*) FROM ingresos_varios;"
        
        echo ""
        echo "=== SAMPLE DATA PREVIEW ==="
        echo "First 3 Sellers:"
        sqlite3 cocolu.db "SELECT name, email, status FROM sellers LIMIT 3;"
        
        echo ""
        echo "First 3 Clients:"
        sqlite3 cocolu.db "SELECT CONCAT(nombre, ' ', apellido) as full_name, telefono FROM clientes LIMIT 3;"
        
        echo ""
        echo "First 3 Products:"
        sqlite3 cocolu.db "SELECT sku, nombre, precio_usd, stock_actual FROM productos LIMIT 3;"
        
        echo ""
        echo "=== RESTARTING BACKEND ==="
        cd /var/www/cocolu-chatbot
        pm2 restart cocolu-dashoffice --update-env
        sleep 3
        
        echo ""
        echo "=== TESTING API ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        
        echo "API /api/clients:"
        curl -s http://127.0.0.1:3009/api/clients -H "Authorization: Bearer \$TOKEN" | head -c 200
        
        echo ""
        echo ""
        echo "API /api/products:"
        curl -s http://127.0.0.1:3009/api/products -H "Authorization: Bearer \$TOKEN" | head -c 200
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n\n🎉 ¡SEED COMPLETO EXITOSO!");
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
