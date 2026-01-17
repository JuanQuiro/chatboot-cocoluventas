-- MIGRATION: 005_strict_constraints.sql
-- DATE: 2026-01-12
-- PURPOSE: Enforce rigid business rules at the database level

-- 1. Prevent Negative Stock in Variants
-- verify if constraints exist first or just alter table? SQLite limits ALTER TABLE.
-- in SQLite we often have to recreate the table to add constraints, OR we can add triggers.
-- Triggers are safer for migrations on existing tables.

CREATE TRIGGER IF NOT EXISTS prevent_negative_stock_variants_insert
BEFORE INSERT ON productos_variantes
FOR EACH ROW
WHEN NEW.stock_actual < 0
BEGIN
    SELECT RAISE(ABORT, 'Constraint Violation: Stock cannot be negative');
END;

CREATE TRIGGER IF NOT EXISTS prevent_negative_stock_variants_update
BEFORE UPDATE ON productos_variantes
FOR EACH ROW
WHEN NEW.stock_actual < 0
BEGIN
    SELECT RAISE(ABORT, 'Constraint Violation: Stock cannot be negative');
END;

-- 2. Prevent Selling Below Cost (Profit Protection) for Variants
CREATE TRIGGER IF NOT EXISTS prevent_loss_pricing_variants_insert
BEFORE INSERT ON productos_variantes
FOR EACH ROW
WHEN NEW.precio_venta_usd < NEW.costo_usd
BEGIN
    SELECT RAISE(ABORT, 'Constraint Violation: Selling price cannot be lower than cost');
END;

CREATE TRIGGER IF NOT EXISTS prevent_loss_pricing_variants_update
BEFORE UPDATE ON productos_variantes
FOR EACH ROW
WHEN NEW.precio_venta_usd < NEW.costo_usd
BEGIN
    SELECT RAISE(ABORT, 'Constraint Violation: Selling price cannot be lower than cost');
END;

-- 3. Prevent Negative Stock in Legacy Products
CREATE TRIGGER IF NOT EXISTS prevent_negative_stock_legacy_update
BEFORE UPDATE ON productos
FOR EACH ROW
WHEN NEW.stock_actual < 0
BEGIN
    SELECT RAISE(ABORT, 'Constraint Violation: Legacy Product Stock cannot be negative');
END;
