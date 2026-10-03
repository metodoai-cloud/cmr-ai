import { supabase } from '../db/connection.js';

async function main() {
  console.log('🔄 Checking pilot opportunities and projects...');
  
  // 1. Get all opportunities in stage 'pilot'
  const { data: pilotOpps, error: oppErr } = await supabase
    .from('opportunities')
    .select('id, name, company_id, service_id, owner_id, setup_value, stage')
    .eq('stage', 'pilot');

  if (oppErr) {
    console.error('Error fetching pilot opportunities:', oppErr);
    return;
  }

  console.log(`Found ${pilotOpps?.length || 0} opportunities in stage 'pilot'`);

  // 2. Get existing projects
  const { data: existingProjs } = await supabase.from('projects').select('id, opportunity_id, name');

  for (const opp of pilotOpps || []) {
    const exists = existingProjs?.some(p => p.opportunity_id === opp.id);
    if (!exists) {
      console.log(`Creating project for pilot opportunity: "${opp.name}"...`);
      
      // Look up client for company if exists
      let clientId = null;
      if (opp.company_id) {
        const { data: clients } = await supabase.from('clients').select('id').eq('company_id', opp.company_id);
        if (clients && clients.length > 0) clientId = clients[0].id;
      }

      const { data: newProj, error: createErr } = await supabase.from('projects').insert({
        opportunity_id: opp.id,
        client_id: clientId,
        service_id: opp.service_id,
        owner_id: opp.owner_id,
        name: opp.name,
        start_date: new Date().toISOString().split('T')[0],
        status: 'in_progress',
        sold_price: opp.setup_value || 0,
      }).select().single();

      if (createErr) {
        console.error(`Error creating project for "${opp.name}":`, createErr);
      } else {
        console.log(`✅ Project created: ID ${newProj.id} - "${newProj.name}"`);
      }
    } else {
      console.log(`Project already exists for "${opp.name}"`);
    }
  }

  console.log('Done!');
}

main().catch(console.error);
