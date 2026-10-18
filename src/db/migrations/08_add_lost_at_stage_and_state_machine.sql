-- ============================================================================
-- Migration 08: Add lost_at_stage to opportunities and validate project states
-- Created: 2026-10-18
-- Ejecutar en Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================================

-- 1. Agregar columna lost_at_stage a la tabla opportunities para registrar la etapa de caída
ALTER TABLE opportunities 
  ADD COLUMN IF NOT EXISTS lost_at_stage TEXT;

COMMENT ON COLUMN opportunities.lost_at_stage IS 'Etapa del embudo comercial donde se cayó o canceló la oportunidad (ej: new, contacted, qualified, proposal_sent, negotiation, pilot)';

-- 2. Asegurar que CHECK constraint de projects incluya 'review' y todos los estados operativos
DO $$
BEGIN
  ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
  ALTER TABLE projects ADD CONSTRAINT projects_status_check
    CHECK (status IN ('review', 'onboarding', 'in_progress', 'pilot', 'completed', 'cancelled'));
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;
