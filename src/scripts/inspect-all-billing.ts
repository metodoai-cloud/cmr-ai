import { supabase } from '../db/connection.js';
import dotenv from 'dotenv';
dotenv.config();

async function inspect() {
  console.log('=== INVOICES ===');
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, client_id, subtotal, tax_amount, total, status, deleted_at, clients(companies(name))')
    .order('created_at');

  for (const inv of invoices || []) {
    const compName = (inv.clients as any)?.companies?.name || 'Sin empresa';
    console.log(`ID: ${inv.id} | N°: ${inv.invoice_number || 'S/N'} | Empresa: ${compName} | Total: $${Number(inv.total).toLocaleString('es-CL')} | Status: ${inv.status} | Deleted: ${inv.deleted_at || 'No'}`);
  }

  console.log('\n=== PAYMENTS ===');
  const { data: payments } = await supabase
    .from('payments')
    .select('id, invoice_id, client_id, amount, payment_date, created_at')
    .order('created_at');

  let sum = 0;
  for (const p of payments || []) {
    sum += Number(p.amount);
    console.log(`ID: ${p.id} | InvID: ${p.invoice_id} | Amount: $${Number(p.amount).toLocaleString('es-CL')} | Date: ${p.payment_date} | Created: ${p.created_at}`);
  }
  console.log(`\nTOTAL SUM OF PAYMENTS: $${sum.toLocaleString('es-CL')}`);
}

inspect().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
