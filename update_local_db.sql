-- Script para inicializar/actualizar base de datos local
-- Agregar columna instagram si no existe

-- Verificar y agregar columna instagram a clientes
ALTER TABLE clientes ADD COLUMN instagram TEXT;

-- Verificar que todas las tablas críticas existen
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
