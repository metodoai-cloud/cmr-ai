import { supabase } from '../db/connection.js';

async function checkOpps() {
  const { data: opps, error } = await supabase
    .from('opportunities')
    .select('id, name, company_id, service_id, companies(id, name), services(id, name)');

  if (error) {
    console.error(error);
    process.exit(1);
  }

  for (const o of opps) {
    console.log(`Opp ID: ${o.id}`);
    console.log(`  opp.name: "${o.name}"`);
    console.log(`  company: "${(o.companies as any)?.name}"`);
    console.log(`  service: "${(o.services as any)?.name}"`);
  }

  process.exit(0);
}

checkOpps();
