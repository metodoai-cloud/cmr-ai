import { supabase } from '../db/connection.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkOpps() {
  const { data: opps } = await supabase
    .from('opportunities')
    .select('id, name, stage, setup_value, recurring_value, probability, companies(name)')
    .order('created_at');

  console.log('=== TODAS LAS OPORTUNIDADES EN SUPABASE ===');
  let openSum = 0;
  let wonSum = 0;
  let openCount = 0;

  for (const o of opps || []) {
    const comp = (o.companies as any)?.name || 'Sin empresa';
    const totalVal = Number(o.setup_value || 0) + Number(o.recurring_value || 0);
    const isOpen = !['won', 'lost'].includes(o.stage);
    if (isOpen) {
      openSum += totalVal;
      openCount++;
    } else if (o.stage === 'won') {
      wonSum += totalVal;
    }
    console.log(`• [${o.stage.toUpperCase()}] "${o.name}" (Empresa: ${comp}) | Setup: $${Number(o.setup_value).toLocaleString('es-CL')} | Rec: $${Number(o.recurring_value).toLocaleString('es-CL')} | Prob: ${Number(o.probability) * 100}% | ${isOpen ? '👉 ABIERTA' : 'CERRADA'}`);
  }

  console.log('\n=== RESUMEN PIPELINE ===');
  console.log(`Oportunidades Abiertas (${openCount}): $${openSum.toLocaleString('es-CL')}`);
  console.log(`Oportunidades Ganadas: $${wonSum.toLocaleString('es-CL')}`);
}

checkOpps().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
