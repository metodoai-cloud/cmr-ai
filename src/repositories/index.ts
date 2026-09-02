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

  async findPipeline() {
    const { data, error } = await this.db
      .from('opportunities')
      .select('*, contacts(first_name, last_name), companies(name), services(name)')
      .is('deleted_at', null)
      .not('stage', 'in', '("won","lost")')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async findByStage(stage: string) {
    const { data, error } = await this.db
      .from('opportunities')
      .select('*, contacts(first_name, last_name), companies(name)')
      .eq('stage', stage)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async findOverdue() {
    const { data, error } = await this.db
      .from('opportunities')
      .select('*, contacts(first_name, last_name), companies(name)')
      .not('stage', 'in', '("won","lost")')
      .lt('next_action_date', new Date().toISOString().split('T')[0])
      .is('deleted_at', null);
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
      .select('*, contacts(first_name, last_name)')
      .eq('opportunity_id', opportunityId)
      .order('occurred_at', { ascending: false });
    if (error) throw error;
    return data || [];
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
      .select('*, clients(*, companies(*), contacts:primary_contact_id(*)), payments(id, payment_date, amount)')
      .is('deleted_at', null)
      .order('issue_date', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.client_id) query = query.eq('client_id', filters.client_id);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async findOverdue() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await this.db
      .from('invoices')
      .select('*, clients(*, companies(*), contacts:primary_contact_id(*)), payments(id, payment_date, amount)')
      .in('status', ['issued', 'partial'])
      .lt('due_date', today)
      .is('deleted_at', null);
    if (error) throw error;
    return data || [];
  }

  async findByClient(clientId: string) {
    const { data, error } = await this.db
      .from('invoices')
      .select('*, payments(id, payment_date, amount)')
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
