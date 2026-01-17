-- ============================================
-- FIX #8: INDICES DE BASE DE DATOS
-- Optimiza queries para producción
-- ============================================

-- Verificar indices existentes
PRAGMA index_list('clientes');
PRAGMA index_list('ventas');
PRAGMA index_list('pagos');
PRAGMA index_list('pedidos');

-- Crear índices faltantes
CREATE INDEX IF NOT EXISTS idx_clientes_cedula ON clientes(cedula);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre_apellido ON clientes(nombre, apellido);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);

CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(cliente_id);

CREATE INDEX IF NOT EXISTS idx_pagos_venta ON pagos(venta_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha);

CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado_entrega);

-- Verificar que se crearon
SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='clientes';
