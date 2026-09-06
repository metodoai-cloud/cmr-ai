import { supabase } from '../db/connection.js';
import dotenv from 'dotenv';
dotenv.config();

async function testFix() {
  console.log('🔍 Identificando pago huérfano...');
  const orphanedId = 'e20a6c32-b3d4-4a31-af9b-e09720587ff6';
  
  const { data: p } = await supabase.from('payments').select('*, invoices(*)').eq('id', orphanedId).single();
  console.log('Pago huérfano:', p?.id, 'Monto:', p?.amount, 'Factura vinculada:', p?.invoices?.invoice_number, 'Deleted at:', p?.invoices?.deleted_at);

  // Remaining payments if deleted
  const { data: allP } = await supabase.from('payments').select('*').neq('id', orphanedId);
  const sum = allP?.reduce((s, x) => s + Number(x.amount), 0) || 0;
  console.log('\nSuma de pagos activos reales:', sum);
  allP?.forEach(x => console.log(`- Factura ID: ${x.invoice_id} -> $${Number(x.amount).toLocaleString('es-CL')}`));
}

testFix().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
