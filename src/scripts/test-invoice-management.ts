import { InvoiceService, PaymentService, ClientService, CompanyService, ContactService } from '../services/index.js';
import { supabase } from '../db/connection.js';

async function runTests() {
  console.log('🧪 Iniciando pruebas de creación, edición y personalización de facturas...\n');

  // 1. Crear datos temporales para la prueba
  const company = await CompanyService.create({ name: 'Empresa Test Facturas' });
  const contact = await ContactService.create({ first_name: 'Juan', last_name: 'Pérez', company_id: company.id });
  const client = await ClientService.create({ company_id: company.id, primary_contact_id: contact.id });
  console.log(`✅ Cliente temporal creado (ID: ${client.id})`);

  // Test 1: Crear factura sin invoice_number (debe quedar null / vacío)
  const invNoNumber = await InvoiceService.create({
    client_id: client.id,
    subtotal: 100000,
    tax_amount: 19000,
    total: 119000,
  });
  console.log('\n--- Test 1: Factura sin invoice_number ---');
  console.log('ID:', invNoNumber.id);
  console.log('invoice_number:', invNoNumber.invoice_number, '(Esperado: null)');
  if (invNoNumber.invoice_number !== null) {
    throw new Error('Test 1 falló: invoice_number no es null');
  }
  console.log('✅ Test 1 superado exitosamente!');

  // Test 2: Crear factura con folio personalizado
  const invWithNumber = await InvoiceService.create({
    client_id: client.id,
    invoice_number: 'FAC-7701',
    subtotal: 500000,
    tax_amount: 95000,
    total: 595000,
    due_date: '2026-09-30',
    notes: 'Factura oficial con folio del SII',
  });
  console.log('\n--- Test 2: Factura con invoice_number personalizado ---');
  console.log('ID:', invWithNumber.id);
  console.log('invoice_number:', invWithNumber.invoice_number, '(Esperado: FAC-7701)');
  if (invWithNumber.invoice_number !== 'FAC-7701') {
    throw new Error('Test 2 falló: invoice_number no coincide con FAC-7701');
  }
  console.log('✅ Test 2 superado exitosamente!');

  // Test 3: Actualizar la factura (editar folio a FAC-7702, cambiar fecha y notas)
  const updatedInv = await InvoiceService.update(invWithNumber.id, {
    invoice_number: 'FAC-7702',
    due_date: '2026-10-15',
    notes: 'Folio corregido a FAC-7702',
    status: 'issued',
  });
  console.log('\n--- Test 3: Actualizar factura con InvoiceService.update ---');
  console.log('ID:', updatedInv.id);
  console.log('invoice_number actualizado:', updatedInv.invoice_number, '(Esperado: FAC-7702)');
  console.log('Estado actualizado:', updatedInv.status, '(Esperado: issued)');
  console.log('Vencimiento:', updatedInv.due_date, '(Esperado: 2026-10-15)');
  if (updatedInv.invoice_number !== 'FAC-7702' || updatedInv.status !== 'issued') {
    throw new Error('Test 3 falló: la actualización de la factura no coincidió con los datos esperados');
  }
  console.log('✅ Test 3 superado exitosamente!');

  // Test 4: Registrar un pago parcial y verificar cálculo de Monto Pagado y Saldo
  const payment = await PaymentService.register({
    invoice_id: updatedInv.id,
    client_id: client.id,
    amount: 200000,
    payment_method: 'bank_transfer',
  });
  console.log('\n--- Test 4: Registrar pago parcial ---');
  console.log('Pago ID:', payment.id, 'Monto: $', payment.amount);

  const enrichedInvoices = await InvoiceService.getAll({ client_id: client.id });
  const targetInv = enrichedInvoices.find((i: any) => i.id === updatedInv.id);
  console.log('Factura con pagos enriquecidos:');
  console.log('- Total:', targetInv?.total);
  console.log('- Monto Pagado:', targetInv?.paid_amount, '(Esperado: 200000)');
  console.log('- Saldo Restante:', targetInv?.pending_amount, '(Esperado: 395000)');
  console.log('- Estado automático:', targetInv?.status, '(Esperado: partial)');
  if (targetInv?.paid_amount !== 200000 || targetInv?.pending_amount !== 395000 || targetInv?.status !== 'partial') {
    throw new Error('Test 4 falló: el cálculo de pagos o estado no es correcto');
  }
  console.log('✅ Test 4 superado exitosamente!');

  // 5. Limpieza de datos de prueba
  console.log('\n🧹 Limpiando registros temporales de prueba...');
  await supabase.from('payments').delete().eq('id', payment.id);
  await supabase.from('invoices').delete().in('id', [invNoNumber.id, invWithNumber.id]);
  await supabase.from('clients').delete().eq('id', client.id);
  await supabase.from('contacts').delete().eq('id', contact.id);
  await supabase.from('companies').delete().eq('id', company.id);
  await supabase.from('audit_logs').delete().in('entity_id', [invNoNumber.id, invWithNumber.id]);
  console.log('✨ Base de datos limpia y todos los tests superados con 100% de éxito!\n');
}

runTests().catch((e) => {
  console.error('❌ Error en tests:', e);
  process.exit(1);
});
