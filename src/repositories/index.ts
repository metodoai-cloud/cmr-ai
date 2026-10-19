// ============================================================================
// Entity Repositories — One per table, extending BaseRepository
// Custom queries specific to each entity go here
// ============================================================================

import { BaseRepository } from './BaseRepository.js';
import { supabase } from '../db/connection.js';

// --- Contacts ---
export class ContactRepository extends BaseRepository<any> {
  constructor() { super('contacts'); }

  async searchByName(name: string) {
    const { data, error } = await this.db
      .from('contacts')
      .select('*, companies(name)')
      .or(`first_name.ilike.%${name}%,last_name.ilike.%${name}%,email.ilike.%${name}%`)
      .is('deleted_at', null)
      .limit(10);
    if (error) throw error;
    return data || [];
  }
}

// --- Companies ---
export class CompanyRepository extends BaseRepository<any> {
  constructor() { super('companies'); }

  async findAll(filters: any = {}) {
    let query = this.db
      .from('companies')
      .select('*')
      .is('deleted_at', null)
      .order('name', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async searchByName(name: string) {
    const { data, error } = await this.db
      .from('companies')
      .select('*')
      .ilike('name', `%${name}%`)
      .is('deleted_at', null)
      .order('name', { ascending: true })
      .limit(10);
    if (error) throw error;
    return data || [];
  }
}

// --- Leads ---
export class LeadRepository extends BaseRepository<any> {
  constructor() { super('leads'); }

  async findWithRelations(filters: any = {}) {
    let query = this.db
      .from('leads')
      .select('*, contacts(first_name, last_name, email), companies(name), campaigns(name), hooks(name), services(name)');
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.campaign_id) query = query.eq('campaign_id', filters.campaign_id);
    query = query.order('created_at', { ascending: false }).limit(filters.limit || 50);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}

// --- Opportunities ---
export class OpportunityRepository extends BaseRepository<any> {
  constructor() { super('opportunities'); }

  async findAll(filters: any = {}) {
    let query = this.db
      .from('opportunities')
      .select('*, contacts(id, first_name, last_name, email, phone), companies(id, name, tax_id, industry), services(id, name, category, standard_setup_price, standard_recurring_price)')
      .is('deleted_at', null);

    if (filters.stage) query = query.eq('stage', filters.stage);
    if (filters.company_id) query = query.eq('company_id', filters.company_id);
    if (filters.contact_id) query = query.eq('contact_id', filters.contact_id);
    if (filters.service_id) query = query.eq('service_id', filters.service_id);

    query = query.order('created_at', { ascending: false });

    if (filters.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findPipeline() {
    const { data, error } = await this.db
      .from('opportunities')
      .select('*, contacts(id, first_name, last_name, email, phone), companies(id, name, tax_id, industry), services(id, name, category, standard_setup_price, standard_recurring_price)')
      .is('deleted_at', null)
      .not('stage', 'in', '("won","lost")')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async findByStage(stage: string) {
    const { data, error } = await this.db
      .from('opportunities')
      .select('*, contacts(id, first_name, last_name, email, phone), companies(id, name, tax_id, industry), services(id, name, category, standard_setup_price, standard_recurring_price)')
      .eq('stage', stage)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async findOverdue() {
    const { data, error } = await this.db
      .from('opportunities')
      .select('*, contacts(id, first_name, last_name, email, phone), companies(id, name, tax_id, industry), services(id, name, category, standard_setup_price, standard_recurring_price)')
      .not('stage', 'in', '("won","lost")')
      .lt('next_action_date', new Date().toISOString().split('T')[0])
      .is('deleted_at', null);
    if (error) throw error;
    return data || [];
  }

  async findByIdWithRelations(id: string) {
    const { data, error } = await this.db
      .from('opportunities')
      .select('*, contacts(id, first_name, last_name, email, phone), companies(id, name, tax_id, industry), services(id, name, category, standard_setup_price, standard_recurring_price)')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async searchByName(name: string) {
    const { data, error } = await this.db
      .from('opportunities')
      .select('*, contacts(id, first_name, last_name, email, phone), companies(id, name, tax_id, industry), services(id, name, category, standard_setup_price, standard_recurring_price)')
      .ilike('name', `%${name}%`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw error;
    return data || [];
  }
}

// --- Activities ---
export class ActivityRepository extends BaseRepository<any> {
  constructor() { super('activities'); }

  async findByOpportunity(opportunityId: string) {
    const { data, error } = await this.db
      .from('activities')
      .select('*, contacts(first_name, last_name), companies(id, name)')
      .eq('opportunity_id', opportunityId)
      .order('occurred_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async findTasks(filters: any = {}) {
    let query = this.db
      .from('activities')
      .select('*, companies(id, name), contacts(id, first_name, last_name), opportunities(id, name)')
      .eq('type', 'task')
      .order('next_action_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (filters.company_id) query = query.eq('company_id', filters.company_id);
    if (filters.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) throw error;

    let list = data || [];
    
    // Normalizar estado según columna status o derivado de result
    list = list.map((a: any) => {
      let st = a.status;
      if (!st && a.result) {
        const rLower = a.result.toLowerCase().trim();
        if (['completada', 'completado', 'done', 'finalizada', 'hecha'].includes(rLower)) {
          st = 'completed';
        } else if (['en proceso', 'in progress', 'en curso'].includes(rLower)) {
          st = 'in_progress';
        } else if (['cancelada', 'cancelado', 'cancelled', 'descartada'].includes(rLower)) {
          st = 'cancelled';
        }
      }
      if (!st) st = 'pending';

      // El título proviene de title o next_action (o del prefijo original en notes antes de ' — ')
      const taskTitle = a.title || a.next_action || (a.notes && a.notes.includes(' — ') ? a.notes.split(' — ')[0] : (a.notes || 'Sin título'));

      return { ...a, title: taskTitle, status: st };
    });

    if (filters.status && filters.status !== 'todas') {
      let targetStatus = filters.status.toLowerCase().trim();
      if (['pendiente', 'pending'].includes(targetStatus)) targetStatus = 'pending';
      if (['en_proceso', 'en_curso', 'in_progress'].includes(targetStatus)) targetStatus = 'in_progress';
      if (['completada', 'completado', 'completed'].includes(targetStatus)) targetStatus = 'completed';
      if (['cancelada', 'cancelado', 'cancelled', 'descartada'].includes(targetStatus)) targetStatus = 'cancelled';
      list = list.filter((a: any) => a.status === targetStatus);
    }

    if (filters.company_name) {
      const q = filters.company_name.toLowerCase().trim();
      list = list.filter((a: any) => a.companies?.name?.toLowerCase().includes(q));
    }

    return list;
  }
}

// --- Clients ---
export class ClientRepository extends BaseRepository<any> {
  constructor() { super('clients'); }

  async findWithCompany() {
    const { data, error } = await this.db
      .from('clients')
      .select('*, companies(name), contacts:primary_contact_id(first_name, last_name, email)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
}

// --- Projects ---
export class ProjectRepository extends BaseRepository<any> {
  constructor() { super('projects'); }

  async findAll(filters: any = {}) {
    let query = this.db
      .from('projects')
      .select('*, clients(*, companies(*), contacts:primary_contact_id(*)), opportunities(*, companies(*))')
      .order('created_at', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.client_id) query = query.eq('client_id', filters.client_id);
    if (filters.opportunity_id) query = query.eq('opportunity_id', filters.opportunity_id);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}

// --- Subscriptions ---
export class SubscriptionRepository extends BaseRepository<any> {
  constructor() { super('subscriptions'); }

  async findAll(filters: any = {}) {
    let query = this.db
      .from('subscriptions')
      .select('*, clients(*, companies(*), contacts:primary_contact_id(*)), services(*), opportunities(*, companies(*))')
      .order('created_at', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.client_id) query = query.eq('client_id', filters.client_id);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findActive() {
    const { data, error } = await this.db
      .from('subscriptions')
      .select('*, clients(*, companies(*), contacts:primary_contact_id(*)), services(*), opportunities(*, companies(*))')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
}

// --- Invoices ---
export class InvoiceRepository extends BaseRepository<any> {
  constructor() { super('invoices'); }

  async findAll(filters: any = {}) {
    let query = this.db
      .from('invoices')
      .select('*, clients(*, companies(*), contacts:primary_contact_id(*)), projects(id, name), payments(id, payment_date, amount, payment_method)')
      .is('deleted_at', null)
      .order('issue_date', { ascending: false });

    if (filters.status && filters.status !== 'todas') {
      let st = filters.status;
      if (st === 'pagada') st = 'paid';
      if (st === 'pendiente') st = 'issued';
      if (st === 'vencida') st = 'overdue';
      if (st === 'anulada') st = 'cancelled';
      query = query.eq('status', st);
    }
    if (filters.client_id) query = query.eq('client_id', filters.client_id);
    if (filters.project_id) query = query.eq('project_id', filters.project_id);
    if (filters.invoice_number) query = query.eq('invoice_number', String(filters.invoice_number).trim());

    const { data, error } = await query;
    if (error) throw error;

    let result = data || [];
    if (filters.company_id) {
      result = result.filter((inv: any) =>
        inv.clients?.company_id === filters.company_id ||
        inv.clients?.companies?.id === filters.company_id
      );
    }
    if (filters.company_name) {
      const q = filters.company_name.toLowerCase().trim();
      result = result.filter((inv: any) =>
        inv.clients?.companies?.name?.toLowerCase().includes(q)
      );
    }
    return result;
  }

  async findByNumber(folio: string | number) {
    const num = String(folio).trim();
    const { data, error } = await this.db
      .from('invoices')
      .select('*, clients(*, companies(*), contacts:primary_contact_id(*)), projects(id, name), payments(id, payment_date, amount, payment_method)')
      .eq('invoice_number', num)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      const byNum = await this.findByNumber(id);
      if (byNum) return byNum;
    }

    const { data, error } = await this.db
      .from('invoices')
      .select('*, clients(*, companies(*), contacts:primary_contact_id(*)), projects(id, name), payments(id, payment_date, amount, payment_method)')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findOverdue() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await this.db
      .from('invoices')
      .select('*, clients(*, companies(*), contacts:primary_contact_id(*)), projects(id, name), payments(id, payment_date, amount)')
      .in('status', ['issued', 'partial'])
      .lt('due_date', today)
      .is('deleted_at', null);
    if (error) throw error;
    return data || [];
  }

  async findByClient(clientId: string) {
    const { data, error } = await this.db
      .from('invoices')
      .select('*, clients(*, companies(*), contacts:primary_contact_id(*)), projects(id, name), payments(id, payment_date, amount)')
      .eq('client_id', clientId)
      .is('deleted_at', null)
      .order('issue_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }
}

// --- Payments ---
export class PaymentRepository extends BaseRepository<any> {
  constructor() { super('payments'); }

  async findAll(filters: any = {}) {
    let query = this.db
      .from('payments')
      .select('*, invoices(id, status, deleted_at)')
      .order('payment_date', { ascending: false });

    if (filters.invoice_id) query = query.eq('invoice_id', filters.invoice_id);
    if (filters.client_id) query = query.eq('client_id', filters.client_id);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).filter((p: any) => !p.invoices || p.invoices.deleted_at === null);
  }

  async sumByInvoice(invoiceId: string): Promise<number> {
    const { data, error } = await this.db
      .from('payments')
      .select('amount')
      .eq('invoice_id', invoiceId);
    if (error) throw error;
    return (data || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  }

  async deleteByInvoice(invoiceId: string): Promise<void> {
    const { error } = await this.db
      .from('payments')
      .delete()
      .eq('invoice_id', invoiceId);
    if (error) throw error;
  }
}

// --- Expenses ---
export class ExpenseRepository extends BaseRepository<any> {
  constructor() { super('expenses'); }

  async findAll(filters: any = {}) {
    let query = this.db
      .from('expenses')
      .select('*, vendors(id, name)')
      .is('deleted_at', null);

    if (filters.id) query = query.eq('id', filters.id);
    if (filters.category) query = query.ilike('category', `%${filters.category}%`);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.vendor_id) query = query.eq('vendor_id', filters.vendor_id);
    if (filters.project_id) query = query.eq('project_id', filters.project_id);
    if (filters.client_id) query = query.eq('client_id', filters.client_id);
    if (filters.date_from) query = query.gte('date', filters.date_from);
    if (filters.date_to) query = query.lte('date', filters.date_to);

    query = query.order('date', { ascending: false });

    if (filters.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findById(id: string) {
    const { data, error } = await this.db
      .from('expenses')
      .select('*, vendors(id, name)')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }
}

// --- Vendors ---
export class VendorRepository extends BaseRepository<any> {
  constructor() { super('vendors'); }

  async searchByName(name: string) {
    const { data, error } = await this.db
      .from('vendors')
      .select('*')
      .ilike('name', `%${name}%`)
      .limit(10);
    if (error) throw error;
    return data || [];
  }
}

// --- Campaigns ---
export class CampaignRepository extends BaseRepository<any> {
  constructor() { super('campaigns'); }
}

// --- Hooks ---
export class HookRepository extends BaseRepository<any> {
  constructor() { super('hooks'); }
}

// --- Services ---
export class ServiceRepository extends BaseRepository<any> {
  constructor() { super('services'); }

  async findAll(filters: any = {}) {
    let query = this.db.from('services').select('*');
    if (filters.active !== undefined) {
      query = query.eq('active', filters.active);
    } else {
      query = query.eq('active', true);
    }
    if (filters.category) query = query.eq('category', filters.category);
    query = query.order('standard_setup_price', { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}

// --- Taxes ---
export class TaxRepository extends BaseRepository<any> {
  constructor() { super('taxes'); }
}

// --- Withdrawals ---
export class WithdrawalRepository extends BaseRepository<any> {
  constructor() { super('withdrawals'); }
}

// --- Business Events ---
export class BusinessEventRepository extends BaseRepository<any> {
  constructor() { super('business_events'); }
}

// --- Audit Logs ---
export class AuditLogRepository extends BaseRepository<any> {
  constructor() { super('audit_logs'); }

  async logAction(params: {
    userId?: string;
    actorType: 'human' | 'ai' | 'system';
    source: 'web' | 'mcp' | 'api' | 'automation';
    toolName?: string;
    entityType: string;
    entityId: string;
    action: string;
    beforeData?: any;
    afterData?: any;
    rawInput?: string;
    structuredInterpretation?: any;
    conversationId?: string;
    requestId?: string;
  }) {
    return this.create({
      user_id: params.userId,
      actor_type: params.actorType,
      source: params.source,
      tool_name: params.toolName,
      entity_type: params.entityType,
      entity_id: params.entityId,
      action: params.action,
      before_data: params.beforeData,
      after_data: params.afterData,
      raw_input: params.rawInput,
      structured_interpretation: params.structuredInterpretation,
      conversation_id: params.conversationId,
      request_id: params.requestId,
    });
  }
}

// ============================================================================
// STRATEGY LAYER REPOSITORIES
// ============================================================================

// --- Agency Profiles ---
export class AgencyProfileRepository extends BaseRepository<any> {
  constructor() { super('agency_profiles'); }

  async getActive(organizationId?: string) {
    let query = this.db
      .from('agency_profiles')
      .select('*')
      .eq('status', 'active');
    
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    const { data, error } = await query.order('version', { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    return data;
  }
}

// --- Customer Profiles ---
export class CustomerProfileRepository extends BaseRepository<any> {
  constructor() { super('customer_profiles'); }

  async findActive(filters: any = {}) {
    let query = this.db
      .from('customer_profiles')
      .select('*')
      .eq('status', 'active');
    
    if (filters.industry) query = query.ilike('industry', `%${filters.industry}%`);
    if (filters.organization_id) query = query.eq('organization_id', filters.organization_id);
    query = query.order('name', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}

// --- Entry Offers ---
export class EntryOfferRepository extends BaseRepository<any> {
  constructor() { super('entry_offers'); }

  async findActive(filters: any = {}) {
    let query = this.db
      .from('entry_offers')
      .select('*, customer_profiles(id, name, industry)')
      .eq('status', 'active')
      .order('priority', { ascending: true });
    
    if (filters.organization_id) query = query.eq('organization_id', filters.organization_id);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findBySlug(slug: string) {
    const { data, error } = await this.db
      .from('entry_offers')
      .select('*, customer_profiles(*)')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    return data;
  }
}

// --- Entry Offer Services (Value Matrix) ---
export class EntryOfferServiceRepository extends BaseRepository<any> {
  constructor() { super('entry_offer_services'); }

  async getMatrixForEntryOffer(entryOfferId: string) {
    const { data, error } = await this.db
      .from('entry_offer_services')
      .select('*, services(*), entry_offers(id, name, slug)')
      .eq('entry_offer_id', entryOfferId)
      .eq('active', true);
    if (error) throw error;
    return data || [];
  }

  async getValueMatrix(entryOfferId: string, serviceId: string) {
    const { data, error } = await this.db
      .from('entry_offer_services')
      .select('*, services(*), entry_offers(*)')
      .eq('entry_offer_id', entryOfferId)
      .eq('service_id', serviceId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }
}

// --- Messaging Frameworks ---
export class MessagingFrameworkRepository extends BaseRepository<any> {
  constructor() { super('messaging_frameworks'); }

  async getActive(filters: any = {}) {
    let query = this.db
      .from('messaging_frameworks')
      .select('*, entry_offers(id, name, slug), customer_profiles(id, name)')
      .eq('status', 'active');
    
    if (filters.entry_offer_id) query = query.eq('entry_offer_id', filters.entry_offer_id);
    if (filters.customer_profile_id) query = query.eq('customer_profile_id', filters.customer_profile_id);
    if (filters.organization_id) query = query.eq('organization_id', filters.organization_id);

    const { data, error } = await query.order('version', { ascending: false });
    if (error) throw error;
    return data || [];
  }
}

// --- Sales Playbooks ---
export class SalesPlaybookRepository extends BaseRepository<any> {
  constructor() { super('sales_playbooks'); }

  async getWithSteps(id: string) {
    const { data, error } = await this.db
      .from('sales_playbooks')
      .select('*, sales_playbook_steps(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (data && data.sales_playbook_steps) {
      data.sales_playbook_steps.sort((a: any, b: any) => a.step_order - b.step_order);
    }
    return data;
  }

  async getActive(filters: any = {}) {
    let query = this.db
      .from('sales_playbooks')
      .select('*, sales_playbook_steps(*), entry_offers(id, name), customer_profiles(id, name)')
      .eq('status', 'active');

    if (filters.entry_offer_id) query = query.eq('entry_offer_id', filters.entry_offer_id);
    if (filters.customer_profile_id) query = query.eq('customer_profile_id', filters.customer_profile_id);

    const { data, error } = await query.order('version', { ascending: false });
    if (error) throw error;
    if (data) {
      data.forEach((pb: any) => {
        if (pb.sales_playbook_steps) {
          pb.sales_playbook_steps.sort((a: any, b: any) => a.step_order - b.step_order);
        }
      });
    }
    return data || [];
  }
}

// --- Sales Playbook Steps ---
export class SalesPlaybookStepRepository extends BaseRepository<any> {
  constructor() { super('sales_playbook_steps'); }

  async findByPlaybook(playbookId: string) {
    const { data, error } = await this.db
      .from('sales_playbook_steps')
      .select('*')
      .eq('playbook_id', playbookId)
      .order('step_order', { ascending: true });
    if (error) throw error;
    return data || [];
  }
}

// --- Sales Objections ---
export class SalesObjectionRepository extends BaseRepository<any> {
  constructor() { super('sales_objections'); }

  async findActive(filters: any = {}) {
    let query = this.db
      .from('sales_objections')
      .select('*, entry_offers(id, name), customer_profiles(id, name)')
      .eq('active', true);
    
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.entry_offer_id) query = query.eq('entry_offer_id', filters.entry_offer_id);
    if (filters.customer_profile_id) query = query.eq('customer_profile_id', filters.customer_profile_id);

    query = query.order('priority', { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async searchByText(text: string) {
    const { data, error } = await this.db
      .from('sales_objections')
      .select('*')
      .eq('active', true)
      .or(`name.ilike.%${text}%,objection_text.ilike.%${text}%,underlying_concern.ilike.%${text}%`)
      .limit(10);
    if (error) throw error;
    return data || [];
  }
}

// --- Client Surveys (CSAT & NPS) ---
export class ClientSurveyRepository extends BaseRepository<any> {
  constructor() { super('client_surveys'); }

  async findByCompany(companyId: string) {
    const { data, error } = await this.db
      .from('client_surveys')
      .select('*, projects(name), clients(*, companies(name))')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async findByClient(clientId: string) {
    const { data, error } = await this.db
      .from('client_surveys')
      .select('*, projects(name), companies(name)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getLatestSurvey(companyId: string, surveyType?: 'csat' | 'nps') {
    let query = this.db
      .from('client_surveys')
      .select('*')
      .eq('company_id', companyId);
    
    if (surveyType) {
      query = query.eq('survey_type', surveyType);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
}

