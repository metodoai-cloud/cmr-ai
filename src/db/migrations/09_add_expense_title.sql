-- ============================================================================
-- Migration 09: Add title column to expenses table
-- Created: 2026-10-19
-- Ejecutar en Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================================

ALTER TABLE expenses 
  ADD COLUMN IF NOT EXISTS title TEXT;

COMMENT ON COLUMN expenses.title IS 'Título o concepto resumido del gasto (ej: Pago Formulario 29, Licencia Zapier, Hosting AWS)';
