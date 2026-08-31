// ============================================================================
// MCP Server — Model Context Protocol for Claude Integration
// Exposes CRM tools as structured functions Claude can call
// ============================================================================

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

// Ensure Supabase env is loaded before importing services
import {
  ContactService, CompanyService, LeadService, OpportunityService,
  ActivityService, ClientService, InvoiceService, PaymentService,
  ExpenseService, TaxService, WithdrawalService, AnalyticsService,
  VendorService, CampaignService, HookService, ServiceCatalog,
  SubscriptionService, ProjectService,
} from '../services/index.js';

export const server = new McpServer({
  name: 'crm-ai',
  version: '1.0.0',
});

// Format dates as DD-MM-YYYY
function formatDateCL(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  const clean = String(dateStr).split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

// ============================================================================
// CRM TOOLS
// ============================================================================

// --- buscar_contacto ---
server.tool(
  'buscar_contacto',
  'Buscar contactos por nombre, email o teléfono. Usar antes de crear uno nuevo para evitar duplicados.',
  { nombre: z.string().describe('Nombre, apellido o email del contacto a buscar') },
  async ({ nombre }) => {
    const results = await ContactService.search(nombre);
    return {
      content: [{
        type: 'text' as const,
        text: results.length > 0
          ? JSON.stringify(results, null, 2)
          : `No se encontraron contactos con "${nombre}".`,
      }],
    };
  }
);

// --- crear_contacto ---
server.tool(
  'crear_contacto',
  'Crear un nuevo contacto en el CRM. Buscar primero para evitar duplicados.',
  {
    first_name: z.string().describe('Nombre del contacto'),
    last_name: z.string().optional().describe('Apellido del contacto'),
    email: z.string().optional().describe('Email'),
    phone: z.string().optional().describe('Teléfono'),
    whatsapp: z.string().optional().describe('WhatsApp'),
    company_id: z.string().optional().describe('ID de la empresa asociada'),
    job_title: z.string().optional().describe('Cargo o puesto'),
    original_source: z.string().optional().describe('Fuente de origen (meta_ads, google_ads, referral, etc.)'),
  },
  async (data) => {
    const contact = await ContactService.create(data, 'mcp');
    return {
      content: [{ type: 'text' as const, text: `✅ Contacto creado: ${contact.first_name} ${contact.last_name || ''} (ID: ${contact.id})` }],
    };
  }
);

// --- actualizar_contacto ---
server.tool(
  'actualizar_contacto',
  'Actualizar datos de un contacto existente.',
  {
    id: z.string().describe('ID del contacto a actualizar'),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    job_title: z.string().optional(),
    status: z.enum(['prospect', 'client', 'former_client']).optional(),
  },
  async ({ id, ...data }) => {
    const contact = await ContactService.update(id, data, 'mcp');
    return {
      content: [{ type: 'text' as const, text: `✅ Contacto actualizado: ${contact.first_name} ${contact.last_name || ''}` }],
    };
  }
);

// --- buscar_empresa ---
server.tool(
  'buscar_empresa',
  'Buscar empresas por nombre.',
  { nombre: z.string().describe('Nombre de la empresa') },
  async ({ nombre }) => {
    const results = await CompanyService.search(nombre);
    return {
      content: [{
        type: 'text' as const,
        text: results.length > 0
          ? JSON.stringify(results, null, 2)
          : `No se encontraron empresas con "${nombre}".`,
      }],
    };
  }
);

// --- crear_empresa ---
server.tool(
  'crear_empresa',
  'Crear una nueva empresa.',
  {
    name: z.string().describe('Nombre de la empresa'),
    industry: z.string().optional().describe('Industria o sector'),
    company_size: z.string().optional().describe('Tamaño (1-10, 10-50, 50-200, 200+)'),
    country: z.string().optional(),
    city: z.string().optional(),
    website: z.string().optional(),
  },
  async (data) => {
    const company = await CompanyService.create(data, 'mcp');
    return {
      content: [{ type: 'text' as const, text: `✅ Empresa creada: ${company.name} (ID: ${company.id})` }],
    };
  }
);

// --- actualizar_empresa ---
server.tool(
  'actualizar_empresa',
  'Actualizar datos de una empresa en el CRM (industria, nombre, sitio web, RUT, ubicación).',
  {
    id: z.string().describe('ID de la empresa a actualizar'),
    name: z.string().optional().describe('Nombre de la empresa'),
    industry: z.string().optional().describe('Industria o sector (ej: Minería, SaaS, Retail, Salud)'),
    website: z.string().optional().describe('Sitio web'),
    tax_id: z.string().optional().describe('RUT o identificación fiscal'),
    city: z.string().optional().describe('Ciudad'),
    country: z.string().optional().describe('País'),
  },
  async ({ id, ...data }) => {
    const company = await CompanyService.update(id, data, 'mcp');
    return {
      content: [{
        type: 'text' as const,
        text: `✅ Empresa "${company.name}" actualizada con éxito (ID: ${company.id})\n- Industria: ${company.industry || 'Sin definir'}\n- Web: ${company.website || 'Sin definir'}`,
      }],
    };
  }
);

// --- crear_lead ---
server.tool(
  'crear_lead',
  'Registrar un nuevo lead asociado a un contacto y campaña.',
  {
    contact_id: z.string().describe('ID del contacto'),
    company_id: z.string().optional().describe('ID de la empresa'),
    source: z.string().optional().describe('Fuente (meta_ads, google_ads, referral, organic, etc.)'),
    channel: z.string().optional().describe('Canal específico'),
    campaign_id: z.string().optional().describe('ID de la campaña'),
    hook_id: z.string().optional().describe('ID del gancho'),
    service_id: z.string().optional().describe('ID del servicio de interés'),
  },
  async (data) => {
    const lead = await LeadService.create(data, 'mcp');
    return {
      content: [{ type: 'text' as const, text: `✅ Lead creado (ID: ${lead.id})` }],
    };
  }
);

// --- crear_oportunidad ---
server.tool(
  'crear_oportunidad',
  'Crear una nueva oportunidad de venta en el pipeline.',
  {
    name: z.string().describe('Nombre descriptivo de la oportunidad'),
    contact_id: z.string().optional().describe('ID del contacto'),
    company_id: z.string().optional().describe('ID de la empresa'),
    service_id: z.string().optional().describe('ID del servicio'),
    setup_value: z.number().optional().describe('Valor de implementación/setup'),
    recurring_value: z.number().optional().describe('Valor recurrente mensual'),
    currency: z.string().optional().default('USD'),
    probability: z.number().optional().describe('Probabilidad de cierre (0 a 1)'),
    estimated_close_date: z.string().optional().describe('Fecha estimada de cierre (YYYY-MM-DD)'),
    campaign_id: z.string().optional(),
    hook_id: z.string().optional(),
    next_action: z.string().optional().describe('Próxima acción a realizar'),
    next_action_date: z.string().optional().describe('Fecha de la próxima acción (YYYY-MM-DD)'),
  },
  async (data) => {
    const opp = await OpportunityService.create(data, 'mcp');
    return {
      content: [{ type: 'text' as const, text: `✅ Oportunidad creada: ${opp.name} ($${opp.setup_value} + $${opp.recurring_value}/mes) — ID: ${opp.id}` }],
    };
  }
);

// --- mover_oportunidad ---
server.tool(
  'mover_oportunidad',
  'Mover una oportunidad a una nueva etapa del pipeline.',
  {
    id: z.string().describe('ID de la oportunidad'),
    stage: z.enum(['new', 'contacted', 'qualified', 'meeting_scheduled', 'meeting_completed', 'proposal_sent', 'negotiation'])
      .describe('Nueva etapa del pipeline'),
  },
  async ({ id, stage }) => {
    const opp = await OpportunityService.moveStage(id, stage, 'mcp');
    return {
      content: [{ type: 'text' as const, text: `✅ Oportunidad "${opp.name}" movida a: ${stage}` }],
    };
  }
);

// --- cerrar_oportunidad ---
server.tool(
  'cerrar_oportunidad',
  'Cerrar una oportunidad como GANADA o PERDIDA. Si es GANADA, automáticamente crea cliente, proyecto, suscripción y factura.',
  {
    id: z.string().describe('ID de la oportunidad'),
    outcome: z.enum(['won', 'lost']).describe('Resultado: won (ganada) o lost (perdida)'),
    lost_reason: z.string().optional().describe('Motivo de pérdida (solo si outcome es lost)'),
  },
  async ({ id, outcome, lost_reason }) => {
    const result = await OpportunityService.closeOpportunity(id, outcome, lost_reason, 'mcp');
    if (outcome === 'lost') {
      return {
        content: [{ type: 'text' as const, text: `⛔ Oportunidad marcada como PERDIDA. Motivo: ${lost_reason || 'No especificado'}` }],
      };
    }
    let summary = `🎉 ¡Oportunidad GANADA!\n\n`;
    summary += `• Cliente: ${result.client ? 'Creado/Actualizado' : 'N/A'}\n`;
    summary += `• Proyecto: ${result.project ? `${result.project.name} ($${result.project.sold_price})` : 'N/A'}\n`;
    summary += `• Suscripción: ${result.subscription ? `$${result.subscription.amount}/mes` : 'N/A'}\n`;
    summary += `• Factura: ${result.invoice ? `${result.invoice.invoice_number} — $${result.invoice.total}` : 'N/A'}\n`;
    return {
      content: [{ type: 'text' as const, text: summary }],
    };
  }
);

// --- actualizar_oportunidad ---
server.tool(
  'actualizar_oportunidad',
  'Modificar o actualizar cualquier campo de una oportunidad existente en el pipeline (nombre, montos, etapa, notas, etc.).',
  {
    id: z.string().describe('ID de la oportunidad a actualizar'),
    name: z.string().optional().describe('Nuevo nombre de la oportunidad'),
    stage: z.enum(['new', 'contacted', 'qualified', 'meeting_scheduled', 'meeting_completed', 'proposal_sent', 'negotiation', 'won', 'lost']).optional().describe('Nueva etapa del pipeline'),
    setup_value: z.number().optional().describe('Valor de setup / implementación'),
    recurring_value: z.number().optional().describe('Valor recurrente mensual (MRR)'),
    service_id: z.string().optional().describe('ID del servicio asociado'),
    probability: z.number().optional().describe('Probabilidad de éxito o cierre en porcentaje (0 a 100)'),
    notes: z.string().optional().describe('Notas o comentarios'),
    next_action: z.string().optional().describe('Próxima acción'),
    next_action_date: z.string().optional().describe('Fecha de próxima acción (YYYY-MM-DD)'),
  },
  async ({ id, ...data }) => {
    const opp = await OpportunityService.update(id, data, 'mcp');
    return {
      content: [{ type: 'text' as const, text: `✅ Oportunidad actualizada: "${opp.name}" (Etapa: ${opp.stage}, Setup: $${opp.setup_value}, MRR: $${opp.recurring_value}/mes)` }],
    };
  }
);

// --- eliminar_oportunidad ---
server.tool(
  'eliminar_oportunidad',
  'Eliminar permanentemente una oportunidad del pipeline de ventas por su ID.',
  {
    id: z.string().describe('ID de la oportunidad a eliminar'),
  },
  async ({ id }) => {
    await OpportunityService.delete(id, 'mcp');
    return {
      content: [{ type: 'text' as const, text: `🗑️ Oportunidad eliminada permanentemente del CRM (ID: ${id}).` }],
    };
  }
);

// --- registrar_actividad ---
server.tool(
  'registrar_actividad',
  'Registrar una actividad comercial (reunión, llamada, email, propuesta, nota, etc.).',
  {
    type: z.enum(['call', 'email', 'whatsapp', 'meeting', 'demo', 'follow_up', 'proposal', 'task', 'note'])
      .describe('Tipo de actividad'),
    contact_id: z.string().optional().describe('ID del contacto'),
    company_id: z.string().optional().describe('ID de la empresa'),
    opportunity_id: z.string().optional().describe('ID de la oportunidad relacionada'),
    result: z.string().optional().describe('Resultado o resumen de la actividad'),
    notes: z.string().optional().describe('Notas adicionales'),
    next_action: z.string().optional().describe('Próxima acción a realizar'),
    next_action_date: z.string().optional().describe('Fecha de la próxima acción (YYYY-MM-DD)'),
  },
  async (data) => {
    const activity = await ActivityService.create(data, 'mcp');
    return {
      content: [{ type: 'text' as const, text: `✅ Actividad registrada: ${data.type} (ID: ${activity.id})` }],
    };
  }
);

// ============================================================================
// FINANCE TOOLS
// ============================================================================

// --- crear_factura ---
server.tool(
  'crear_factura',
  'Crear una nueva factura para un cliente en el CRM. El monto total incluye IVA del 19% por defecto y el sistema desglosa el Neto automáticamente.',
  {
    client_id: z.string().describe('ID del cliente'),
    invoice_number: z.string().optional().describe('Número o folio de la factura (ej: 1042 o FAC-1042). Si se omite, queda vacío.'),
    total: z.number().optional().describe('Total de la factura (con IVA incluido)'),
    subtotal: z.number().optional().describe('Subtotal neto (si no se especifica total)'),
    tax_amount: z.number().optional().describe('Monto de impuestos (opcional, por defecto 19% IVA)'),
    currency: z.string().optional().default('CLP'),
    status: z.enum(['draft', 'issued', 'sent', 'partial', 'paid', 'overdue', 'cancelled', 'void']).optional().default('draft'),
    issue_date: z.string().optional().describe('Fecha de emisión (YYYY-MM-DD o DD-MM-YYYY)'),
    due_date: z.string().optional().describe('Fecha de vencimiento (YYYY-MM-DD o DD-MM-YYYY)'),
    project_id: z.string().optional(),
    subscription_id: z.string().optional(),
    notes: z.string().optional(),
  },
  async (data) => {
    const invoice = await InvoiceService.create(data, 'mcp');
    const folioText = invoice.invoice_number ? `N° ${invoice.invoice_number}` : 'Sin Folio';
    return {
      content: [{
        type: 'text' as const,
        text: `✅ Factura ${folioText} creada exitosamente (ID: ${invoice.id})\n- Total (con IVA): $${(Number(invoice.total) || 0).toLocaleString('es-CL')}\n- Neto: $${(Number(invoice.subtotal) || 0).toLocaleString('es-CL')} | IVA (19%): $${(Number(invoice.tax_amount) || 0).toLocaleString('es-CL')}\n- Monto Pagado: $${(invoice.paid_amount || 0).toLocaleString('es-CL')}\n- Emisión: ${formatDateCL(invoice.issue_date)}\n- Vencimiento: ${formatDateCL(invoice.due_date)}\n- Estado: "${invoice.status}"`,
      }],
    };
  }
);

// --- actualizar_factura ---
server.tool(
  'actualizar_factura',
  'Actualizar datos de una factura existente, incluyendo folio (invoice_number), estado, fechas o montos.',
  {
    id: z.string().describe('ID de la factura a actualizar'),
    invoice_number: z.string().optional().describe('Número o folio de la factura'),
    status: z.enum(['draft', 'issued', 'sent', 'partial', 'paid', 'overdue', 'cancelled', 'void']).optional().describe('Estado de la factura'),
    issue_date: z.string().optional().describe('Fecha de emisión (YYYY-MM-DD o DD-MM-YYYY)'),
    due_date: z.string().optional().describe('Fecha de vencimiento (YYYY-MM-DD o DD-MM-YYYY)'),
    subtotal: z.number().optional().describe('Monto subtotal'),
    tax_amount: z.number().optional().describe('Monto de impuestos'),
    total: z.number().optional().describe('Monto total'),
    notes: z.string().optional().describe('Notas o concepto de la factura'),
  },
  async ({ id, ...data }) => {
    const invoice = await InvoiceService.update(id, data, 'mcp');
    const folioText = invoice.invoice_number ? `N° ${invoice.invoice_number}` : 'Sin Folio';
    return {
      content: [{
        type: 'text' as const,
        text: `✅ Factura ${folioText} actualizada correctamente (ID: ${invoice.id})\n- Monto Pagado: $${(invoice.paid_amount || 0).toLocaleString('es-CL')} / Total: $${(Number(invoice.total) || 0).toLocaleString('es-CL')}\n- Emisión: ${formatDateCL(invoice.issue_date)} | Vence: ${formatDateCL(invoice.due_date)}\n- Estado: ${invoice.status}`,
      }],
    };
  }
);

// --- eliminar_factura ---
server.tool(
  'eliminar_factura',
  'Eliminar una factura del CRM permanentemente por su ID.',
  {
    id: z.string().describe('ID de la factura a eliminar'),
  },
  async (data) => {
    const result = await InvoiceService.delete(data.id, 'mcp');
    return {
      content: [{
        type: 'text' as const,
        text: `✅ Factura (ID: ${data.id}) eliminada exitosamente del CRM.`,
      }],
    };
  }
);

// --- anular_factura ---
server.tool(
  'anular_factura',
  'Anular una factura en el CRM (cambia su estado a cancelled).',
  {
    id: z.string().describe('ID de la factura a anular'),
  },
  async (data) => {
    const invoice = await InvoiceService.cancel(data.id, 'mcp');
    const folioText = invoice.invoice_number ? `N° ${invoice.invoice_number}` : 'Sin Folio';
    return {
      content: [{
        type: 'text' as const,
        text: `✅ Factura ${folioText} (ID: ${data.id}) anulada exitosamente (Estado: cancelled).`,
      }],
    };
  }
);

// --- registrar_pago ---
server.tool(
  'registrar_pago',
  'Registrar un pago recibido. Actualiza automáticamente el estado de la factura.',
  {
    invoice_id: z.string().describe('ID de la factura'),
    client_id: z.string().describe('ID del cliente'),
    amount: z.number().describe('Monto del pago'),
    currency: z.string().optional().default('USD'),
    payment_method: z.string().optional().describe('Método de pago (bank_transfer, credit_card, cash, etc.)'),
    payment_date: z.string().optional().describe('Fecha del pago (YYYY-MM-DD)'),
  },
  async (data) => {
    const payment = await PaymentService.register(data, 'mcp');
    return {
      content: [{ type: 'text' as const, text: `✅ Pago registrado: $${payment.amount} (ID: ${payment.id})` }],
    };
  }
);

// --- crear_gasto ---
server.tool(
  'crear_gasto',
  'Registrar un gasto de la empresa. Puede asociarse a un cliente, proyecto o campaña para calcular rentabilidad.',
  {
    description: z.string().describe('Descripción del gasto'),
    total: z.number().describe('Monto total del gasto'),
    category: z.string().optional().describe('Categoría (software, advertising, contractor, infrastructure, office, travel, etc.)'),
    vendor_name: z.string().optional().describe('Nombre del proveedor'),
    vendor_id: z.string().optional().describe('ID del proveedor si ya existe'),
    payment_account: z.string().optional().describe('Cuenta de pago (tarjeta_empresa, transferencia, efectivo)'),
    currency: z.string().optional().default('USD'),
    date: z.string().optional().describe('Fecha del gasto (YYYY-MM-DD)'),
    client_id: z.string().optional().describe('ID del cliente (para rentabilidad)'),
    project_id: z.string().optional().describe('ID del proyecto (para rentabilidad)'),
    campaign_id: z.string().optional().describe('ID de la campaña (para ROAS)'),
  },
  async (data) => {
    const expense = await ExpenseService.create({
      ...data,
      subtotal: data.total,
      tax_amount: 0,
      status: 'paid',
      paid_at: new Date().toISOString(),
    }, 'mcp');
    return {
      content: [{ type: 'text' as const, text: `✅ Gasto registrado: ${data.description} — $${data.total} (${data.category || 'sin categoría'})` }],
    };
  }
);

// --- registrar_impuesto ---
server.tool(
  'registrar_impuesto',
  'Registrar un impuesto estimado o pagado.',
  {
    type: z.string().describe('Tipo de impuesto (IVA, ISR, etc.)'),
    period_start: z.string().describe('Inicio del período (YYYY-MM-DD)'),
    period_end: z.string().describe('Fin del período (YYYY-MM-DD)'),
    due_date: z.string().describe('Fecha de vencimiento (YYYY-MM-DD)'),
    estimated_amount: z.number().optional(),
    actual_amount: z.number().optional(),
    status: z.enum(['estimated', 'pending', 'paid']).optional().default('estimated'),
  },
  async (data) => {
    const tax = await TaxService.register(data, 'mcp');
    return {
      content: [{ type: 'text' as const, text: `✅ Impuesto registrado: ${data.type} — $${data.estimated_amount || data.actual_amount}` }],
    };
  }
);

// --- registrar_retiro ---
server.tool(
  'registrar_retiro',
  'Registrar un retiro de socio. NO se contabiliza como gasto operativo.',
  {
    amount: z.number().describe('Monto del retiro'),
    currency: z.string().optional().default('USD'),
    type: z.enum(['owner_draw', 'dividend', 'advance', 'other']).optional().default('owner_draw'),
    source_account: z.string().optional().describe('Cuenta de origen'),
    notes: z.string().optional(),
    date: z.string().optional().describe('Fecha del retiro (YYYY-MM-DD)'),
  },
  async (data) => {
    const withdrawal = await WithdrawalService.register(data, 'mcp');
    return {
      content: [{ type: 'text' as const, text: `✅ Retiro registrado: $${data.amount}` }],
    };
  }
);

// ============================================================================
// ANALYTICS TOOLS
// ============================================================================

// --- consultar_pipeline ---
server.tool(
  'consultar_pipeline',
  'Consultar el pipeline de ventas actual con oportunidades abiertas.',
  {},
  async () => {
    const pipeline = await OpportunityService.getPipeline();
    const summary = pipeline.map((o: any) =>
      `• ${o.name} | ${o.stage} | $${o.setup_value}+$${o.recurring_value}/mes | ${Math.round(Number(o.probability) * 100)}% | ${o.next_action || ''} (${o.next_action_date || ''})`
    ).join('\n');
    return {
      content: [{ type: 'text' as const, text: pipeline.length > 0
        ? `📊 Pipeline (${pipeline.length} oportunidades):\n\n${summary}`
        : 'Pipeline vacío.' }],
    };
  }
);

// --- consultar_ventas ---
server.tool(
  'consultar_ventas',
  'Consultar resumen de ventas: pipeline total, forecast, ventas del mes, win rate.',
  {},
  async () => {
    const sales = await AnalyticsService.getSalesSummary();
    return {
      content: [{ type: 'text' as const, text: `📊 Resumen de Ventas:\n\n` +
        `• Pipeline total: $${sales.pipeline_total.toLocaleString()}\n` +
        `• Forecast ponderado: $${sales.weighted_forecast.toLocaleString()}\n` +
        `• Ventas este mes: $${sales.sales_this_month.toLocaleString()}\n` +
        `• Win rate: ${sales.win_rate}%\n` +
        `• Oportunidades abiertas: ${sales.open_opportunities}\n` +
        `• Total ganadas: ${sales.won_total}` }],
    };
  }
);

// --- consultar_finanzas ---
server.tool(
  'consultar_finanzas',
  'Consultar resumen financiero: facturado, cobrado, por cobrar, gastos, impuestos, caja, MRR.',
  {},
  async () => {
    const f = await AnalyticsService.getFinanceSummary();
    return {
      content: [{ type: 'text' as const, text: `💰 Resumen Financiero:\n\n` +
        `• Facturado: $${f.total_invoiced.toLocaleString()}\n` +
        `• Cobrado: $${f.total_collected.toLocaleString()}\n` +
        `• Por cobrar: $${f.outstanding.toLocaleString()}\n` +
        `• Vencido: $${f.overdue_amount.toLocaleString()} (${f.overdue_count} facturas)\n` +
        `• Gastos: $${f.total_expenses.toLocaleString()}\n` +
        `• Impuestos pendientes: $${f.pending_taxes.toLocaleString()}\n` +
        `• Retiros: $${f.total_withdrawals.toLocaleString()}\n` +
        `• MRR: $${f.mrr.toLocaleString()}\n` +
        `• Caja neta: $${f.net_cash.toLocaleString()}` }],
    };
  }
);

// --- consultar_marketing ---
server.tool(
  'consultar_marketing',
  'Consultar métricas de marketing: leads, CPL, CAC, ROAS, revenue por campaña.',
  {},
  async () => {
    const m = await AnalyticsService.getMarketingSummary();
    let text = `📈 Resumen de Marketing:\n\n`;
    text += `• Total leads: ${m.total_leads}\n`;
    text += `• Total inversión: $${m.total_spend.toLocaleString()}\n\n`;
    text += `Campañas:\n`;
    for (const c of m.campaigns) {
      text += `\n🔹 ${c.campaign_name} (${c.channel})\n`;
      text += `   Inversión: $${c.spend} | Leads: ${c.leads} | CPL: $${c.cpl}\n`;
      text += `   Oportunidades: ${c.opportunities} | Ventas: ${c.sales}\n`;
      text += `   Revenue: $${c.revenue.toLocaleString()} | ROAS: ${c.roas}x | CAC: $${c.cac}\n`;
    }
    return { content: [{ type: 'text' as const, text }] };
  }
);

// --- consultar_dashboard_ejecutivo ---
server.tool(
  'consultar_dashboard_ejecutivo',
  'Resumen ejecutivo completo del negocio: ventas, finanzas y marketing.',
  {},
  async () => {
    const d = await AnalyticsService.getDashboard();
    let text = `📊 DASHBOARD EJECUTIVO\n${'='.repeat(40)}\n\n`;

    text += `🏷️ VENTAS\n`;
    text += `  Pipeline: $${d.sales.pipeline_total.toLocaleString()} | Forecast: $${d.sales.weighted_forecast.toLocaleString()}\n`;
    text += `  Ventas mes: $${d.sales.sales_this_month.toLocaleString()} | Win rate: ${d.sales.win_rate}%\n\n`;

    text += `💰 FINANZAS\n`;
    text += `  Facturado: $${d.finance.total_invoiced.toLocaleString()} | Cobrado: $${d.finance.total_collected.toLocaleString()}\n`;
    text += `  Por cobrar: $${d.finance.outstanding.toLocaleString()} | Vencido: $${d.finance.overdue_amount.toLocaleString()}\n`;
    text += `  Gastos: $${d.finance.total_expenses.toLocaleString()} | MRR: $${d.finance.mrr.toLocaleString()}\n`;
    text += `  Caja neta: $${d.finance.net_cash.toLocaleString()}\n\n`;

    text += `📈 MARKETING\n`;
    text += `  Leads: ${d.marketing.total_leads} | Inversión: $${d.marketing.total_spend.toLocaleString()}\n`;
    const best = d.marketing.campaigns.sort((a: any, b: any) => b.roas - a.roas)[0];
    if (best) text += `  Mejor campaña: ${best.campaign_name} (ROAS: ${best.roas}x)\n`;

    return { content: [{ type: 'text' as const, text }] };
  }
);

// --- consultar_cuentas_por_cobrar ---
server.tool(
  'consultar_cuentas_por_cobrar',
  'Ver facturas pendientes de cobro y facturas vencidas.',
  {},
  async () => {
    const overdue = await InvoiceService.getOverdue();
    if (overdue.length === 0) {
      return { content: [{ type: 'text' as const, text: '✅ No hay facturas vencidas.' }] };
    }
    const list = overdue.map((i: any) => {
      const folio = i.invoice_number ? `N° ${i.invoice_number}` : `ID: ${i.id.slice(0, 8)} (Sin Folio)`;
      const paid = (i.paid_amount || 0).toLocaleString('es-CL');
      const total = (Number(i.total) || 0).toLocaleString('es-CL');
      const company = i.clients?.companies?.name || 'Cliente Particular';
      const vence = formatDateCL(i.due_date);
      return `• ${folio} | Pagado: $${paid} / Total: $${total} | Vence: ${vence} | Empresa: ${company}`;
    }).join('\n');
    return {
      content: [{ type: 'text' as const, text: `⚠️ Facturas vencidas (${overdue.length}):\n\n${list}` }],
    };
  }
);

// --- buscar_facturas ---
server.tool(
  'buscar_facturas',
  'Buscar facturas por estado o cliente.',
  {
    status: z.enum(['draft', 'issued', 'sent', 'partial', 'paid', 'overdue', 'cancelled', 'void']).optional(),
    client_id: z.string().optional(),
  },
  async (filters) => {
    const invoices = await InvoiceService.getAll(filters);
    const list = invoices.map((i: any) => {
      const folio = i.invoice_number ? `N° ${i.invoice_number}` : `ID: ${i.id.slice(0, 8)} (Sin Folio)`;
      const paid = (i.paid_amount || 0).toLocaleString('es-CL');
      const total = (Number(i.total) || 0).toLocaleString('es-CL');
      const emision = formatDateCL(i.issue_date);
      const vence = formatDateCL(i.due_date);
      return `• ${folio} | Pagado: $${paid} / Total: $${total} | Emisión: ${emision} | Vence: ${vence} | Estado: ${i.status.toUpperCase()}`;
    }).join('\n');
    return {
      content: [{ type: 'text' as const, text: invoices.length > 0
        ? `📋 Facturas (${invoices.length}):\n\n${list}`
        : 'No se encontraron facturas con esos filtros.' }],
    };
  }
);

// --- listar_servicios ---
server.tool(
  'listar_servicios',
  'Ver el catálogo oficial de servicios estructurado en sus 4 Servicios Madre y orden ascendente de Up-selling con precios en pesos chilenos ($).',
  {},
  async () => {
    const services = await ServiceCatalog.getAll();
    if (services.length === 0) {
      return { content: [{ type: 'text' as const, text: 'No hay servicios activos en el catálogo.' }] };
    }

    const grouped: Record<string, any[]> = {};
    for (const s of services) {
      const parent = s.category || 'Otros Servicios';
      if (!grouped[parent]) grouped[parent] = [];
      grouped[parent].push(s);
    }

    let formatted = `📋 **Catálogo Oficial de Servicios (Escalera de Valor & Up-Selling)**:\n`;
    for (const [parent, items] of Object.entries(grouped)) {
      formatted += `\n🏷️ **${parent}**\n`;
      for (const item of items) {
        const setup = Number(item.standard_setup_price || 0);
        const mrr = Number(item.standard_recurring_price || 0);
        let priceInfo = '';
        if (setup > 0 && mrr > 0) {
          priceInfo = `Setup: $${setup.toLocaleString('es-CL')} Neto (+ IVA) + MRR: $${mrr.toLocaleString('es-CL')}/mes Neto (+ IVA)`;
        } else if (setup > 0) {
          priceInfo = `Precio Único: $${setup.toLocaleString('es-CL')} Neto (+ IVA)`;
        } else {
          priceInfo = `Recurrente: $${mrr.toLocaleString('es-CL')}/mes Neto (+ IVA)`;
        }
        
        formatted += `  • **${item.name}** ➔ ${priceInfo}\n    _${item.description || ''}_\n    ID: \`${item.id}\`\n`;
      }
    }

    return {
      content: [{ type: 'text' as const, text: formatted }],
    };
  }
);

// --- listar_proyectos ---
server.tool(
  'listar_proyectos',
  'Listar proyectos de implementación en curso u operaciones del CRM.',
  {
    status: z.enum(['onboarding', 'in_progress', 'review', 'completed', 'cancelled']).optional().describe('Filtrar por estado del proyecto'),
  },
  async (filters) => {
    const projs = await ProjectService.getAll(filters);
    if (projs.length === 0) return { content: [{ type: 'text' as const, text: 'No hay proyectos en curso registrados.' }] };
    const list = projs.map((p: any) => {
      const compName = p.clients?.companies?.name || p.opportunities?.companies?.name || 'Empresa';
      return `• [${p.status.toUpperCase()}] "${p.name}" (Empresa: ${compName}) | Precio: $${Number(p.sold_price).toLocaleString('es-CL')} | Inicio: ${p.start_date || 'N/A'} | Entrega: ${p.due_date || 'Pendiente'} | ID: ${p.id}`;
    }).join('\n');
    return {
      content: [{ type: 'text' as const, text: `🚀 Proyectos (${projs.length}):\n\n${list}` }],
    };
  }
);

// --- actualizar_proyecto ---
server.tool(
  'actualizar_proyecto',
  'Actualizar los datos operativos de un proyecto de implementación en curso (nombre, estado, precio acordado, fecha de inicio, fecha de entrega).',
  {
    id: z.string().describe('ID del proyecto a actualizar'),
    name: z.string().optional().describe('Nuevo nombre del proyecto'),
    status: z.enum(['onboarding', 'in_progress', 'review', 'completed', 'cancelled']).optional().describe('Nuevo estado del proyecto'),
    sold_price: z.number().optional().describe('Precio vendido / acordado'),
    start_date: z.string().optional().describe('Fecha de inicio (YYYY-MM-DD)'),
    due_date: z.string().optional().describe('Fecha de entrega estimada (YYYY-MM-DD)'),
    estimated_cost: z.number().optional().describe('Costo estimado'),
  },
  async ({ id, ...data }) => {
    const updated = await ProjectService.update(id, data, 'mcp');
    return {
      content: [{ type: 'text' as const, text: `✅ Proyecto actualizado con éxito:\n- Nombre: "${updated.name}"\n- Estado: ${updated.status}\n- Precio: $${Number(updated.sold_price).toLocaleString('es-CL')}\n- Inicio: ${updated.start_date || 'N/A'}\n- Entrega: ${updated.due_date || 'Pendiente'}` }],
    };
  }
);

// ============================================================================
// START SERVER (Stdio for local Claude Desktop)
// ============================================================================
import { fileURLToPath } from 'url';

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🤖 CRM MCP Server running on stdio');
}
