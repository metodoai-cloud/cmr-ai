import { supabase } from '../db/connection.js';

async function main() {
  const tables = [
    'users', 'companies', 'contacts', 'leads', 'opportunities',
    'activities', 'services', 'clients', 'projects', 'subscriptions',
    'campaigns', 'hooks', 'invoices', 'payments', 'expenses',
    'taxes', 'withdrawals', 'business_events', 'audit_logs', 'organizations',
    'agency_profiles', 'customer_profiles', 'entry_offers', 'entry_offer_services',
    'messaging_frameworks', 'sales_playbooks', 'sales_playbook_steps', 'sales_objections'
  ];

  console.log('=== INSPECCIÓN DE TABLAS EN SUPABASE ===');
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`❌ ${t}: NO EXISTE o ERROR (${error.message})`);
    } else {
      const sample = data && data.length > 0 ? Object.keys(data[0]) : '(tabla vacía)';
      console.log(`✅ ${t}: EXISTE - Columnas ejemplo:`, sample);
    }
  }

  // Check opportunities columns specifically
  console.log('\n=== MUESTRA DETALLADA DE OPPORTUNITIES ===');
  const { data: opps } = await supabase.from('opportunities').select('*').limit(1);
  if (opps && opps.length > 0) {
    console.log('Columnas de opportunities:', Object.keys(opps[0]));
    console.log('Ejemplo opp:', opps[0]);
  }

  // Check activities columns specifically
  console.log('\n=== MUESTRA DETALLADA DE ACTIVITIES ===');
  const { data: acts } = await supabase.from('activities').select('*').limit(1);
  if (acts && acts.length > 0) {
    console.log('Columnas de activities:', Object.keys(acts[0]));
    console.log('Ejemplo activity:', acts[0]);
  }

  // Check services columns specifically
  console.log('\n=== MUESTRA DETALLADA DE SERVICES ===');
  const { data: srvs } = await supabase.from('services').select('*').limit(1);
  if (srvs && srvs.length > 0) {
    console.log('Columnas de services:', Object.keys(srvs[0]));
  }
}

main().catch(console.error);
