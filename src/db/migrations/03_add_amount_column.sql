-- ============================================================================
-- Migration 03: Add and Synchronize 'amount' column in expenses and invoices
-- Fixes: PGRST204 "Could not find the 'amount' column of 'expenses' in the schema cache"
-- ============================================================================

-- 1. Agregar columna 'amount' a la tabla expenses
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2);

-- 2. Rellenar 'amount' para registros existentes
UPDATE expenses 
SET amount = COALESCE(total, subtotal, 0) 
WHERE amount IS NULL;

-- 3. Crear función y trigger para sincronizar amount <-> total <-> subtotal en expenses
CREATE OR REPLACE FUNCTION sync_expenses_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Si envían amount pero no total, asignar total y subtotal
  IF NEW.amount IS NOT NULL AND (NEW.total IS NULL OR NEW.total = 0) THEN
    NEW.total := NEW.amount;
    IF NEW.subtotal IS NULL OR NEW.subtotal = 0 THEN
      NEW.subtotal := NEW.amount - COALESCE(NEW.tax_amount, 0);
    END IF;
  -- Si envían total pero no amount, asignar amount
  ELSIF NEW.total IS NOT NULL AND (NEW.amount IS NULL OR NEW.amount = 0) THEN
    NEW.amount := NEW.total;
    IF NEW.subtotal IS NULL OR NEW.subtotal = 0 THEN
      NEW.subtotal := NEW.total - COALESCE(NEW.tax_amount, 0);
    END IF;
  -- Si ambos vienen definidos, asegurar que no sean null
  ELSE
    NEW.amount := COALESCE(NEW.amount, NEW.total, NEW.subtotal, 0);
    NEW.total := COALESCE(NEW.total, NEW.amount, 0);
    NEW.subtotal := COALESCE(NEW.subtotal, NEW.total, 0);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_expenses_amount ON expenses;
CREATE TRIGGER trg_sync_expenses_amount
BEFORE INSERT OR UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION sync_expenses_amount();

-- 4. Agregar columna 'amount' a la tabla invoices (preventivo para Claude Cowork)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2);

UPDATE invoices 
SET amount = COALESCE(total, subtotal, 0) 
WHERE amount IS NULL;

CREATE OR REPLACE FUNCTION sync_invoices_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.amount IS NOT NULL AND (NEW.total IS NULL OR NEW.total = 0) THEN
    NEW.total := NEW.amount;
    IF NEW.subtotal IS NULL OR NEW.subtotal = 0 THEN
      NEW.subtotal := ROUND(NEW.amount / 1.19);
      NEW.tax_amount := NEW.amount - NEW.subtotal;
    END IF;
  ELSIF NEW.total IS NOT NULL AND (NEW.amount IS NULL OR NEW.amount = 0) THEN
    NEW.amount := NEW.total;
  ELSE
    NEW.amount := COALESCE(NEW.amount, NEW.total, 0);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_invoices_amount ON invoices;
CREATE TRIGGER trg_sync_invoices_amount
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION sync_invoices_amount();

-- 5. Recargar la caché de esquemas de PostgREST / Supabase
NOTIFY pgrst, 'reload schema';
