import { supabase } from '../db/connection.js';

async function fixProjectPrices() {
  console.log('--- REVISANDO Y SINCRONIZANDO PRECIOS DE PROYECTOS CON OPORTUNIDADES ---');

  // 1. Get all projects with opportunities
  const { data: projs, error } = await supabase
    .from('projects')
    .select('id, name, sold_price, opportunity_id, opportunities(id, name, setup_value, recurring_value)');

  if (error) {
    console.error('Error fetching projects:', error);
    process.exit(1);
  }

  for (const p of projs) {
    const opp = Array.isArray(p.opportunities) ? p.opportunities[0] : p.opportunities;
    if (opp && opp.setup_value !== undefined) {
      const netSetup = Number(opp.setup_value);
      console.log(`Proyecto: "${p.name}"`);
      console.log(`  - Precio actual en projects: $${Number(p.sold_price).toLocaleString('es-CL')}`);
      console.log(`  - Setup en oportunidad (Pipeline): $${netSetup.toLocaleString('es-CL')}`);

      if (Number(p.sold_price) !== netSetup) {
        console.log(`  -> Actualizando sold_price a $${netSetup.toLocaleString('es-CL')} para igualar al Pipeline...`);
        const { error: updateErr } = await supabase
          .from('projects')
          .update({ sold_price: netSetup })
          .eq('id', p.id);

        if (updateErr) console.error('  Error updating project:', updateErr);
        else console.log('  ✅ Actualizado con éxito.');
      } else {
        console.log('  ✅ Ya coincide.');
      }
    }
  }

  process.exit(0);
}

fixProjectPrices();
