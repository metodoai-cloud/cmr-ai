import { supabase } from '../db/connection.js';
import dotenv from 'dotenv';
dotenv.config();

async function deduplicate() {
  const { data: services } = await supabase.from('services').select('*').order('created_at', { ascending: true });
  const seen = new Set<string>();
  const toDelete: string[] = [];

  for (const s of services || []) {
    if (seen.has(s.name)) {
      toDelete.push(s.id);
    } else {
      seen.add(s.name);
    }
  }

  console.log(`Eliminando ${toDelete.length} duplicados...`);
  for (const id of toDelete) {
    await supabase.from('services').delete().eq('id', id);
  }

  const { data: remaining } = await supabase.from('services').select('*').order('name');
  console.log(`\n🎉 Catálogo limpio y único (${remaining?.length} servicios):`);
  remaining?.forEach((s, idx) => {
    console.log(`${idx + 1}. [${s.category}] ${s.name} | Setup: $${(s.standard_setup_price || 0).toLocaleString('es-CL')} | MRR: $${(s.standard_recurring_price || 0).toLocaleString('es-CL')}/mes | Tipo: ${s.billing_type}`);
  });
}

deduplicate();
