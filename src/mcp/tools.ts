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
  AgencyProfileService, CustomerProfileService, EntryOfferService,
  ValueMatrixService, MessagingFrameworkService, SalesPlaybookService,
  SalesObjectionService, SurveyService
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
    'piloto': 'pilot',
    'pilot': 'pilot',
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

// Helper to resolve service by ID or fuzzy name search
async function resolveServiceId(serviceId?: string, serviceName?: string): Promise<{ id: string; name: string; setup_price?: number; recurring_price?: number } | null> {
  if (serviceId) {
    try {
      const srv = await ServiceCatalog.getById(serviceId);
      if (srv) return { id: srv.id, name: srv.name, setup_price: srv.standard_setup_price, recurring_price: srv.standard_recurring_price };
    } catch {
      // Fallback to ID directly
    }
    return { id: serviceId, name: 'Servicio' };
  }
  if (serviceName) {
    try {
      const all = await ServiceCatalog.getAll({ active: true });
      const term = serviceName.trim().toLowerCase();
      const match = all.find((s: any) =>
        s.name.toLowerCase() === term ||
        s.name.toLowerCase().includes(term) ||
        (s.code && s.code.toLowerCase() === term)
      );
      if (match) {
        return { id: match.id, name: match.name, setup_price: match.standard_setup_price, recurring_price: match.standard_recurring_price };
      }
    } catch {
      // Ignore error
    }
  }
  return null;
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
    'Crear una nueva oportunidad de venta en el pipeline del CRM, incluyendo opcionalmente el servicio cotizado (por ID o nombre) y el snapshot estratégico.',
    {
      name: z.string().optional().describe('Nombre u objetivo del trato (ej: Implementación CRM para Cliente X)'),
      title: z.string().optional().describe('Alias de nombre para el trato'),
      contact_id: z.string().optional().describe('ID del contacto asociado'),
      company_id: z.string().optional().describe('ID de la empresa asociada'),
      lead_id: z.string().optional().describe('ID del lead de origen si existe'),
      service_id: z.string().optional().describe('ID del servicio principal cotizado del catálogo'),
      service_name: z.string().optional().describe('Nombre del servicio del catálogo a vincular (si no tienes el ID, se buscará automáticamente)'),
      estimated_value: z.number().optional().describe('Valor estimado del setup / venta'),
      setup_value: z.number().optional().describe('Valor de setup inicial'),
      recurring_value: z.number().optional().describe('Valor mensual recurrente (MRR)'),
      stage: z.enum(['new', 'contacted', 'qualified', 'meeting_scheduled', 'proposal_sent', 'negotiation', 'pilot', 'won', 'lost', 'nuevo', 'contactado', 'calificado', 'reunion', 'propuesta', 'negociacion', 'piloto', 'ganado', 'perdido']).optional().describe('Etapa del pipeline'),
      notes: z.string().optional().describe('Notas adicionales'),
      // Snapshot Estratégico
      agency_profile_id: z.string().optional().describe('ID de la estrategia/perfil de agencia activa'),
      entry_offer_id: z.string().optional().describe('ID de la puerta de entrada comercial (Marketing, Automatización, etc.)'),
      customer_profile_id: z.string().optional().describe('ID del avatar / ICP clasificado'),
      messaging_framework_id: z.string().optional().describe('ID del framework de mensajes aplicado'),
      sales_playbook_id: z.string().optional().describe('ID del playbook de ventas utilizado'),
    },
    async (data) => {
      try {
        let finalServiceId = data.service_id;
        let serviceInfo: any = null;
        if (data.service_id || data.service_name) {
          serviceInfo = await resolveServiceId(data.service_id, data.service_name);
          if (serviceInfo) {
            finalServiceId = serviceInfo.id;
          }
        }

        const oppName = data.name || data.title || (serviceInfo ? `Oportunidad: ${serviceInfo.name}` : 'Nueva Oportunidad');
        let setupVal = data.setup_value ?? data.estimated_value;
        if (setupVal === undefined && serviceInfo?.setup_price !== undefined) {
          setupVal = serviceInfo.setup_price;
        }
        setupVal = setupVal ?? 0;

        let recVal = data.recurring_value;
        if (recVal === undefined && serviceInfo?.recurring_price !== undefined) {
          recVal = serviceInfo.recurring_price;
        }
        recVal = recVal ?? 0;

        const normStage = normalizeStage(data.stage) || 'new';

        const payload: any = {
          name: oppName,
          contact_id: data.contact_id,
          company_id: data.company_id,
          lead_id: data.lead_id,
          service_id: finalServiceId,
          setup_value: setupVal,
          recurring_value: recVal,
          stage: normStage,
          notes: data.notes,
          agency_profile_id: data.agency_profile_id,
          entry_offer_id: data.entry_offer_id,
          customer_profile_id: data.customer_profile_id,
          messaging_framework_id: data.messaging_framework_id,
          sales_playbook_id: data.sales_playbook_id,
        };

        const opp = await OpportunityService.create(payload);
        const srvText = serviceInfo ? ` | Servicio: "${serviceInfo.name}"` : (finalServiceId ? ` | Service ID: ${finalServiceId}` : '');
        return {
          content: [{ type: 'text' as const, text: `✅ Oportunidad creada: "${opp.name}" (ID: ${opp.id}) en etapa "${opp.stage}"${srvText} | Setup: $${opp.setup_value} | Recurrente: $${opp.recurring_value}/mes` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al crear oportunidad: ${err.message}` }] };
      }
    }
  );

  // --- listar_oportunidades ---
  srv.tool(
    'listar_oportunidades',
    'Ver las oportunidades actuales en el pipeline de ventas con sus servicios y empresas vinculadas.',
    {
      stage: z.string().optional().describe('Filtrar por etapa del pipeline'),
      service_id: z.string().optional().describe('Filtrar por ID del servicio vinculado'),
      company_id: z.string().optional().describe('Filtrar por ID de la empresa'),
      limit: z.number().optional().describe('Máximo de resultados (default 20)'),
    },
    async (filters) => {
      try {
        const normFilters = {
          ...filters,
          stage: normalizeStage(filters.stage),
        };
        const opps = await OpportunityService.getAll(normFilters);
        const list = opps.map((o: any) => {
          const srvName = o.services?.name ? ` | Servicio: ${o.services.name}` : (o.service_id ? ` | Service ID: ${o.service_id}` : '');
          const companyName = o.companies?.name ? ` | Empresa: ${o.companies.name}` : '';
          return `• [${(o.stage || 'new').toUpperCase()}] ${o.name || o.title || 'Sin nombre'}${companyName}${srvName} | Setup: $${o.setup_value || 0} | MRR: $${o.recurring_value || 0}/mes | ID: ${o.id}`;
        }).join('\n');
        return {
          content: [{ type: 'text' as const, text: opps.length > 0 ? `📊 Pipeline (${opps.length}):\n\n${list}` : 'No hay oportunidades activas.' }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al listar oportunidades: ${err.message}` }] };
      }
    }
  );

  // --- obtener_oportunidad ---
  srv.tool(
    'obtener_oportunidad',
    'Obtener el detalle completo de una oportunidad del CRM por su ID (incluyendo servicio vinculado, empresa, contacto y snapshot estratégico).',
    {
      id: z.string().describe('ID de la oportunidad a consultar'),
    },
    async ({ id }) => {
      try {
        const opp = await OpportunityService.getWithRelations(id);
        if (!opp) {
          return { content: [{ type: 'text' as const, text: `❌ Oportunidad no encontrada con ID: ${id}` }] };
        }

        const contactName = opp.contacts ? `${opp.contacts.first_name || ''} ${opp.contacts.last_name || ''}`.trim() : 'N/A';
        const companyName = opp.companies?.name || 'N/A';
        const serviceName = opp.services?.name ? `${opp.services.name} (${opp.services.category || 'General'})` : (opp.service_id ? `ID: ${opp.service_id}` : 'Sin vincular');

        const detail = `📋 **Detalle de Oportunidad**\n` +
          `- **Nombre:** ${opp.name}\n` +
          `- **ID:** ${opp.id}\n` +
          `- **Etapa:** ${(opp.stage || 'new').toUpperCase()}\n` +
          `- **Empresa:** ${companyName}\n` +
          `- **Contacto:** ${contactName}\n` +
          `- **Servicio Vinculado:** ${serviceName}\n` +
          `- **Setup:** $${opp.setup_value || 0}\n` +
          `- **Recurrente (MRR):** $${opp.recurring_value || 0}/mes\n` +
          `- **Probabilidad:** ${((opp.probability || 0) * 100).toFixed(0)}%\n` +
          `- **Siguiente Acción:** ${opp.next_action || 'N/A'} (Fecha: ${opp.next_action_date || 'N/A'})\n` +
          `- **Notas:** ${opp.notes || 'N/A'}`;

        return { content: [{ type: 'text' as const, text: detail }] };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al obtener oportunidad: ${err.message}` }] };
      }
    }
  );

  // --- actualizar_oportunidad ---
  srv.tool(
    'actualizar_oportunidad',
    'Actualizar el estado, información, servicio vinculado o snapshot estratégico de una oportunidad en el pipeline.',
    {
      id: z.string().describe('ID de la oportunidad a actualizar'),
      service_id: z.string().optional().describe('ID del servicio a vincular a la oportunidad'),
      service_name: z.string().optional().describe('Nombre del servicio del catálogo a vincular (lo busca y vincula automáticamente)'),
      stage: z.string().optional().describe('Nueva etapa del pipeline (new, contacted, qualified, meeting_scheduled, proposal_sent, negotiation, pilot, won, lost)'),
      setup_value: z.number().optional().describe('Valor de setup actualizado'),
      recurring_value: z.number().optional().describe('Valor recurrente mensual actualizado'),
      estimated_value: z.number().optional().describe('Alias para setup_value'),
      notes: z.string().optional().describe('Notas adicionales'),
      name: z.string().optional().describe('Nuevo nombre de la oportunidad'),
      title: z.string().optional().describe('Alias para name'),
      probability: z.number().optional().describe('Probabilidad de éxito o cierre (0 a 100)'),
      // Snapshot Estratégico
      agency_profile_id: z.string().optional().describe('ID de la estrategia/perfil de agencia'),
      entry_offer_id: z.string().optional().describe('ID de la puerta de entrada comercial'),
      customer_profile_id: z.string().optional().describe('ID del avatar / ICP'),
      messaging_framework_id: z.string().optional().describe('ID del framework de mensajes'),
      sales_playbook_id: z.string().optional().describe('ID del playbook de ventas'),
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

        let linkedServiceName = '';
        if (data.service_id || data.service_name) {
          const srv = await resolveServiceId(data.service_id, data.service_name);
          if (srv) {
            payload.service_id = srv.id;
            linkedServiceName = srv.name;
          } else if (data.service_id) {
            payload.service_id = data.service_id;
          }
        }

        if (data.agency_profile_id !== undefined) payload.agency_profile_id = data.agency_profile_id;
        if (data.entry_offer_id !== undefined) payload.entry_offer_id = data.entry_offer_id;
        if (data.customer_profile_id !== undefined) payload.customer_profile_id = data.customer_profile_id;
        if (data.messaging_framework_id !== undefined) payload.messaging_framework_id = data.messaging_framework_id;
        if (data.sales_playbook_id !== undefined) payload.sales_playbook_id = data.sales_playbook_id;

        const opp = await OpportunityService.update(id, payload);
        const srvNote = linkedServiceName ? ` | Servicio vinculado: "${linkedServiceName}"` : (payload.service_id ? ` | Service ID: ${payload.service_id}` : '');
        const lostNote = payload.stage === 'lost' ? ' ⚠️ (Proyectos asociados cancelados automáticamente para consistencia)' : '';
        return {
          content: [{ type: 'text' as const, text: `✅ Oportunidad actualizada: "${opp.name}" → etapa "${opp.stage}"${srvNote}${lostNote}` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al actualizar oportunidad: ${err.message}` }] };
      }
    }
  );

  // --- registrar_actividad ---
  srv.tool(
    'registrar_actividad',
    'Registrar una actividad comercial o tarea operativa: reunión, llamada, propuesta, tarea o nota. IMPORTANTE: Definir con claridad el nombre de la tarea (title), el resultado esperado o entregable concreto (desired_outcome) y el siguiente paso posterior real (next_action, solo si es diferente al título).',
    {
      opportunity_id: z.string().optional().describe('ID de la oportunidad relacionada'),
      contact_id: z.string().optional().describe('ID del contacto relacionado'),
      company_id: z.string().optional().describe('ID de la empresa relacionada'),
      type: z.enum(['meeting', 'call', 'email', 'proposal', 'whatsapp', 'note', 'demo', 'follow_up', 'task', 'negotiation']).describe('Tipo de actividad'),
      title: z.string().optional().describe('Nombre o título concreto de la tarea o actividad actual'),
      description: z.string().optional().describe('Descripción detallada de lo que se realiza'),
      notes: z.string().optional().describe('Notas o comentarios adicionales'),
      result: z.string().optional().describe('Resultado, conclusión o estado actual de la actividad (ej: pendiente, en proceso, completada)'),
      next_action: z.string().optional().describe('Siguiente paso posterior a realizar una vez concluida o avanzada la tarea (NO repetir el título de la tarea actual)'),
      next_action_date: z.string().optional().describe('Fecha límite o programada del siguiente paso (YYYY-MM-DD)'),
      scheduled_at: z.string().optional().describe('Fecha y hora programada o efectuada (ISO 8601)'),
      occurred_at: z.string().optional().describe('Fecha y hora efectuada (ISO 8601)'),
      // Ejecución estratégica real
      playbook_step_id: z.string().optional().describe('ID del paso de playbook ejecutado'),
      objection_id: z.string().optional().describe('ID de la objeción estratégica vinculada'),
      objection_text: z.string().optional().describe('Lo que realmente dijo el prospecto como objeción'),
      response_used: z.string().optional().describe('Respuesta o argumento que se le dio al prospecto'),
      buyer_signal: z.string().optional().describe('Señal de compra o estado de decisión detectado'),
      pain_detected: z.string().optional().describe('Dolor o problema concreto manifestado por el prospecto'),
      desired_outcome: z.string().optional().describe('Resultado esperado o entregable concreto que valida el éxito de la tarea (ej: documento firmado, factura pagada, wireframe aprobado)'),
      meeting_summary: z.string().optional().describe('Resumen ejecutivo de la reunión o llamada'),
      ai_analysis: z.record(z.any()).optional().describe('Análisis o estructuración generada por IA'),
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
          playbook_step_id: data.playbook_step_id || null,
          objection_id: data.objection_id || null,
          objection_text: data.objection_text || null,
          response_used: data.response_used || null,
          buyer_signal: data.buyer_signal || null,
          pain_detected: data.pain_detected || null,
          desired_outcome: data.desired_outcome || null,
          meeting_summary: data.meeting_summary || null,
          ai_analysis: data.ai_analysis || null,
        };

        const activity = await ActivityService.create(payload);
        return {
          content: [{ type: 'text' as const, text: `✅ Actividad registrada exitosamente:\n- Tipo: ${mappedType.toUpperCase()}\n- Detalle: ${combinedNotes}\n- ID: ${activity.id}${data.pain_detected ? `\n- Dolor detectado: ${data.pain_detected}` : ''}${data.objection_text ? `\n- Objeción: ${data.objection_text}` : ''}` }],
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

  // --- listar_tareas ---
  srv.tool(
    'listar_tareas',
    'Listar tareas comerciales y operativas pendientes o en curso, con empresa asociada y fecha límite.',
    {
      estado: z.enum(['pendiente', 'en_proceso', 'completada', 'todas']).optional().describe('Filtrar por estado: pendiente, en_proceso, completada, todas (por defecto: pendiente)'),
      empresa: z.string().optional().describe('Filtrar por nombre o ID de empresa'),
      limit: z.number().optional().describe('Máximo de resultados a devolver (por defecto 30)'),
    },
    async (filters) => {
      try {
        const repoFilters: any = {
          status: filters.estado || 'pendiente',
          limit: filters.limit || 30,
        };
        if (filters.empresa) {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.empresa);
          if (isUuid) repoFilters.company_id = filters.empresa;
          else repoFilters.company_name = filters.empresa;
        }

        const tasks = await ActivityService.getTasks(repoFilters);
        if (tasks.length === 0) {
          return { content: [{ type: 'text' as const, text: `No se encontraron tareas con estado "${repoFilters.status}".` }] };
        }

        const list = tasks.map((t: any) => {
          let stBadge = '⏳ PENDIENTE';
          if (t.status === 'completed') stBadge = '✅ COMPLETADA';
          else if (t.status === 'in_progress') stBadge = '🔄 EN PROCESO';
          else if (t.status === 'cancelled') stBadge = '🚫 CANCELADA';

          const empresa = t.companies?.name || 'MetodoAI (Interno)';
          const fechaLimite = t.next_action_date ? formatDateCL(t.next_action_date) : 'Sin fecha asignada';
          const titulo = t.notes || t.next_action || 'Sin descripción';
          const resultado = t.result ? `\n    Resultado: ${t.result}` : '';
          const entregable = t.desired_outcome ? `\n    Entregable esperado: ${t.desired_outcome}` : '';
          return `• [${stBadge}] **${titulo}**\n  - Empresa: ${empresa} | Fecha Límite: ${fechaLimite} | ID: \`${t.id}\`${entregable}${resultado}`;
        }).join('\n\n');

        return {
          content: [{ type: 'text' as const, text: `📋 Tareas (${tasks.length}):\n\n${list}` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al listar tareas: ${err.message}` }] };
      }
    }
  );

  // --- completar_tarea ---
  srv.tool(
    'completar_tarea',
    'Marcar una tarea como completada en el CRM, registrando el resultado o entregable obtenido.',
    {
      id: z.string().describe('ID UUID de la tarea a completar'),
      resultado: z.string().optional().describe('Resultado, entregable o conclusión de la tarea completada'),
      notas: z.string().optional().describe('Notas o comentarios finales adicionales'),
    },
    async ({ id, resultado, notas }) => {
      try {
        const updated = await ActivityService.completeTask(id, resultado, notas, 'mcp');
        return {
          content: [{ type: 'text' as const, text: `✅ Tarea completada exitosamente:\n- Tarea: ${updated.notes || updated.next_action || id}\n- Estado: [✅ COMPLETADA]\n- Resultado: ${updated.result || 'Registrada como completada'}` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al completar tarea: ${err.message}` }] };
      }
    }
  );

  // --- actualizar_tarea ---
  srv.tool(
    'actualizar_tarea',
    'Actualizar estado, fecha límite, notas o entregable de una tarea operativa.',
    {
      id: z.string().describe('ID UUID de la tarea a actualizar'),
      estado: z.enum(['pendiente', 'en_proceso', 'completada', 'cancelada', 'cancelled', 'pending', 'in_progress', 'completed']).optional().describe('Nuevo estado de la tarea: pendiente, en_proceso, completada, cancelada/cancelled'),
      fecha_limite: z.string().optional().describe('Nueva fecha límite (YYYY-MM-DD)'),
      siguiente_paso: z.string().optional().describe('Siguiente acción o paso posterior'),
      resultado_esperado: z.string().optional().describe('Resultado esperado o entregable concreto que valida el éxito'),
      notas: z.string().optional().describe('Notas o comentarios de avance'),
    },
    async ({ id, estado, fecha_limite, siguiente_paso, resultado_esperado, notas }) => {
      try {
        const payload: any = {};
        if (estado) payload.status = estado;
        if (fecha_limite !== undefined) payload.next_action_date = fecha_limite;
        if (siguiente_paso !== undefined) payload.next_action = siguiente_paso;
        if (resultado_esperado !== undefined) payload.desired_outcome = resultado_esperado;
        if (notas !== undefined) payload.notes = notas;

        const updated = await ActivityService.updateTask(id, payload, 'mcp');
        let stBadge = updated.status;
        if (updated.status === 'completed') stBadge = '✅ COMPLETADA';
        else if (updated.status === 'cancelled') stBadge = '🚫 CANCELADA';
        else if (updated.status === 'in_progress') stBadge = '🔄 EN PROCESO';
        else if (updated.status === 'pending') stBadge = '⏳ PENDIENTE';

        return {
          content: [{ type: 'text' as const, text: `✅ Tarea actualizada correctamente:\n- Tarea: ${updated.notes || updated.next_action || id}\n- Estado: [${stBadge}]\n- Fecha límite: ${updated.next_action_date || 'Sin fecha'}` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al actualizar tarea: ${err.message}` }] };
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
        const fin = data.finance || {};
        const sales = data.sales || {};

        const sold = (Number(fin.total_sold_gross) || 0).toLocaleString('es-CL');
        const invoiced = (Number(fin.total_invoiced) || 0).toLocaleString('es-CL');
        const collected = (Number(fin.total_collected) || 0).toLocaleString('es-CL');
        const porCobrar = (Number(fin.por_cobrar) || 0).toLocaleString('es-CL');
        const porFacturar = (Number(fin.por_facturar) || 0).toLocaleString('es-CL');
        const netCash = (Number(fin.net_cash) || 0).toLocaleString('es-CL');

        const text = `📊 **DASHBOARD EJECUTIVO CRM**\n\n` +
          `💰 **ESTADO FINANCIERO:**\n` +
          `• Total Vendido Ganado (IVA incl.): $${sold}\n` +
          `• Total Facturado Emitido: $${invoiced}\n` +
          `• Total Cobrado Real en Banco: $${collected}\n` +
          `• Caja Neta Disponible: $${netCash}\n\n` +
          `⚖️ **CONTROL DE COBRO Y FACTURACIÓN:**\n` +
          `• 💳 **Cuentas por Cobrar (Facturado no pagado):** $${porCobrar} (Facturas vencidas: ${fin.overdue_count || 0})\n` +
          `• ⏳ **Pendiente de Facturar (Vendido sin factura):** $${porFacturar}\n\n` +
          `📈 **PIPELINE COMERCIAL:**\n` +
          `• Oportunidades Abiertas: ${sales.open_opportunities || 0}\n` +
          `• Oportunidades Ganadas: ${sales.won_total || 0}\n` +
          `• Tasa de Cierre (Win Rate): ${sales.win_rate || 0}%`;

        return {
          content: [{
            type: 'text' as const,
            text,
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
    'Marcar una oportunidad como perdida en el pipeline, registrando el motivo de pérdida y gestionando sus proyectos asociados.',
    {
      id: z.string().describe('ID UUID o nombre de la oportunidad perdida'),
      reason: z.string().optional().describe('Motivo de la pérdida (ej: Precio alto, Decidió esperar, Eligió a la competencia)'),
      cancelar_proyectos: z.boolean().optional().default(true).describe('Si es true (por defecto), cancela automáticamente los proyectos asociados en curso para mantener consistencia'),
    },
    async ({ id, reason, cancelar_proyectos = true }) => {
      try {
        let oppId = id.trim();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(oppId);
        if (!isUuid) {
          const found = await OpportunityService.search(oppId);
          if (found && found.length > 0) {
            oppId = found[0].id;
          }
        }

        const result = await OpportunityService.closeLost(oppId, reason, cancelar_proyectos, 'mcp');
        const opp = result.opportunity;

        let msg = `📉 **Oportunidad marcada como PERDIDA:**\n` +
          `• **Oportunidad:** ${opp?.name || oppId}\n` +
          `• **ID:** \`${opp?.id || oppId}\`\n` +
          `• **Motivo:** ${reason || opp?.lost_reason || 'No especificado'}`;

        if (result.cancelledProjects && result.cancelledProjects.length > 0) {
          msg += `\n\n⚠️ **Proyectos asociados cancelados automáticamente (${result.cancelledProjects.length}):**\n` +
            result.cancelledProjects.map((p: any) => `• Proyecto: "${p.name}" (ID: \`${p.id}\`) → Estado cambiado a **CANCELADO**`).join('\n');
        } else if (result.openProjects && result.openProjects.length > 0 && !cancelar_proyectos) {
          msg += `\n\n⚠️ **ATENCIÓN: Existen proyectos asociados que siguen abiertos (${result.openProjects.length}):**\n` +
            result.openProjects.map((p: any) => `• Proyecto: "${p.name}" (ID: \`${p.id}\`, Estado actual: ${p.status})`).join('\n') +
            `\nPuedes cancelarlos usando actualizar_proyecto o ejecutando cerrar_oportunidad_perdida con cancelar_proyectos: true.`;
        } else {
          msg += `\n• **Proyectos asociados:** No hay proyectos abiertos pendientes.`;
        }

        return {
          content: [{ type: 'text' as const, text: msg }],
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
    'Actualizar datos de una factura existente por su número de folio (ej: 84) o ID, incluyendo estado, fechas, notas o montos.',
    {
      numero: z.union([z.string(), z.number()]).optional().describe('Número o folio de la factura a actualizar (ej: 84, 68)'),
      id: z.string().optional().describe('ID UUID de la factura si no se cuenta con el número'),
      client_id: z.string().optional().describe('ID del cliente o empresa asociado a la factura'),
      project_id: z.string().optional().describe('ID del proyecto asociado a la factura'),
      subscription_id: z.string().optional().describe('ID de la suscripción asociada a la factura'),
      invoice_number: z.string().optional().describe('Nuevo número o folio de la factura si cambia'),
      estado: z.enum(['pagada', 'pendiente', 'vencida', 'anulada']).optional().describe('Estado de la factura: pagada, pendiente, vencida, anulada'),
      status: z.string().optional().describe('Alias para estado'),
      issue_date: z.string().optional().describe('Fecha de emisión (YYYY-MM-DD)'),
      due_date: z.string().optional().describe('Fecha de vencimiento (YYYY-MM-DD)'),
      subtotal: z.number().optional().describe('Monto neto o subtotal'),
      tax_amount: z.number().optional().describe('Monto de IVA (19%)'),
      total: z.number().optional().describe('Monto total bruto'),
      notes: z.string().optional().describe('Notas o concepto de la factura'),
    },
    async ({ numero, id, estado, status, ...data }) => {
      try {
        const identifier = numero !== undefined ? String(numero).trim() : id;
        if (!identifier) {
          return { content: [{ type: 'text' as const, text: '❌ Debe indicar el número de factura (ej: 84) o su ID.' }] };
        }

        const prev = await InvoiceService.getById(identifier);
        if (!prev) {
          return { content: [{ type: 'text' as const, text: `❌ No se encontró la factura con identificador: ${identifier}` }] };
        }

        const updatePayload: any = { ...data };
        if (estado) updatePayload.status = estado;
        else if (status) updatePayload.status = status;

        const invoice = await InvoiceService.update(identifier, updatePayload, 'mcp');
        const folioText = invoice.invoice_number ? `Factura N° ${invoice.invoice_number}` : `Factura ID: ${invoice.id.slice(0, 8)}`;

        // Detectar cambios aplicados
        const changes: string[] = [];
        if (updatePayload.subtotal !== undefined && Number(prev.subtotal) !== Number(invoice.subtotal)) {
          changes.push(`• Neto: $${Number(prev.subtotal).toLocaleString('es-CL')} → $${Number(invoice.subtotal).toLocaleString('es-CL')}`);
        }
        if (updatePayload.tax_amount !== undefined && Number(prev.tax_amount) !== Number(invoice.tax_amount)) {
          changes.push(`• IVA (19%): $${Number(prev.tax_amount).toLocaleString('es-CL')} → $${Number(invoice.tax_amount).toLocaleString('es-CL')}`);
        }
        if (updatePayload.total !== undefined && Number(prev.total) !== Number(invoice.total)) {
          changes.push(`• Total: $${Number(prev.total).toLocaleString('es-CL')} → $${Number(invoice.total).toLocaleString('es-CL')}`);
        }
        if (prev.estado !== invoice.estado) {
          changes.push(`• Estado: [${prev.estado_legible}] → [${invoice.estado_legible}]`);
        }
        if (updatePayload.due_date && prev.due_date !== invoice.due_date) {
          changes.push(`• Vencimiento: ${formatDateCL(prev.due_date)} → ${formatDateCL(invoice.due_date)}`);
        }
        if (updatePayload.issue_date && prev.issue_date !== invoice.issue_date) {
          changes.push(`• Emisión: ${formatDateCL(prev.issue_date)} → ${formatDateCL(invoice.issue_date)}`);
        }
        if (updatePayload.notes !== undefined && (prev.notes || '') !== (invoice.notes || '')) {
          changes.push(`• Concepto: "${prev.notes || 'Sin concepto'}" → "${invoice.notes || 'Sin concepto'}"`);
        }

        const changesSection = changes.length > 0
          ? `\n\n📝 **Cambios realizados:**\n${changes.join('\n')}`
          : '\n\n📝 **Cambios realizados:** Ninguno (valores confirmados sin variación).';

        const totalFormatted = (Number(invoice.total) || 0).toLocaleString('es-CL');
        const subtotalFormatted = (Number(invoice.subtotal) || 0).toLocaleString('es-CL');
        const ivaFormatted = (Number(invoice.tax_amount) || 0).toLocaleString('es-CL');
        const pagadoFormatted = (invoice.paid_amount || 0).toLocaleString('es-CL');
        const saldoFormatted = (invoice.pending_amount || 0).toLocaleString('es-CL');

        let msg = `✅ **${folioText} actualizada correctamente:**\n` +
          `• **Empresa:** ${invoice.company_name}\n` +
          `• **Proyecto:** ${invoice.project_name}\n` +
          `• **Estado:** [${invoice.estado_legible}]\n` +
          `• **Monto Total:** $${totalFormatted} (Neto: $${subtotalFormatted} + IVA 19%: $${ivaFormatted})\n` +
          `• **Monto Pagado:** $${pagadoFormatted} | **Saldo Pendiente:** $${saldoFormatted}\n` +
          `• **Fecha Emisión:** ${formatDateCL(invoice.issue_date)} | **Vencimiento:** ${formatDateCL(invoice.due_date)}`;

        if (invoice.notes) {
          msg += `\n• **Concepto / Notas:** ${invoice.notes}`;
        }
        msg += changesSection;

        return {
          content: [{ type: 'text' as const, text: msg }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al actualizar factura: ${err.message}` }] };
      }
    }
  );

  // --- obtener_factura ---
  srv.tool(
    'obtener_factura',
    'Consultar el detalle completo de una factura por su número de folio (ej: 84) o ID.',
    {
      numero: z.union([z.string(), z.number()]).optional().describe('Número o folio de la factura a consultar (ej: 84, 68)'),
      id: z.string().optional().describe('ID UUID de la factura si no se cuenta con el folio'),
    },
    async ({ numero, id }) => {
      try {
        const identifier = numero !== undefined ? String(numero).trim() : id;
        if (!identifier) {
          return { content: [{ type: 'text' as const, text: '❌ Debe indicar el número de factura (ej: 84) o su ID.' }] };
        }
        const inv = await InvoiceService.getById(identifier);
        if (!inv) {
          return { content: [{ type: 'text' as const, text: `❌ No se encontró la factura N° ${identifier}` }] };
        }

        const folio = inv.invoice_number ? `Factura N° ${inv.invoice_number}` : `Factura ID: ${inv.id.slice(0, 8)}`;
        const total = (Number(inv.total) || 0).toLocaleString('es-CL');
        const subtotal = (Number(inv.subtotal) || 0).toLocaleString('es-CL');
        const iva = (Number(inv.tax_amount) || 0).toLocaleString('es-CL');
        const paid = (inv.paid_amount || 0).toLocaleString('es-CL');
        const pending = (inv.pending_amount || 0).toLocaleString('es-CL');

        let text = `📄 **${folio}**\n` +
          `• **Empresa:** ${inv.company_name}\n` +
          `• **Proyecto:** ${inv.project_name}\n` +
          `• **Estado:** [${inv.estado_legible}]\n` +
          `• **Monto Total:** $${total} (Neto: $${subtotal} + IVA 19%: $${iva})\n` +
          `• **Monto Pagado:** $${paid} | **Saldo Pendiente:** $${pending}\n` +
          `• **Fecha Emisión:** ${formatDateCL(inv.issue_date)} | **Vencimiento:** ${formatDateCL(inv.due_date)}\n` +
          `• **Concepto / Notas:** ${inv.notes || 'Sin concepto registrado'}`;

        if (inv.payments && inv.payments.length > 0) {
          text += `\n\n💳 **Historial de Pagos:**\n` +
            inv.payments.map((p: any) => `  - ${formatDateCL(p.payment_date)}: $${Number(p.amount).toLocaleString('es-CL')} (${p.payment_method || 'Transferencia'})`).join('\n');
        }

        return { content: [{ type: 'text' as const, text }] };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al obtener factura: ${err.message}` }] };
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
    'Registrar un gasto o egreso operativo del negocio en el CRM.',
    {
      category: z.string().describe('Categoría del gasto (ej: software, advertising, contractor, infrastructure, office, services, etc.)'),
      amount: z.number().describe('Monto del gasto'),
      description: z.string().optional().describe('Descripción o detalle del gasto'),
      date: z.string().optional().describe('Fecha del gasto (YYYY-MM-DD, por defecto hoy)'),
      vendor_name: z.string().optional().describe('Nombre del proveedor o plataforma (ej: Meta Ads, Zapier, AWS, Claude, OpenAI)'),
      vendor_id: z.string().optional().describe('ID del proveedor si ya existe'),
      project_id: z.string().optional().describe('ID del proyecto si el gasto está asignado a un proyecto'),
      client_id: z.string().optional().describe('ID del cliente si el gasto es atribuible a un cliente'),
      payment_account: z.string().optional().describe('Medio o cuenta de pago (ej: tarjeta_empresa, transferencia)'),
      currency: z.string().optional().describe('Moneda (USD, CLP, etc. Por defecto CLP)'),
      status: z.enum(['pending', 'paid', 'cancelled']).optional().describe('Estado del gasto (por defecto paid)'),
    },
    async (data) => {
      try {
        const expense = await ExpenseService.create(data, 'mcp');
        const formattedAmount = (Number(expense.total) || Number(data.amount)).toLocaleString('es-CL');
        return {
          content: [{
            type: 'text' as const,
            text: `✅ Gasto registrado exitosamente:\n- Categoría: ${expense.category || data.category}\n- Monto: $${formattedAmount}\n- Descripción: ${expense.description || data.description || 'Sin descripción'}\n- Fecha: ${formatDateCL(expense.date)}\n- ID: \`${expense.id}\``,
          }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al registrar gasto: ${err.message}` }] };
      }
    }
  );

  // --- listar_facturas ---
  srv.tool(
    'listar_facturas',
    'Ver facturas generadas en el CRM con detalle de empresa, proyecto, montos y estado.',
    {
      empresa: z.string().optional().describe('Filtrar por nombre o ID de empresa'),
      proyecto_id: z.string().optional().describe('Filtrar por ID de proyecto'),
      estado: z.enum(['pagada', 'pendiente', 'vencida', 'anulada', 'todas']).optional().describe('Filtrar por estado: pagada, pendiente, vencida, anulada (o todas)'),
      status: z.string().optional().describe('Alias para estado'),
    },
    async (filters) => {
      try {
        const repoFilters: any = {};
        if (filters.estado && filters.estado !== 'todas') repoFilters.status = filters.estado;
        else if (filters.status && filters.status !== 'todas') repoFilters.status = filters.status;
        if (filters.proyecto_id) repoFilters.project_id = filters.proyecto_id;
        if (filters.empresa) {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.empresa);
          if (isUuid) repoFilters.company_id = filters.empresa;
          else repoFilters.company_name = filters.empresa;
        }

        const invoices = await InvoiceService.getAll(repoFilters);
        if (invoices.length === 0) {
          return { content: [{ type: 'text' as const, text: 'No se encontraron facturas con los filtros indicados.' }] };
        }

        const list = invoices.map((i: any) => {
          const folio = i.invoice_number ? `Factura N° ${i.invoice_number}` : `Factura ID: ${i.id.slice(0, 8)}`;
          const paid = (i.paid_amount || 0).toLocaleString('es-CL');
          const total = (Number(i.total) || 0).toLocaleString('es-CL');
          const subtotal = (Number(i.subtotal) || 0).toLocaleString('es-CL');
          const iva = (Number(i.tax_amount) || 0).toLocaleString('es-CL');
          const emision = formatDateCL(i.issue_date);
          const vence = formatDateCL(i.due_date);
          const concepto = i.notes ? `\n    Concepto: ${i.notes}` : '';
          return `• **${folio}** | **Empresa:** ${i.company_name} | **Proyecto:** ${i.project_name}\n  - Estado: [${i.estado_legible}] | Total: $${total} (Neto: $${subtotal} + IVA: $${iva}) | Pagado: $${paid}\n  - Emisión: ${emision} | Vence: ${vence}${concepto}`;
        }).join('\n\n');

        return {
          content: [{ type: 'text' as const, text: `📋 Facturas del CRM (${invoices.length}):\n\n${list}` }],
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
    'Ver gastos y egresos del negocio con montos, fechas y categorías.',
    {
      category: z.string().optional().describe('Filtrar por categoría de gasto'),
    },
    async (filters) => {
      try {
        const expenses = await ExpenseService.getAll(filters);
        const list = expenses.map((e: any) => {
          const totalFormatted = (Number(e.total) || Number(e.amount) || 0).toLocaleString('es-CL');
          const dateFormatted = formatDateCL(e.date);
          const desc = e.description ? ` (${e.description})` : '';
          return `• **${e.category || 'General'}** | $${totalFormatted} | Fecha: ${dateFormatted}${desc} | ID: \`${e.id}\``;
        }).join('\n');
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
        header += `• Salud de la cartera: ${m.health_summary?.summary_text || '4 Óptimo · 1 Atención · 1 Riesgo'}\n`;
        header += `• Retainer total: ${m.retainer?.formatted || '$790.000/mes'} (${m.retainer?.note || 'Cartera mensual recurrente contratada'})\n`;
        header += `• Ticket promedio proyectos (One-Off): ${m.avg_ticket_projects?.formatted || '$770.000'}\n`;
        header += `• Ticket promedio retainer: ${m.avg_ticket_retainer?.formatted || '$790.000/mes'}\n\n`;
        header += `**Matriz de Clientes (Operación, Salud & Cobro):**\n`;

        const rows = data.clients.map((c: any) => {
          const healthEmoji = c.health_score === 'green' ? '🟢' : c.health_score === 'yellow' ? '🟡' : '🔴';
          return `• **${c.name}** [${c.status_label.toUpperCase()}] ${healthEmoji} ${c.health_label}\n  - LTV: ${c.ltv_formatted} | TTV: ${c.ttv_text}\n  - Servicio(s): ${c.services} (${c.service_category_label})\n  - Etapa: ${c.stage}\n  - Cobro / Pago: ${c.billing_status}\n  - Diagnóstico Salud: ${c.health_reason}\n  - Próxima Acción: ${c.next_action}`;
        }).join('\n\n');

        return {
          content: [{ type: 'text' as const, text: `${header}\n${rows}` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al consultar panel de clientes: ${err.message}` }] };
      }
    }
  );

  // ============================================================================
  // STRATEGY LAYER TOOLS (CAPA ESTRATÉGICA)
  // ============================================================================

  // --- 1. obtener_identidad_agencia ---
  srv.tool(
    'obtener_identidad_agencia',
    'Obtener la identidad, nicho, posicionamiento, super promesa, mecanismo único y filosofía de ventas activa de la agencia.',
    {},
    async () => {
      try {
        const profile = await AgencyProfileService.getActive();
        if (!profile) {
          return { content: [{ type: 'text' as const, text: 'ℹ️ No hay un perfil de agencia activo configurado.' }] };
        }
        const text = `🏛️ **IDENTIDAD & ESTRATEGIA DE AGENCIA: ${profile.agency_name || profile.name}** (v${profile.version})\n\n` +
          `• **Nicho**: ${profile.niche || 'N/A'}\n` +
          `• **Posicionamiento**: ${profile.positioning || 'N/A'}\n` +
          `• **🌟 Super Promesa**: ${profile.super_promise || 'N/A'}\n` +
          `• **Problema Core**: ${profile.core_problem || 'N/A'}\n` +
          `• **Transformación Deseada**: ${profile.desired_transformation || 'N/A'}\n` +
          `• **Mecanismo Único**: ${profile.unique_mechanism || 'N/A'}\n` +
          `• **Tono de Voz**: ${profile.tone_of_voice || 'N/A'}\n` +
          `• **Filosofía de Ventas**: ${profile.sales_philosophy || 'N/A'}\n` +
          `• **Diferenciadores**: ${Array.isArray(profile.differentiators) ? profile.differentiators.join(', ') : 'N/A'}\n` +
          `• **Palabras de Marca**: ${Array.isArray(profile.brand_keywords) ? profile.brand_keywords.join(', ') : 'N/A'}\n` +
          `• **Lenguaje a Evitar**: ${Array.isArray(profile.avoid_language) ? profile.avoid_language.join(', ') : 'N/A'}\n` +
          `• **ID**: ${profile.id}`;
        return { content: [{ type: 'text' as const, text }] };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al obtener identidad de agencia: ${err.message}` }] };
      }
    }
  );

  // --- 2. listar_customer_profiles ---
  srv.tool(
    'listar_customer_profiles',
    'Listar los avatares / ICPs (Ideal Customer Profiles) definidos por la agencia con sus dolores, disparadores y criterios de calificación.',
    {
      industry: z.string().optional().describe('Filtrar por industria o sector'),
    },
    async (filters) => {
      try {
        const profiles = await CustomerProfileService.getActive(filters);
        if (profiles.length === 0) {
          return { content: [{ type: 'text' as const, text: 'No hay avatares / customer profiles activos registrados.' }] };
        }
        const list = profiles.map((p: any) => {
          const pains = Array.isArray(p.main_problems) ? p.main_problems.slice(0, 2).join('; ') : '';
          const triggers = Array.isArray(p.buying_triggers) ? p.buying_triggers.slice(0, 2).join('; ') : '';
          return `👤 **${p.name}** (${p.industry || 'Industria general'})\n` +
            `  - Decisor: ${p.decision_maker || 'N/A'}\n` +
            `  - Dolores clave: ${pains || 'N/A'}\n` +
            `  - Disparadores de compra: ${triggers || 'N/A'}\n` +
            `  - Urgencia / Presupuesto: ${p.urgency_level || 'N/A'} / ${p.budget_profile || 'N/A'}\n` +
            `  - ID: ${p.id}`;
        }).join('\n\n');
        return { content: [{ type: 'text' as const, text: `🎯 **Avatares / ICPs Activos (${profiles.length})**:\n\n${list}` }] };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al listar customer profiles: ${err.message}` }] };
      }
    }
  );

  // --- 3. obtener_customer_profile ---
  srv.tool(
    'obtener_customer_profile',
    'Obtener el perfil detallado de un avatar / ICP por su ID o nombre.',
    {
      id: z.string().describe('ID del customer profile / avatar'),
    },
    async ({ id }) => {
      try {
        const cp = await CustomerProfileService.getById(id);
        if (!cp) return { content: [{ type: 'text' as const, text: `No se encontró customer profile con ID "${id}".` }] };
        return { content: [{ type: 'text' as const, text: JSON.stringify(cp, null, 2) }] };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al obtener customer profile: ${err.message}` }] };
      }
    }
  );

  // --- 4. listar_entry_offers ---
  srv.tool(
    'listar_entry_offers',
    'Listar las puertas de entrada comerciales de la agencia (ej: Marketing, Automatización).',
    {},
    async () => {
      try {
        const offers = await EntryOfferService.getActive();
        if (offers.length === 0) {
          return { content: [{ type: 'text' as const, text: 'No hay ofertas de entrada comerciales registradas.' }] };
        }
        const list = offers.map((o: any) => {
          return `🚪 **${o.name}** (slug: \`${o.slug}\`)\n` +
            `  - Propuesta de valor: ${o.value_proposition || o.description || 'N/A'}\n` +
            `  - Mecanismo único: ${o.unique_mechanism || 'N/A'}\n` +
            `  - Avatar principal: ${o.customer_profiles?.name || 'General'}\n` +
            `  - CTA Principal: ${o.primary_cta || 'N/A'}\n` +
            `  - ID: ${o.id}`;
        }).join('\n\n');
        return { content: [{ type: 'text' as const, text: `🚪 **Puertas de Entrada Comerciales (${offers.length})**:\n\n${list}` }] };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al listar entry offers: ${err.message}` }] };
      }
    }
  );

  // --- 5. obtener_entry_offer ---
  srv.tool(
    'obtener_entry_offer',
    'Obtener el detalle completo de una puerta de entrada comercial por ID o slug, incluyendo la Super Promesa resuelta (con fallback automático a la agencia).',
    {
      id_or_slug: z.string().describe('ID (UUID) o slug de la puerta de entrada (ej: "marketing", "automatizacion")'),
    },
    async ({ id_or_slug }) => {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id_or_slug);
        const offer = isUuid ? await EntryOfferService.getById(id_or_slug) : await EntryOfferService.getBySlug(id_or_slug);
        if (!offer) {
          return { content: [{ type: 'text' as const, text: `No se encontró entry offer para "${id_or_slug}".` }] };
        }
        const text = `🚪 **PUERTA DE ENTRADA: ${offer.name}** (\`${offer.slug}\`)\n\n` +
          `• **Propuesta de Valor**: ${offer.value_proposition || 'N/A'}\n` +
          `• **🌟 Super Promesa**: ${offer.super_promise} ${offer.is_super_promise_inherited ? '(Heredada de la Agencia)' : '(Específica de la oferta)'}\n` +
          `• **Problema Principal**: ${offer.primary_problem || 'N/A'}\n` +
          `• **Resultado Deseado**: ${offer.desired_outcome || 'N/A'}\n` +
          `• **Mecanismo Único**: ${offer.unique_mechanism || 'N/A'}\n` +
          `• **Mensaje de Calificación**: ${offer.qualification_message || 'N/A'}\n` +
          `• **CTA Principal**: ${offer.primary_cta || 'N/A'}\n` +
          `• **Objeciones Principales**: ${Array.isArray(offer.main_objections) ? offer.main_objections.join(', ') : 'N/A'}\n` +
          `• **ID**: ${offer.id}`;
        return { content: [{ type: 'text' as const, text }] };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al obtener entry offer: ${err.message}` }] };
      }
    }
  );

  // --- 6. obtener_matriz_valor_servicio ---
  srv.tool(
    'obtener_matriz_valor_servicio',
    'Consultar la matriz de valor de servicios dentro de una puerta de entrada específica (ancla de valor, analogía, problema resuelto, entregable y notas de venta).',
    {
      entry_offer_id: z.string().describe('ID de la puerta de entrada (Entry Offer)'),
      service_id: z.string().optional().describe('ID opcional del servicio específico para ver su matriz'),
    },
    async ({ entry_offer_id, service_id }) => {
      try {
        if (service_id) {
          const matrix = await ValueMatrixService.getValueMatrix(entry_offer_id, service_id);
          if (!matrix) return { content: [{ type: 'text' as const, text: 'No existe matriz de valor para esta combinación de Entry Offer y Servicio.' }] };
          const text = `💎 **MATRIZ DE VALOR: ${matrix.services?.name} en ${matrix.entry_offers?.name}**\n\n` +
            `• **Rol del Servicio**: ${matrix.role || 'N/A'}\n` +
            `• **Posicionamiento**: ${matrix.positioning || 'N/A'}\n` +
            `• **Entregable**: ${matrix.deliverable || 'N/A'}\n` +
            `• **Problema Resuelto**: ${matrix.problem_solved || 'N/A'}\n` +
            `• **Valor Real**: ${matrix.real_value || 'N/A'}\n` +
            `• **Analogía de Venta**: "${matrix.analogy || 'N/A'}"\n` +
            `• **Ancla de Valor**: ${matrix.value_anchor_min ? `${matrix.value_anchor_min}x` : ''} – ${matrix.value_anchor_max ? `${matrix.value_anchor_max}x` : ''} (${matrix.value_justification || 'Justificación ROI'})\n` +
            `• **Resultado Típico**: ${matrix.typical_outcome || 'N/A'}\n` +
            `• **Notas de Venta**: ${matrix.sales_notes || 'N/A'}`;
          return { content: [{ type: 'text' as const, text }] };
        } else {
          const matrices = await ValueMatrixService.getMatrixForEntryOffer(entry_offer_id);
          if (matrices.length === 0) return { content: [{ type: 'text' as const, text: 'No hay servicios en la matriz de valor para esta puerta de entrada.' }] };
          const list = matrices.map((m: any) =>
            `• **${m.services?.name || 'Servicio'}** (${m.role || 'Core'})\n` +
            `  - Valor real: ${m.real_value || 'N/A'}\n` +
            `  - Analogía: "${m.analogy || 'N/A'}"\n` +
            `  - Ancla ROI: ${m.value_anchor_min ? `${m.value_anchor_min}x` : ''} - ${m.value_anchor_max ? `${m.value_anchor_max}x` : ''}\n` +
            `  - Service ID: ${m.service_id}`
          ).join('\n\n');
          return { content: [{ type: 'text' as const, text: `💎 **Matriz de Valor para Entry Offer (${matrices.length} servicios)**:\n\n${list}` }] };
        }
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al obtener matriz de valor: ${err.message}` }] };
      }
    }
  );

  // --- 7. obtener_messaging_framework ---
  srv.tool(
    'obtener_messaging_framework',
    'Obtener los frameworks de mensajería estratégica para Marketing y Ventas (mensajes clave, dolores, beneficios, ángulos de ganchos, reversión de riesgo).',
    {
      entry_offer_id: z.string().optional().describe('Filtrar por ID de la puerta de entrada'),
      customer_profile_id: z.string().optional().describe('Filtrar por ID del avatar/ICP'),
    },
    async (filters) => {
      try {
        const frameworks = await MessagingFrameworkService.getActive(filters);
        if (frameworks.length === 0) {
          return { content: [{ type: 'text' as const, text: 'No hay frameworks de mensajería activos con los filtros indicados.' }] };
        }
        const text = frameworks.map((f: any) =>
          `📢 **FRAMEWORK: ${f.name}** (v${f.version})\n` +
          `• **Mensaje Principal**: "${f.main_message || 'N/A'}"\n` +
          `• **Declaración del Problema**: ${f.problem_statement || 'N/A'}\n` +
          `• **Estado Deseado**: ${f.desired_state || 'N/A'}\n` +
          `• **Mensaje del Mecanismo**: ${f.mechanism_message || 'N/A'}\n` +
          `• **Reversión de Riesgo**: ${f.risk_reversal || 'N/A'}\n` +
          `• **Mensaje de Urgencia**: ${f.urgency_message || 'N/A'}\n` +
          `• **Temas de Ganchos (Hook Themes)**: ${Array.isArray(f.hook_themes) ? f.hook_themes.join(', ') : 'N/A'}\n` +
          `• **Palabras a Usar**: ${Array.isArray(f.words_to_use) ? f.words_to_use.join(', ') : 'N/A'}\n` +
          `• **Palabras a Evitar**: ${Array.isArray(f.words_to_avoid) ? f.words_to_avoid.join(', ') : 'N/A'}\n` +
          `• **ID**: ${f.id}`
        ).join('\n\n---\n\n');
        return { content: [{ type: 'text' as const, text }] };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al obtener messaging framework: ${err.message}` }] };
      }
    }
  );

  // --- 8. obtener_sales_playbook ---
  srv.tool(
    'obtener_sales_playbook',
    'Obtener el playbook de ventas estructurado con todos sus pasos (Confianza, Necesidades, Oferta, Cierre, Objeciones, Seguimiento), preguntas clave, señales a detectar y errores a evitar.',
    {
      entry_offer_id: z.string().optional().describe('Filtrar por puerta de entrada'),
      customer_profile_id: z.string().optional().describe('Filtrar por avatar/ICP'),
      playbook_id: z.string().optional().describe('ID específico del playbook'),
    },
    async (params) => {
      try {
        let playbook: any = null;
        if (params.playbook_id) {
          playbook = await SalesPlaybookService.getById(params.playbook_id);
        } else {
          const list = await SalesPlaybookService.getActive(params);
          playbook = list.length > 0 ? list[0] : null;
        }

        if (!playbook) {
          return { content: [{ type: 'text' as const, text: 'No se encontró ningún playbook de ventas activo.' }] };
        }

        let out = `📖 **PLAYBOOK DE VENTAS: ${playbook.name}** (v${playbook.version})\n`;
        out += `• Objetivo: ${playbook.objective || 'Proceso comercial estandarizado de la agencia'}\n\n`;
        out += `**Pasos del Proceso Comercial:**\n`;

        const steps = playbook.sales_playbook_steps || [];
        if (steps.length === 0) {
          out += `(Sin pasos configurados aún)\n`;
        } else {
          steps.forEach((s: any) => {
            out += `\n🔹 **Paso ${s.step_order}: ${s.name}** (ID: ${s.id})\n`;
            if (s.objective) out += `   • Objetivo: ${s.objective}\n`;
            if (s.description) out += `   • Descripción: ${s.description}\n`;
            if (Array.isArray(s.questions) && s.questions.length > 0) {
              out += `   • Preguntas clave:\n` + s.questions.map((q: string) => `     - ${q}`).join('\n') + `\n`;
            }
            if (Array.isArray(s.signals_to_detect) && s.signals_to_detect.length > 0) {
              out += `   • Señales a detectar: ${s.signals_to_detect.join(', ')}\n`;
            }
            if (Array.isArray(s.mistakes_to_avoid) && s.mistakes_to_avoid.length > 0) {
              out += `   • Errores a evitar: ${s.mistakes_to_avoid.join(', ')}\n`;
            }
            if (Array.isArray(s.phrases_examples) && s.phrases_examples.length > 0) {
              out += `   • Frases recomendadas: ${s.phrases_examples.join(' | ')}\n`;
            }
          });
        }

        return { content: [{ type: 'text' as const, text: out }] };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al obtener sales playbook: ${err.message}` }] };
      }
    }
  );

  // --- 9. listar_sales_objections ---
  srv.tool(
    'listar_sales_objections',
    'Consultar la biblioteca estratégica de objeciones y respuestas recomendadas por categoría (precio, tiempo, confianza, autoridad, necesidad, competencia, riesgo, implementación).',
    {
      category: z.enum(['price', 'timing', 'trust', 'authority', 'need', 'competition', 'risk', 'implementation', 'other']).optional().describe('Categoría de la objeción'),
      search: z.string().optional().describe('Búsqueda por texto en objeción o preocupación'),
      entry_offer_id: z.string().optional().describe('Filtrar por puerta de entrada'),
    },
    async (filters) => {
      try {
        let objections = [];
        if (filters.search) {
          objections = await SalesObjectionService.search(filters.search);
        } else {
          objections = await SalesObjectionService.getActive(filters);
        }

        if (objections.length === 0) {
          return { content: [{ type: 'text' as const, text: 'No se encontraron objeciones en la biblioteca con los criterios indicados.' }] };
        }

        const list = objections.map((o: any) =>
          `🛡️ **[${(o.category || 'general').toUpperCase()}] ${o.name}** (ID: ${o.id})\n` +
          `  • Lo que dice el cliente: "${o.objection_text || o.name}"\n` +
          `  • Preocupación real oculta: ${o.underlying_concern || 'N/A'}\n` +
          `  • 💡 Respuesta recomendada: ${o.recommended_response || 'N/A'}\n` +
          `  • Preguntas de profundización: ${Array.isArray(o.questions_to_ask) ? o.questions_to_ask.join(' | ') : 'N/A'}\n` +
          `  • ⚠️ Respuestas a evitar: ${Array.isArray(o.responses_to_avoid) ? o.responses_to_avoid.join(' | ') : 'N/A'}`
        ).join('\n\n');

        return { content: [{ type: 'text' as const, text: `🛡️ **Biblioteca Estratégica de Objeciones (${objections.length})**:\n\n${list}` }] };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al listar objeciones: ${err.message}` }] };
      }
    }
  );

  // --- crear_tarea ---
  srv.tool(
    'crear_tarea',
    'Crear o programar una tarea operativa o comercial con fecha de vencimiento y asignación.',
    {
      title: z.string().describe('Título o resumen de la tarea'),
      description: z.string().optional().describe('Descripción detallada de la tarea a realizar'),
      due_date: z.string().optional().describe('Fecha límite o de ejecución (YYYY-MM-DD)'),
      company_id: z.string().optional().describe('ID de la empresa asociada'),
      contact_id: z.string().optional().describe('ID del contacto asociado'),
      opportunity_id: z.string().optional().describe('ID de la oportunidad asociada'),
      result: z.string().optional().describe('Resultado esperado o notas de seguimiento'),
    },
    async (data) => {
      try {
        const payload = {
          type: 'task',
          notes: [data.title, data.description].filter(Boolean).join(' — '),
          next_action: data.title,
          next_action_date: data.due_date || null,
          occurred_at: data.due_date ? `${data.due_date}T12:00:00Z` : new Date().toISOString(),
          company_id: data.company_id || null,
          contact_id: data.contact_id || null,
          opportunity_id: data.opportunity_id || null,
          result: data.result || null,
        };
        const task = await ActivityService.create(payload);
        return {
          content: [{ type: 'text' as const, text: `✅ Tarea guardada con éxito en el CRM (ID: ${task.id})\n• Título: ${data.title}\n• Fecha límite: ${data.due_date || 'Sin fecha'}` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al guardar tarea: ${err.message}` }] };
      }
    }
  );

  // --- crear_proyecto ---
  srv.tool(
    'crear_proyecto',
    'Crear un nuevo proyecto de entrega técnica u operativa para un cliente en el CRM.',
    {
      name: z.string().describe('Nombre del proyecto (ej: Creación de Empresa, Automatización de Procesos)'),
      company_id: z.string().optional().describe('ID de la empresa'),
      client_id: z.string().optional().describe('ID del cliente'),
      status: z.enum(['onboarding', 'in_progress', 'review', 'completed', 'cancelled']).optional().describe('Estado operativo inicial'),
      sold_price: z.number().optional().describe('Precio vendido del proyecto'),
      due_date: z.string().optional().describe('Fecha límite de entrega (YYYY-MM-DD)'),
      start_date: z.string().optional().describe('Fecha de inicio (YYYY-MM-DD)'),
    },
    async (data) => {
      try {
        const project = await ProjectService.create(data, 'mcp');
        return {
          content: [{ type: 'text' as const, text: `🚀 Proyecto creado exitosamente:\n• Nombre: ${project.name}\n• Estado: ${project.status}\n• ID: ${project.id}\n• Plazo: ${project.due_date || 'Sin definir'}` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al crear proyecto: ${err.message}` }] };
      }
    }
  );

  // --- registrar_encuesta_cliente ---
  srv.tool(
    'registrar_encuesta_cliente',
    'Registrar una encuesta de satisfacción CSAT (1-5) o NPS (0-10) de un cliente para recalcular automáticamente su Customer Health Score.',
    {
      company_id: z.string().describe('ID de la empresa'),
      client_id: z.string().optional().describe('ID del cliente'),
      survey_type: z.enum(['csat', 'nps']).describe('Tipo de encuesta (csat para entregables/pago único, nps para retainers recurrentes)'),
      score: z.number().describe('Puntuación: 1 a 5 para CSAT; 0 a 10 para NPS'),
      q1_delivery_quality: z.number().min(1).max(5).optional().describe('CSAT: Calidad de entrega (1-5)'),
      q2_communication: z.number().min(1).max(5).optional().describe('CSAT: Fluidez de comunicación (1-5)'),
      q3_expectations: z.number().min(1).max(5).optional().describe('CSAT: Cumplimiento de expectativas (1-5)'),
      qualitative_feedback: z.string().optional().describe('Comentario u opinión abierta del cliente'),
    },
    async (data) => {
      try {
        const survey = await SurveyService.recordSurvey(data, 'mcp');
        return {
          content: [{ type: 'text' as const, text: `🌟 Encuesta de satisfacción registrada exitosamente:\n• Tipo: ${data.survey_type.toUpperCase()}\n• Puntuación: ${data.score}\n• ID: ${survey.id}\nEl Health Score del cliente ha sido recalculado.` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al registrar encuesta: ${err.message}` }] };
      }
    }
  );

  // --- consultar_panel_completo ---
  srv.tool(
    'consultar_panel_completo',
    'Consultar la matriz consolidada de clientes con su servicio contratado, etapa operativa, estado de cobro, Customer Health Score (0-100 pts), LTV y Time to Value.',
    {},
    async () => {
      try {
        const panel = await AnalyticsService.getClientPanel();
        return {
          content: [{ type: 'text' as const, text: `📋 PANEL DE CLIENTES:\n\n${JSON.stringify(panel, null, 2)}` }],
        };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `❌ Error al obtener panel de clientes: ${err.message}` }] };
      }
    }
  );

}



