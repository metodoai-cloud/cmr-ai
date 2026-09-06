-- ============================================================================
-- CRM INTELIGENTE — CAPA ESTRATÉGICA (STRATEGY LAYER)
-- Migración 02: Agency Profiles, Customer Profiles, Entry Offers, Value Matrix,
-- Messaging Frameworks, Sales Playbooks, Steps, Objections y Enriquecimiento
-- ============================================================================

-- 1. AGENCY PROFILES (Identidad y Estrategia General de la Agencia)
CREATE TABLE IF NOT EXISTS agency_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  name TEXT NOT NULL,
  agency_name TEXT,
  description TEXT,
  niche TEXT,
  positioning TEXT,
  super_promise TEXT,
  core_problem TEXT,
  desired_transformation TEXT,
  unique_mechanism TEXT,
  differentiators JSONB DEFAULT '[]',
  values JSONB DEFAULT '[]',
  tone_of_voice TEXT,
  brand_keywords JSONB DEFAULT '[]',
  avoid_language JSONB DEFAULT '[]',
  sales_philosophy TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'archived')),
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Constraint de PostgreSQL: Solo un perfil activo por organización
CREATE UNIQUE INDEX IF NOT EXISTS idx_agency_profiles_active_unique
  ON agency_profiles (COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'))
  WHERE status = 'active';

-- 2. CUSTOMER PROFILES (Avatares / ICPs)
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  company_size TEXT,
  revenue_range TEXT,
  geography TEXT,
  decision_maker TEXT,
  job_titles JSONB DEFAULT '[]',
  main_problems JSONB DEFAULT '[]',
  desired_outcomes JSONB DEFAULT '[]',
  fears JSONB DEFAULT '[]',
  frustrations JSONB DEFAULT '[]',
  buying_triggers JSONB DEFAULT '[]',
  purchase_barriers JSONB DEFAULT '[]',
  common_objections JSONB DEFAULT '[]',
  current_alternatives JSONB DEFAULT '[]',
  awareness_level TEXT,
  urgency_level TEXT,
  budget_profile TEXT,
  preferred_channels JSONB DEFAULT '[]',
  language_patterns JSONB DEFAULT '[]',
  qualification_criteria JSONB DEFAULT '[]',
  disqualification_criteria JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ENTRY OFFERS (Puertas de Entrada Comerciales)
CREATE TABLE IF NOT EXISTS entry_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  primary_customer_profile_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
  primary_problem TEXT,
  secondary_problems JSONB DEFAULT '[]',
  desired_outcome TEXT,
  value_proposition TEXT,
  super_promise TEXT, -- NULL significa fallback a agency_profiles.super_promise
  unique_mechanism TEXT,
  primary_cta TEXT,
  qualification_message TEXT,
  main_objections JSONB DEFAULT '[]',
  proof_points JSONB DEFAULT '[]',
  priority INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ENTRY OFFER SERVICES (Matriz de Valor: Entry Offer + Service)
CREATE TABLE IF NOT EXISTS entry_offer_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  entry_offer_id UUID NOT NULL REFERENCES entry_offers(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  role TEXT,
  positioning TEXT,
  deliverable TEXT,
  problem_solved TEXT,
  real_value TEXT,
  analogy TEXT,
  value_anchor_min NUMERIC,
  value_anchor_max NUMERIC,
  value_justification TEXT,
  typical_outcome TEXT,
  proof_points JSONB DEFAULT '[]',
  recommended_price_context TEXT,
  sales_notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_entry_offer_service UNIQUE(entry_offer_id, service_id)
);

-- 5. MESSAGING FRAMEWORKS (Arquitectura de Mensajes de Marketing y Ventas)
CREATE TABLE IF NOT EXISTS messaging_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  entry_offer_id UUID REFERENCES entry_offers(id) ON DELETE SET NULL,
  customer_profile_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  main_message TEXT,
  problem_statement TEXT,
  desired_state TEXT,
  mechanism_message TEXT,
  credibility_message TEXT,
  risk_reversal TEXT,
  urgency_message TEXT,
  primary_benefits JSONB DEFAULT '[]',
  secondary_benefits JSONB DEFAULT '[]',
  pain_points JSONB DEFAULT '[]',
  hook_themes JSONB DEFAULT '[]',
  proof_types JSONB DEFAULT '[]',
  cta_options JSONB DEFAULT '[]',
  objection_angles JSONB DEFAULT '[]',
  words_to_use JSONB DEFAULT '[]',
  words_to_avoid JSONB DEFAULT '[]',
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'archived')),
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. SALES PLAYBOOKS (Cómo debe vender la Agencia)
CREATE TABLE IF NOT EXISTS sales_playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  entry_offer_id UUID REFERENCES entry_offers(id) ON DELETE SET NULL,
  customer_profile_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
  objective TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'archived')),
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. SALES PLAYBOOK STEPS (Pasos individuales del Playbook)
CREATE TABLE IF NOT EXISTS sales_playbook_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id UUID NOT NULL REFERENCES sales_playbooks(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  objective TEXT,
  description TEXT,
  questions JSONB DEFAULT '[]',
  signals_to_detect JSONB DEFAULT '[]',
  recommended_actions JSONB DEFAULT '[]',
  phrases_examples JSONB DEFAULT '[]',
  mistakes_to_avoid JSONB DEFAULT '[]',
  success_criteria JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_playbook_step_order UNIQUE(playbook_id, step_order)
);

-- 8. SALES OBJECTIONS (Biblioteca Estratégica de Objeciones)
CREATE TABLE IF NOT EXISTS sales_objections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  entry_offer_id UUID REFERENCES entry_offers(id) ON DELETE SET NULL,
  customer_profile_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other'
    CHECK (category IN ('price', 'timing', 'trust', 'authority', 'need', 'competition', 'risk', 'implementation', 'other')),
  objection_text TEXT,
  underlying_concern TEXT,
  recommended_response TEXT,
  questions_to_ask JSONB DEFAULT '[]',
  proof_to_use JSONB DEFAULT '[]',
  responses_to_avoid JSONB DEFAULT '[]',
  priority INTEGER DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- MODIFICACIONES A TABLAS EXISTENTES
-- ============================================================================

-- 12. Modificación de CAMPAIGNS
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS entry_offer_id UUID REFERENCES entry_offers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS customer_profile_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS messaging_framework_id UUID REFERENCES messaging_frameworks(id) ON DELETE SET NULL;

-- 13. Modificación de HOOKS
ALTER TABLE hooks
  ADD COLUMN IF NOT EXISTS entry_offer_id UUID REFERENCES entry_offers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS customer_profile_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS messaging_framework_id UUID REFERENCES messaging_frameworks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pain_point TEXT,
  ADD COLUMN IF NOT EXISTS desired_outcome TEXT,
  ADD COLUMN IF NOT EXISTS hook_type TEXT;

-- 14. Modificación de LEADS
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS entry_offer_id UUID REFERENCES entry_offers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS customer_profile_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS customer_profile_source TEXT CHECK (customer_profile_source IN ('manual','ai_inferred','rule_based','imported')),
  ADD COLUMN IF NOT EXISTS customer_profile_confidence NUMERIC CHECK (customer_profile_confidence >= 0.00 AND customer_profile_confidence <= 1.00),
  ADD COLUMN IF NOT EXISTS customer_profile_reason TEXT;

-- 15. Modificación de OPPORTUNITIES (Snapshot Estratégico)
ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS agency_profile_id UUID REFERENCES agency_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS entry_offer_id UUID REFERENCES entry_offers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS customer_profile_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS messaging_framework_id UUID REFERENCES messaging_frameworks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sales_playbook_id UUID REFERENCES sales_playbooks(id) ON DELETE SET NULL;

-- 18. Modificación de ACTIVITIES (Ejecución Real de Interacciones)
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS playbook_step_id UUID REFERENCES sales_playbook_steps(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS objection_id UUID REFERENCES sales_objections(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS objection_text TEXT,
  ADD COLUMN IF NOT EXISTS response_used TEXT,
  ADD COLUMN IF NOT EXISTS buyer_signal TEXT,
  ADD COLUMN IF NOT EXISTS pain_detected TEXT,
  ADD COLUMN IF NOT EXISTS desired_outcome TEXT,
  ADD COLUMN IF NOT EXISTS meeting_summary TEXT,
  ADD COLUMN IF NOT EXISTS ai_analysis JSONB;

-- ============================================================================
-- ÍNDICES PARA LA CAPA ESTRATÉGICA
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_agency_profiles_status ON agency_profiles(status);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_status ON customer_profiles(status);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_industry ON customer_profiles(industry);

CREATE INDEX IF NOT EXISTS idx_entry_offers_status ON entry_offers(status);
CREATE INDEX IF NOT EXISTS idx_entry_offers_slug ON entry_offers(slug);
CREATE INDEX IF NOT EXISTS idx_entry_offers_customer_profile ON entry_offers(primary_customer_profile_id);

CREATE INDEX IF NOT EXISTS idx_entry_offer_services_entry_offer ON entry_offer_services(entry_offer_id);
CREATE INDEX IF NOT EXISTS idx_entry_offer_services_service ON entry_offer_services(service_id);

CREATE INDEX IF NOT EXISTS idx_messaging_frameworks_entry_offer ON messaging_frameworks(entry_offer_id);
CREATE INDEX IF NOT EXISTS idx_messaging_frameworks_customer_profile ON messaging_frameworks(customer_profile_id);
CREATE INDEX IF NOT EXISTS idx_messaging_frameworks_status ON messaging_frameworks(status);

CREATE INDEX IF NOT EXISTS idx_sales_playbooks_entry_offer ON sales_playbooks(entry_offer_id);
CREATE INDEX IF NOT EXISTS idx_sales_playbooks_customer_profile ON sales_playbooks(customer_profile_id);
CREATE INDEX IF NOT EXISTS idx_sales_playbooks_status ON sales_playbooks(status);

CREATE INDEX IF NOT EXISTS idx_sales_playbook_steps_playbook ON sales_playbook_steps(playbook_id);
CREATE INDEX IF NOT EXISTS idx_sales_playbook_steps_order ON sales_playbook_steps(playbook_id, step_order);

CREATE INDEX IF NOT EXISTS idx_sales_objections_entry_offer ON sales_objections(entry_offer_id);
CREATE INDEX IF NOT EXISTS idx_sales_objections_customer_profile ON sales_objections(customer_profile_id);
CREATE INDEX IF NOT EXISTS idx_sales_objections_category ON sales_objections(category);

CREATE INDEX IF NOT EXISTS idx_campaigns_entry_offer ON campaigns(entry_offer_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_customer_profile ON campaigns(customer_profile_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_messaging_framework ON campaigns(messaging_framework_id);

CREATE INDEX IF NOT EXISTS idx_opportunities_agency_profile ON opportunities(agency_profile_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_entry_offer ON opportunities(entry_offer_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_customer_profile ON opportunities(customer_profile_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_messaging_framework ON opportunities(messaging_framework_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_sales_playbook ON opportunities(sales_playbook_id);

CREATE INDEX IF NOT EXISTS idx_activities_playbook_step ON activities(playbook_step_id);
CREATE INDEX IF NOT EXISTS idx_activities_objection ON activities(objection_id);
