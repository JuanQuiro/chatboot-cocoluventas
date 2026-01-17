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

console.log("🔧 FASE 1: ACTUALIZANDO ESQUEMA DE BASE DE DATOS...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db << 'EOF'
-- 1. AGREGAR APELLIDO A CLIENTES (si no existe)
ALTER TABLE clientes ADD COLUMN apellido TEXT;

-- 2. CREAR TABLA TASAS DE CAMBIO
CREATE TABLE IF NOT EXISTS tasas_cambio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tasa_oficial REAL NOT NULL,
    tasa_paralelo REAL NOT NULL,
    fecha DATE DEFAULT (date('now')),
    activa BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar tasa inicial (ajustar según valor real)
INSERT INTO tasas_cambio (tasa_oficial, tasa_paralelo, activa) 
VALUES (50.00, 52.00, 1);

-- 3. CREAR/MODIFICAR TABLA PAGOS PARA MULTIMONEDA
CREATE TABLE IF NOT EXISTS pagos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venta_id INTEGER NOT NULL,
    monto REAL NOT NULL,
    moneda TEXT NOT NULL CHECK(moneda IN ('USD', 'BS')),
    monto_usd REAL NOT NULL,
    tasa_cambio REAL,
    metodo TEXT NOT NULL,
    tipo TEXT DEFAULT 'pago',
    nota TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venta_id) REFERENCES ventas(id)
);

-- 4. AGREGAR CAMPOS CALCULADOS A VENTAS (si no existen)
ALTER TABLE ventas ADD COLUMN subtotal REAL DEFAULT 0;
ALTER TABLE ventas ADD COLUMN descuento_porcentaje REAL DEFAULT 0;
ALTER TABLE ventas ADD COLUMN descuento_monto REAL DEFAULT 0;
ALTER TABLE ventas ADD COLUMN iva_monto REAL DEFAULT 0;
ALTER TABLE ventas ADD COLUMN delivery_monto REAL DEFAULT 0;
ALTER TABLE ventas ADD COLUMN saldo_pendiente REAL DEFAULT 0;

-- 5. CREAR ÍNDICES PARA RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_clientes_nombre_apellido ON clientes(nombre, apellido);
CREATE INDEX IF NOT EXISTS idx_tasas_fecha ON tasas_cambio(fecha);
CREATE INDEX IF NOT EXISTS idx_tasas_activa ON tasas_cambio(activa);
CREATE INDEX IF NOT EXISTS idx_pagos_venta ON pagos(venta_id);

-- Verificar cambios
.schema clientes
.schema tasas_cambio
.schema pagos
.schema ventas

SELECT 'TABLAS ACTUALIZADAS CORRECTAMENTE' as status;
EOF

echo ""
echo "========================================="
echo "✅ ESQUEMA DE BASE DE DATOS ACTUALIZADO"
echo "========================================="
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
