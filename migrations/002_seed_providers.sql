-- SEED: 002_seed_providers.sql
-- DATE: 2026-01-12
-- PURPOSE: Insert initial provider data

DELETE FROM proveedores;

INSERT INTO proveedores (nombre, pais, nivel_calidad_default, tiempo_entrega_promedio_dias, ubicacion_fisica_default, activo, notas)
VALUES 
('Inventario Local', 'VE', 'estandar', 0, 'Tienda Principal', 1, 'Productos disponibles para entrega inmediata'),
('Proveedor China', 'CN', 'estandar', 15, 'Bodega Guangzhou', 1, 'Productos económicos, calidad estándar, tiempos largos'),
('Artesanos India', 'IN', 'premium', 7, 'Bodega Mumbai', 1, 'Excelente relación calidad-precio, acabados detallados'),
('Taller Italia', 'IT', 'luxury', 10, 'Milán', 1, 'Alta joyería, certificados, calidad luxury');
