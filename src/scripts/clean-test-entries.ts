import { supabase } from '../db/connection.js';

async function main() {
  const { data: comp } = await supabase.from('companies').select('id, name').ilike('name', '%Test%');
  for (const c of comp || []) {
    const { data: cl } = await supabase.from('clients').select('id').eq('company_id', c.id);
    for (const client of cl || []) {
      await supabase.from('invoices').delete().eq('client_id', client.id);
      await supabase.from('clients').delete().eq('id', client.id);
    }
    await supabase.from('contacts').delete().eq('company_id', c.id);
    await supabase.from('companies').delete().eq('id', c.id);
    console.log('Eliminada empresa test:', c.name);
  }
  console.log('Limpieza completada.');
}

main().catch(console.error);
