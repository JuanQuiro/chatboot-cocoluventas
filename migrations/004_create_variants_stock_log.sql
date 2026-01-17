-- MIGRATION: 004_create_variants_stock_log.sql
-- DATE: 2026-01-12
-- PURPOSE: Create dedicated stock movement log for variants to avoid FK issues with legacy products

CREATE TABLE IF NOT EXISTS movimientos_stock_variantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    variante_id INTEGER NOT NULL,
    tipo_movimiento TEXT NOT NULL, -- 'venta', 'compra', 'ajuste', 'anulacion'
    cantidad INTEGER NOT NULL,
    stock_anterior INTEGER NOT NULL,
    stock_nuevo INTEGER NOT NULL,
    pedido_id INTEGER, -- Puede ser NULL si es un ajuste manual
    comentario TEXT,
    fecha_movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (variante_id) REFERENCES productos_variantes(id),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

CREATE INDEX IF NOT EXISTS idx_movimientos_variantes_id ON movimientos_stock_variantes(variante_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_variantes_fecha ON movimientos_stock_variantes(fecha_movimiento);
