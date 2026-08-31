import { supabase } from '../db/connection.js';

async function fixGafOpp() {
  console.log('--- ACTUALIZANDO NOMBRE DE OPORTUNIDAD GAF EXTERNA ---');

  const { data, error } = await supabase
    .from('opportunities')
    .update({ name: 'GAF Externa — Creación de Empresa desde Cero (Starter)' })
    .eq('id', '1ff6509d-d2ad-4322-a485-048a669efbfd')
    .select();

  if (error) {
    console.error('Error actualizando:', error);
    process.exit(1);
  }

  console.log('✅ Oportunidad actualizada:', data);
  process.exit(0);
}

fixGafOpp();
