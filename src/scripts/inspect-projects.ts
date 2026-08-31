import { supabase } from '../db/connection.js';

async function main() {
  const { data: projs, error } = await supabase
    .from('projects')
    .select('*, clients(*, companies(*)), opportunities(*, companies(*))');

  if (error) {
    console.error('Error fetching projects:', error);
    process.exit(1);
  }

  console.log('--- PROYECTOS EN SUPABASE ---');
  projs.forEach((p, idx) => {
    console.log(`${idx + 1}. ID: ${p.id}`);
    console.log(`   Name: ${p.name}`);
    console.log(`   Client:`, JSON.stringify(p.clients));
    console.log(`   Opportunity:`, JSON.stringify(p.opportunities));
    console.log(`   Sold Price: ${p.sold_price} | Start: ${p.start_date} | Due: ${p.due_date} | Status: ${p.status}`);
  });
  process.exit(0);
}

main();
