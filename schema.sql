-- ============================================================================
-- CRM INTELIGENTE — SCHEMA COMPLETO
-- Copiar y ejecutar en: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('owner','admin','sales','marketing','operations','finance','viewer')),
  avatar_url TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. COMPANIES
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  name TEXT NOT NULL,
  legal_name TEXT,
  tax_id TEXT,
  website TEXT,
  industry TEXT,
  company_size TEXT,
  country TEXT,
  city TEXT,
  sales_owner_id UUID REFERENCES users(id),
  is_active_client BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- 3. SERVICES
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  standard_setup_price NUMERIC(12,2) DEFAULT 0,
  standard_recurring_price NUMERIC(12,2) DEFAULT 0,
  billing_type TEXT DEFAULT 'hybrid'
    CHECK (billing_type IN ('one_time','recurring','hybrid')),
  billing_frequency TEXT DEFAULT 'monthly'
    CHECK (billing_frequency IN ('monthly','quarterly','annual','one_time')),
  estimated_cost NUMERIC(12,2) DEFAULT 0,
  target_margin NUMERIC(5,2) DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CAMPAIGNS
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  name TEXT NOT NULL,
  channel TEXT,
  objective TEXT,
  start_date DATE,
  end_date DATE,
  budget NUMERIC(12,2) DEFAULT 0,
  actual_spend NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','active','paused','completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. HOOKS
CREATE TABLE IF NOT EXISTS hooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  name TEXT NOT NULL,
  message TEXT,
  angle TEXT
    CHECK (angle IN ('pain','saving','money','time','growth','risk','opportunity')),
  format TEXT,
  target_audience TEXT,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('draft','active','paused','retired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. CONTACTS
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  company_id UUID REFERENCES companies(id),
  job_title TEXT,
  country TEXT,
  city TEXT,
  timezone TEXT,
  original_source TEXT,
  original_campaign_id UUID REFERENCES campaigns(id),
  original_hook_id UUID REFERENCES hooks(id),
  status TEXT DEFAULT 'prospect'
    CHECK (status IN ('prospect','client','former_client')),
  owner_id UUID REFERENCES users(id),
  tags JSONB DEFAULT '[]',
  notes TEXT,
  last_interaction_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- 7. LEADS
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  contact_id UUID REFERENCES contacts(id),
  company_id UUID REFERENCES companies(id),
  source TEXT,
  channel TEXT,
  campaign_id UUID REFERENCES campaigns(id),
  hook_id UUID REFERENCES hooks(id),
  landing_page TEXT,
  form_name TEXT,
  service_id UUID REFERENCES services(id),
  status TEXT DEFAULT 'new'
    CHECK (status IN ('new','working','qualified','discarded','converted')),
  owner_id UUID REFERENCES users(id),
  lead_score INTEGER DEFAULT 0,
  discard_reason TEXT,
  converted_to_opportunity BOOLEAN DEFAULT false,
  opportunity_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. OPPORTUNITIES
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  name TEXT NOT NULL,
  contact_id UUID REFERENCES contacts(id),
  company_id UUID REFERENCES companies(id),
  lead_id UUID REFERENCES leads(id),
  service_id UUID REFERENCES services(id),
  owner_id UUID REFERENCES users(id),
  stage TEXT DEFAULT 'new'
    CHECK (stage IN (
      'new','contacted','qualified','meeting_scheduled',
      'meeting_completed','proposal_sent','negotiation','won','lost'
    )),
  setup_value NUMERIC(12,2) DEFAULT 0,
  recurring_value NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  probability NUMERIC(5,2) DEFAULT 0,
  estimated_close_date DATE,
  closed_at TIMESTAMPTZ,
  campaign_id UUID REFERENCES campaigns(id),
  hook_id UUID REFERENCES hooks(id),
  next_action TEXT,
  next_action_date DATE,
  lost_reason TEXT,
  competitor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- FK from leads to opportunities
ALTER TABLE leads
  DROP CONSTRAINT IF EXISTS leads_opportunity_id_fkey;
ALTER TABLE leads
  ADD CONSTRAINT leads_opportunity_id_fkey
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id);

-- 9. ACTIVITIES
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  type TEXT NOT NULL
    CHECK (type IN ('call','email','whatsapp','meeting','demo','follow_up','proposal','task','note')),
  contact_id UUID REFERENCES contacts(id),
  company_id UUID REFERENCES companies(id),
  opportunity_id UUID REFERENCES opportunities(id),
  owner_id UUID REFERENCES users(id),
  occurred_at TIMESTAMPTZ DEFAULT now(),
  result TEXT,
  notes TEXT,
  next_action TEXT,
  next_action_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. CLIENTS
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  company_id UUID REFERENCES companies(id),
  primary_contact_id UUID REFERENCES contacts(id),
  sales_owner_id UUID REFERENCES users(id),
  account_manager_id UUID REFERENCES users(id),
  start_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'onboarding'
    CHECK (status IN ('onboarding','active','paused','finished')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- 11. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  client_id UUID REFERENCES clients(id),
  opportunity_id UUID REFERENCES opportunities(id),
  service_id UUID REFERENCES services(id),
  owner_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  start_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'onboarding'
    CHECK (status IN ('onboarding','in_progress','review','completed','cancelled')),
  sold_price NUMERIC(12,2) DEFAULT 0,
  estimated_cost NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  client_id UUID REFERENCES clients(id),
  service_id UUID REFERENCES services(id),
  opportunity_id UUID REFERENCES opportunities(id),
  start_date DATE DEFAULT CURRENT_DATE,
  next_billing_date DATE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_frequency TEXT DEFAULT 'monthly'
    CHECK (billing_frequency IN ('monthly','quarterly','annual')),
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active','paused','cancelled')),
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. VENDORS
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'other'
    CHECK (type IN ('freelancer','software','agency','supplier','government','other')),
  email TEXT,
  phone TEXT,
  tax_id TEXT,
  country TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  invoice_number TEXT,
  client_id UUID REFERENCES clients(id),
  project_id UUID REFERENCES projects(id),
  subscription_id UUID REFERENCES subscriptions(id),
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','issued','partial','paid','overdue','cancelled')),
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- 15. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  invoice_id UUID REFERENCES invoices(id),
  client_id UUID REFERENCES clients(id),
  payment_date DATE DEFAULT CURRENT_DATE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  account_reference TEXT,
  external_reference TEXT,
  idempotency_key TEXT UNIQUE,
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  date DATE DEFAULT CURRENT_DATE,
  vendor_id UUID REFERENCES vendors(id),
  category TEXT,
  description TEXT,
  project_id UUID REFERENCES projects(id),
  client_id UUID REFERENCES clients(id),
  campaign_id UUID REFERENCES campaigns(id),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','paid','cancelled')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  payment_account TEXT,
  receipt_url TEXT,
  external_reference TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- 17. TAXES
CREATE TABLE IF NOT EXISTS taxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  type TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  due_date DATE,
  estimated_amount NUMERIC(12,2) DEFAULT 0,
  actual_amount NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'estimated'
    CHECK (status IN ('estimated','pending','paid')),
  paid_at TIMESTAMPTZ,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 18. WITHDRAWALS
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  user_id UUID REFERENCES users(id),
  date DATE DEFAULT CURRENT_DATE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  type TEXT DEFAULT 'owner_draw'
    CHECK (type IN ('owner_draw','dividend','advance','other')),
  source_account TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 19. BUSINESS EVENTS
CREATE TABLE IF NOT EXISTS business_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  payload JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- 20. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  timestamp TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES users(id),
  actor_type TEXT DEFAULT 'human'
    CHECK (actor_type IN ('human','ai','system')),
  actor_id TEXT,
  source TEXT DEFAULT 'web'
    CHECK (source IN ('web','mcp','api','automation')),
  tool_name TEXT,
  entity_type TEXT,
  entity_id UUID,
  action TEXT NOT NULL,
  before_data JSONB,
  after_data JSONB,
  raw_input TEXT,
  structured_interpretation JSONB,
  conversation_id TEXT,
  request_id TEXT
);

-- ============================================================================
-- CAPA ESTRATÉGICA (STRATEGY LAYER)
-- ============================================================================

-- 21. AGENCY PROFILES
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_agency_profiles_active_unique
  ON agency_profiles (COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'))
  WHERE status = 'active';

-- 22. CUSTOMER PROFILES
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

-- 23. ENTRY OFFERS
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
  super_promise TEXT,
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

-- 24. ENTRY OFFER SERVICES (Matriz de Valor)
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

-- 25. MESSAGING FRAMEWORKS
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

-- 26. SALES PLAYBOOKS
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

-- 27. SALES PLAYBOOK STEPS
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

-- 28. SALES OBJECTIONS
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
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_owner ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_leads_contact ON leads(contact_id);
CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_hook ON leads(hook_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_company ON opportunities(company_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_contact ON opportunities(contact_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_owner ON opportunities(owner_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_campaign ON opportunities(campaign_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_opportunity ON activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_expenses_vendor ON expenses(vendor_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_campaign ON expenses(campaign_id);
CREATE INDEX IF NOT EXISTS idx_business_events_type ON business_events(event_type);
CREATE INDEX IF NOT EXISTS idx_business_events_entity ON business_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Índices Capa Estratégica
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
