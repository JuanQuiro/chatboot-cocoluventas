
import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'data', 'cocolu.db');
const db = new Database(dbPath);

console.log(`\n🚀 Starting Migration V2: Cocolu Pro Schema Upgrade`);
console.log(`📂 Database: ${dbPath}\n`);

const run = (label, sql) => {
    try {
        console.log(`Running: ${label}`);
        db.exec(sql);
        console.log(`✅ Success`);
    } catch (e) {
        if (e.message.includes('duplicate column')) {
            console.log(`⚠️ Skipped (Column already exists): ${e.message}`);
        } else if (e.message.includes('already exists')) {
            console.log(`⚠️ Skipped (Table already exists): ${e.message}`);
        } else {
            console.error(`❌ Error in ${label}:`, e.message);
        }
    }
};

// 1. Update Pedidos Table
run('Add manufacturer_id to orders', 'ALTER TABLE pedidos ADD COLUMN fabricante_id INTEGER');
run('Add delivery_date to orders', 'ALTER TABLE pedidos ADD COLUMN fecha_entrega DATE');
run('Add commission_amount to orders', 'ALTER TABLE pedidos ADD COLUMN monto_comision REAL DEFAULT 0');

// 2. Update Movimientos Stock Table
run('Add unit_cost to inventory', 'ALTER TABLE movimientos_stock ADD COLUMN costo_unitario REAL DEFAULT 0');
run('Add total_cost to inventory', 'ALTER TABLE movimientos_stock ADD COLUMN costo_total REAL DEFAULT 0');

// 3. Update Abonos (Payments) Table
run('Add currency_breakdown to payments', 'ALTER TABLE abonos ADD COLUMN desglose_moneda TEXT');
// tasa_bcv already exists in abonos

// 4. Update Ingresos Varios
run('Add exchange_rate to misc_income', 'ALTER TABLE ingresos_varios ADD COLUMN tasa_cambio REAL DEFAULT 0');
run('Add usd_amount to misc_income', 'ALTER TABLE ingresos_varios ADD COLUMN monto_usd REAL DEFAULT 0');
run('Add breakdown to misc_income', 'ALTER TABLE ingresos_varios ADD COLUMN desglose_moneda TEXT');

// 5. Create Fabricantes (Manufacturers) Table
run('Create manufacturers table', `
    CREATE TABLE IF NOT EXISTS fabricantes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        especialidad TEXT DEFAULT 'general',
        activo INTEGER DEFAULT 1,
        carga_actual INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// 6. Create Commission Config Table
run('Create commissions table', `
    CREATE TABLE IF NOT EXISTS configuracion_comisiones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entidad_tipo TEXT NOT NULL, -- 'vendedor' or 'fabricante'
        entidad_id INTEGER NOT NULL,
        tipo_comision TEXT NOT NULL, -- 'porcentaje' or 'fijo'
        valor REAL NOT NULL,
        descripcion TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// 7. Create Gastos (Expenses/Debts) Table
run('Create expenses table', `
    CREATE TABLE IF NOT EXISTS gastos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descripcion TEXT NOT NULL,
        proveedor TEXT,
        monto_total_usd REAL NOT NULL,
        monto_pagado_usd REAL DEFAULT 0,
        estado TEXT DEFAULT 'pendiente', -- 'pendiente', 'pagado_parcial', 'pagado'
        fecha_limite DATE,
        categoria TEXT,
        metodo_pago TEXT,
        referencia_pago TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Seed Manufacturers if empty
const manufacturers = db.prepare('SELECT count(*) as count FROM fabricantes').get();
if (manufacturers.count === 0) {
    console.log('🌱 Seeding initial manufacturers (1-4)...');
    const stmt = db.prepare('INSERT INTO fabricantes (nombre) VALUES (?)');
    stmt.run('Fabricante 1');
    stmt.run('Fabricante 2');
    stmt.run('Fabricante 3');
    stmt.run('Fabricante 4');
    console.log('✅ Seeded 4 manufacturers');
}

console.log('\n✨ Migration Complete!');
db.close();
