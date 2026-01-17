-- COCOLU PRO - Script de Migración Completo
-- Ejecutar este script para habilitar todas las funcionalidades

-- =====================================================
-- 1. CREAR TABLA FABRICANTES
-- =====================================================
CREATE TABLE IF NOT EXISTS fabricantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    especialidad VARCHAR(50) DEFAULT 'general',
    tarifa_base DECIMAL(10,2) DEFAULT 0,
    capacidad_maxima INTEGER DEFAULT 10,
    tiempo_entrega_dias INTEGER DEFAULT 7,
    contacto_telefono VARCHAR(20),
    contacto_email VARCHAR(100),
    notas TEXT,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar fabricantes por defecto
INSERT OR IGNORE INTO fabricantes (id, nombre, especialidad, tarifa_base, capacidad_maxima) VALUES 
(1, 'Fabricante 1', 'general', 5.00, 10),
(2, 'Fabricante 2', 'sublimacion', 4.50, 15),
(3, 'Fabricante 3', 'bordado', 6.00, 8),
(4, 'Fabricante 4', 'serigrafia', 5.50, 12);

-- =====================================================
-- 2. AÑADIR COLUMNAS A TABLA PEDIDOS
-- =====================================================
-- Fecha de entrega
ALTER TABLE pedidos ADD COLUMN fecha_entrega DATE;

-- ID del fabricante asignado
ALTER TABLE pedidos ADD COLUMN fabricante_id INTEGER REFERENCES fabricantes(id);

-- =====================================================
-- 3. AÑADIR COLUMNA INSTAGRAM A CLIENTES
-- =====================================================
ALTER TABLE clientes ADD COLUMN instagram TEXT DEFAULT NULL;

-- =====================================================
-- 4. AÑADIR COLUMNA COSTO A PRODUCTOS (si no existe)
-- =====================================================
ALTER TABLE productos ADD COLUMN costo_usd REAL DEFAULT 0;

-- =====================================================
-- 5. AÑADIR COSTO A MOVIMIENTOS DE INVENTARIO
-- =====================================================
ALTER TABLE movimientos_stock ADD COLUMN costo_unitario REAL DEFAULT 0;
ALTER TABLE movimientos_stock ADD COLUMN costo_total REAL DEFAULT 0;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
SELECT 'Migraciones completadas exitosamente!' as status;
