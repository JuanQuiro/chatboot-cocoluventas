-- MIGRATION: 001_create_variants_system.sql
-- DATE: 2026-01-12
-- PURPOSE: Implement architecture for product quality variants by provider

-- 1. Tabla de Productos Base (Concepto General)
CREATE TABLE IF NOT EXISTS productos_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion_general TEXT,
    categoria_id INTEGER,
    sku_base TEXT UNIQUE,
    producto_legacy_id INTEGER, -- Para vincular con la tabla antigua si es necesario
    activo BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Proveedores (Orígenes de Calidad)
CREATE TABLE IF NOT EXISTS proveedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,              -- Ej: "Proveedor Guangzhou", "Artesanos India"
    pais TEXT NOT NULL,                -- Código país: "CN", "IN", "IT", "VE"
    nivel_calidad_default TEXT,        -- "estandar", "premium", "luxury"
    tiempo_entrega_promedio_dias INTEGER,
    ubicacion_fisica_default TEXT,     -- "Bodega China", "Tienda Local"
    activo BOOLEAN DEFAULT 1,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Variantes de Producto (La "ficha" real de venta)
CREATE TABLE IF NOT EXISTS productos_variantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_base_id INTEGER NOT NULL,
    proveedor_id INTEGER NOT NULL,
    
    -- Identificación
    sku_variante TEXT UNIQUE,          -- SKU específico Ej: "ANILLO-CN-STD"
    nombre_variante TEXT,              -- Nombre amigable Ej: "Anillo Estrella (Calidad Estándar)"
    
    -- Especificaciones Técnicas (Información precisa)
    material TEXT,                     -- Ej: "Plata 925"
    peso_gramos REAL,
    dimensiones TEXT,
    acabado TEXT,                      -- Ej: "Pulido a mano"
    pureza_metal TEXT,                 -- Ej: "925", "950"
    
    -- Calidad y Garantía
    nivel_calidad TEXT NOT NULL,       -- "estandar", "premium", "luxury"
    garantia_meses INTEGER DEFAULT 0,
    certificado_tipo TEXT,             -- NULL si no tiene
    
    -- Gestión de Inventario y Precios
    costo_usd REAL DEFAULT 0,
    precio_venta_usd REAL NOT NULL,
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 0,
    ubicacion_actual TEXT,             -- Dónde está físicamente AHORA
    
    -- Estado
    disponible BOOLEAN DEFAULT 1,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producto_base_id) REFERENCES productos_base(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
    UNIQUE(producto_base_id, proveedor_id)
);

-- Indices para optimizar búsqueda
CREATE INDEX IF NOT EXISTS idx_productos_base_nombre ON productos_base(nombre);
CREATE INDEX IF NOT EXISTS idx_productos_variantes_sku ON productos_variantes(sku_variante);
CREATE INDEX IF NOT EXISTS idx_productos_variantes_calidad ON productos_variantes(nivel_calidad);
CREATE INDEX IF NOT EXISTS idx_variantes_producto_base ON productos_variantes(producto_base_id);
