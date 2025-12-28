-- Migration: Create fabricantes table
-- Date: 2025-12-23

CREATE TABLE IF NOT EXISTS fabricantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    especialidad VARCHAR(50) DEFAULT 'general',
    tarifa_base DECIMAL(10,2) DEFAULT 0,
    capacidad_maxima INTEGER DEFAULT 10,
    tiempo_entrega_dias INTEGER DEFAULT 7,
    contacto_telefono VARCHAR(20),
    contacto_email VARCHAR(100),
    notas TEXT,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default manufacturers
INSERT INTO fabricantes (nombre, especialidad, tarifa_base, capacidad_maxima) VALUES 
('Fabricante 1', 'general', 5.00, 10),
('Fabricante 2', 'sublimacion', 4.50, 15),
('Fabricante 3', 'bordado', 6.00, 8),
('Fabricante 4', 'serigrafia', 5.50, 12);

SELECT 'Fabricantes table created successfully with default data.' as status;
