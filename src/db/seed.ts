// ============================================================================
// Seed Data — Realistic initial data for the CRM
// Run with: npm run seed
// ============================================================================

import { supabase } from './connection.js';

async function seed() {
  console.log('🌱 Seeding database with initial data...\n');

  // --- 1. Users ---
  const { data: users, error: usersErr } = await supabase
    .from('users')
    .upsert([
      {
        email: 'admin@agencia.com',
        full_name: 'Admin Principal',
        role: 'owner',
        timezone: 'America/New_York',
      },
      {
        email: 'ventas@agencia.com',
        full_name: 'Carlos Ventas',
        role: 'sales',
        timezone: 'America/New_York',
      },
      {
        email: 'marketing@agencia.com',
        full_name: 'Ana Marketing',
        role: 'marketing',
        timezone: 'America/New_York',
      },
    ], { onConflict: 'email' })
    .select();

  if (usersErr) { console.error('❌ Users:', usersErr.message); return; }
  console.log(`✅ Users: ${users.length} created`);

  const ownerId = users[0].id;
  const salesId = users[1].id;

  // --- 2. Services ---
  const { data: services, error: servErr } = await supabase
    .from('services')
    .upsert([
      {
        name: 'Automatización WhatsApp',
        category: 'automation',
        description: 'Implementación de chatbot y flujos de WhatsApp Business',
        standard_setup_price: 8000,
        standard_recurring_price: 1500,
        billing_type: 'hybrid',
        billing_frequency: 'monthly',
        estimated_cost: 2000,
        target_margin: 70,
      },
      {
        name: 'Gestión de Redes Sociales',
        category: 'social_media',
        description: 'Creación de contenido y gestión de redes sociales',
        standard_setup_price: 0,
        standard_recurring_price: 2500,
        billing_type: 'recurring',
        billing_frequency: 'monthly',
        estimated_cost: 800,
        target_margin: 68,
      },
      {
        name: 'Desarrollo Web',
        category: 'web',
        description: 'Diseño y desarrollo de sitio web profesional',
        standard_setup_price: 15000,
        standard_recurring_price: 500,
        billing_type: 'hybrid',
        billing_frequency: 'monthly',
        estimated_cost: 5000,
        target_margin: 65,
      },
      {
        name: 'SEO y Posicionamiento',
        category: 'seo',
        description: 'Optimización de motores de búsqueda y posicionamiento orgánico',
        standard_setup_price: 3000,
        standard_recurring_price: 2000,
        billing_type: 'hybrid',
        billing_frequency: 'monthly',
        estimated_cost: 600,
        target_margin: 70,
      },
      {
        name: 'Email Marketing',
        category: 'email',
        description: 'Estrategia y automatización de email marketing',
        standard_setup_price: 2000,
        standard_recurring_price: 1000,
        billing_type: 'hybrid',
        billing_frequency: 'monthly',
        estimated_cost: 300,
        target_margin: 70,
      },
    ], { onConflict: 'id' })
    .select();

  if (servErr) { console.error('❌ Services:', servErr.message); return; }
  console.log(`✅ Services: ${services.length} created`);

  // --- 3. Campaigns ---
  const { data: campaigns, error: campErr } = await supabase
    .from('campaigns')
    .upsert([
      {
        name: 'Meta Ads — Automatización Q3',
        channel: 'meta_ads',
        objective: 'leads',
        start_date: '2026-07-01',
        budget: 3000,
        actual_spend: 1850,
        status: 'active',
      },
      {
        name: 'Google Ads — Desarrollo Web',
        channel: 'google_ads',
        objective: 'leads',
        start_date: '2026-06-15',
        budget: 2000,
        actual_spend: 1200,
        status: 'active',
      },
      {
        name: 'LinkedIn Outbound — Enterprise',
        channel: 'linkedin',
        objective: 'meetings',
        start_date: '2026-08-01',
        budget: 500,
        actual_spend: 200,
        status: 'active',
      },
      {
        name: 'Referidos y Alianzas',
        channel: 'referral',
        objective: 'leads',
        start_date: '2026-01-01',
        budget: 0,
        actual_spend: 0,
        status: 'active',
      },
    ], { onConflict: 'id' })
    .select();

  if (campErr) { console.error('❌ Campaigns:', campErr.message); return; }
  console.log(`✅ Campaigns: ${campaigns.length} created`);

  // --- 4. Hooks ---
  const { data: hooks, error: hookErr } = await supabase
    .from('hooks')
    .upsert([
      {
        name: '¿Pierdes clientes por WhatsApp?',
        message: 'El 73% de los leads que no recibes respuesta en 5 min se van a la competencia',
        angle: 'pain',
        format: 'video_ad',
        target_audience: 'Clínicas y consultorios',
      },
      {
        name: 'Automatiza y ahorra 20h/semana',
        message: 'Nuestros clientes recuperan 20 horas semanales con automatización de WhatsApp',
        angle: 'time',
        format: 'carousel',
        target_audience: 'Pymes con equipo comercial',
      },
      {
        name: 'Caso de éxito: 3x más citas',
        message: 'DentalPro pasó de 40 a 120 citas mensuales con nuestro sistema',
        angle: 'growth',
        format: 'case_study',
        target_audience: 'Sector salud',
      },
      {
        name: 'Web profesional desde $499/mes',
        message: 'Tu sitio web profesional con landing pages optimizadas para conversión',
        angle: 'money',
        format: 'static_ad',
        target_audience: 'Negocios sin web',
      },
    ], { onConflict: 'id' })
    .select();

  if (hookErr) { console.error('❌ Hooks:', hookErr.message); return; }
  console.log(`✅ Hooks: ${hooks.length} created`);

  // --- 5. Companies ---
  const { data: companies, error: compErr } = await supabase
    .from('companies')
    .upsert([
      { name: 'DentalPro', industry: 'Salud', company_size: '50-200', country: 'México', city: 'CDMX', sales_owner_id: salesId },
      { name: 'Acme Corp', industry: 'Comercio', company_size: '10-50', country: 'Colombia', city: 'Bogotá', sales_owner_id: salesId },
      { name: 'TechFlow Solutions', industry: 'Tecnología', company_size: '10-50', country: 'Chile', city: 'Santiago', sales_owner_id: ownerId },
      { name: 'FitZone Gym', industry: 'Fitness', company_size: '1-10', country: 'México', city: 'Guadalajara', sales_owner_id: salesId },
      { name: 'Legal Partners', industry: 'Legal', company_size: '10-50', country: 'Argentina', city: 'Buenos Aires', sales_owner_id: ownerId },
      { name: 'Inmobiliaria del Valle', industry: 'Real Estate', company_size: '10-50', country: 'México', city: 'Monterrey', sales_owner_id: salesId, is_active_client: true },
      { name: 'EduTech Academy', industry: 'Educación', company_size: '10-50', country: 'España', city: 'Madrid', sales_owner_id: ownerId, is_active_client: true },
    ], { onConflict: 'id' })
    .select();

  if (compErr) { console.error('❌ Companies:', compErr.message); return; }
  console.log(`✅ Companies: ${companies.length} created`);

  // --- 6. Contacts ---
  const { data: contacts, error: contErr } = await supabase
    .from('contacts')
    .upsert([
      { first_name: 'Laura', last_name: 'Méndez', email: 'laura@dentalpro.mx', phone: '+52 55 1234 5678', company_id: companies[0].id, job_title: 'Directora Comercial', owner_id: salesId, original_source: 'meta_ads', original_campaign_id: campaigns[0].id, original_hook_id: hooks[0].id },
      { first_name: 'Roberto', last_name: 'García', email: 'roberto@acme.co', phone: '+57 301 234 5678', company_id: companies[1].id, job_title: 'Gerente General', owner_id: salesId, original_source: 'google_ads', original_campaign_id: campaigns[1].id, original_hook_id: hooks[3].id },
      { first_name: 'Martín', last_name: 'Silva', email: 'martin@techflow.cl', phone: '+56 9 1234 5678', company_id: companies[2].id, job_title: 'CTO', owner_id: ownerId, original_source: 'linkedin', original_campaign_id: campaigns[2].id },
      { first_name: 'Patricia', last_name: 'Ruiz', email: 'patricia@fitzone.mx', phone: '+52 33 9876 5432', company_id: companies[3].id, job_title: 'Dueña', owner_id: salesId, original_source: 'meta_ads', original_campaign_id: campaigns[0].id, original_hook_id: hooks[1].id },
      { first_name: 'Diego', last_name: 'Fernández', email: 'diego@legalpartners.ar', phone: '+54 11 4567 8901', company_id: companies[4].id, job_title: 'Socio Director', owner_id: ownerId, original_source: 'referral', original_campaign_id: campaigns[3].id },
      { first_name: 'Sofía', last_name: 'Torres', email: 'sofia@delvalle.mx', phone: '+52 81 5555 1234', company_id: companies[5].id, job_title: 'Marketing Manager', owner_id: salesId, original_source: 'google_ads', original_campaign_id: campaigns[1].id, status: 'client' },
      { first_name: 'Alejandro', last_name: 'Vega', email: 'alex@edutech.es', phone: '+34 612 345 678', company_id: companies[6].id, job_title: 'CEO', owner_id: ownerId, original_source: 'linkedin', original_campaign_id: campaigns[2].id, status: 'client' },
    ], { onConflict: 'id' })
    .select();

  if (contErr) { console.error('❌ Contacts:', contErr.message); return; }
  console.log(`✅ Contacts: ${contacts.length} created`);

  // --- 7. Leads ---
  const { data: leadsList, error: leadErr } = await supabase
    .from('leads')
    .upsert([
      { contact_id: contacts[0].id, company_id: companies[0].id, source: 'meta_ads', channel: 'facebook', campaign_id: campaigns[0].id, hook_id: hooks[0].id, service_id: services[0].id, status: 'qualified', owner_id: salesId, lead_score: 85 },
      { contact_id: contacts[1].id, company_id: companies[1].id, source: 'google_ads', channel: 'google', campaign_id: campaigns[1].id, hook_id: hooks[3].id, service_id: services[2].id, status: 'working', owner_id: salesId, lead_score: 60 },
      { contact_id: contacts[2].id, company_id: companies[2].id, source: 'linkedin', channel: 'linkedin', campaign_id: campaigns[2].id, service_id: services[0].id, status: 'qualified', owner_id: ownerId, lead_score: 90 },
      { contact_id: contacts[3].id, company_id: companies[3].id, source: 'meta_ads', channel: 'instagram', campaign_id: campaigns[0].id, hook_id: hooks[1].id, service_id: services[1].id, status: 'new', owner_id: salesId, lead_score: 40 },
      { contact_id: contacts[4].id, company_id: companies[4].id, source: 'referral', channel: 'referral', campaign_id: campaigns[3].id, service_id: services[3].id, status: 'qualified', owner_id: ownerId, lead_score: 75 },
      { contact_id: contacts[5].id, company_id: companies[5].id, source: 'google_ads', channel: 'google', campaign_id: campaigns[1].id, service_id: services[2].id, status: 'converted', owner_id: salesId, lead_score: 95, converted_to_opportunity: true },
      { contact_id: contacts[6].id, company_id: companies[6].id, source: 'linkedin', channel: 'linkedin', campaign_id: campaigns[2].id, service_id: services[0].id, status: 'converted', owner_id: ownerId, lead_score: 92, converted_to_opportunity: true },
    ], { onConflict: 'id' })
    .select();

  if (leadErr) { console.error('❌ Leads:', leadErr.message); return; }
  console.log(`✅ Leads: ${leadsList.length} created`);

  // --- 8. Opportunities ---
  const { data: opps, error: oppErr } = await supabase
    .from('opportunities')
    .upsert([
      { name: 'DentalPro — Automatización WhatsApp', contact_id: contacts[0].id, company_id: companies[0].id, lead_id: leadsList[0].id, service_id: services[0].id, owner_id: salesId, stage: 'proposal_sent', setup_value: 8000, recurring_value: 1500, probability: 0.70, estimated_close_date: '2026-09-05', campaign_id: campaigns[0].id, hook_id: hooks[0].id, next_action: 'Enviar propuesta formal', next_action_date: '2026-08-28' },
      { name: 'Acme — Desarrollo Web Corporativo', contact_id: contacts[1].id, company_id: companies[1].id, lead_id: leadsList[1].id, service_id: services[2].id, owner_id: salesId, stage: 'meeting_scheduled', setup_value: 15000, recurring_value: 500, probability: 0.40, estimated_close_date: '2026-09-30', campaign_id: campaigns[1].id, hook_id: hooks[3].id, next_action: 'Reunión de discovery', next_action_date: '2026-08-26' },
      { name: 'TechFlow — Automatización CRM', contact_id: contacts[2].id, company_id: companies[2].id, lead_id: leadsList[2].id, service_id: services[0].id, owner_id: ownerId, stage: 'negotiation', setup_value: 12000, recurring_value: 2000, probability: 0.80, estimated_close_date: '2026-08-30', campaign_id: campaigns[2].id, next_action: 'Negociar descuento por pago anual', next_action_date: '2026-08-25' },
      { name: 'Legal Partners — SEO', contact_id: contacts[4].id, company_id: companies[4].id, lead_id: leadsList[4].id, service_id: services[3].id, owner_id: ownerId, stage: 'qualified', setup_value: 3000, recurring_value: 2000, probability: 0.30, estimated_close_date: '2026-10-15', campaign_id: campaigns[3].id, next_action: 'Agendar reunión', next_action_date: '2026-08-27' },
      { name: 'Inmobiliaria del Valle — Web + Redes', contact_id: contacts[5].id, company_id: companies[5].id, lead_id: leadsList[5].id, service_id: services[2].id, owner_id: salesId, stage: 'won', setup_value: 15000, recurring_value: 2500, probability: 1.0, closed_at: '2026-07-15', campaign_id: campaigns[1].id },
      { name: 'EduTech — Automatización + Email', contact_id: contacts[6].id, company_id: companies[6].id, lead_id: leadsList[6].id, service_id: services[0].id, owner_id: ownerId, stage: 'won', setup_value: 10000, recurring_value: 2000, probability: 1.0, closed_at: '2026-06-20', campaign_id: campaigns[2].id },
    ], { onConflict: 'id' })
    .select();

  if (oppErr) { console.error('❌ Opportunities:', oppErr.message); return; }
  console.log(`✅ Opportunities: ${opps.length} created`);

  // --- 9. Clients (from won opportunities) ---
  const { data: clientsList, error: cliErr } = await supabase
    .from('clients')
    .upsert([
      { company_id: companies[5].id, primary_contact_id: contacts[5].id, sales_owner_id: salesId, account_manager_id: salesId, start_date: '2026-07-15', status: 'active' },
      { company_id: companies[6].id, primary_contact_id: contacts[6].id, sales_owner_id: ownerId, account_manager_id: ownerId, start_date: '2026-06-20', status: 'active' },
    ], { onConflict: 'id' })
    .select();

  if (cliErr) { console.error('❌ Clients:', cliErr.message); return; }
  console.log(`✅ Clients: ${clientsList.length} created`);

  // --- 10. Projects ---
  const { data: projectsList, error: projErr } = await supabase
    .from('projects')
    .upsert([
      { client_id: clientsList[0].id, opportunity_id: opps[4].id, service_id: services[2].id, owner_id: salesId, name: 'Web Inmobiliaria del Valle', start_date: '2026-07-20', due_date: '2026-09-15', status: 'in_progress', sold_price: 15000, estimated_cost: 5000 },
      { client_id: clientsList[1].id, opportunity_id: opps[5].id, service_id: services[0].id, owner_id: ownerId, name: 'Automatización EduTech', start_date: '2026-06-25', due_date: '2026-08-10', status: 'completed', sold_price: 10000, estimated_cost: 3000, completed_at: '2026-08-08T00:00:00Z' },
    ], { onConflict: 'id' })
    .select();

  if (projErr) { console.error('❌ Projects:', projErr.message); return; }
  console.log(`✅ Projects: ${projectsList.length} created`);

  // --- 11. Subscriptions ---
  const { data: subsList, error: subErr } = await supabase
    .from('subscriptions')
    .upsert([
      { client_id: clientsList[0].id, service_id: services[2].id, opportunity_id: opps[4].id, start_date: '2026-08-01', next_billing_date: '2026-09-01', amount: 2500, billing_frequency: 'monthly', status: 'active' },
      { client_id: clientsList[1].id, service_id: services[0].id, opportunity_id: opps[5].id, start_date: '2026-07-01', next_billing_date: '2026-09-01', amount: 2000, billing_frequency: 'monthly', status: 'active' },
    ], { onConflict: 'id' })
    .select();

  if (subErr) { console.error('❌ Subscriptions:', subErr.message); return; }
  console.log(`✅ Subscriptions: ${subsList.length} created`);

  // --- 12. Vendors ---
  const { data: vendorsList, error: venErr } = await supabase
    .from('vendors')
    .upsert([
      { name: 'Zapier', type: 'software', country: 'US' },
      { name: 'Meta Platforms', type: 'software', country: 'US' },
      { name: 'Google Ads', type: 'software', country: 'US' },
      { name: 'OpenAI', type: 'software', country: 'US' },
      { name: 'Freelancer Diseño', type: 'freelancer', country: 'México' },
      { name: 'AWS', type: 'software', country: 'US' },
    ], { onConflict: 'id' })
    .select();

  if (venErr) { console.error('❌ Vendors:', venErr.message); return; }
  console.log(`✅ Vendors: ${vendorsList.length} created`);

  // --- 13. Invoices ---
  const { data: invoicesList, error: invErr } = await supabase
    .from('invoices')
    .upsert([
      { invoice_number: 'INV-2026-001', client_id: clientsList[0].id, project_id: projectsList[0].id, issue_date: '2026-07-20', due_date: '2026-08-20', subtotal: 15000, tax_amount: 2400, total: 17400, status: 'partial' },
      { invoice_number: 'INV-2026-002', client_id: clientsList[0].id, subscription_id: subsList[0].id, issue_date: '2026-08-01', due_date: '2026-08-15', subtotal: 2500, tax_amount: 400, total: 2900, status: 'issued' },
      { invoice_number: 'INV-2026-003', client_id: clientsList[1].id, project_id: projectsList[1].id, issue_date: '2026-06-25', due_date: '2026-07-25', subtotal: 10000, tax_amount: 2100, total: 12100, status: 'paid' },
      { invoice_number: 'INV-2026-004', client_id: clientsList[1].id, subscription_id: subsList[1].id, issue_date: '2026-07-01', due_date: '2026-07-15', subtotal: 2000, tax_amount: 420, total: 2420, status: 'paid' },
      { invoice_number: 'INV-2026-005', client_id: clientsList[1].id, subscription_id: subsList[1].id, issue_date: '2026-08-01', due_date: '2026-08-15', subtotal: 2000, tax_amount: 420, total: 2420, status: 'issued' },
    ], { onConflict: 'id' })
    .select();

  if (invErr) { console.error('❌ Invoices:', invErr.message); return; }
  console.log(`✅ Invoices: ${invoicesList.length} created`);

  // --- 14. Payments ---
  const { error: payErr } = await supabase
    .from('payments')
    .upsert([
      { invoice_id: invoicesList[0].id, client_id: clientsList[0].id, payment_date: '2026-07-25', amount: 8700, payment_method: 'bank_transfer', confirmed: true, idempotency_key: 'PAY-001' },
      { invoice_id: invoicesList[2].id, client_id: clientsList[1].id, payment_date: '2026-07-20', amount: 12100, payment_method: 'bank_transfer', confirmed: true, idempotency_key: 'PAY-002' },
      { invoice_id: invoicesList[3].id, client_id: clientsList[1].id, payment_date: '2026-07-12', amount: 2420, payment_method: 'credit_card', confirmed: true, idempotency_key: 'PAY-003' },
    ], { onConflict: 'idempotency_key' });

  if (payErr) { console.error('❌ Payments:', payErr.message); return; }
  console.log(`✅ Payments: 3 created`);

  // --- 15. Expenses ---
  const { error: expErr } = await supabase
    .from('expenses')
    .upsert([
      { date: '2026-08-01', vendor_id: vendorsList[0].id, category: 'software', description: 'Zapier — Plan Team', subtotal: 420, tax_amount: 0, total: 420, status: 'paid', paid_at: '2026-08-01T00:00:00Z', payment_account: 'tarjeta_empresa', idempotency_key: 'EXP-001' },
      { date: '2026-08-05', vendor_id: vendorsList[1].id, category: 'advertising', description: 'Meta Ads — Agosto', campaign_id: campaigns[0].id, subtotal: 850, tax_amount: 136, total: 986, status: 'paid', paid_at: '2026-08-05T00:00:00Z', payment_account: 'tarjeta_empresa', idempotency_key: 'EXP-002' },
      { date: '2026-08-05', vendor_id: vendorsList[2].id, category: 'advertising', description: 'Google Ads — Agosto', campaign_id: campaigns[1].id, subtotal: 600, tax_amount: 96, total: 696, status: 'paid', paid_at: '2026-08-05T00:00:00Z', payment_account: 'tarjeta_empresa', idempotency_key: 'EXP-003' },
      { date: '2026-08-10', vendor_id: vendorsList[3].id, category: 'software', description: 'OpenAI API', subtotal: 180, tax_amount: 0, total: 180, status: 'paid', paid_at: '2026-08-10T00:00:00Z', payment_account: 'tarjeta_empresa', idempotency_key: 'EXP-004' },
      { date: '2026-08-15', vendor_id: vendorsList[4].id, category: 'contractor', description: 'Diseño landing pages — Inmobiliaria', client_id: clientsList[0].id, project_id: projectsList[0].id, subtotal: 1500, tax_amount: 240, total: 1740, status: 'paid', paid_at: '2026-08-15T00:00:00Z', payment_account: 'transferencia', idempotency_key: 'EXP-005' },
      { date: '2026-08-20', vendor_id: vendorsList[5].id, category: 'infrastructure', description: 'AWS Hosting — Agosto', subtotal: 250, tax_amount: 0, total: 250, status: 'paid', paid_at: '2026-08-20T00:00:00Z', payment_account: 'tarjeta_empresa', idempotency_key: 'EXP-006' },
    ], { onConflict: 'idempotency_key' });

  if (expErr) { console.error('❌ Expenses:', expErr.message); return; }
  console.log(`✅ Expenses: 6 created`);

  // --- 16. Taxes ---
  const { error: taxErr } = await supabase
    .from('taxes')
    .upsert([
      { type: 'IVA', period_start: '2026-07-01', period_end: '2026-07-31', due_date: '2026-08-17', estimated_amount: 3200, actual_amount: 3156, status: 'paid', paid_at: '2026-08-15T00:00:00Z' },
      { type: 'ISR', period_start: '2026-07-01', period_end: '2026-07-31', due_date: '2026-08-17', estimated_amount: 2800, actual_amount: 2650, status: 'paid', paid_at: '2026-08-15T00:00:00Z' },
      { type: 'IVA', period_start: '2026-08-01', period_end: '2026-08-31', due_date: '2026-09-17', estimated_amount: 2900, status: 'estimated' },
      { type: 'ISR', period_start: '2026-08-01', period_end: '2026-08-31', due_date: '2026-09-17', estimated_amount: 2400, status: 'estimated' },
    ], { onConflict: 'id' });

  if (taxErr) { console.error('❌ Taxes:', taxErr.message); return; }
  console.log(`✅ Taxes: 4 created`);

  // --- 17. Activities ---
  const { error: actErr } = await supabase
    .from('activities')
    .upsert([
      { type: 'meeting', contact_id: contacts[0].id, company_id: companies[0].id, opportunity_id: opps[0].id, owner_id: salesId, occurred_at: '2026-08-20T10:00:00Z', result: 'Interesada en automatizar WhatsApp para 7 clínicas', notes: 'Hablamos de $8,000 setup + $1,500/mes. Enviar propuesta el jueves.', next_action: 'Enviar propuesta', next_action_date: '2026-08-28' },
      { type: 'call', contact_id: contacts[1].id, company_id: companies[1].id, opportunity_id: opps[1].id, owner_id: salesId, occurred_at: '2026-08-22T14:30:00Z', result: 'Confirmó reunión para el martes', next_action: 'Reunión discovery', next_action_date: '2026-08-26' },
      { type: 'proposal', contact_id: contacts[2].id, company_id: companies[2].id, opportunity_id: opps[2].id, owner_id: ownerId, occurred_at: '2026-08-18T11:00:00Z', result: 'Propuesta enviada por $12,000 + $2,000/mes', notes: 'Pidió descuento por pago anual. Evaluar propuesta de 10% descuento.', next_action: 'Negociar descuento', next_action_date: '2026-08-25' },
      { type: 'email', contact_id: contacts[4].id, company_id: companies[4].id, opportunity_id: opps[3].id, owner_id: ownerId, occurred_at: '2026-08-21T09:00:00Z', result: 'Envió información sobre SEO para bufetes de abogados', next_action: 'Agendar reunión', next_action_date: '2026-08-27' },
    ], { onConflict: 'id' });

  if (actErr) { console.error('❌ Activities:', actErr.message); return; }
  console.log(`✅ Activities: 4 created`);

  // --- 18. Withdrawals ---
  const { error: witErr } = await supabase
    .from('withdrawals')
    .upsert([
      { user_id: ownerId, date: '2026-07-30', amount: 5000, type: 'owner_draw', source_account: 'cuenta_principal', notes: 'Retiro mensual julio' },
      { user_id: ownerId, date: '2026-08-15', amount: 3000, type: 'advance', source_account: 'cuenta_principal', notes: 'Adelanto agosto' },
    ], { onConflict: 'id' });

  if (witErr) { console.error('❌ Withdrawals:', witErr.message); return; }
  console.log(`✅ Withdrawals: 2 created`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log('   Pipeline: 4 opportunities open, 2 won');
  console.log('   Clients: 2 active');
  console.log('   MRR: $4,500 (2 subscriptions)');
  console.log('   Invoiced: $37,240');
  console.log('   Collected: $23,220');
  console.log('   Pending: $14,020');
}

seed().catch(console.error);
