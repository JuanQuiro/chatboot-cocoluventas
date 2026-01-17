-- MIGRATION: 006_deep_hardening.sql
-- DATE: 2026-01-12
-- PURPOSE: Advanced indexing, Structural Integrity (FKs), and Financial Automations

-- 1. Performance: Indexing for Variants
CREATE INDEX IF NOT EXISTS idx_productos_variantes_sku ON productos_variantes(sku_variante);
CREATE INDEX IF NOT EXISTS idx_productos_variantes_base ON productos_variantes(producto_base_id);

-- 2. Structural Integrity: Add variante_id to Sales Details
-- We use ALTER TABLE to add the column. 
-- Note: SQLite does not support adding FK constraints via ALTER TABLE easily in older versions, 
-- but we can add the column and use it for logic. Truly enforcing FK might require table recreation,
-- which is risky. We will add the column for now to enable the logic.
ALTER TABLE detalles_pedido ADD COLUMN variante_id INTEGER REFERENCES productos_variantes(id);

-- 3. Financial Integrity: Auto-calculate Total Paid (Eliminate Drift)
-- Trigger to update 'total_abono_usd' on pedidos whenever an abono is added/changed/deleted.

CREATE TRIGGER IF NOT EXISTS calc_paid_insert AFTER INSERT ON abonos
BEGIN
    UPDATE pedidos 
    SET total_abono_usd = (
        SELECT COALESCE(SUM(monto_abono_usd), 0)
        FROM abonos 
        WHERE pedido_id = NEW.pedido_id AND estado_abono = 'confirmado'
    )
    WHERE id = NEW.pedido_id;
END;

CREATE TRIGGER IF NOT EXISTS calc_paid_update AFTER UPDATE ON abonos
BEGIN
    UPDATE pedidos 
    SET total_abono_usd = (
        SELECT COALESCE(SUM(monto_abono_usd), 0)
        FROM abonos 
        WHERE pedido_id = NEW.pedido_id AND estado_abono = 'confirmado'
    )
    WHERE id = NEW.pedido_id;
    
    -- Handle case where order ID might change (rare, but good for completeness)
    UPDATE pedidos 
    SET total_abono_usd = (
        SELECT COALESCE(SUM(monto_abono_usd), 0)
        FROM abonos 
        WHERE pedido_id = OLD.pedido_id AND estado_abono = 'confirmado'
    )
    WHERE id = OLD.pedido_id AND OLD.pedido_id != NEW.pedido_id;
END;

CREATE TRIGGER IF NOT EXISTS calc_paid_delete AFTER DELETE ON abonos
BEGIN
    UPDATE pedidos 
    SET total_abono_usd = (
        SELECT COALESCE(SUM(monto_abono_usd), 0)
        FROM abonos 
        WHERE pedido_id = OLD.pedido_id AND estado_abono = 'confirmado'
    )
    WHERE id = OLD.pedido_id;
END;
