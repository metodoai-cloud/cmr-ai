import { supabase } from '../db/connection.js';

async function main() {
  const { data, error } = await supabase.from('services').select('*');
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  console.log('=== SERVICIOS EN SUPABASE ===');
  data.forEach((s: any, idx: number) => {
    console.log(`[${idx + 1}] ID: ${s.id} | NAME: "${s.name}" | CATEGORY: "${s.category}" | SETUP: ${s.standard_setup_price} | MRR: ${s.standard_recurring_price}`);
  });
  process.exit(0);
}

main();
