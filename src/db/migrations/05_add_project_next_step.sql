-- Migration: Add Next Step and Next Step Owner to Projects
-- Created: 2026-09-30

ALTER TABLE projects 
  ADD COLUMN IF NOT EXISTS next_step TEXT,
  ADD COLUMN IF NOT EXISTS next_step_owner TEXT DEFAULT 'Agencia';

COMMENT ON COLUMN projects.next_step IS 'Próximo paso o hito acordado con el cliente';
COMMENT ON COLUMN projects.next_step_owner IS 'Responsable del próximo paso: Agencia, Cliente o Tercero';
