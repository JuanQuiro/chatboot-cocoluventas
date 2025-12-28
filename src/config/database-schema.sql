CREATE TABLE IF NOT EXISTS sellers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT,
    active INTEGER DEFAULT 1,
    status TEXT DEFAULT 'offline', -- online, offline, busy
    specialty TEXT DEFAULT 'general',
    max_clients INTEGER DEFAULT 50,
    current_clients INTEGER DEFAULT 0,
    rating REAL DEFAULT 5.0,
    work_schedule TEXT, -- JSON
    days_off TEXT, -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cedula TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    telefono TEXT,
    email TEXT,
    direccion TEXT,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clientes_cedula ON clientes(cedula);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);

CREATE TABLE IF NOT EXISTS categorias_producto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO categorias_producto (id, nombre, descripcion) 
VALUES (1, 'General', 'Categoría general para productos');

CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio_usd REAL NOT NULL DEFAULT 0,
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 0,
    stock_maximo INTEGER DEFAULT 1000,
    categoria_id INTEGER DEFAULT 1,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias_producto(id)
);

CREATE INDEX IF NOT EXISTS idx_productos_sku ON productos(sku);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);

CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER,
    cliente_cedula TEXT,
    cliente_nombre TEXT NOT NULL,
    cliente_apellido TEXT NOT NULL,
    cliente_telefono TEXT,
    cliente_email TEXT,
    cliente_direccion TEXT,
    
    subtotal_usd REAL NOT NULL DEFAULT 0,
    monto_descuento_usd REAL DEFAULT 0,
    monto_iva_usd REAL DEFAULT 0,
    monto_delivery_usd REAL DEFAULT 0,
    total_usd REAL NOT NULL DEFAULT 0,
    aplica_iva INTEGER DEFAULT 0,
    
    metodo_pago TEXT DEFAULT 'efectivo',
    referencia_pago TEXT,
    es_abono INTEGER DEFAULT 0,
    tipo_pago_abono TEXT,
    metodo_pago_abono TEXT,
    monto_abono_simple REAL DEFAULT 0,
    monto_abono_usd REAL DEFAULT 0,
    monto_abono_ves REAL DEFAULT 0,
    total_abono_usd REAL DEFAULT 0,
    fecha_vencimiento DATE,
    
    es_pago_mixto INTEGER DEFAULT 0,
    monto_mixto_usd REAL DEFAULT 0,
    monto_mixto_ves REAL DEFAULT 0,
    metodo_pago_mixto_usd TEXT,
    metodo_pago_mixto_ves TEXT,
    referencia_mixto_usd TEXT,
    referencia_mixto_ves TEXT,
    
    tasa_bcv REAL DEFAULT 36.50,
    estado_entrega TEXT DEFAULT 'pendiente',
    comentarios_generales TEXT,
    comentarios_descuento TEXT,
    
    vendedor_id INTEGER,
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_anulacion DATETIME,
    motivo_anulacion TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (vendedor_id) REFERENCES sellers(id)
);

CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado_entrega);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha_pedido);

CREATE TABLE IF NOT EXISTS detalles_pedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL,
    producto_id INTEGER,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario_usd REAL NOT NULL DEFAULT 0,
    nombre_producto TEXT NOT NULL,
    sku_producto TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE INDEX IF NOT EXISTS idx_detalles_pedido ON detalles_pedido(pedido_id);
CREATE INDEX IF NOT EXISTS idx_detalles_producto ON detalles_pedido(producto_id);

CREATE TABLE IF NOT EXISTS abonos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL,
    cliente_id INTEGER,
    monto_abono_usd REAL DEFAULT 0,
    monto_abono_ves REAL DEFAULT 0,
    tasa_bcv REAL DEFAULT 36.50,
    metodo_pago_abono TEXT NOT NULL,
    referencia_pago TEXT,
    tipo_abono TEXT DEFAULT 'simple',
    fecha_abono DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATE,
    estado_abono TEXT DEFAULT 'confirmado',
    comentarios TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE INDEX IF NOT EXISTS idx_abonos_pedido ON abonos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_abonos_cliente ON abonos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_abonos_fecha ON abonos(fecha_abono);

CREATE TABLE IF NOT EXISTS movimientos_stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    tipo_movimiento TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    stock_anterior INTEGER NOT NULL,
    stock_nuevo INTEGER NOT NULL,
    pedido_id INTEGER,
    comentario TEXT,
    fecha_movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

CREATE INDEX IF NOT EXISTS idx_movimientos_producto ON movimientos_stock(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos_stock(fecha_movimiento);

CREATE TABLE IF NOT EXISTS tasa_cambio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha DATE UNIQUE NOT NULL,
    tasa_bcv REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasa_fecha ON tasa_cambio(fecha);

INSERT OR IGNORE INTO tasa_cambio (fecha, tasa_bcv) 
VALUES (DATE('now'), 36.50);

CREATE TABLE IF NOT EXISTS metodos_pago (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL,
    tipo TEXT NOT NULL, -- 'usd', 'ves', 'mixto'
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO metodos_pago (nombre, tipo) VALUES
('Efectivo USD', 'usd'),
('Efectivo VES', 'ves'),
('Transferencia USD', 'usd'),
('Transferencia VES', 'ves'),
('Pago Móvil', 'ves'),
('Zelle', 'usd'),
('PayPal', 'usd'),
('Mixto', 'mixto');

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seller_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, -- Phone number or user ID
    seller_id INTEGER NOT NULL,
    status TEXT DEFAULT 'active', -- active, closed
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME,
    notes TEXT,
    FOREIGN KEY (seller_id) REFERENCES sellers(id)
);

CREATE INDEX IF NOT EXISTS idx_assignments_user ON seller_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_seller ON seller_assignments(seller_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON seller_assignments(status);

CREATE TABLE IF NOT EXISTS meta_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meta_config_key ON meta_config(key);

CREATE TABLE IF NOT EXISTS meta_config_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    value TEXT,
    changed_by TEXT DEFAULT 'admin',
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meta_config_history_key ON meta_config_history(key);
CREATE INDEX IF NOT EXISTS idx_meta_config_history_changed_at ON meta_config_history(changed_at);

CREATE TABLE IF NOT EXISTS ingresos_varios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descripcion TEXT NOT NULL,
    monto REAL NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    categoria TEXT,
    notas TEXT,
    metodo_pago TEXT DEFAULT 'efectivo',
    referencia TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

