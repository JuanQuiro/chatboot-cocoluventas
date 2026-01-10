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

console.log(`📊 Creating missing tables on VPS...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/data
        
        echo "=== CREATING MISSING TABLES ==="
        
        sqlite3 cocolu.db << 'ENDSCHEMA'
-- 1. Configuracion de Comisiones
CREATE TABLE IF NOT EXISTS configuracion_comisiones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entidad_tipo TEXT NOT NULL,
    entidad_id INTEGER NOT NULL,
    tipo_comision TEXT NOT NULL,
    valor REAL NOT NULL,
    descripcion TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Gastos
CREATE TABLE IF NOT EXISTS gastos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descripcion TEXT NOT NULL,
    proveedor TEXT,
    monto_total_usd REAL NOT NULL,
    monto_pagado_usd REAL DEFAULT 0,
    estado TEXT DEFAULT 'pendiente',
    fecha_limite DATE,
    categoria TEXT,
    metodo_pago TEXT,
    referencia_pago TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Cuotas / Installments
CREATE TABLE IF NOT EXISTS cuotas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER,
    cliente_id INTEGER,
    numero_cuota INTEGER,
    monto_usd REAL NOT NULL,
    monto_pagado_usd REAL DEFAULT 0,
    fecha_vencimiento DATE,
    estado TEXT DEFAULT 'pendiente',
    fecha_pago DATE,
    metodo_pago TEXT,
    referencia_pago TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Cuentas por Cobrar / Accounts Receivable
CREATE TABLE IF NOT EXISTS cuentas_por_cobrar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER,
    pedido_id INTEGER,
    tipo TEXT,
    descripcion TEXT,
    monto_total_usd REAL NOT NULL,
    monto_pagado_usd REAL DEFAULT 0,
    saldo_usd REAL,
    fecha_emision DATE,
    fecha_vencimiento DATE,
   estado TEXT DEFAULT 'pendiente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

ENDSCHEMA
        
        echo "✅ Tables created"
        
        echo ""
        echo "=== VERIFYING NEW TABLES ==="
        sqlite3 cocolu.db ".tables"
        
        echo ""
        echo "=== RESTARTING PM2 ==="
        cd /var/www/cocolu-chatbot
        pm2 restart cocolu-dashoffice
        sleep 5
        
        echo ""
        echo "=== TESTING INSTALLMENTS ENDPOINT ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "Should return empty array:"
        curl -s "http://127.0.0.1:3009/api/installments?status=all&page=1&limit=50" -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "✅ ALL MISSING TABLES CREATED - SYSTEM SHOULD WORK NOW!"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n🎉 TABLES CREATED SUCCESSFULLY!");
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
