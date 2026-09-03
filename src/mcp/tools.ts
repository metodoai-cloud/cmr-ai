// ============================================================================
// MCP Tools Registry — Registers all CRM tools onto any McpServer instance
// Fully synchronized with Supabase DB constraints, robust error handling
// ============================================================================

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  ContactService, CompanyService, LeadService, OpportunityService,
  ActivityService, ClientService, InvoiceService, PaymentService,
  ExpenseService, TaxService, WithdrawalService, AnalyticsService,
  VendorService, CampaignService, HookService, ServiceCatalog,
  SubscriptionService, ProjectService,
} from '../services/index.js';

// Map stage aliases to database enum values
function normalizeStage(stage?: string): string | undefined {
  if (!stage) return undefined;
  const map: Record<string, string> = {
    'nuevo': 'new',
    'contactado': 'contacted',
    'calificado': 'qualified',
    'reunion': 'meeting_scheduled',
    'propuesta': 'proposal_sent',
    'negociacion': 'negotiation',
    'ganado': 'won',
    'perdido': 'lost',
  };
  return map[stage.toLowerCase()] || stage;
}

// Map contact status aliases to database enum values
function normalizeContactStatus(status?: string): string | undefined {
  if (!status) return undefined;
  const map: Record<string, string> = {
    'inactive': 'former_client',
    'inactivo': 'former_client',
    'cliente': 'client',
    'prospecto': 'prospect',
  };
  return map[status.toLowerCase()] || status;
}

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

export function registerTools(srv: McpServer) {

  // --- buscar_contacto ---
  srv.tool(
    'buscar_contacto',
    'Buscar contactos por nombre, email o teléfono. Usar antes de crear uno nuevo para evitar duplicados.',
    { nombre: z.string().describe('Nombre, apellido o email del contacto a buscar') },
    async ({ nombre }) => {
      try {
        const results = await ContactService.search(nombre);
        return {
          content: [{
            type: 'text' as const,
            text: results.length > 0
              ? JSON.stringify(results, null, 2)
              : `No se encontraron contactos con "${nombre}".`,
          }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al buscar contactos: ${err.message}` }] };
      }
    }
  );

  // --- crear_contacto ---
  srv.tool(
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
      status: z.enum(['prospect', 'client', 'former_client', 'inactive']).optional().describe('Estado del contacto'),
      original_source: z.string().optional().describe('Fuente de origen (meta_ads, google_ads, referral, etc.)'),
      notes: z.string().optional().describe('Notas o comentarios sobre el contacto'),
    },
    async (data) => {
      try {
        const payload = {
          ...data,
          status: normalizeContactStatus(data.status) || 'prospect',
        };
        const contact = await ContactService.create(payload);
        return {
          content: [{ type: 'text' as const, text: `✅ Contacto creado exitosamente:\n- Nombre: ${contact.first_name} ${contact.last_name || ''}\n- ID: ${contact.id}\n- Empresa: ${contact.company_id || 'Sin vincular'}` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al crear contacto: ${err.message}` }] };
      }
    }
  );

  // --- actualizar_contacto ---
  srv.tool(
    'actualizar_contacto',
    'Actualizar datos de un contacto existente, incluyendo vincular o cambiar la empresa (company_id).',
    {
      id: z.string().describe('ID del contacto a actualizar'),
      first_name: z.string().optional().describe('Nombre'),
      last_name: z.string().optional().describe('Apellido'),
      email: z.string().optional().describe('Email'),
      phone: z.string().optional().describe('Teléfono'),
      whatsapp: z.string().optional().describe('WhatsApp'),
      job_title: z.string().optional().describe('Cargo'),
      status: z.enum(['prospect', 'client', 'former_client', 'inactive']).optional().describe('Estado del contacto'),
      company_id: z.string().optional().describe('ID de la empresa a asociar al contacto'),
      notes: z.string().optional().describe('Notas actualizadas'),
    },
    async ({ id, ...data }) => {
      try {
        const payload: any = { ...data };
        if (data.status) payload.status = normalizeContactStatus(data.status);
        const contact = await ContactService.update(id, payload);
        return {
          content: [{ type: 'text' as const, text: `✅ Contacto actualizado correctamente: ${contact.first_name} ${contact.last_name || ''} (ID: ${contact.id}, Empresa ID: ${contact.company_id || 'Ninguna'})` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al actualizar contacto: ${err.message}` }] };
      }
    }
  );

  // --- crear_empresa ---
  srv.tool(
    'crear_empresa',
    'Crear o registrar una nueva empresa en el CRM.',
    {
      name: z.string().describe('Nombre de la empresa'),
      industry: z.string().optional().describe('Industria o sector'),
      website: z.string().optional().describe('Sitio web'),
      email: z.string().optional().describe('Email de contacto principal'),
      phone: z.string().optional().describe('Teléfono'),
    },
    async (data) => {
      try {
        const company = await CompanyService.create(data);
        return {
          content: [{ type: 'text' as const, text: `✅ Empresa creada: "${company.name}" (ID: ${company.id})` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al crear empresa: ${err.message}` }] };
      }
    }
  );

  // --- buscar_empresa ---
  srv.tool(
    'buscar_empresa',
    'Buscar una empresa por nombre o industria.',
    { nombre: z.string().describe('Nombre o industria a buscar') },
    async ({ nombre }) => {
      try {
        const results = await CompanyService.search(nombre);
        return {
          content: [{ type: 'text' as const, text: results.length > 0 ? JSON.stringify(results, null, 2) : `No se encontró ninguna empresa con "${nombre}".` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al buscar empresa: ${err.message}` }] };
      }
    }
  );

  // --- actualizar_empresa ---
  srv.tool(
    'actualizar_empresa',
    'Actualizar datos de una empresa en el CRM (industria, nombre, sitio web, RUT / tax_id, ciudad, país).',
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
      try {
        const company = await CompanyService.update(id, data, 'mcp');
        return {
          content: [{
            type: 'text' as const,
            text: `✅ Empresa "${company.name}" actualizada con éxito (ID: ${company.id})\n- Industria: ${company.industry || 'Sin definir'}\n- Web: ${company.website || 'Sin definir'}\n- Ubicación: ${[company.city, company.country].filter(Boolean).join(', ') || 'Sin definir'}`,
          }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al actualizar empresa: ${err.message}` }] };
      }
    }
  );

  // --- crear_oportunidad ---
  srv.tool(
    'crear_oportunidad',
    'Crear una nueva oportunidad de venta en el pipeline del CRM.',
    {
      name: z.string().optional().describe('Nombre u objetivo del trato'),
      title: z.string().optional().describe('Alias de nombre para el trato'),
      contact_id: z.string().optional().describe('ID del contacto asociado'),
      company_id: z.string().optional().describe('ID de la empresa asociada'),
      estimated_value: z.number().optional().describe('Valor estimado del setup / venta'),
      setup_value: z.number().optional().describe('Valor de setup inicial'),
      recurring_value: z.number().optional().describe('Valor mensual recurrente (MRR)'),
      stage: z.enum(['new', 'contacted', 'qualified', 'meeting_scheduled', 'proposal_sent', 'negotiation', 'won', 'lost', 'nuevo', 'contactado', 'calificado', 'reunion', 'propuesta', 'negociacion', 'ganado', 'perdido']).optional().describe('Etapa del pipeline'),
      notes: z.string().optional().describe('Notas adicionales'),
    },
    async (data) => {
      try {
        const oppName = data.name || data.title || 'Nueva Oportunidad';
        const setupVal = data.setup_value ?? data.estimated_value ?? 0;
        const normStage = normalizeStage(data.stage) || 'new';

        const payload = {
          name: oppName,
          contact_id: data.contact_id,
          company_id: data.company_id,
          setup_value: setupVal,
          recurring_value: data.recurring_value ?? 0,
          stage: normStage,
          notes: data.notes,
        };

        const opp = await OpportunityService.create(payload);
        return {
          content: [{ type: 'text' as const, text: `✅ Oportunidad creada: "${opp.name}" (ID: ${opp.id}) en etapa "${opp.stage}" | Setup: $${opp.setup_value} | Recurrente: $${opp.recurring_value}/mes` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al crear oportunidad: ${err.message}` }] };
      }
    }
  );

  // --- listar_oportunidades ---
  srv.tool(
    'listar_oportunidades',
    'Ver las oportunidades actuales en el pipeline de ventas.',
    {
      stage: z.string().optional().describe('Filtrar por etapa del pipeline'),
      limit: z.number().optional().describe('Máximo de resultados (default 20)'),
    },
    async (filters) => {
      try {
        const normFilters = {
          ...filters,
          stage: normalizeStage(filters.stage),
        };
        const opps = await OpportunityService.getAll(normFilters);
        const list = opps.map((o: any) =>
          `• [${(o.stage || 'new').toUpperCase()}] ${o.name || o.title || 'Sin nombre'} | Setup: $${o.setup_value || 0} | MRR: $${o.recurring_value || 0}/mes | ID: ${o.id}`
        ).join('\n');
        return {
          content: [{ type: 'text' as const, text: opps.length > 0 ? `📊 Pipeline (${opps.length}):\n\n${list}` : 'No hay oportunidades activas.' }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al listar oportunidades: ${err.message}` }] };
      }
    }
  );

  // --- actualizar_oportunidad ---
  srv.tool(
    'actualizar_oportunidad',
    'Actualizar el estado o información de una oportunidad en el pipeline.',
    {
      id: z.string().describe('ID de la oportunidad a actualizar'),
      stage: z.string().optional().describe('Nueva etapa del pipeline (new, contacted, qualified, meeting_scheduled, proposal_sent, negotiation, won, lost)'),
      setup_value: z.number().optional().describe('Valor de setup actualizado'),
      recurring_value: z.number().optional().describe('Valor recurrente mensual actualizado'),
      estimated_value: z.number().optional().describe('Alias para setup_value'),
      notes: z.string().optional().describe('Notas adicionales'),
      name: z.string().optional().describe('Nuevo nombre de la oportunidad'),
      title: z.string().optional().describe('Alias para name'),
      probability: z.number().optional().describe('Probabilidad de éxito o cierre (0 a 100)'),
    },
    async ({ id, ...data }) => {
      try {
        const payload: any = {};
        if (data.name || data.title) payload.name = data.name || data.title;
        if (data.stage) payload.stage = normalizeStage(data.stage);
        if (data.setup_value !== undefined) payload.setup_value = data.setup_value;
        else if (data.estimated_value !== undefined) payload.setup_value = data.estimated_value;
        if (data.recurring_value !== undefined) payload.recurring_value = data.recurring_value;
        if (data.probability !== undefined) payload.probability = data.probability;
        if (data.notes !== undefined) payload.notes = data.notes;

        const opp = await OpportunityService.update(id, payload);
        return {
          content: [{ type: 'text' as const, text: `✅ Oportunidad actualizada: "${opp.name}" → etapa "${opp.stage}"` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al actualizar oportunidad: ${err.message}` }] };
      }
    }
  );

  // --- registrar_actividad ---
  srv.tool(
    'registrar_actividad',
    'Registrar una actividad comercial: reunión, llamada, propuesta, nota u otro contacto.',
    {
      opportunity_id: z.string().optional().describe('ID de la oportunidad relacionada'),
      contact_id: z.string().optional().describe('ID del contacto relacionado'),
      company_id: z.string().optional().describe('ID de la empresa relacionada'),
      type: z.enum(['meeting', 'call', 'email', 'proposal', 'whatsapp', 'note', 'demo', 'follow_up', 'task', 'negotiation']).describe('Tipo de actividad'),
      title: z.string().optional().describe('Título breve o resumen de la actividad'),
      description: z.string().optional().describe('Descripción detallada'),
      notes: z.string().optional().describe('Notas adicionales'),
      result: z.string().optional().describe('Resultado o conclusión de la actividad'),
      next_action: z.string().optional().describe('Siguiente paso a tomar'),
      next_action_date: z.string().optional().describe('Fecha del siguiente paso (YYYY-MM-DD)'),
      scheduled_at: z.string().optional().describe('Fecha y hora programada o efectuada (ISO 8601)'),
      occurred_at: z.string().optional().describe('Fecha y hora efectuada (ISO 8601)'),
    },
    async (data) => {
      try {
        const validTypes = ['call', 'email', 'whatsapp', 'meeting', 'demo', 'follow_up', 'proposal', 'task', 'note'];
        const mappedType = validTypes.includes(data.type) ? data.type : (data.type === 'negotiation' ? 'proposal' : 'note');

        const combinedNotes = [data.title, data.description, data.notes].filter(Boolean).join(' — ') || 'Actividad registrada';

        const payload = {
          type: mappedType,
          contact_id: data.contact_id || null,
          company_id: data.company_id || null,
          opportunity_id: data.opportunity_id || null,
          notes: combinedNotes,
          result: data.result || null,
          next_action: data.next_action || null,
          next_action_date: data.next_action_date || null,
          occurred_at: data.occurred_at || data.scheduled_at || new Date().toISOString(),
        };

        const activity = await ActivityService.create(payload);
        return {
          content: [{ type: 'text' as const, text: `✅ Actividad registrada exitosamente:\n- Tipo: ${mappedType.toUpperCase()}\n- Detalle: ${combinedNotes}\n- ID: ${activity.id}` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al registrar actividad: ${err.message}` }] };
      }
    }
  );

  // --- listar_actividades ---
  srv.tool(
    'listar_actividades',
    'Ver actividades comerciales recientes: reuniones, llamadas, propuestas.',
    {
      opportunity_id: z.string().optional().describe('Filtrar por oportunidad'),
      contact_id: z.string().optional().describe('Filtrar por contacto'),
      limit: z.number().optional().describe('Número de resultados (default 20)'),
    },
    async (filters) => {
      try {
        const activities = await ActivityService.getAll(filters);
        const list = activities.map((a: any) =>
          `• [${(a.type || 'actividad').toUpperCase()}] ${a.notes || a.result || 'Sin descripción'} | ${a.occurred_at || a.created_at || 'Sin fecha'}`
        ).join('\n');
        return {
          content: [{ type: 'text' as const, text: activities.length > 0 ? `📅 Actividades (${activities.length}):\n\n${list}` : 'No hay actividades registradas.' }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al listar actividades: ${err.message}` }] };
      }
    }
  );

  // --- dashboard_resumen ---
  srv.tool(
    'dashboard_resumen',
    'Obtener un resumen del estado actual del negocio: pipeline, finanzas, clientes activos y proyectos.',
    {},
    async () => {
      try {
        const data = await AnalyticsService.getDashboard();
        return {
          content: [{
            type: 'text' as const,
            text: `📊 DASHBOARD CRM:\n\n${JSON.stringify(data, null, 2)}`,
          }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al obtener dashboard: ${err.message}` }] };
      }
    }
  );

  // --- listar_contactos ---
  srv.tool(
    'listar_contactos',
    'Listar contactos del CRM con filtros opcionales.',
    {
      status: z.enum(['prospect', 'client', 'former_client', 'inactive']).optional().describe('Filtrar por estado del contacto'),
      limit: z.number().optional().describe('Máximo de resultados (default 20)'),
    },
    async (filters) => {
      try {
        const normFilters = {
          ...filters,
          status: normalizeContactStatus(filters.status),
        };
        const contacts = await ContactService.getAll(normFilters);
        const list = contacts.map((c: any) =>
          `• ${c.first_name} ${c.last_name || ''} | ${c.email || 'Sin email'} | ${c.phone || 'Sin teléfono'} | Empresa ID: ${c.company_id || 'N/A'} | Estado: ${c.status}`
        ).join('\n');
        return {
          content: [{ type: 'text' as const, text: contacts.length > 0 ? `👥 Contactos (${contacts.length}):\n\n${list}` : 'No hay contactos.' }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al listar contactos: ${err.message}` }] };
      }
    }
  );

  // --- cerrar_oportunidad_ganada ---
  srv.tool(
    'cerrar_oportunidad_ganada',
    'Marcar una oportunidad como ganada. Crea automáticamente el cliente, proyecto, suscripción y factura inicial.',
    {
      id: z.string().describe('ID de la oportunidad ganada'),
      final_value: z.number().optional().describe('Valor final cerrado del trato'),
    },
    async ({ id, final_value }) => {
      try {
        const result = await OpportunityService.closeWon(id, final_value);
        return {
          content: [{ type: 'text' as const, text: `🎉 ¡Oportunidad ganada!\n\n${JSON.stringify(result, null, 2)}` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al cerrar oportunidad ganada: ${err.message}` }] };
      }
    }
  );

  // --- cerrar_oportunidad_perdida ---
  srv.tool(
    'cerrar_oportunidad_perdida',
    'Marcar una oportunidad como perdida en el pipeline, registrando el motivo de pérdida.',
    {
      id: z.string().describe('ID de la oportunidad perdida'),
      reason: z.string().optional().describe('Motivo de la pérdida (ej: Precio alto, Decidió esperar, Eligió a la competencia)'),
    },
    async ({ id, reason }) => {
      try {
        const result = await OpportunityService.closeLost(id, reason);
        return {
          content: [{ type: 'text' as const, text: `📉 Oportunidad marcada como PERDIDA (ID: ${id}). Motivo: ${reason || 'No especificado'}.` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al cerrar oportunidad perdida: ${err.message}` }] };
      }
    }
  );

  // --- eliminar_oportunidad ---
  srv.tool(
    'eliminar_oportunidad',
    'Eliminar permanentemente una oportunidad del pipeline de ventas por su ID.',
    {
      id: z.string().describe('ID de la oportunidad a eliminar'),
    },
    async ({ id }) => {
      try {
        await OpportunityService.delete(id, 'mcp');
        return {
          content: [{ type: 'text' as const, text: `🗑️ Oportunidad eliminada permanentemente del CRM (ID: ${id}).` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al eliminar oportunidad: ${err.message}` }] };
      }
    }
  );

  // --- registrar_pago ---
  srv.tool(
    'registrar_pago',
    'Registrar un pago recibido de un cliente asociado a una factura.',
    {
      invoice_id: z.string().describe('ID de la factura asociada'),
      amount: z.number().describe('Monto del pago'),
      payment_method: z.string().optional().describe('Método de pago (transferencia, efectivo, tarjeta, etc.)'),
      payment_date: z.string().optional().describe('Fecha del pago (YYYY-MM-DD)'),
      notes: z.string().optional().describe('Notas o detalle del pago'),
      reference_number: z.string().optional().describe('Número de comprobante bancario o referencia'),
    },
    async (data) => {
      try {
        const payload = {
          ...data,
          payment_date: data.payment_date || new Date().toISOString().split('T')[0],
          currency: 'CLP',
        };
        const payment = await PaymentService.create(payload);
        return {
          content: [{ type: 'text' as const, text: `✅ Pago registrado exitosamente:\n- Monto: $${data.amount}\n- ID: ${payment.id}\n- Factura ID: ${data.invoice_id}` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al registrar pago: ${err.message}` }] };
      }
    }
  );

  // --- crear_factura ---
  srv.tool(
    'crear_factura',
    'Crear o emitir una factura para un cliente en el CRM. El monto total ya incluye IVA del 19% por defecto y el sistema desglosa el Neto automáticamente.',
    {
      client_id: z.string().describe('ID del cliente al que se le factura'),
      invoice_number: z.string().optional().describe('Número o folio de la factura (opcional, ej: 1042 o FAC-1042). Si no se indica, queda vacío.'),
      total: z.number().optional().describe('Monto total de la factura (con IVA incluido)'),
      subtotal: z.number().optional().describe('Monto neto (si no se especifica total)'),
      tax_amount: z.number().optional().describe('Monto de impuesto (opcional, por defecto 19% de IVA)'),
      status: z.enum(['draft', 'issued', 'sent', 'partial', 'paid', 'overdue', 'cancelled', 'void']).optional().describe('Estado inicial de la factura (default: draft)'),
      issue_date: z.string().optional().describe('Fecha de emisión (YYYY-MM-DD o DD-MM-YYYY)'),
      due_date: z.string().optional().describe('Fecha de vencimiento (YYYY-MM-DD o DD-MM-YYYY)'),
      project_id: z.string().optional().describe('ID del proyecto relacionado si aplica'),
      subscription_id: z.string().optional().describe('ID de la suscripción relacionada si aplica'),
      notes: z.string().optional().describe('Notas o concepto de la factura'),
    },
    async (data) => {
      try {
        const invoice = await InvoiceService.create({
          invoice_number: data.invoice_number || null,
          client_id: data.client_id,
          project_id: data.project_id || null,
          subscription_id: data.subscription_id || null,
          issue_date: data.issue_date || new Date().toISOString().split('T')[0],
          due_date: data.due_date || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          subtotal: data.subtotal,
          tax_amount: data.tax_amount,
          total: data.total,
          currency: 'CLP',
          status: data.status || 'draft',
          notes: data.notes || null,
        }, 'mcp');

        const folioText = invoice.invoice_number ? `N° ${invoice.invoice_number}` : 'Sin Folio';
        return {
          content: [{
            type: 'text' as const,
            text: `✅ Factura ${folioText} creada exitosamente (ID: ${invoice.id})\n- Total (con IVA): $${(Number(invoice.total) || 0).toLocaleString('es-CL')}\n- Neto: $${(Number(invoice.subtotal) || 0).toLocaleString('es-CL')} | IVA (19%): $${(Number(invoice.tax_amount) || 0).toLocaleString('es-CL')}\n- Monto Pagado: $${(invoice.paid_amount || 0).toLocaleString('es-CL')}\n- Emisión: ${formatDateCL(invoice.issue_date)} | Vencimiento: ${formatDateCL(invoice.due_date)}\n- Estado: "${invoice.status}"`,
          }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al crear factura: ${err.message}` }] };
      }
    }
  );

  // --- actualizar_factura ---
  srv.tool(
    'actualizar_factura',
    'Actualizar datos de una factura existente, incluyendo folio (invoice_number), estado, fechas o montos.',
    {
      id: z.string().describe('ID de la factura a actualizar'),
      client_id: z.string().optional().describe('ID del cliente asociado a la factura (para reasignar de empresa)'),
      project_id: z.string().optional().describe('ID del proyecto asociado a la factura'),
      subscription_id: z.string().optional().describe('ID de la suscripción asociada a la factura'),
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
      try {
        const invoice = await InvoiceService.update(id, data, 'mcp');
        const folioText = invoice.invoice_number ? `N° ${invoice.invoice_number}` : 'Sin Folio';
        return {
          content: [{
            type: 'text' as const,
            text: `✅ Factura ${folioText} actualizada correctamente (ID: ${invoice.id})\n- Monto Pagado: $${(invoice.paid_amount || 0).toLocaleString('es-CL')} / Total: $${(Number(invoice.total) || 0).toLocaleString('es-CL')}\n- Emisión: ${formatDateCL(invoice.issue_date)} | Vence: ${formatDateCL(invoice.due_date)}\n- Estado: ${invoice.status}`,
          }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al actualizar factura: ${err.message}` }] };
      }
    }
  );

  // --- eliminar_factura ---
  srv.tool(
    'eliminar_factura',
    'Eliminar una factura del CRM permanentemente por su ID.',
    {
      id: z.string().describe('ID de la factura a eliminar'),
    },
    async (data) => {
      try {
        const result = await InvoiceService.delete(data.id, 'mcp');
        return {
          content: [{
            type: 'text' as const,
            text: `✅ Factura (ID: ${data.id}) eliminada exitosamente.`,
          }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al eliminar factura: ${err.message}` }] };
      }
    }
  );

  // --- anular_factura ---
  srv.tool(
    'anular_factura',
    'Anular una factura en el CRM (cambia su estado a cancelled).',
    {
      id: z.string().describe('ID de la factura a anular'),
    },
    async (data) => {
      try {
        const invoice = await InvoiceService.cancel(data.id, 'mcp');
        const folioText = invoice.invoice_number ? `N° ${invoice.invoice_number}` : 'Sin Folio';
        return {
          content: [{
            type: 'text' as const,
            text: `✅ Factura ${folioText} (ID: ${data.id}) anulada exitosamente (Estado: cancelled).`,
          }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al anular factura: ${err.message}` }] };
      }
    }
  );

  // --- registrar_gasto ---
  srv.tool(
    'registrar_gasto',
    'Registrar un gasto o egreso del negocio.',
    {
      category: z.string().describe('Categoría del gasto (publicidad, herramientas, servicios, etc.)'),
      amount: z.number().describe('Monto del gasto'),
      description: z.string().optional().describe('Descripción del gasto'),
      date: z.string().optional().describe('Fecha del gasto (YYYY-MM-DD)'),
    },
    async (data) => {
      try {
        const expense = await ExpenseService.create(data);
        return {
          content: [{ type: 'text' as const, text: `✅ Gasto registrado: ${data.category} — $${data.amount} (ID: ${expense.id})` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al registrar gasto: ${err.message}` }] };
      }
    }
  );

  // --- listar_facturas ---
  srv.tool(
    'listar_facturas',
    'Ver facturas generadas, con filtro por estado.',
    {
      status: z.enum(['draft', 'issued', 'sent', 'partial', 'paid', 'overdue', 'cancelled', 'void']).optional().describe('Filtrar por estado de factura'),
    },
    async (filters) => {
      try {
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
          content: [{ type: 'text' as const, text: invoices.length > 0 ? `📋 Facturas (${invoices.length}):\n\n${list}` : 'No se encontraron facturas.' }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al listar facturas: ${err.message}` }] };
      }
    }
  );

  // --- analytics_ventas ---
  srv.tool(
    'analytics_ventas',
    'Obtener estadísticas de ventas: ingresos, conversiones y top clientes.',
    {},
    async () => {
      try {
        const data = await AnalyticsService.getSalesStats();
        return {
          content: [{ type: 'text' as const, text: `📈 Estadísticas de ventas:\n\n${JSON.stringify(data, null, 2)}` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al obtener estadísticas: ${err.message}` }] };
      }
    }
  );

  // --- listar_clientes ---
  srv.tool(
    'listar_clientes',
    'Ver todos los clientes activos del negocio con su nombre de empresa y respectivo ID.',
    {},
    async () => {
      try {
        const clients = await ClientService.getAll();
        const list = clients.map((c: any) => {
          const compName = c.companies?.name || c.companies?.legal_name || 'Sin Empresa';
          return `• **${compName}** | ID Cliente: \`${c.id}\` | Estado: ${c.status} | Inicio: ${c.start_date || 'N/A'}`;
        }).join('\n');
        return {
          content: [{ type: 'text' as const, text: clients.length > 0 ? `🏢 Clientes Activos (${clients.length}):\n\n${list}` : 'No hay clientes activos.' }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al listar clientes: ${err.message}` }] };
      }
    }
  );


  // --- registrar_retiro ---
  srv.tool(
    'registrar_retiro',
    'Registrar un retiro de fondos del negocio.',
    {
      amount: z.number().describe('Monto del retiro'),
      reason: z.string().optional().describe('Motivo del retiro'),
    },
    async (data) => {
      try {
        const withdrawal = await WithdrawalService.create(data);
        return {
          content: [{ type: 'text' as const, text: `✅ Retiro registrado: $${data.amount} (ID: ${withdrawal.id})` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al registrar retiro: ${err.message}` }] };
      }
    }
  );

  // --- listar_campanas ---
  srv.tool(
    'listar_campanas',
    'Ver campañas de marketing activas e inactivas.',
    {},
    async () => {
      try {
        const campaigns = await CampaignService.getAll();
        const list = campaigns.map((c: any) => `• ${c.name} | ${c.platform} | Presupuesto: $${c.budget || 0}`).join('\n');
        return {
          content: [{ type: 'text' as const, text: campaigns.length > 0 ? `📣 Campañas (${campaigns.length}):\n\n${list}` : 'No hay campañas registradas.' }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al listar campañas: ${err.message}` }] };
      }
    }
  );

  // --- listar_suscripciones ---
  srv.tool(
    'listar_suscripciones',
    'Ver suscripciones activas de los clientes.',
    {},
    async () => {
      try {
        const subs = await SubscriptionService.getAll();
        const list = subs.map((s: any) => `• ${s.id} | $${s.amount}/mes | Estado: ${s.status}`).join('\n');
        return {
          content: [{ type: 'text' as const, text: subs.length > 0 ? `🔄 Suscripciones (${subs.length}):\n\n${list}` : 'No hay suscripciones activas.' }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al listar suscripciones: ${err.message}` }] };
      }
    }
  );

  // --- listar_servicios ---
  srv.tool(
    'listar_servicios',
    'Ver el catálogo oficial de servicios estructurado en sus 4 Servicios Madre y orden ascendente de Up-selling con precios en pesos chilenos ($).',
    {},
    async () => {
      try {
        const services = await ServiceCatalog.getAll();
        if (services.length === 0) {
          return { content: [{ type: 'text' as const, text: 'No hay servicios activos en el catálogo.' }] };
        }

        // Agrupar por Servicio Madre
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
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al listar servicios: ${err.message}` }] };
      }
    }
  );

  // --- crear_servicio ---
  srv.tool(
    'crear_servicio',
    'Crear o dar de alta un nuevo servicio o paquete en el catálogo comercial del CRM.',
    {
      name: z.string().describe('Nombre del servicio o paquete comercial (ej: CRM Setup + Automatización)'),
      category: z.string().optional().describe('Categoría (ej: Automatización, Desarrollo, Consultoría, Publicidad)'),
      description: z.string().optional().describe('Descripción del alcance del servicio'),
      standard_setup_price: z.number().optional().describe('Precio estándar de setup o implementación inicial'),
      standard_recurring_price: z.number().optional().describe('Precio estándar recurrente mensual (MRR)'),
      billing_type: z.enum(['one_time', 'recurring', 'hybrid']).optional().describe('Tipo de facturación (one_time, recurring, hybrid)'),
      billing_frequency: z.enum(['monthly', 'quarterly', 'annual', 'one_time']).optional().describe('Frecuencia de cobro'),
      estimated_cost: z.number().optional().describe('Costo estimado de entrega'),
      target_margin: z.number().optional().describe('Margen objetivo en porcentaje (ej: 40 para 40%)'),
    },
    async (data) => {
      try {
        const srvObj = await ServiceCatalog.create({
          name: data.name,
          category: data.category || 'General',
          description: data.description || null,
          standard_setup_price: data.standard_setup_price ?? 0,
          standard_recurring_price: data.standard_recurring_price ?? 0,
          billing_type: data.billing_type || (data.standard_recurring_price ? 'recurring' : 'one_time'),
          billing_frequency: data.billing_frequency || (data.standard_recurring_price ? 'monthly' : 'one_time'),
          estimated_cost: data.estimated_cost ?? 0,
          target_margin: data.target_margin ?? 0,
          active: true,
        });
        return {
          content: [{ type: 'text' as const, text: `✅ Servicio creado en catálogo:\n- Nombre: "${srvObj.name}"\n- Setup: $${srvObj.standard_setup_price}\n- Mensualidad: $${srvObj.standard_recurring_price}/mes\n- ID: ${srvObj.id}` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al crear servicio: ${err.message}` }] };
      }
    }
  );

  // --- actualizar_servicio ---
  srv.tool(
    'actualizar_servicio',
    'Actualizar datos, precios o alcance de un servicio existente en el catálogo del CRM.',
    {
      id: z.string().describe('ID del servicio a actualizar'),
      name: z.string().optional().describe('Nuevo nombre del servicio'),
      category: z.string().optional().describe('Categoría'),
      description: z.string().optional().describe('Descripción o alcance'),
      standard_setup_price: z.number().optional().describe('Precio de setup inicial'),
      standard_recurring_price: z.number().optional().describe('Precio mensual recurrente (MRR)'),
      billing_type: z.enum(['one_time', 'recurring', 'hybrid']).optional().describe('Tipo de facturación'),
      billing_frequency: z.enum(['monthly', 'quarterly', 'annual', 'one_time']).optional().describe('Frecuencia de cobro'),
      estimated_cost: z.number().optional().describe('Costo estimado'),
      target_margin: z.number().optional().describe('Margen objetivo (%)'),
      active: z.boolean().optional().describe('Estado activo o inactivo'),
    },
    async ({ id, ...data }) => {
      try {
        const srvObj = await ServiceCatalog.update(id, data);
        return {
          content: [{ type: 'text' as const, text: `✅ Servicio actualizado:\n- Nombre: "${srvObj.name}"\n- Setup: $${srvObj.standard_setup_price}\n- Mensualidad: $${srvObj.standard_recurring_price}/mes` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al actualizar servicio: ${err.message}` }] };
      }
    }
  );

  // --- listar_gastos ---
  srv.tool(
    'listar_gastos',
    'Ver gastos y egresos del negocio.',
    {
      category: z.string().optional().describe('Filtrar por categoría de gasto'),
    },
    async (filters) => {
      try {
        const expenses = await ExpenseService.getAll(filters);
        const list = expenses.map((e: any) => `• ${e.category} | $${e.amount} | ${e.date}`).join('\n');
        return {
          content: [{ type: 'text' as const, text: expenses.length > 0 ? `💸 Gastos (${expenses.length}):\n\n${list}` : 'No hay gastos registrados.' }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al listar gastos: ${err.message}` }] };
      }
    }
  );

  // --- listar_proyectos ---
  srv.tool(
    'listar_proyectos',
    'Listar proyectos de implementación en curso u operaciones del CRM.',
    {
      status: z.enum(['onboarding', 'in_progress', 'review', 'completed', 'cancelled']).optional().describe('Filtrar por estado del proyecto'),
    },
    async (filters) => {
      try {
        const projs = await ProjectService.getAll(filters);
        if (projs.length === 0) return { content: [{ type: 'text' as const, text: 'No hay proyectos en curso registrados.' }] };
        const list = projs.map((p: any) => {
          const compName = p.clients?.companies?.name || p.opportunities?.companies?.name || 'Empresa';
          return `• [${p.status.toUpperCase()}] "${p.name}" (Empresa: ${compName}) | Precio: $${Number(p.sold_price).toLocaleString('es-CL')} | Inicio: ${p.start_date || 'N/A'} | Entrega: ${p.due_date || 'Pendiente'} | ID: ${p.id}`;
        }).join('\n');
        return {
          content: [{ type: 'text' as const, text: `🚀 Proyectos (${projs.length}):\n\n${list}` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al listar proyectos: ${err.message}` }] };
      }
    }
  );

  // --- actualizar_proyecto ---
  srv.tool(
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
      try {
        const updated = await ProjectService.update(id, data, 'mcp');
        return {
          content: [{ type: 'text' as const, text: `✅ Proyecto actualizado con éxito:\n- Nombre: "${updated.name}"\n- Estado: ${updated.status}\n- Precio: $${Number(updated.sold_price).toLocaleString('es-CL')}\n- Inicio: ${updated.start_date || 'N/A'}\n- Entrega: ${updated.due_date || 'Pendiente'}` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al actualizar proyecto: ${err.message}` }] };
      }
    }
  );

  // --- consultar_panel_clientes ---
  srv.tool(
    'consultar_panel_clientes',
    'Consultar la matriz ejecutiva del Panel de Clientes (Servicio contratado, etapa operativa y estado de cobro/pago cruzado con finanzas).',
    {},
    async () => {
      try {
        const data = await AnalyticsService.getClientPanel();
        const m = data.metrics;
        let header = `📊 **PANEL DE CLIENTES (CRM METODOAI)**\n`;
        header += `• Clientes en cartera: ${m.clients_count.summary_text}\n`;
        header += `• Retainer total: ${m.retainer?.formatted || '$790.000/mes'} (${m.retainer?.note || 'Cartera mensual recurrente contratada'})\n`;
        header += `• Ticket promedio proyectos (One-Off): ${m.avg_ticket_projects?.formatted || '$770.000'}\n`;
        header += `• Ticket promedio retainer: ${m.avg_ticket_retainer?.formatted || '$790.000/mes'}\n\n`;
        header += `**Matriz de Clientes (Servicio, Etapa y Cobro):**\n`;

        const rows = data.clients.map((c: any) => {
          return `• **${c.name}** [${c.status_label.toUpperCase()}]\n  - Servicio(s): ${c.services} (${c.service_category_label})\n  - Etapa: ${c.stage}\n  - Cobro / Pago: ${c.billing_status}`;
        }).join('\n\n');

        return {
          content: [{ type: 'text' as const, text: `${header}\n${rows}` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al consultar panel de clientes: ${err.message}` }] };
      }
    }
  );

}

