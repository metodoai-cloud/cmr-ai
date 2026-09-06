import { supabase } from '../db/connection.js';
import dotenv from 'dotenv';
dotenv.config();

async function removeOrphanedPayment() {
  const orphanedId = 'e20a6c32-b3d4-4a31-af9b-e09720587ff6';
  console.log(`🗑️ Eliminando pago huérfano ID: ${orphanedId}...`);
  
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', orphanedId);

  if (error) {
    console.error('❌ Error eliminando pago:', error.message);
    return;
  }
  console.log('✅ Pago huérfano eliminado con éxito de Supabase.');
}

removeOrphanedPayment().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
