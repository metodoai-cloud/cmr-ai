// ============================================================================
// Database Migration Script
// Creates all 20 entities in Supabase PostgreSQL
// Run with: npm run migrate
// ============================================================================

import { supabase } from './connection.js';

const MIGRATION_SQL = `

-- ============================================================================
-- 1. USERS
-- ============================================================================
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

-- ============================================================================
-- 2. CONTACTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  company_id UUID,
  job_title TEXT,
  country TEXT,
  city TEXT,
  timezone TEXT,
  original_source TEXT,
  original_campaign_id UUID,
  original_hook_id UUID,
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

-- ============================================================================
-- 3. COMPANIES
-- ============================================================================
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

-- Add FK after companies exists
ALTER TABLE contacts 
  DROP CONSTRAINT IF EXISTS contacts_company_id_fkey;
ALTER TABLE contacts 
  ADD CONSTRAINT contacts_company_id_fkey 
  FOREIGN KEY (company_id) REFERENCES companies(id);

-- ============================================================================
-- 4. SERVICES
-- ============================================================================
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

-- ============================================================================
-- 5. CAMPAIGNS
-- ============================================================================
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

-- ============================================================================
-- 6. HOOKS (Ganchos de Marketing)
-- ============================================================================
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

-- ============================================================================
-- 7. LEADS
-- ============================================================================
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

-- Add FK for contacts original attribution
ALTER TABLE contacts
  DROP CONSTRAINT IF EXISTS contacts_original_campaign_id_fkey;
ALTER TABLE contacts
  ADD CONSTRAINT contacts_original_campaign_id_fkey
  FOREIGN KEY (original_campaign_id) REFERENCES campaigns(id);

ALTER TABLE contacts
  DROP CONSTRAINT IF EXISTS contacts_original_hook_id_fkey;
ALTER TABLE contacts
  ADD CONSTRAINT contacts_original_hook_id_fkey
  FOREIGN KEY (original_hook_id) REFERENCES hooks(id);

-- ============================================================================
-- 8. OPPORTUNITIES
-- ============================================================================
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

-- Add FK from leads to opportunities
ALTER TABLE leads
  DROP CONSTRAINT IF EXISTS leads_opportunity_id_fkey;
ALTER TABLE leads
  ADD CONSTRAINT leads_opportunity_id_fkey
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id);

-- ============================================================================
-- 9. ACTIVITIES
-- ============================================================================
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

-- ============================================================================
-- 10. CLIENTS
-- ============================================================================
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

-- ============================================================================
-- 11. PROJECTS
-- ============================================================================
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

-- ============================================================================
-- 12. SUBSCRIPTIONS
-- ============================================================================
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

-- ============================================================================
-- 13. VENDORS (Proveedores)
-- ============================================================================
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

-- ============================================================================
-- 14. INVOICES (Facturas)
-- ============================================================================
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

-- ============================================================================
-- 15. PAYMENTS (Pagos)
-- ============================================================================
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

-- ============================================================================
-- 16. EXPENSES (Gastos)
-- ============================================================================
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

-- ============================================================================
-- 17. TAXES (Impuestos)
-- ============================================================================
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

-- ============================================================================
-- 18. WITHDRAWALS (Retiros de socios)
-- ============================================================================
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

-- ============================================================================
-- 19. BUSINESS EVENTS
-- ============================================================================
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

-- ============================================================================
-- 20. AUDIT LOGS
-- ============================================================================
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
-- INDEXES for performance
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

`;

async function runMigration() {
  console.log('🚀 Starting database migration...\n');

  const { error } = await supabase.rpc('exec_sql', { sql: MIGRATION_SQL });

  if (error) {
    // If the RPC doesn't exist, we'll use the REST approach
    // Split SQL into individual statements and run via supabase
    console.log('ℹ️  RPC not available, running statements via SQL Editor...');
    console.log('');
    console.log('='.repeat(70));
    console.log('IMPORTANT: Copy the SQL below and run it in your Supabase SQL Editor');
    console.log('Go to: https://supabase.com/dashboard → Your project → SQL Editor');
    console.log('='.repeat(70));
    console.log('');
    console.log(MIGRATION_SQL);
    console.log('');
    console.log('='.repeat(70));
    console.log('After running the SQL, execute: npm run seed');
    console.log('='.repeat(70));
    return;
  }

  console.log('✅ Migration completed successfully!');
  console.log('📋 Created 20 tables with indexes and constraints');
  console.log('');
  console.log('Next step: npm run seed');
}

// Also export the SQL for manual use
export { MIGRATION_SQL };

runMigration().catch(console.error);
