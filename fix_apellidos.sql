-- ============================================
-- FIX #2: APELLIDO NULL MIGRATION
-- Actualiza todos los apellidos NULL o vacíos
-- ============================================

-- Paso 1: Verificar cuántos clientes tienen apellido NULL o vacío
SELECT 
    COUNT(*) as total_null_apellido,
    (SELECT COUNT(*) FROM clientes) as total_clientes
FROM clientes 
WHERE apellido IS NULL OR apellido = '';

-- Paso 2: Ver ejemplos de clientes afectados
SELECT id, nombre, apellido, cedula 
FROM clientes 
WHERE apellido IS NULL OR apellido = ''
LIMIT 10;

-- Paso 3: Actualizar apellidos NULL o vacíos a '.'
UPDATE clientes 
SET apellido = '.' 
WHERE apellido IS NULL OR apellido = '';

-- Paso 4: Verificar que no queden NULL
SELECT COUNT(*) as should_be_zero 
FROM clientes 
WHERE apellido IS NULL OR apellido = '';

-- Paso 5: Ver clientes actualizados
SELECT id, nombre, apellido, cedula 
FROM clientes 
WHERE apellido = '.'
LIMIT 10;
