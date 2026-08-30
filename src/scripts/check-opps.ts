import { supabase } from '../db/connection.js';

async function main() {
  const { data: opps, error } = await supabase
    .from('opportunities')
    .select('id, name, stage, setup_value, recurring_value, probability, created_at');

  if (error) {
    console.error('Error fetching opportunities:', error);
    process.exit(1);
  }

  console.log('--- OPORTUNIDADES EN SUPABASE ---');
  opps.forEach((o, i) => {
    console.log(`${i + 1}. [${o.stage}] ${o.name} | Setup: $${o.setup_value} | Recurrente: $${o.recurring_value} | Prob: ${o.probability}%`);
  });

  const openOpps = opps.filter(o => o.stage !== 'won' && o.stage !== 'lost');
  console.log('\n--- OPORTUNIDADES ABIERTAS (NO WON / NO LOST) ---');
  openOpps.forEach((o, i) => {
    console.log(`${i + 1}. [${o.stage}] ${o.name} | Setup: $${o.setup_value} | Recurrente: $${o.recurring_value}`);
  });

  process.exit(0);
}

main();
