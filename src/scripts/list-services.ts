import { supabase } from '../db/connection.js';

async function main() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching services:', error.message);
    process.exit(1);
  }

  console.log('--- SERVICIOS EN SUPABASE ---');
  data.forEach((s, idx) => {
    console.log(`${idx + 1}. [${s.category || 'general'}] ${s.name} (Setup: $${s.standard_setup_price} | Recurrente: $${s.standard_recurring_price}/m | Tipo: ${s.billing_type})`);
  });
  process.exit(0);
}

main();
