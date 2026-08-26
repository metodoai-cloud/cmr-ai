import { supabase } from '../db/connection.js';
import dotenv from 'dotenv';
dotenv.config();

async function cleanAndKeepOfficial() {
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

  // Set active = false on any service not in official list
  const { data: allServices } = await supabase.from('services').select('*');
  for (const s of allServices || []) {
    if (!officialNames.includes(s.name)) {
      await supabase.from('services').update({ active: false }).eq('id', s.id);
    } else {
      await supabase.from('services').update({ active: true }).eq('id', s.id);
    }
  }

  const { data: activeList } = await supabase.from('services').select('*').eq('active', true);
  console.log(`Catálogo Oficial Activo (${activeList?.length} servicios):`);
  activeList?.forEach(s => {
    console.log(`• [${s.category}] ${s.name} | Setup: $${s.standard_setup_price?.toLocaleString('es-CL')} | MRR: $${s.standard_recurring_price?.toLocaleString('es-CL')}`);
  });
}

cleanAndKeepOfficial();
