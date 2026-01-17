-- Semilla de Datos de Prueba para Sistema de Variantes
-- Eliminar datos previos de variantes para evitar duplicados en pruebas (limpieza)
DELETE FROM productos_variantes;
DELETE FROM productos_base;
DELETE FROM fabricantes;

-- 1. Insertar Fabricantes (para asignación opcional)
INSERT INTO fabricantes (nombre, especialidad, carga_actual, estado) VALUES 
('Taller Maestro Joyero', 'Anillos y Engastes', 'BAJA', 'activo'),
('Fabrica Local Centro', 'Cadenas y Pulseras', 'MEDIA', 'activo'),
('Importadora Global', 'Joyería Fantasía', 'ALTA', 'activo');

-- 2. Insertar Productos Base
-- ID explícitos para relacionar fácilmente
INSERT INTO productos_base (id, nombre, descripcion, categoria_id, sku_base, created_at) VALUES 
(1, 'Anillo Solitario Clásico', 'Anillo de compromiso estilo solitario con piedra central', 1, 'BAS-ANI-001', CURRENT_TIMESTAMP),
(2, 'Pulsera Infinito', 'Pulsera con dije de infinito, ajustable', 2, 'BAS-PUL-001', CURRENT_TIMESTAMP),
(3, 'Collar Corazón', 'Collar delicado con dije de corazón minimalista', 3, 'BAS-COL-001', CURRENT_TIMESTAMP);

-- 3. Insertar Variantes (Realistas)

-- Variantes para Anillo Solitario (ID Base: 1)
-- Opción Económica (China)
INSERT INTO productos_variantes (
    producto_base_id, proveedor_id, sku_variante, nombre_variante,
    nivel_calidad, material, acabado, peso_gramos,
    precio_compra_usd, precio_venta_usd, stock_actual,
    tiempo_entrega_promedio_dias, garantia_meses, notas
) VALUES (
    1, (SELECT id FROM proveedores WHERE pais = 'CN' LIMIT 1), 'ANI-001-STD', 'Anillo Solitario (Acero/Zircón)',
    'standard', 'Acero Inoxidable', 'Pulido Brillante', 4.5,
    2.50, 12.00, 50,
    15, 1, 'Ideal para joyería de fantasía duradera'
);

-- Opción Premium (Italia)
INSERT INTO productos_variantes (
    producto_base_id, proveedor_id, sku_variante, nombre_variante,
    nivel_calidad, material, acabado, peso_gramos,
    precio_compra_usd, precio_venta_usd, stock_actual,
    tiempo_entrega_promedio_dias, garantia_meses, notas
) VALUES (
    1, (SELECT id FROM proveedores WHERE pais = 'IT' LIMIT 1), 'ANI-001-PRM', 'Anillo Solitario (Plata 925/Swarovski)',
    'premium', 'Plata Ley 925', 'Bañado en Rodio', 3.8,
    18.00, 45.00, 15,
    7, 6, 'Incluye certificado de autenticidad de la plata'
);

-- Opción Luxury (Local/Artesanal - Ejemplo de Alta Gama)
INSERT INTO productos_variantes (
    producto_base_id, proveedor_id, sku_variante, nombre_variante,
    nivel_calidad, material, acabado, peso_gramos,
    precio_compra_usd, precio_venta_usd, stock_actual,
    tiempo_entrega_promedio_dias, garantia_meses, notas
) VALUES (
    1, (SELECT id FROM proveedores WHERE tipo = 'fabricante_local' LIMIT 1), 'ANI-001-LUX', 'Anillo Solitario (Oro 18k/Diamante)',
    'luxury', 'Oro 18k', 'Pulido Espejo', 4.2,
    120.00, 350.00, 3,
    3, 24, 'Pieza única con diamante certificado 0.10ct'
);


-- Variantes para Pulsera Infinito (ID Base: 2)
INSERT INTO productos_variantes (
    producto_base_id, proveedor_id, sku_variante, nombre_variante,
    nivel_calidad, material, acabado, peso_gramos,
    precio_compra_usd, precio_venta_usd, stock_actual,
    tiempo_entrega_promedio_dias, garantia_meses
) VALUES 
(
    2, (SELECT id FROM proveedores WHERE pais = 'CN' LIMIT 1), 'PUL-001-STD', 'Pulsera Infinito (Hilo Rojo/Aleación)',
    'standard', 'Hilo Textil + Aleación', 'Mate', 2.0,
    0.50, 5.00, 200,
    15, 0
),
(
    2, (SELECT id FROM proveedores WHERE pais = 'IT' LIMIT 1), 'PUL-001-PRM', 'Pulsera Infinito (Plata 925)',
    'premium', 'Plata Ley 925', 'Rodinado', 5.5,
    12.00, 35.00, 25,
    7, 12
);
