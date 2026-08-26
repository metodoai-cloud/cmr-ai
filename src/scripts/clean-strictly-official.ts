import { supabase } from '../db/connection.js';
import dotenv from 'dotenv';
dotenv.config();

async function clean() {
  const officialNames = [
    'Creación de Empresa desde Cero — Starter',
    'Creación de Empresa desde Cero — VIP',
    'Diagnóstico y Documentación de Procesos',
    'Automatización de Procesos',
    '1 Automatización Puntual',
    '2 Automatizaciones Puntuales',
    '3 Automatizaciones Puntuales',
    'Marketing / Campaña',
    'Desarrollo de Producto / Web App',
  ];

  // Delete non-official services
  const { data: all } = await supabase.from('services').select('id, name');
  for (const s of all || []) {
    if (!officialNames.includes(s.name)) {
      // First update any leads referencing this service to null
      await supabase.from('leads').update({ service_id: null }).eq('service_id', s.id);
      await supabase.from('opportunities').update({ service_id: null }).eq('service_id', s.id);
      await supabase.from('projects').update({ service_id: null }).eq('service_id', s.id);
      await supabase.from('subscriptions').update({ service_id: null }).eq('service_id', s.id);
      await supabase.from('services').delete().eq('id', s.id);
      console.log(`Eliminado servicio no oficial: ${s.name}`);
    }
  }

  const { data: official } = await supabase.from('services').select('*').order('standard_setup_price');
  console.log(`\n🎉 Catálogo Oficial Definitivo (${official?.length} servicios):`);
  official?.forEach((s, idx) => {
    console.log(`${idx + 1}. [${s.category}] ${s.name} | Setup: $${(s.standard_setup_price || 0).toLocaleString('es-CL')} | MRR: $${(s.standard_recurring_price || 0).toLocaleString('es-CL')}/mes | Tipo: ${s.billing_type}`);
  });
}

clean();
