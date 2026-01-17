-- MIGRATION: 008_logistics_upgrade.sql
-- DATE: 2026-01-12
-- PURPOSE: Implement Multi-Origin Stock, Logistics, and Rich Order Attributes

-- 1. Locations (Orígenes de Stock)
-- Defines where stock can physically exist and how long it takes to arrive.
CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,          -- 'Tienda Local', 'Bodega India', 'Fabrica China'
    code TEXT NOT NULL UNIQUE,          -- 'LOCAL', 'IN', 'CN'
    lead_time_days INTEGER DEFAULT 0,   -- 0 for Local, 7 for India, 14 for China
    is_active BOOLEAN DEFAULT 1
);

-- Seed Default Locations
INSERT OR IGNORE INTO locations (name, code, lead_time_days) VALUES ('Tienda Local', 'LOCAL', 0);
INSERT OR IGNORE INTO locations (name, code, lead_time_days) VALUES ('Bodega India', 'IN', 7);
INSERT OR IGNORE INTO locations (name, code, lead_time_days) VALUES ('Fabrica China', 'CN', 15);

-- 2. Multi-Origin Stock (Stock Desglosado)
-- Replaces/Augments the simple 'stock_actual' column.
-- A single variant can exist in multiple places.
CREATE TABLE IF NOT EXISTS variant_stock_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    variante_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variante_id) REFERENCES productos_variantes(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_variant_location ON variant_stock_locations(variante_id, location_id);

-- 3. Enhance Orders for Logistics
-- Add columns to track priority, estimated delivery, and assignment source.
ALTER TABLE pedidos ADD COLUMN prioridad TEXT DEFAULT 'normal'; -- 'normal', 'urgente', 'express'
ALTER TABLE pedidos ADD COLUMN fecha_entrega_estimada DATE;
ALTER TABLE pedidos ADD COLUMN assignment_source_manufacturer TEXT DEFAULT 'manual'; -- 'auto', 'manual'
ALTER TABLE pedidos ADD COLUMN assignment_source_seller TEXT DEFAULT 'manual';      -- 'auto', 'manual'

-- 4. Trigger to synchronize 'stock_actual' (Total) with locations?
-- OPTIONAL: For backward compatibility, we could sum(quantity) -> stock_actual.
-- For now, we will manage this via Service Logic to ensure consistency.

-- 5. Rich Variant Details (Extras)
ALTER TABLE productos_variantes ADD COLUMN detalles_extra_json TEXT; -- JSON for { "box": true, "certificate": true }
