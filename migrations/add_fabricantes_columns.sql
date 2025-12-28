-- Migration: Add columns to fabricantes table for manufacturer management
-- Date: 2025-12-23

-- Add tarifa_base column (base rate per piece in USD)
ALTER TABLE fabricantes ADD COLUMN tarifa_base DECIMAL(10,2) DEFAULT 0;

-- Add capacidad_maxima column (maximum concurrent orders)
ALTER TABLE fabricantes ADD COLUMN capacidad_maxima INTEGER DEFAULT 10;

-- Add tiempo_entrega_dias column (average delivery time in days)
ALTER TABLE fabricantes ADD COLUMN tiempo_entrega_dias INTEGER DEFAULT 7;

-- Add contact information
ALTER TABLE fabricantes ADD COLUMN contacto_telefono VARCHAR(20);
ALTER TABLE fabricantes ADD COLUMN contacto_email VARCHAR(100);

-- Add notes field
ALTER TABLE fabricantes ADD COLUMN notas TEXT;

-- Verify the changes
SELECT 'Migration completed successfully. New columns added to fabricantes table.' as status;
