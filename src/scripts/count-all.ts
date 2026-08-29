import { supabase } from '../db/connection.js';

async function countAll() {
  const tables = [
    'audit_logs',
    'business_events',
    'withdrawals',
    'taxes',
    'expenses',
    'payments',
    'invoices',
    'vendors',
    'subscriptions',
    'projects',
    'clients',
    'activities',
    'opportunities',
    'leads',
    'contacts',
    'hooks',
    'campaigns',
    'services',
    'companies',
    'users',
  ];

  console.log('--- RECUENTO ACTUAL EN BASE DE DATOS ---');
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`${table}: ERROR (${error.message})`);
    } else {
      console.log(`${table}: ${count} registros`);
    }
  }
}

countAll().catch(console.error);
