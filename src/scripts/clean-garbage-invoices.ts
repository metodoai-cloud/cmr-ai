import { supabase } from '../db/connection.js';

async function main() {
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, total, status, issue_date, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error al consultar facturas:', error);
    return;
  }

  console.log('--- FACTURAS ENCONTRADAS ---');
  for (const inv of invoices || []) {
    console.log(`ID: ${inv.id} | Folio: ${inv.invoice_number} | Total: $${inv.total} | Estado: ${inv.status} | Creada: ${inv.created_at}`);
  }

  // Eliminar facturas de prueba con total 0 y estado cancelled
  const garbage = (invoices || []).filter(inv => Number(inv.total) === 0 || (inv.status === 'cancelled' && Number(inv.total) === 0));
  
  for (const g of garbage) {
    console.log(`🗑️ Eliminando factura basura: ID ${g.id} (Folio: ${g.invoice_number}, Total: ${g.total})`);
    // Borrar pagos asociados si hubiera
    await supabase.from('payments').delete().eq('invoice_id', g.id);
    const { error: delErr } = await supabase.from('invoices').delete().eq('id', g.id);
    if (delErr) {
      console.error(`Error al borrar factura ${g.id}:`, delErr);
    } else {
      console.log(`✅ Factura ${g.id} eliminada correctamente.`);
    }
  }

  // Listar estado final
  const { data: finalInvoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, total, status, issue_date')
    .order('created_at', { ascending: true });

  console.log('\n--- FACTURAS RESTANTES (SOLO LAS REALES) ---');
  for (const inv of finalInvoices || []) {
    console.log(`ID: ${inv.id} | Folio: ${inv.invoice_number} | Total: $${inv.total} | Estado: ${inv.status}`);
  }
}

main().catch(console.error);
