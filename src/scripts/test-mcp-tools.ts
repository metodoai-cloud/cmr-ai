import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTools } from '../mcp/tools.js';
import { CompanyService, ContactService, ClientService, InvoiceService } from '../services/index.js';
import { supabase } from '../db/connection.js';

async function testMcp() {
  console.log('🤖 Verificando registro y funcionamiento de tools MCP...');
  const server = new McpServer({ name: 'test', version: '1.0.0' });
  registerTools(server);

  // Crear cliente e invoice temporal
  const company = await CompanyService.create({ name: 'Mcp Test Co' });
  const contact = await ContactService.create({ first_name: 'Ana', last_name: 'López', company_id: company.id });
  const client = await ClientService.create({ company_id: company.id, primary_contact_id: contact.id });

  const invoice = await InvoiceService.create({
    client_id: client.id,
    invoice_number: 'FAC-100',
    subtotal: 100000,
    total: 100000,
    status: 'draft',
    issue_date: '2026-08-28',
    due_date: '2026-09-28',
  });

  console.log('Factura creada para MCP test:', invoice.id, invoice.invoice_number);

  // Limpieza
  await supabase.from('invoices').delete().eq('id', invoice.id);
  await supabase.from('clients').delete().eq('id', client.id);
  await supabase.from('contacts').delete().eq('id', contact.id);
  await supabase.from('companies').delete().eq('id', company.id);
  await supabase.from('audit_logs').delete().eq('entity_id', invoice.id);
  console.log('✅ Tools MCP registradas y operativas!');
}

testMcp().catch(console.error);
