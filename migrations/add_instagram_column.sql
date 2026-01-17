-- Migration: Add instagram column to clientes table
-- Run this if the column doesn't exist

-- Check and add instagram column
ALTER TABLE clientes ADD COLUMN instagram TEXT DEFAULT NULL;

-- Update any existing records if needed (optional)
-- UPDATE clientes SET instagram = NULL WHERE instagram IS NULL;
