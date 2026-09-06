import { supabase } from '../db/connection.js';
import dotenv from 'dotenv';
dotenv.config();

async function syncInvoice84() {
  console.log('🔄 Sincronizando pago para Factura N° 84...');

  // 1. Fetch invoice 84
  const { data: inv, error: invErr } = await supabase
    .from('invoices')
    .select('*')
    .eq('invoice_number', '84')
    .is('deleted_at', null)
    .single();

  if (invErr || !inv) {
    console.error('❌ Error buscando Factura 84:', invErr?.message);
    return;
  }

  console.log(`📄 Factura 84 encontrada: ID ${inv.id}, Estado: ${inv.status}, Total: $${inv.total}`);

  // 2. Check existing payments
  const { data: existingPayments, error: payErr } = await supabase
    .from('payments')
    .select('*')
    .eq('invoice_id', inv.id);

  if (payErr) {
    console.error('❌ Error buscando pagos de factura 84:', payErr.message);
    return;
  }

  const sumPaid = (existingPayments || []).reduce((s: number, p: any) => s + Number(p.amount), 0);
  console.log(`💰 Pagos existentes para Factura 84: ${existingPayments?.length || 0} (Total pagado: $${sumPaid})`);

  if (sumPaid >= Number(inv.total)) {
    console.log('✅ La Factura 84 ya tiene cubierto el pago total.');
    return;
  }

  const amountToPay = Number(inv.total) - sumPaid;
  console.log(`➕ Insertando pago de $${amountToPay} en tabla 'payments'...`);

  const { data: newPayment, error: insertErr } = await supabase
    .from('payments')
    .insert({
      invoice_id: inv.id,
      client_id: inv.client_id,
      amount: amountToPay,
      currency: inv.currency || 'CLP',
      payment_date: inv.issue_date || new Date().toISOString().split('T')[0],
      payment_method: 'Transferencia',
      confirmed: true,
    })
    .select()
    .single();

  if (insertErr) {
    console.error('❌ Error insertando pago:', insertErr.message);
    return;
  }

  console.log(`✅ Pago creado exitosamente con ID: ${newPayment.id}, Monto: $${newPayment.amount}`);
}

syncInvoice84().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
