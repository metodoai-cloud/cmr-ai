-- Migration 07: Add notes to invoices and status to activities
-- Created: 2026-10-17
-- Ejecutar en Supabase Dashboard -> SQL Editor -> New query -> Run

-- 1. Agregar columna notes a la tabla invoices
ALTER TABLE invoices 
  ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN invoices.notes IS 'Concepto o notas descriptivas de la factura';

-- 2. Agregar columna status a la tabla activities (para tareas comerciales y operativas)
ALTER TABLE activities 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
  CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'));

COMMENT ON COLUMN activities.status IS 'Estado operativo de la tarea: pending, in_progress, completed, cancelled';

-- 3. Agregar columna updated_at a la tabla activities
ALTER TABLE activities 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

COMMENT ON COLUMN activities.updated_at IS 'Fecha y hora de última modificación de la actividad';

-- 4. Backfill de estado en tareas existentes basándose en el campo result
UPDATE activities
SET status = 'completed'
WHERE type = 'task' 
  AND LOWER(TRIM(COALESCE(result, ''))) IN ('completada', 'completado', 'done', 'finalizada', 'hecha');

UPDATE activities
SET status = 'in_progress'
WHERE type = 'task' 
  AND LOWER(TRIM(COALESCE(result, ''))) IN ('en proceso', 'in progress', 'en curso');

UPDATE activities
SET status = 'cancelled'
WHERE type = 'task' 
  AND LOWER(TRIM(COALESCE(result, ''))) IN ('cancelada', 'cancelado', 'cancelled', 'descartada');

UPDATE activities
SET status = 'pending'
WHERE type = 'task' AND status IS NULL;
