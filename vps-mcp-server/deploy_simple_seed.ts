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

console.log(`Creating Final Working Seed on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/data
        
        # First, get exact column names
        echo "=== DISCOVERING EXACT COLUMNS ==="
        sqlite3 cocolu.db "PRAGMA table_info(sellers);" | head -20
        echo ""
        sqlite3 cocolu.db "PRAGMA table_info(clientes);" | head -20
        echo ""
        sqlite3 cocolu.db "PRAGMA table_info(productos);" | head -20
        
        # Insert basic data that we KNOW will work
        echo ""
        echo "=== INSERTING CLIENTS (simple version) ==="
        sqlite3 cocolu.db "INSERT INTO clientes (nombre, telefono) VALUES ('María González', '04241001001');"
        sqlite3 cocolu.db "INSERT INTO clientes (nombre, telefono) VALUES ('José Pérez', '04241001002');"
        sqlite3 cocolu.db "INSERT INTO clientes (nombre, telefono) VALUES ('Ana Martínez', '04241001003');"
        sqlite3 cocolu.db "INSERT INTO clientes (nombre, telefono) VALUES ('Carlos López', '04241001004');"
        sqlite3 cocolu.db "INSERT INTO clientes (nombre, telefono) VALUES ('Laura Rodríguez', '04241001005');"
        sqlite3 cocolu.db "INSERT INTO clientes (nombre, telefono) VALUES ('Pedro Sánchez', '04241001006');"
        sqlite3 cocolu.db "INSERT INTO clientes (nombre, telefono) VALUES ('Carmen Díaz', '04241001007');"
        sqlite3 cocolu.db "INSERT INTO clientes (nombre, telefono) VALUES ('Miguel Torres', '04241001008');"
        sqlite3 cocolu.db "INSERT INTO clientes (nombre, telefono) VALUES ('Isabel Ramírez', '04241001009');"
        sqlite3 cocolu.db "INSERT INTO clientes (nombre, telefono) VALUES ('Cliente VIP', '04241001010');"
        
        echo "✅ Clients inserted"
        
        echo ""
        echo "=== INSERTING PRODUCTS (simple version) ==="
        sqlite3 cocolu.db "INSERT INTO productos (codigo, nombre, precio, stock) VALUES ('P-001', 'RELICARIO Oro 18k', 4500.00, 5);"
        sqlite3 cocolu.db "INSERT INTO productos (codigo, nombre, precio, stock) VALUES ('P-002', 'DIJE Plata 925', 850.00, 12);"
        sqlite3 cocolu.db "INSERT INTO productos (codigo, nombre, precio, stock) VALUES ('P-003', 'CADENA Oro Blanco', 3200.00, 8);"
        sqlite3 cocolu.db "INSERT INTO productos (codigo, nombre, precio, stock) VALUES ('P-004', 'PULSERA Acero', 650.00, 20);"
        sqlite3 cocolu.db "INSERT INTO productos (codigo, nombre, precio, stock) VALUES ('P-005', 'ANILLO Platino', 5500.00, 3);"
        sqlite3 cocolu.db "INSERT INTO productos (codigo, nombre, precio, stock) VALUES ('P-006', 'ARETES Oro 18k', 2800.00, 15);"
        sqlite3 cocolu.db "INSERT INTO productos (codigo, nombre, precio, stock) VALUES ('P-007', 'COLLAR Plata 925', 1200.00, 0);"
        sqlite3 cocolu.db "INSERT INTO productos (codigo, nombre, precio, stock) VALUES ('P-008', 'DIJE Oro Rosa', 1850.00, 10);"
        sqlite3 cocolu.db "INSERT INTO productos (codigo, nombre, precio, stock) VALUES ('P-009', 'RELICARIO Plata', 980.00, 18);"
        sqlite3 cocolu.db "INSERT INTO productos (codigo, nombre, precio, stock) VALUES ('P-010', 'CADENA Acero', 720.00, 25);"
        
        echo "✅ Products inserted"
        
        echo ""
        echo "=== FINAL VERIFICATION ==="
        sqlite3 cocolu.db "SELECT 'Users: ' || COUNT(*) FROM users;"
        sqlite3 cocolu.db "SELECT 'Clients: ' || COUNT(*) FROM clientes;"
        sqlite3 cocolu.db "SELECT 'Products: ' || COUNT(*) FROM productos;"
        sqlite3 cocolu.db "SELECT 'Sales: ' || COUNT(*) FROM ingresos_varios;"
        
        echo ""
        echo "=== RESTART PM2 ==="
        cd /var/www/cocolu-chatbot
        pm2 restart cocolu-dashoffice
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Final seed complete");
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
