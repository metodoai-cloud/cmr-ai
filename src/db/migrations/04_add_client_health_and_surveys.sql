-- ============================================================================
-- CRM INTELIGENTE — MIGRACIÓN 04: CUSTOMER HEALTH SCORE & CLIENT SURVEYS
-- ============================================================================

-- 1. Tabla de Encuestas de Satisfacción (CSAT & NPS)
CREATE TABLE IF NOT EXISTS client_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  survey_type TEXT NOT NULL CHECK (survey_type IN ('csat', 'nps')),
  score NUMERIC(4,2) NOT NULL, -- 1.0 a 5.0 para CSAT; 0 a 10 para NPS
  
  -- Campos específicos para CSAT (Pago Único / Hitos)
  q1_delivery_quality INTEGER CHECK (q1_delivery_quality BETWEEN 1 AND 5),
  q2_communication INTEGER CHECK (q2_communication BETWEEN 1 AND 5),
  q3_expectations INTEGER CHECK (q3_expectations BETWEEN 1 AND 5),
  
  -- Comentario cualitativo abierto (CSAT y NPS)
  qualitative_feedback TEXT,
  
  -- Metadatos de ingesta
  source TEXT DEFAULT 'webhook' CHECK (source IN ('webhook', 'form', 'manual', 'api')),
  period TEXT, -- Ej: '2026-Q3', '2026-09'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices de búsqueda
CREATE INDEX IF NOT EXISTS idx_client_surveys_company ON client_surveys(company_id);
CREATE INDEX IF NOT EXISTS idx_client_surveys_client ON client_surveys(client_id);
CREATE INDEX IF NOT EXISTS idx_client_surveys_type ON client_surveys(survey_type);

-- RLS (Habilitar y permitir acceso a la API del CRM)
ALTER TABLE client_surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to client_surveys" ON client_surveys FOR ALL USING (true) WITH CHECK (true);

-- 2. Columnas de Health Score consolidado en la tabla clients
ALTER TABLE clients 
  ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'one_time' CHECK (service_type IN ('one_time', 'recurring')),
  ADD COLUMN IF NOT EXISTS current_csat NUMERIC(3,1) DEFAULT 5.0,
  ADD COLUMN IF NOT EXISTS current_nps INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS kpi_status TEXT DEFAULT 'high' CHECK (kpi_status IN ('high', 'medium', 'low')),
  ADD COLUMN IF NOT EXISTS communication_status TEXT DEFAULT 'fluent' CHECK (communication_status IN ('fluent', 'acceptable', 'poor')),
  ADD COLUMN IF NOT EXISTS health_score INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS health_level TEXT DEFAULT 'green' CHECK (health_level IN ('green', 'yellow', 'red')),
  ADD COLUMN IF NOT EXISTS health_reason TEXT DEFAULT 'Avance normal y sin fricciones operativas',
  ADD COLUMN IF NOT EXISTS playbook_action TEXT DEFAULT 'Solicitar testimonio o caso de estudio',
  ADD COLUMN IF NOT EXISTS last_survey_at TIMESTAMPTZ;
