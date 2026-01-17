-- MIGRATION: 009_traceability.sql
-- DATE: 2026-01-12
-- PURPOSE: Add Traceability (Batch Number) to sold items

-- Add Batch/Lot Number to Order Details
-- This allows tracking exactly which batch a specific sold item came from.
ALTER TABLE detalles_pedido ADD COLUMN lote_asignado TEXT; 

-- Optional: Add 'origen_logistico' to track if it came from CN/IN/LOCAL
ALTER TABLE detalles_pedido ADD COLUMN origen_logistico TEXT; -- 'LOCAL', 'CN', 'IN'
