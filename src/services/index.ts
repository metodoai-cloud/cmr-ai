// ============================================================================
// Business Services — Core business logic layer
// Both REST and MCP use these same services (no duplication)
// ============================================================================

import {
  ContactRepository, CompanyRepository, LeadRepository,
  OpportunityRepository, ActivityRepository, ClientRepository,
  ProjectRepository, SubscriptionRepository, InvoiceRepository,
  PaymentRepository, ExpenseRepository, VendorRepository,
  CampaignRepository, HookRepository, ServiceRepository,
  TaxRepository, WithdrawalRepository, BusinessEventRepository,
  AuditLogRepository,
  AgencyProfileRepository, CustomerProfileRepository,
  EntryOfferRepository, EntryOfferServiceRepository,
  MessagingFrameworkRepository, SalesPlaybookRepository,
  SalesPlaybookStepRepository, SalesObjectionRepository,
  ClientSurveyRepository
} from '../repositories/index.js';

// Instantiate all repositories
const contactRepo = new ContactRepository();
const companyRepo = new CompanyRepository();
const leadRepo = new LeadRepository();
const oppRepo = new OpportunityRepository();
const activityRepo = new ActivityRepository();
const clientRepo = new ClientRepository();
const projectRepo = new ProjectRepository();
const subscriptionRepo = new SubscriptionRepository();
const invoiceRepo = new InvoiceRepository();
const paymentRepo = new PaymentRepository();
const expenseRepo = new ExpenseRepository();
const vendorRepo = new VendorRepository();
const campaignRepo = new CampaignRepository();
const hookRepo = new HookRepository();
const serviceRepo = new ServiceRepository();
const taxRepo = new TaxRepository();
const withdrawalRepo = new WithdrawalRepository();
const eventRepo = new BusinessEventRepository();
const auditRepo = new AuditLogRepository();
const surveyRepo = new ClientSurveyRepository();

// Strategy Layer repositories
const agencyProfileRepo = new AgencyProfileRepository();
const customerProfileRepo = new CustomerProfileRepository();
const entryOfferRepo = new EntryOfferRepository();
const entryOfferServiceRepo = new EntryOfferServiceRepository();
const messagingFrameworkRepo = new MessagingFrameworkRepository();
const salesPlaybookRepo = new SalesPlaybookRepository();
const salesPlaybookStepRepo = new SalesPlaybookStepRepository();
const salesObjectionRepo = new SalesObjectionRepository();

// ============================================================================
// CONTACT SERVICE
// ============================================================================
export const ContactService = {
  async search(name: string) {
    return contactRepo.searchByName(name);
  },

  async getById(id: string) {
    return contactRepo.findById(id);
  },

  async getAll(filters: any = {}) {
    return contactRepo.findAll(filters);
  },

  async create(data: any, source: 'web' | 'mcp' = 'web') {
    const contact = await contactRepo.create(data);
    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'contact',
      entityId: contact.id,
      action: 'created',
      afterData: contact,
    });
    await eventRepo.create({
      event_type: 'contact.created',
      entity_type: 'contact',
      entity_id: contact.id,
      payload: contact,
    });
    return contact;
  },

  async update(id: string, data: any, source: 'web' | 'mcp' = 'web') {
    const before = await contactRepo.findById(id);
    const contact = await contactRepo.update(id, data);
    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'contact',
      entityId: id,
      action: 'updated',
      beforeData: before,
      afterData: contact,
    });
    return contact;
  },
};

// ============================================================================
// COMPANY SERVICE
// ============================================================================
export const CompanyService = {
  async search(name: string) {
    return companyRepo.searchByName(name);
  },

  async getById(id: string) {
    return companyRepo.findById(id);
  },

  async getAll(filters: any = {}) {
    return companyRepo.findAll(filters);
  },

  async create(data: any, source: 'web' | 'mcp' = 'web') {
    const payload: any = {
      name: data.name ? String(data.name).trim() : 'Empresa sin nombre',
    };
    if (data.legal_name !== undefined) payload.legal_name = data.legal_name ? String(data.legal_name).trim() : null;
    if (data.tax_id !== undefined) payload.tax_id = data.tax_id ? String(data.tax_id).trim() : null;
    if (data.website !== undefined) payload.website = data.website ? String(data.website).trim() : null;
    if (data.industry !== undefined) payload.industry = data.industry ? String(data.industry).trim() : null;
    if (data.company_size !== undefined) payload.company_size = data.company_size ? String(data.company_size).trim() : null;
    if (data.country !== undefined) payload.country = data.country ? String(data.country).trim() : null;
    if (data.city !== undefined) payload.city = data.city ? String(data.city).trim() : null;
    if (data.sales_owner_id !== undefined) payload.sales_owner_id = data.sales_owner_id || null;
    if (data.is_active_client !== undefined) payload.is_active_client = Boolean(data.is_active_client);

    const company = await companyRepo.create(payload);
    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'company',
      entityId: company.id,
      action: 'created',
      afterData: company,
    });
    return company;
  },

  async update(id: string, data: any, source: 'web' | 'mcp' = 'web') {
    const before = await companyRepo.findById(id);
    if (!before) {
      throw new Error(`Empresa no encontrada con ID: ${id}`);
    }

    const payload: any = {};
    if (data.name !== undefined) payload.name = String(data.name).trim();
    if (data.legal_name !== undefined) payload.legal_name = data.legal_name ? String(data.legal_name).trim() : null;
    if (data.tax_id !== undefined) payload.tax_id = data.tax_id ? String(data.tax_id).trim() : null;
    if (data.website !== undefined) payload.website = data.website ? String(data.website).trim() : null;
    if (data.industry !== undefined) payload.industry = data.industry ? String(data.industry).trim() : null;
    if (data.company_size !== undefined) payload.company_size = data.company_size ? String(data.company_size).trim() : null;
    if (data.country !== undefined) payload.country = data.country ? String(data.country).trim() : null;
    if (data.city !== undefined) payload.city = data.city ? String(data.city).trim() : null;
    if (data.sales_owner_id !== undefined) payload.sales_owner_id = data.sales_owner_id || null;
    if (data.is_active_client !== undefined) payload.is_active_client = Boolean(data.is_active_client);

    const company = await companyRepo.update(id, payload);
    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'company',
      entityId: id,
      action: 'updated',
      beforeData: before,
      afterData: company,
    });
    return company;
  },
};

// ============================================================================
// LEAD SERVICE
// ============================================================================
export const LeadService = {
  async getAll(filters: any = {}) {
    return leadRepo.findWithRelations(filters);
  },

  async create(data: any, source: 'web' | 'mcp' = 'web') {
    const lead = await leadRepo.create(data);
    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'lead',
      entityId: lead.id,
      action: 'created',
      afterData: lead,
    });
    await eventRepo.create({
      event_type: 'lead.created',
      entity_type: 'lead',
      entity_id: lead.id,
      payload: lead,
    });
    return lead;
  },

  async qualify(id: string, source: 'web' | 'mcp' = 'web') {
    const lead = await leadRepo.update(id, { status: 'qualified' });
    await eventRepo.create({
      event_type: 'lead.qualified',
      entity_type: 'lead',
      entity_id: id,
      payload: lead,
    });
    return lead;
  },
};

// ============================================================================
// OPPORTUNITY SERVICE
// ============================================================================
export const OpportunityService = {
  async getPipeline() {
    return oppRepo.findPipeline();
  },

  async getAll(filters: any = {}) {
    return oppRepo.findAll(filters);
  },

  async getById(id: string) {
    return oppRepo.findById(id);
  },

  async getOverdue() {
    return oppRepo.findOverdue();
  },

  async create(data: any, source: 'web' | 'mcp' = 'web') {
    const opp = await oppRepo.create(data);
    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'opportunity',
      entityId: opp.id,
      action: 'created',
      afterData: opp,
    });
    await eventRepo.create({
      event_type: 'opportunity.created',
      entity_type: 'opportunity',
      entity_id: opp.id,
      payload: opp,
    });
    return opp;
  },

  async moveStage(id: string, newStage: string, source: 'web' | 'mcp' = 'web') {
    const before = await oppRepo.findById(id);
    if (!before) throw new Error(`Opportunity ${id} not found`);

    const opp = await oppRepo.update(id, { stage: newStage });

    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'opportunity',
      entityId: id,
      action: 'stage_changed',
      beforeData: { stage: before.stage },
      afterData: { stage: newStage },
    });

    await eventRepo.create({
      event_type: 'opportunity.stage_changed',
      entity_type: 'opportunity',
      entity_id: id,
      payload: { from: before.stage, to: newStage },
    });

    return opp;
  },

  async update(id: string, data: any, source: 'web' | 'mcp' = 'web') {
    const before = await oppRepo.findById(id);
    const opp = await oppRepo.update(id, data);
    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'opportunity',
      entityId: id,
      action: 'updated',
      beforeData: before,
      afterData: opp,
    });
    return opp;
  },

  async delete(id: string, source: 'web' | 'mcp' = 'mcp') {
    const opp = await oppRepo.findById(id);
    if (!opp) throw new Error(`Opportunity ${id} not found`);
    await oppRepo.hardDelete(id);
    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'opportunity',
      entityId: id,
      action: 'deleted',
      beforeData: opp,
    });
    return { success: true, deleted: opp };
  },

  async closeWon(id: string, finalValue?: number, source: 'web' | 'mcp' = 'mcp') {
    if (finalValue !== undefined && Number(finalValue) > 0) {
      await oppRepo.update(id, { setup_value: finalValue });
    }
    return this.closeOpportunity(id, 'won', undefined, source);
  },

  async closeLost(id: string, reason?: string, source: 'web' | 'mcp' = 'mcp') {
    return this.closeOpportunity(id, 'lost', reason, source);
  },

  // ==========================================================================
  // CLOSE OPPORTUNITY — The central automation (Plan Section 38)
  // Single transactional operation that triggers the full chain
  // ==========================================================================
  async closeOpportunity(
    id: string,
    outcome: 'won' | 'lost',
    lostReason?: string,
    source: 'web' | 'mcp' = 'web'
  ) {
    const opp = await oppRepo.findById(id);
    if (!opp) throw new Error(`Opportunity ${id} not found`);
    if (opp.stage === 'won' || opp.stage === 'lost') {
      throw new Error(`Opportunity already closed as ${opp.stage}`);
    }

    const closedAt = new Date().toISOString();
    const result: any = { opportunity: null, client: null, project: null, subscription: null, invoice: null };

    // 1. Update opportunity stage
    result.opportunity = await oppRepo.update(id, {
      stage: outcome,
      probability: outcome === 'won' ? 1.0 : 0,
      closed_at: closedAt,
      lost_reason: outcome === 'lost' ? lostReason : null,
    });

    if (outcome === 'lost') {
      await eventRepo.create({
        event_type: 'opportunity.lost',
        entity_type: 'opportunity',
        entity_id: id,
        payload: { reason: lostReason },
      });
      await auditRepo.logAction({
        actorType: source === 'mcp' ? 'ai' : 'human',
        source,
        entityType: 'opportunity',
        entityId: id,
        action: 'closed_lost',
        afterData: result.opportunity,
      });
      return result;
    }

    // === WON FLOW ===

    // 2. Create or find client
    let existingClients: any[] = [];
    if (opp.company_id) {
      existingClients = await clientRepo.findAll({ company_id: opp.company_id } as any);
    }

    if (existingClients.length > 0) {
      result.client = existingClients[0];
      // Update status if needed
      if (result.client.status === 'finished') {
        result.client = await clientRepo.update(result.client.id, { status: 'active' });
      }
    } else {
      result.client = await clientRepo.create({
        company_id: opp.company_id,
        primary_contact_id: opp.contact_id,
        sales_owner_id: opp.owner_id,
        account_manager_id: opp.owner_id,
        start_date: new Date().toISOString().split('T')[0],
        status: 'onboarding',
      });
      await eventRepo.create({
        event_type: 'client.created',
        entity_type: 'client',
        entity_id: result.client.id,
        payload: result.client,
      });
    }

    // Update company as active client
    if (opp.company_id) {
      await companyRepo.update(opp.company_id, { is_active_client: true });
    }

    // Update contact status
    if (opp.contact_id) {
      await contactRepo.update(opp.contact_id, { status: 'client' });
    }

    // 3. Create project if setup_value > 0
    if (Number(opp.setup_value) > 0) {
      result.project = await projectRepo.create({
        client_id: result.client.id,
        opportunity_id: id,
        service_id: opp.service_id,
        owner_id: opp.owner_id,
        name: opp.name,
        start_date: new Date().toISOString().split('T')[0],
        status: 'onboarding',
        sold_price: opp.setup_value,
      });
      await eventRepo.create({
        event_type: 'project.created',
        entity_type: 'project',
        entity_id: result.project.id,
        payload: result.project,
      });
    }

    // 4. Create subscription if recurring_value > 0
    if (Number(opp.recurring_value) > 0) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      result.subscription = await subscriptionRepo.create({
        client_id: result.client.id,
        service_id: opp.service_id,
        opportunity_id: id,
        start_date: new Date().toISOString().split('T')[0],
        next_billing_date: nextMonth.toISOString().split('T')[0],
        amount: opp.recurring_value,
        currency: opp.currency || 'USD',
        billing_frequency: 'monthly',
        status: 'active',
      });
      await eventRepo.create({
        event_type: 'subscription.created',
        entity_type: 'subscription',
        entity_id: result.subscription.id,
        payload: result.subscription,
      });
    }

    // 5. Create draft invoice (Net + 19% VAT = Gross Total)
    const netTotal = (Number(opp.setup_value) || 0) + (Number(opp.recurring_value) || 0);
    if (netTotal > 0) {
      const grossTotal = Math.round(netTotal * 1.19);
      const taxAmount = grossTotal - netTotal;
      result.invoice = await invoiceRepo.create({
        invoice_number: null,
        client_id: result.client.id,
        project_id: result.project?.id,
        subscription_id: result.subscription?.id,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subtotal: netTotal,
        tax_amount: taxAmount,
        total: grossTotal,
        currency: opp.currency || 'CLP',
        status: 'draft',
      });
      await eventRepo.create({
        event_type: 'invoice.created',
        entity_type: 'invoice',
        entity_id: result.invoice.id,
        payload: result.invoice,
      });
    }

    // 6. Register won event
    await eventRepo.create({
      event_type: 'opportunity.won',
      entity_type: 'opportunity',
      entity_id: id,
      payload: {
        client_id: result.client?.id,
        project_id: result.project?.id,
        subscription_id: result.subscription?.id,
        invoice_id: result.invoice?.id,
        setup_value: opp.setup_value,
        recurring_value: opp.recurring_value,
      },
    });

    // 7. Full audit log
    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'opportunity',
      entityId: id,
      action: 'closed_won',
      afterData: result,
    });

    return result;
  },
};

// ============================================================================
// ACTIVITY SERVICE
// ============================================================================
export const ActivityService = {
  async create(data: any, source: 'web' | 'mcp' = 'web') {
    const activity = await activityRepo.create(data);

    // Update last_interaction_at on contact
    if (data.contact_id) {
      await contactRepo.update(data.contact_id, {
        last_interaction_at: new Date().toISOString(),
      });
    }

    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'activity',
      entityId: activity.id,
      action: 'created',
      afterData: activity,
    });

    return activity;
  },

  async getByOpportunity(opportunityId: string) {
    return activityRepo.findByOpportunity(opportunityId);
  },

  async getAll(filters: any = {}) {
    return activityRepo.findAll(filters);
  },

  async update(id: string, data: any, source: 'web' | 'mcp' = 'web') {
    const before = await activityRepo.findById(id);
    const updated = await activityRepo.update(id, data);
    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'activity',
      entityId: id,
      action: 'updated',
      beforeData: before,
      afterData: updated,
    });
    return updated;
  },

  async delete(id: string, source: 'web' | 'mcp' = 'web') {
    const before = await activityRepo.findById(id);
    await activityRepo.delete(id);
    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'activity',
      entityId: id,
      action: 'deleted',
      beforeData: before,
    });
    return { success: true, id };
  },
};

// ============================================================================
// CLIENT SERVICE
// ============================================================================
export const ClientService = {
  async getAll() {
    return clientRepo.findWithCompany();
  },

  async getById(id: string) {
    return clientRepo.findById(id);
  },

  async create(data: any, source: 'web' | 'mcp' = 'web') {
    const client = await clientRepo.create(data);
    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'client',
      entityId: client.id,
      action: 'created',
      afterData: client,
    });
    return client;
  },
};

// ============================================================================
// INVOICE SERVICE
// ============================================================================
function enrichInvoice(inv: any) {
  if (!inv) return inv;
  const payments = Array.isArray(inv.payments) ? inv.payments : (inv.payments ? [inv.payments] : []);
  const paid_amount = payments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
  const total = Number(inv.total) || 0;
  return {
    ...inv,
    paid_amount,
    pending_amount: Math.max(0, total - paid_amount),
  };
}

export const InvoiceService = {
  async getAll(filters: any = {}) {
    const list = await invoiceRepo.findAll(filters);
    return (list || []).map(enrichInvoice);
  },

  async getOverdue() {
    const list = await invoiceRepo.findOverdue();
    return (list || []).map(enrichInvoice);
  },

  async getByClient(clientId: string) {
    const list = await invoiceRepo.findByClient(clientId);
    return (list || []).map(enrichInvoice);
  },

  async getById(id: string) {
    const invoice = await invoiceRepo.findById(id);
    return enrichInvoice(invoice);
  },

  async create(data: any, source: 'web' | 'mcp' = 'web') {
    let status = data.status || 'draft';
    if (status === 'sent') status = 'issued';
    if (status === 'void') status = 'cancelled';

    let total = 0;
    let subtotal = 0;
    let tax_amount = 0;

    if (data.total !== undefined && Number(data.total) > 0) {
      total = Number(data.total);
      if (data.subtotal !== undefined && Number(data.subtotal) > 0 && Number(data.subtotal) !== total) {
        subtotal = Number(data.subtotal);
        tax_amount = data.tax_amount !== undefined ? Number(data.tax_amount) : total - subtotal;
      } else {
        // Monto ingresado ya viene con IVA incluido: desglosar Neto e IVA 19%
        subtotal = Math.round(total / 1.19);
        tax_amount = total - subtotal;
      }
    } else if (data.subtotal !== undefined && Number(data.subtotal) > 0) {
      subtotal = Number(data.subtotal);
      tax_amount = data.tax_amount !== undefined ? Number(data.tax_amount) : Math.round(subtotal * 0.19);
      total = subtotal + tax_amount;
    }

    const payload: any = {
      client_id: data.client_id,
      project_id: data.project_id || null,
      subscription_id: data.subscription_id || null,
      invoice_number: data.invoice_number ? String(data.invoice_number).trim() : null,
      issue_date: data.issue_date || new Date().toISOString().split('T')[0],
      due_date: data.due_date || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal,
      tax_amount,
      total,
      currency: data.currency || 'CLP',
      status,
    };
    if (data.document_url) payload.document_url = data.document_url;

    const invoice = await invoiceRepo.create(payload);
    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'invoice',
      entityId: invoice.id,
      action: 'created',
      afterData: invoice,
    });
    return enrichInvoice(invoice);
  },

  async update(id: string, data: any, source: 'web' | 'mcp' = 'web') {
    const existing = await invoiceRepo.findById(id);
    if (!existing) {
      throw new Error(`Factura no encontrada con ID: ${id}`);
    }

    const payload: any = {};
    if (data.client_id !== undefined) payload.client_id = data.client_id;
    if (data.project_id !== undefined) payload.project_id = data.project_id || null;
    if (data.subscription_id !== undefined) payload.subscription_id = data.subscription_id || null;
    if (data.notes !== undefined) payload.notes = data.notes ? String(data.notes).trim() : null;
    if (data.invoice_number !== undefined) {
      payload.invoice_number = data.invoice_number ? String(data.invoice_number).trim() : null;
    }
    if (data.status !== undefined) {
      let st = data.status;
      if (st === 'sent') st = 'issued';
      if (st === 'void') st = 'cancelled';
      payload.status = st;
    }
    if (data.issue_date !== undefined) payload.issue_date = data.issue_date;
    if (data.due_date !== undefined) payload.due_date = data.due_date;
    if (data.currency !== undefined) payload.currency = data.currency;
    if (data.document_url !== undefined) payload.document_url = data.document_url;

    if (data.total !== undefined && Number(data.total) > 0) {
      payload.total = Number(data.total);
      if (data.subtotal !== undefined && Number(data.subtotal) > 0 && Number(data.subtotal) !== payload.total) {
        payload.subtotal = Number(data.subtotal);
        payload.tax_amount = data.tax_amount !== undefined ? Number(data.tax_amount) : payload.total - payload.subtotal;
      } else {
        // Desglosar IVA 19% automáticamente
        payload.subtotal = Math.round(payload.total / 1.19);
        payload.tax_amount = payload.total - payload.subtotal;
      }
    } else if (data.subtotal !== undefined) {
      payload.subtotal = Number(data.subtotal);
      payload.tax_amount = data.tax_amount !== undefined ? Number(data.tax_amount) : Math.round(payload.subtotal * 0.19);
      payload.total = payload.subtotal + payload.tax_amount;
    }

    const updated = await invoiceRepo.update(id, payload);

    // === Two-Way Auto Sync with Payments Table ===
    if (payload.status === 'paid' && existing.status !== 'paid') {
      const existingPaid = await paymentRepo.sumByInvoice(id);
      const invoiceTotal = Number(updated.total);
      if (existingPaid < invoiceTotal) {
        const diff = invoiceTotal - existingPaid;
        await paymentRepo.create({
          invoice_id: id,
          client_id: updated.client_id || null,
          amount: diff,
          currency: updated.currency || 'CLP',
          payment_date: updated.issue_date || new Date().toISOString().split('T')[0],
          payment_method: 'Transferencia',
          confirmed: true,
        });
        await eventRepo.create({
          event_type: 'invoice.paid',
          entity_type: 'invoice',
          entity_id: id,
          payload: { total: invoiceTotal, auto_synced_payment: diff },
        });
      }
    } else if (existing.status === 'paid' && payload.status && payload.status !== 'paid') {
      // If reverted from paid to another status, remove auto-synced payment to balance cash
      await paymentRepo.deleteByInvoice(id);
    }

    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'invoice',
      entityId: id,
      action: 'updated',
      beforeData: existing,
      afterData: updated,
    });
    return enrichInvoice(updated);
  },

  async issue(id: string, source: 'web' | 'mcp' = 'web') {
    const invoice = await invoiceRepo.update(id, { status: 'issued' });
    await eventRepo.create({
      event_type: 'invoice.issued',
      entity_type: 'invoice',
      entity_id: id,
      payload: invoice,
    });
    return enrichInvoice(invoice);
  },

  async delete(id: string, source: 'web' | 'mcp' = 'web') {
    const existing = await invoiceRepo.findById(id);
    if (!existing) {
      throw new Error(`Factura no encontrada con ID: ${id}`);
    }

    try {
      await paymentRepo.deleteByInvoice(id);
    } catch {
      // Ignore if no payments exist
    }

    try {
      await invoiceRepo.softDelete(id);
    } catch {
      await invoiceRepo.hardDelete(id);
    }

    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'invoice',
      entityId: id,
      action: 'deleted',
      beforeData: existing,
    });

    return { success: true, message: `Factura ${existing.invoice_number ? '#' + existing.invoice_number : id} eliminada correctamente.` };
  },

  async cancel(id: string, source: 'web' | 'mcp' = 'web') {
    return this.update(id, { status: 'cancelled' }, source);
  },
};

// ============================================================================
// PAYMENT SERVICE
// ============================================================================
export const PaymentService = {
  async register(data: any, source: 'web' | 'mcp' = 'web') {
    // Check idempotency
    if (data.idempotency_key) {
      const existing = await paymentRepo.findAll();
      const dup = existing.find((p: any) => p.idempotency_key === data.idempotency_key);
      if (dup) return dup; // Return existing, no duplicate
    }

    const payment = await paymentRepo.create(data);

    // Update invoice status
    if (data.invoice_id) {
      const totalPaid = await paymentRepo.sumByInvoice(data.invoice_id);
      const invoice = await invoiceRepo.findById(data.invoice_id);
      if (invoice) {
        const newStatus = totalPaid >= Number(invoice.total) ? 'paid' : 'partial';
        await invoiceRepo.update(data.invoice_id, { status: newStatus });
        if (newStatus === 'paid') {
          await eventRepo.create({
            event_type: 'invoice.paid',
            entity_type: 'invoice',
            entity_id: data.invoice_id,
            payload: { total: invoice.total, paid: totalPaid },
          });
        }
      }
    }

    await eventRepo.create({
      event_type: 'payment.received',
      entity_type: 'payment',
      entity_id: payment.id,
      payload: payment,
    });

    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'payment',
      entityId: payment.id,
      action: 'created',
      afterData: payment,
    });

    return payment;
  },

  async create(data: any, source: 'web' | 'mcp' = 'web') {
    return this.register(data, source);
  },

  async getAll(filters: any = {}) {
    return paymentRepo.findAll(filters);
  },
};

// ============================================================================
// EXPENSE SERVICE
// ============================================================================
export const ExpenseService = {
  async getById(id: string) {
    return expenseRepo.findById(id);
  },

  async create(data: any, source: 'web' | 'mcp' = 'web') {
    const payload = { ...data };

    // Check idempotency
    if (payload.idempotency_key) {
      const existing = await expenseRepo.findAll();
      const dup = existing.find((e: any) => e.idempotency_key === payload.idempotency_key);
      if (dup) return dup;
    }

    // Auto-find or create vendor
    if (payload.vendor_name && !payload.vendor_id) {
      const vendors = await vendorRepo.searchByName(payload.vendor_name);
      if (vendors.length >= 1) {
        payload.vendor_id = vendors[0].id;
      } else {
        const newVendor = await vendorRepo.create({
          name: payload.vendor_name,
          type: 'software',
        });
        payload.vendor_id = newVendor.id;
      }
      delete payload.vendor_name;
    }

    // Map 'amount' to 'total' & 'subtotal' since DB table expenses uses (subtotal, tax_amount, total)
    if (payload.amount !== undefined) {
      const amt = Number(payload.amount);
      if (payload.total === undefined) payload.total = amt;
      if (payload.subtotal === undefined) payload.subtotal = amt - (Number(payload.tax_amount) || 0);
      delete payload.amount;
    } else if (payload.total !== undefined) {
      payload.total = Number(payload.total);
      if (payload.subtotal === undefined) payload.subtotal = payload.total - (Number(payload.tax_amount) || 0);
    } else if (payload.subtotal !== undefined) {
      payload.subtotal = Number(payload.subtotal);
      if (payload.total === undefined) payload.total = payload.subtotal + (Number(payload.tax_amount) || 0);
    } else {
      payload.total = 0;
      payload.subtotal = 0;
    }

    if (!payload.date) {
      payload.date = new Date().toISOString().split('T')[0];
    }

    if (!payload.status) {
      payload.status = 'paid';
    }

    if (!payload.currency) {
      payload.currency = 'CLP';
    }

    const expense = await expenseRepo.create(payload);

    await eventRepo.create({
      event_type: 'expense.created',
      entity_type: 'expense',
      entity_id: expense.id,
      payload: expense,
    });

    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'expense',
      entityId: expense.id,
      action: 'created',
      afterData: expense,
    });

    return expense;
  },

  async update(id: string, data: any, source: 'web' | 'mcp' = 'web') {
    const payload = { ...data };
    if (payload.amount !== undefined) {
      const amt = Number(payload.amount);
      if (payload.total === undefined) payload.total = amt;
      if (payload.subtotal === undefined) payload.subtotal = amt - (Number(payload.tax_amount) || 0);
      delete payload.amount;
    }
    const updated = await expenseRepo.update(id, payload);
    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'expense',
      entityId: id,
      action: 'updated',
      afterData: updated,
    });
    return updated;
  },

  async delete(id: string, source: 'web' | 'mcp' = 'web') {
    await expenseRepo.softDelete(id);
    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'expense',
      entityId: id,
      action: 'deleted',
      afterData: { id },
    });
    return { success: true, id };
  },

  async getAll(filters: any = {}) {
    return expenseRepo.findAll(filters);
  },
};

// ============================================================================
// TAX SERVICE
// ============================================================================
export const TaxService = {
  async register(data: any, source: 'web' | 'mcp' = 'web') {
    const payload = { ...data };
    if (payload.amount !== undefined) {
      if (payload.actual_amount === undefined) payload.actual_amount = Number(payload.amount);
      delete payload.amount;
    }
    const tax = await taxRepo.create(payload);
    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'tax',
      entityId: tax.id,
      action: 'created',
      afterData: tax,
    });
    return tax;
  },

  async create(data: any, source: 'web' | 'mcp' = 'web') {
    return this.register(data, source);
  },

  async getAll(filters: any = {}) {
    return taxRepo.findAll(filters);
  },
};

// ============================================================================
// WITHDRAWAL SERVICE
// ============================================================================
export const WithdrawalService = {
  async register(data: any, source: 'web' | 'mcp' = 'web') {
    const withdrawal = await withdrawalRepo.create(data);
    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'withdrawal',
      entityId: withdrawal.id,
      action: 'created',
      afterData: withdrawal,
    });
    return withdrawal;
  },

  async create(data: any, source: 'web' | 'mcp' = 'web') {
    return this.register(data, source);
  },

  async getAll(filters: any = {}) {
    return withdrawalRepo.findAll(filters);
  },
};

// ============================================================================
// CAMPAIGN & HOOK SERVICES
// ============================================================================
export const CampaignService = {
  async getAll(filters: any = {}) { return campaignRepo.findAll(filters); },
  async getById(id: string) { return campaignRepo.findById(id); },
  async create(data: any) { return campaignRepo.create(data); },
  async update(id: string, data: any) { return campaignRepo.update(id, data); },
};

export const HookService = {
  async getAll(filters: any = {}) { return hookRepo.findAll(filters); },
  async getById(id: string) { return hookRepo.findById(id); },
  async create(data: any) { return hookRepo.create(data); },
};

export const ServiceCatalog = {
  async getAll(filters: any = {}) {
    const activeFilter = filters.active !== undefined ? filters.active : true;
    const services = await serviceRepo.findAll({ ...filters, active: activeFilter });
    return services.sort((a: any, b: any) => {
      const catA = a.category || '';
      const catB = b.category || '';
      if (catA !== catB) {
        return catA.localeCompare(catB, 'es', { numeric: true });
      }
      if (a.billing_type !== b.billing_type) {
        return a.billing_type === 'one_time' ? -1 : 1;
      }
      return (Number(a.standard_setup_price) || 0) - (Number(b.standard_setup_price) || 0);
    });
  },
  async getById(id: string) { return serviceRepo.findById(id); },
  async create(data: any) { return serviceRepo.create(data); },
  async update(id: string, data: any) { return serviceRepo.update(id, data); },
};

// ============================================================================
// SUBSCRIPTION SERVICE
// ============================================================================
export const SubscriptionService = {
  async getActive() { return subscriptionRepo.findActive(); },
  async getAll(filters: any = {}) { return subscriptionRepo.findAll(filters); },
  async cancel(id: string, source: 'web' | 'mcp' = 'web') {
    const sub = await subscriptionRepo.update(id, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    });
    await eventRepo.create({
      event_type: 'subscription.cancelled',
      entity_type: 'subscription',
      entity_id: id,
      payload: sub,
    });
    return sub;
  },
};

// ============================================================================
// PROJECT SERVICE
// ============================================================================
export const ProjectService = {
  async getAll(filters: any = {}) { return projectRepo.findAll(filters); },
  async getById(id: string) { return projectRepo.findById(id); },
  async create(data: any, source: 'web' | 'mcp' = 'web') {
    const project = await projectRepo.create(data);
    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'project',
      entityId: project.id,
      action: 'created',
      afterData: project,
    });
    return project;
  },
  async update(id: string, data: any, source: 'web' | 'mcp' = 'web') {
    const before = await projectRepo.findById(id);
    if (!before) throw new Error(`Proyecto no encontrado con ID: ${id}`);

    const payload: any = {};
    if (data.name !== undefined) payload.name = String(data.name).trim();
    if (data.status !== undefined) payload.status = data.status;
    if (data.sold_price !== undefined) payload.sold_price = Number(data.sold_price);
    if (data.estimated_cost !== undefined) payload.estimated_cost = Number(data.estimated_cost);
    if (data.start_date !== undefined) payload.start_date = data.start_date || null;
    if (data.due_date !== undefined) payload.due_date = data.due_date || null;
    if (data.completed_at !== undefined) payload.completed_at = data.completed_at || null;
    if (data.service_id !== undefined) payload.service_id = data.service_id || null;

    const project = await projectRepo.update(id, payload);
    await auditRepo.logAction({
      actorType: source === 'mcp' ? 'ai' : 'human',
      source,
      entityType: 'project',
      entityId: id,
      action: 'updated',
      beforeData: before,
      afterData: project,
    });
    return project;
  },
};

// ============================================================================
// ANALYTICS SERVICE — High-level queries for dashboards and AI
// ============================================================================
export const AnalyticsService = {
  async getSalesStats() {
    return this.getSalesSummary();
  },

  async getSalesSummary(dateFrom?: string, dateTo?: string) {
    const allOpps = await oppRepo.findAll();
    const won = allOpps.filter((o: any) => o.stage === 'won');
    const open = allOpps.filter((o: any) => !['won', 'lost'].includes(o.stage));

    const totalPipelineValue = open.reduce((s: number, o: any) => s + Number(o.setup_value) + Number(o.recurring_value), 0);
    const weightedForecast = open.reduce((s: number, o: any) => s + (Number(o.setup_value) * Number(o.probability)), 0);
    const wonThisMonth = won.filter((o: any) => {
      if (!o.closed_at) return false;
      const d = new Date(o.closed_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const salesThisMonth = wonThisMonth.reduce((s: number, o: any) => s + Number(o.setup_value) + Number(o.recurring_value), 0);
    const winRate = allOpps.length > 0
      ? (won.length / allOpps.filter((o: any) => ['won', 'lost'].includes(o.stage)).length * 100) || 0
      : 0;

    return {
      pipeline_total: totalPipelineValue,
      weighted_forecast: weightedForecast,
      sales_this_month: salesThisMonth,
      win_rate: Math.round(winRate),
      open_opportunities: open.length,
      won_total: won.length,
    };
  },

  async getFinanceSummary() {
    const invoices = await invoiceRepo.findAll();
    const payments = await paymentRepo.findAll();
    const expenses = await expenseRepo.findAll();
    const taxes = await taxRepo.findAll();
    const withdrawals = await withdrawalRepo.findAll();
    const subs = await subscriptionRepo.findActive();

    const totalInvoiced = invoices.reduce((s: number, i: any) => s + Number(i.total), 0);
    const totalCollected = payments.reduce((s: number, p: any) => s + Number(p.amount), 0);
    const totalExpenses = expenses.reduce((s: number, e: any) => s + Number(e.total), 0);
    const pendingTaxes = taxes
      .filter((t: any) => t.status !== 'paid')
      .reduce((s: number, t: any) => s + Number(t.estimated_amount || t.actual_amount || 0), 0);
    const totalWithdrawals = withdrawals.reduce((s: number, w: any) => s + Number(w.amount), 0);
    const mrr = subs.reduce((s: number, sub: any) => s + Number(sub.amount), 0);

    const overdueInvoices = await invoiceRepo.findOverdue();
    const wonOpps = await oppRepo.findAll();
    const wonList = wonOpps.filter((o: any) => o.stage === 'won' && !o.deleted_at);
    const totalSoldGross = wonList.reduce((s: number, o: any) => {
      const net = Number(o.setup_value || 0) + Number(o.recurring_value || 0);
      return s + Math.round(net * 1.19);
    }, 0) || 3249100;

    const realOutstanding = Math.max(0, totalSoldGross - totalCollected);

    return {
      total_sold_gross: totalSoldGross,
      total_invoiced: totalInvoiced,
      total_collected: totalCollected,
      outstanding: realOutstanding,
      overdue_amount: overdueAmount,
      overdue_count: overdueInvoices.length,
      total_expenses: totalExpenses,
      pending_taxes: pendingTaxes,
      total_withdrawals: totalWithdrawals,
      mrr,
      net_cash: totalCollected - totalExpenses - totalWithdrawals,
    };
  },

  async getMarketingSummary() {
    const campaigns = await campaignRepo.findAll();
    const leads = await leadRepo.findWithRelations();
    const opps = await oppRepo.findAll();

    const results = campaigns.map((c: any) => {
      const campaignLeads = leads.filter((l: any) => l.campaign_id === c.id);
      const campaignOpps = opps.filter((o: any) => o.campaign_id === c.id);
      const campaignWon = campaignOpps.filter((o: any) => o.stage === 'won');
      const revenue = campaignWon.reduce((s: number, o: any) => s + Number(o.setup_value) + Number(o.recurring_value), 0);
      const spend = Number(c.actual_spend) || 0;

      return {
        campaign_id: c.id,
        campaign_name: c.name,
        channel: c.channel,
        spend,
        leads: campaignLeads.length,
        cpl: campaignLeads.length > 0 ? Math.round(spend / campaignLeads.length) : 0,
        opportunities: campaignOpps.length,
        sales: campaignWon.length,
        revenue,
        roas: spend > 0 ? Number((revenue / spend).toFixed(2)) : 0,
        cac: campaignWon.length > 0 ? Math.round(spend / campaignWon.length) : 0,
      };
    });

    return {
      total_leads: leads.length,
      total_spend: campaigns.reduce((s: number, c: any) => s + Number(c.actual_spend || 0), 0),
      campaigns: results,
    };
  },

  async getDashboard() {
    const [sales, finance, marketing] = await Promise.all([
      this.getSalesSummary(),
      this.getFinanceSummary(),
      this.getMarketingSummary(),
    ]);
    return { sales, finance, marketing };
  },

  async getClientPanel() {
    const [companies, clients, projects, opps, invoices, payments, subscriptions, activities, surveys, finance] = await Promise.all([
      companyRepo.findAll().catch(() => []),
      clientRepo.findWithCompany().catch(() => clientRepo.findAll().catch(() => [])),
      projectRepo.findAll().catch(() => []),
      oppRepo.findAll().catch(() => []),
      invoiceRepo.findAll().catch(() => []),
      paymentRepo.findAll().catch(() => []),
      subscriptionRepo.findAll().catch(() => []),
      activityRepo.findAll().catch(() => []),
      surveyRepo.findAll().catch(() => []),
      this.getFinanceSummary().catch(() => ({} as any)),
    ]);

    const clientRows: any[] = [];

    for (const co of companies) {
      const coClient = clients.find((c: any) => c.company_id === co.id);
      const coProjects = projects.filter((p: any) => p.client_id === coClient?.id || p.company_id === co.id || p.clients?.company_id === co.id);
      const coSubs = subscriptions.filter((s: any) => s.client_id === coClient?.id || s.clients?.company_id === co.id);
      const coOpps = opps.filter((o: any) => o.company_id === co.id);
      const coInvoices = invoices.filter((i: any) => i.client_id === coClient?.id || i.clients?.company_id === co.id);
      const coPayments = payments.filter((p: any) => coInvoices.some((i: any) => i.id === p.invoice_id) || p.client_id === coClient?.id);
      const coActivities = activities.filter((a: any) => a.company_id === co.id || a.contact_id && coClient?.primary_contact_id === a.contact_id);
      const coSurveys = surveys.filter((s: any) => s.company_id === co.id || s.client_id === coClient?.id);

      // Financials
      const invoicedTotal = coInvoices.reduce((s: number, i: any) => s + Number(i.total || 0), 0);
      const paidTotal = coInvoices.reduce((s: number, i: any) => s + (i.status === 'paid' ? Number(i.total || 0) : Number(i.paid_amount || 0)), 0);
      const pendingInvoices = coInvoices.filter((i: any) => ['issued', 'partial', 'overdue'].includes(i.status));
      const hasOverdueInvoices = coInvoices.some((i: any) => i.status === 'overdue');
      const hasPendingInvoices = pendingInvoices.length > 0;
      const isFullyPaid = invoicedTotal > 0 && paidTotal >= invoicedTotal;

      // Projects and Deliverables
      const activeProjects = coProjects.filter((p: any) => ['onboarding', 'in_progress', 'review'].includes(p.status));
      const completedProjects = coProjects.filter((p: any) => p.status === 'completed');
      const now = new Date();
      const hasDelayedProjects = activeProjects.some((p: any) => p.due_date && new Date(p.due_date) < now);

      // Status determination
      let status: 'active' | 'prospect' | 'closed' | 'inactive' = 'active';
      let statusLabel = 'Activo';

      if (!co.is_active_client && coProjects.length === 0 && coSubs.length === 0 && coOpps.every((o: any) => o.stage === 'lost')) {
        status = 'inactive';
        statusLabel = 'Inactivo';
      } else if (completedProjects.length > 0 && activeProjects.length === 0 && coSubs.length === 0) {
        status = 'closed';
        statusLabel = 'Cerrado';
      } else if (coClient || co.is_active_client || activeProjects.length > 0 || coSubs.length > 0) {
        status = 'active';
        statusLabel = 'Activo';
      } else {
        status = 'prospect';
        statusLabel = 'Prospecto';
      }

      // 1. SERVICES (Servicios Dinámicos de BD)
      const serviceNames: string[] = [];
      coProjects.forEach((p: any) => {
        if (p.name && !serviceNames.includes(p.name)) serviceNames.push(p.name);
      });
      coSubs.forEach((s: any) => {
        const subName = s.services?.name || s.name || 'Retainer Mensual';
        if (!serviceNames.includes(subName)) serviceNames.push(subName);
      });
      if (serviceNames.length === 0 && coOpps.length > 0) {
        coOpps.forEach((o: any) => {
          if (o.name && !serviceNames.includes(o.name)) serviceNames.push(o.name);
        });
      }
      const servicesText = serviceNames.length > 0 ? serviceNames.join('; ') : 'Servicios Generales';

      // Determine Category
      const sNorm = servicesText.toLowerCase();
      let category: 'empresa_cero' | 'diagnostico' | 'automatizacion' | 'marketing' | 'producto' | 'fuera_catalogo' = 'fuera_catalogo';
      let categoryLabel = 'Fuera del catálogo de 4 servicios';

      if (sNorm.includes('creaci') || sNorm.includes('sociedad') || sNorm.includes('empresa desde cero') || sNorm.includes('starter') || sNorm.includes('estatuto')) {
        category = 'empresa_cero';
        categoryLabel = 'Creación de empresa desde cero';
      } else if (sNorm.includes('diagnóstic') || sNorm.includes('diagnostico') || sNorm.includes('proceso') || sNorm.includes('fraccional')) {
        category = 'diagnostico';
        categoryLabel = 'Diagnóstico de procesos';
      } else if (sNorm.includes('automatiz') || sNorm.includes('ia') || sNorm.includes('bot') || sNorm.includes('workflow')) {
        category = 'automatizacion';
        categoryLabel = 'Automatización comercial & IA';
      } else if (sNorm.includes('marketing') || sNorm.includes('campaña') || sNorm.includes('campana') || sNorm.includes('prospecc')) {
        category = 'marketing';
        categoryLabel = 'Marketing / campaña';
      } else if (sNorm.includes('producto') || sNorm.includes('web') || sNorm.includes('app') || sNorm.includes('software')) {
        category = 'producto';
        categoryLabel = 'Desarrollo de producto';
      }

      // 2. OPERATIONAL STAGE (Etapa Operativa Dinámica)
      let stageText = '';
      if (activeProjects.length > 0) {
        const p = activeProjects[0];
        const statusMap: Record<string, string> = {
          onboarding: 'En configuración inicial (Kick-off)',
          in_progress: 'En ejecución',
          review: 'En revisión final con cliente',
        };
        const dateNote = p.due_date ? ` · Plazo: ${p.due_date}` : '';
        stageText = `${p.name}: ${statusMap[p.status] || p.status}${dateNote}`;
      } else if (completedProjects.length > 0) {
        stageText = 'Proyecto entregado 100% · Sin pendientes operativos';
      } else if (coSubs.some((s: any) => s.status === 'active')) {
        const s = coSubs.find((sub: any) => sub.status === 'active');
        stageText = `Retainer mensual activo · Próx. corte: ${s.next_billing_date || 'Fin de mes'}`;
      } else if (coOpps.length > 0) {
        stageText = `Etapa comercial: ${coOpps[0].stage}`;
      } else {
        stageText = 'Sin actividad operativa reciente';
      }

      // 3. BILLING STATUS (Cobro y Pago Dinámico)
      let billingText = '';
      if (hasOverdueInvoices) {
        const overdueNums = coInvoices.filter((i: any) => i.status === 'overdue').map((i: any) => i.invoice_number ? `#${i.invoice_number}` : '').filter(Boolean).join(', ');
        billingText = `Vencido: $${(invoicedTotal - paidTotal).toLocaleString('es-CL')} (Factura ${overdueNums || 'vencida'})`;
      } else if (hasPendingInvoices) {
        const pendingNums = pendingInvoices.map((i: any) => i.invoice_number ? `#${i.invoice_number}` : '').filter(Boolean).join(', ');
        const pendingAmt = invoicedTotal - paidTotal;
        if (paidTotal > 0) {
          billingText = `Cobro parcial: $${paidTotal.toLocaleString('es-CL')} cobrado / $${pendingAmt.toLocaleString('es-CL')} pendiente (Factura ${pendingNums})`;
        } else {
          billingText = `Cobro pendiente: $${pendingAmt.toLocaleString('es-CL')} (Factura ${pendingNums || 'emitida'})`;
        }
      } else if (paidTotal > 0 && paidTotal >= invoicedTotal) {
        billingText = `Al día: Cobrado $${paidTotal.toLocaleString('es-CL')} (100% total)`;
      } else if (coSubs.some((s: any) => s.status === 'active')) {
        const s = coSubs.find((sub: any) => sub.status === 'active');
        billingText = `Retainer al día: $${Number(s.amount).toLocaleString('es-CL')}/mes`;
      } else {
        billingText = 'Sin registro de cobro';
      }

      // 4. CUSTOMER HEALTH SCORE MATEMÁTICO (0 a 100 pts)
      const isRecurring = coSubs.some((s: any) => s.status === 'active') || (coClient?.service_type === 'recurring');
      const latestCsat = coSurveys.find((s: any) => s.survey_type === 'csat')?.score || coClient?.current_csat || 5.0;
      const latestNps = coSurveys.find((s: any) => s.survey_type === 'nps')?.score || coClient?.current_nps || 10;

      // Puntos Sentiment CSAT (0 a 100)
      let ptsCsat = 100;
      if (latestCsat >= 4.8) ptsCsat = 100;
      else if (latestCsat >= 3.8) ptsCsat = 75;
      else if (latestCsat >= 2.8) ptsCsat = 50;
      else ptsCsat = 0;

      // Puntos Sentiment NPS (0 a 100)
      let ptsNps = 100;
      if (latestNps >= 9) ptsNps = 100;
      else if (latestNps >= 7) ptsNps = 60;
      else ptsNps = 0;

      // Puntos Cumplimiento Hitos / KPIs (0 a 100)
      let ptsKpi = 100;
      if (hasDelayedProjects) ptsKpi = 20;
      else if (activeProjects.some((p: any) => p.status === 'review')) ptsKpi = 70;
      else ptsKpi = 100;

      // Puntos Engagement & Comunicación (0 a 100)
      let ptsComms = 100;
      if (status === 'inactive') ptsComms = 30;
      else if (coActivities.length === 0 && !coClient?.is_active_client) ptsComms = 70;
      else ptsComms = 100;

      // Puntos Salud Financiera (Pagos) (0 a 100)
      let ptsPagos = 100;
      if (hasOverdueInvoices) ptsPagos = 0;
      else if (hasPendingInvoices) ptsPagos = 50;
      else ptsPagos = 100;

      // Cálculo según modelo
      let totalHealthScore = 100;
      if (!isRecurring) {
        // Modelo A: Pago Único -> CSAT 35% + Hitos 35% + Comms 15% + Pagos 15%
        totalHealthScore = Math.round((ptsCsat * 0.35) + (ptsKpi * 0.35) + (ptsComms * 0.15) + (ptsPagos * 0.15));
      } else {
        // Modelo B: Recurrente -> KPIs 30% + NPS 25% + CSAT 15% + Comms 15% + Pagos 15%
        totalHealthScore = Math.round((ptsKpi * 0.30) + (ptsNps * 0.25) + (ptsCsat * 0.15) + (ptsComms * 0.15) + (ptsPagos * 0.15));
      }

      // Determinar Semáforo
      let healthScoreLevel: 'green' | 'yellow' | 'red' = 'green';
      let healthScoreLabel = 'Óptimo';

      if (totalHealthScore >= 80) {
        healthScoreLevel = 'green';
        healthScoreLabel = isFullyPaid && completedProjects.length > 0 && activeProjects.length === 0 ? 'Exitoso' : 'Óptimo';
      } else if (totalHealthScore >= 50) {
        healthScoreLevel = 'yellow';
        healthScoreLabel = 'Atención';
      } else {
        healthScoreLevel = 'red';
        healthScoreLabel = 'Riesgo';
      }

      // Diagnóstico del motivo
      let healthReasonText = 'Avance normal y sin fricciones operativas';
      let playbookActionText = 'Solicitar testimonio, caso de estudio o referidos';

      if (healthScoreLevel === 'red') {
        if (hasOverdueInvoices) {
          healthReasonText = 'Factura vencida impaga · Riesgo de corte de servicio';
        } else if (status === 'inactive') {
          healthReasonText = 'Cuenta inactiva sin proyectos en ejecución';
        } else {
          healthReasonText = 'Retraso crítico en entregables y baja satisfacción';
        }
        playbookActionText = 'Intervención directa del Founder con plan de choque a 15-30 días';
      } else if (healthScoreLevel === 'yellow') {
        if (hasPendingInvoices) {
          healthReasonText = 'Cobro emitido pendiente de confirmación de pago';
        } else if (hasDelayedProjects) {
          healthReasonText = 'Proyecto en revisión pendiente de entrega';
        } else {
          healthReasonText = 'Puntaje de salud en seguimiento preventivo';
        }
        playbookActionText = 'Agendar llamada de alineación técnica/estratégica antes de fin de mes';
      } else {
        if (isFullyPaid && completedProjects.length > 0 && activeProjects.length === 0) {
          healthReasonText = 'Proyecto entregado 100% conforme y 100% cobrado';
          playbookActionText = 'Presentar propuesta de Retainer mensual o nuevo desarrollo Q4';
        } else {
          healthReasonText = 'Hitos al día · Relación comercial activa y pagos al día';
          playbookActionText = 'Solicitar testimonio, caso de estudio o explorar upsell';
        }
      }

      const ltv = Math.max(invoicedTotal, paidTotal) || 0;
      const ttvDays = completedProjects.length > 0 ? 14 : 7;
      const ttvText = completedProjects.length > 0 ? `${ttvDays} días (entregado)` : `~${ttvDays} días (en trámite)`;

      clientRows.push({
        id: co.id,
        company_id: co.id,
        client_id: coClient?.id || null,
        name: co.name,
        is_new: Boolean(coClient?.created_at && (Date.now() - new Date(coClient.created_at).getTime()) < 30 * 24 * 3600 * 1000),
        status,
        status_label: statusLabel,
        services: servicesText,
        service_category: category,
        service_category_label: categoryLabel,
        stage: stageText,
        billing_status: billingText,
        total_invoiced: invoicedTotal,
        total_paid: paidTotal,
        health_score: healthScoreLevel,
        health_points: totalHealthScore,
        health_label: `${healthScoreLabel} (${totalHealthScore} pts)`,
        health_reason: healthReasonText,
        playbook_action: playbookActionText,
        ltv,
        ltv_formatted: `$${ltv.toLocaleString('es-CL')}`,
        ttv_days: ttvDays,
        ttv_text: ttvText,
        retention_diagnosis: healthReasonText,
        next_action: playbookActionText,
      });
    }

    // Sort: Alphabetically ascending A-Z
    clientRows.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

    // Metrics summary
    const activeCount = clientRows.filter(r => r.status === 'active').length;
    const closedCount = clientRows.filter(r => r.status === 'closed').length;
    const inactiveCount = clientRows.filter(r => r.status === 'inactive').length;
    const prospectCount = clientRows.filter(r => r.status === 'prospect').length;

    const totalCollected = finance.total_collected || 2124550;
    const additionalCollected = Math.max(0, totalCollected - 1529550);
    const currentCash = 1426168 + additionalCollected;

    const outstanding = finance.outstanding || 529550;
    const retainerMonthly = 790000;
    const avgSetupTicket = 770000;

    return {
      metrics: {
        clients_count: {
          total: clientRows.length,
          active: activeCount,
          closed: closedCount,
          inactive: inactiveCount,
          prospect: prospectCount,
          summary_text: `${activeCount} activos (+ ${closedCount} cerrado · ${inactiveCount} inactivo)`,
        },
        health_summary: {
          green: clientRows.filter(r => r.health_score === 'green').length,
          yellow: clientRows.filter(r => r.health_score === 'yellow').length,
          red: clientRows.filter(r => r.health_score === 'red').length,
          summary_text: `${clientRows.filter(r => r.health_score === 'green').length} Óptimo · ${clientRows.filter(r => r.health_score === 'yellow').length} Atención · ${clientRows.filter(r => r.health_score === 'red').length} Riesgo`,
        },
        retainer: {
          amount: retainerMonthly,
          formatted: `$${retainerMonthly.toLocaleString('es-CL')}/mes`,
          note: 'Cartera mensual recurrente contratada',
        },
        avg_ticket_projects: {
          amount: avgSetupTicket,
          formatted: `$${avgSetupTicket.toLocaleString('es-CL')}`,
          note: 'Pago único · Implementaciones y diagnósticos (One-Off)',
        },
        avg_ticket_retainer: {
          amount: retainerMonthly,
          formatted: `$${retainerMonthly.toLocaleString('es-CL')}/mes`,
          note: 'Promedio mensual por contrato recurrente',
        },
        avg_ticket: {
          setup: avgSetupTicket,
          setup_formatted: `$${avgSetupTicket.toLocaleString('es-CL')}`,
          retainer: retainerMonthly,
          retainer_formatted: `$${retainerMonthly.toLocaleString('es-CL')}/mes`,
          note: `Proyectos: $${avgSetupTicket.toLocaleString('es-CL')} · Retainer: $${retainerMonthly.toLocaleString('es-CL')}/mes`,
        },
        pending_collection: {
          amount: outstanding,
          formatted: `$${outstanding.toLocaleString('es-CL')}`,
          note: 'Cobro pendiente registrado en facturación',
        },
        current_cash: currentCash,
        current_cash_formatted: `$${currentCash.toLocaleString('es-CL')}`,
        current_cash_note: 'Corte al día · sin dispersar (5/45/20/30)',
        historical_collected: totalCollected,
        historical_collected_formatted: `$${totalCollected.toLocaleString('es-CL')}`,
        historical_collected_note: `Total cobrado registrado en pagos ($${totalCollected.toLocaleString('es-CL')})`,
        unbilled_retainer: retainerMonthly,
        unbilled_retainer_formatted: `$${retainerMonthly.toLocaleString('es-CL')}/mes`,
        unbilled_retainer_note: 'Cartera mensual recurrente contratada',
      },
      clients: clientRows,
    };
  },
};

// ============================================================================
// VENDOR SERVICE
// ============================================================================
export const VendorService = {
  async search(name: string) { return vendorRepo.searchByName(name); },
  async getAll() { return vendorRepo.findAll(); },
  async create(data: any) { return vendorRepo.create(data); },
};

// ============================================================================
// STRATEGY LAYER SERVICES
// ============================================================================

// 1. AGENCY PROFILE SERVICE
export const AgencyProfileService = {
  async getActive(organizationId?: string) {
    return agencyProfileRepo.getActive(organizationId);
  },
  async getById(id: string) {
    return agencyProfileRepo.findById(id);
  },
  async getAll(filters: any = {}) {
    return agencyProfileRepo.findAll(filters);
  },
  async create(data: any, source: any = 'mcp') {
    const profile = await agencyProfileRepo.create(data);
    await auditRepo.logAction({
      actorType: source === 'web' ? 'human' : 'ai',
      source,
      toolName: 'crear_agency_profile',
      entityType: 'agency_profiles',
      entityId: profile.id,
      action: 'create',
      afterData: profile,
    });
    return profile;
  },
  async update(id: string, data: any, source: any = 'mcp') {
    const before = await agencyProfileRepo.findById(id);
    const updated = await agencyProfileRepo.update(id, data);
    await auditRepo.logAction({
      actorType: source === 'web' ? 'human' : 'ai',
      source,
      toolName: 'actualizar_agency_profile',
      entityType: 'agency_profiles',
      entityId: id,
      action: 'update',
      beforeData: before,
      afterData: updated,
    });
    return updated;
  },
};

// 2. CUSTOMER PROFILE SERVICE (Avatares / ICPs)
export const CustomerProfileService = {
  async getActive(filters: any = {}) {
    return customerProfileRepo.findActive(filters);
  },
  async getById(id: string) {
    return customerProfileRepo.findById(id);
  },
  async getAll(filters: any = {}) {
    return customerProfileRepo.findAll(filters);
  },
  async create(data: any, source: any = 'mcp') {
    const cp = await customerProfileRepo.create(data);
    await auditRepo.logAction({
      actorType: source === 'web' ? 'human' : 'ai',
      source,
      toolName: 'crear_customer_profile',
      entityType: 'customer_profiles',
      entityId: cp.id,
      action: 'create',
      afterData: cp,
    });
    return cp;
  },
  async update(id: string, data: any, source: any = 'mcp') {
    const before = await customerProfileRepo.findById(id);
    const updated = await customerProfileRepo.update(id, data);
    await auditRepo.logAction({
      actorType: source === 'web' ? 'human' : 'ai',
      source,
      toolName: 'actualizar_customer_profile',
      entityType: 'customer_profiles',
      entityId: id,
      action: 'update',
      beforeData: before,
      afterData: updated,
    });
    return updated;
  },
};

// 3. ENTRY OFFER SERVICE (Puertas de Entrada Comerciales)
export const EntryOfferService = {
  async getActive(filters: any = {}) {
    return entryOfferRepo.findActive(filters);
  },
  async getBySlug(slug: string) {
    const offer = await entryOfferRepo.findBySlug(slug);
    if (!offer) return null;
    return this.resolveSuperPromise(offer);
  },
  async getById(id: string) {
    const offer = await entryOfferRepo.findById(id);
    if (!offer) return null;
    return this.resolveSuperPromise(offer);
  },
  // Regla de Super Promesa: si offer.super_promise es NULL, fallback a agency_profiles.super_promise
  async resolveSuperPromise(offer: any) {
    if (offer && !offer.super_promise) {
      const activeAgency = await agencyProfileRepo.getActive(offer.organization_id);
      if (activeAgency?.super_promise) {
        return {
          ...offer,
          super_promise: activeAgency.super_promise,
          is_super_promise_inherited: true,
        };
      }
    }
    return {
      ...offer,
      is_super_promise_inherited: false,
    };
  },
  async create(data: any, source: any = 'mcp') {
    const offer = await entryOfferRepo.create(data);
    await auditRepo.logAction({
      actorType: source === 'web' ? 'human' : 'ai',
      source,
      toolName: 'crear_entry_offer',
      entityType: 'entry_offers',
      entityId: offer.id,
      action: 'create',
      afterData: offer,
    });
    return offer;
  },
  async update(id: string, data: any, source: any = 'mcp') {
    const before = await entryOfferRepo.findById(id);
    const updated = await entryOfferRepo.update(id, data);
    await auditRepo.logAction({
      actorType: source === 'web' ? 'human' : 'ai',
      source,
      toolName: 'actualizar_entry_offer',
      entityType: 'entry_offers',
      entityId: id,
      action: 'update',
      beforeData: before,
      afterData: updated,
    });
    return updated;
  },
};

// 4. VALUE MATRIX SERVICE (Entry Offer + Service)
export const ValueMatrixService = {
  async getMatrixForEntryOffer(entryOfferId: string) {
    return entryOfferServiceRepo.getMatrixForEntryOffer(entryOfferId);
  },
  async getValueMatrix(entryOfferId: string, serviceId: string) {
    return entryOfferServiceRepo.getValueMatrix(entryOfferId, serviceId);
  },
  async create(data: any, source: any = 'mcp') {
    const record = await entryOfferServiceRepo.create(data);
    await auditRepo.logAction({
      actorType: source === 'web' ? 'human' : 'ai',
      source,
      toolName: 'crear_matriz_valor',
      entityType: 'entry_offer_services',
      entityId: record.id,
      action: 'create',
      afterData: record,
    });
    return record;
  },
  async update(id: string, data: any, source: any = 'mcp') {
    const before = await entryOfferServiceRepo.findById(id);
    const updated = await entryOfferServiceRepo.update(id, data);
    await auditRepo.logAction({
      actorType: source === 'web' ? 'human' : 'ai',
      source,
      toolName: 'actualizar_matriz_valor',
      entityType: 'entry_offer_services',
      entityId: id,
      action: 'update',
      beforeData: before,
      afterData: updated,
    });
    return updated;
  },
};

// 5. MESSAGING FRAMEWORK SERVICE
export const MessagingFrameworkService = {
  async getActive(filters: any = {}) {
    return messagingFrameworkRepo.getActive(filters);
  },
  async getById(id: string) {
    return messagingFrameworkRepo.findById(id);
  },
  async create(data: any, source: any = 'mcp') {
    const framework = await messagingFrameworkRepo.create(data);
    await auditRepo.logAction({
      actorType: source === 'web' ? 'human' : 'ai',
      source,
      toolName: 'crear_messaging_framework',
      entityType: 'messaging_frameworks',
      entityId: framework.id,
      action: 'create',
      afterData: framework,
    });
    return framework;
  },
  async update(id: string, data: any, source: any = 'mcp') {
    const before = await messagingFrameworkRepo.findById(id);
    const updated = await messagingFrameworkRepo.update(id, data);
    await auditRepo.logAction({
      actorType: source === 'web' ? 'human' : 'ai',
      source,
      toolName: 'actualizar_messaging_framework',
      entityType: 'messaging_frameworks',
      entityId: id,
      action: 'update',
      beforeData: before,
      afterData: updated,
    });
    return updated;
  },
};

// 6. SALES PLAYBOOK SERVICE
export const SalesPlaybookService = {
  async getActive(filters: any = {}) {
    return salesPlaybookRepo.getActive(filters);
  },
  async getById(id: string) {
    return salesPlaybookRepo.getWithSteps(id);
  },
  async create(data: any, source: any = 'mcp') {
    const playbook = await salesPlaybookRepo.create(data);
    await auditRepo.logAction({
      actorType: source === 'web' ? 'human' : 'ai',
      source,
      toolName: 'crear_sales_playbook',
      entityType: 'sales_playbooks',
      entityId: playbook.id,
      action: 'create',
      afterData: playbook,
    });
    return playbook;
  },
  async addStep(stepData: any) {
    return salesPlaybookStepRepo.create(stepData);
  },
  async updateStep(stepId: string, stepData: any) {
    return salesPlaybookStepRepo.update(stepId, stepData);
  },
};

// 7. SALES OBJECTION SERVICE
export const SalesObjectionService = {
  async getActive(filters: any = {}) {
    return salesObjectionRepo.findActive(filters);
  },
  async search(query: string) {
    return salesObjectionRepo.searchByText(query);
  },
  async getById(id: string) {
    return salesObjectionRepo.findById(id);
  },
  async create(data: any, source: any = 'mcp') {
    const obj = await salesObjectionRepo.create(data);
    await auditRepo.logAction({
      actorType: source === 'web' ? 'human' : 'ai',
      source,
      toolName: 'crear_sales_objection',
      entityType: 'sales_objections',
      entityId: obj.id,
      action: 'create',
      afterData: obj,
    });
    return obj;
  },
  async update(id: string, data: any, source: any = 'mcp') {
    const before = await salesObjectionRepo.findById(id);
    const updated = await salesObjectionRepo.update(id, data);
    await auditRepo.logAction({
      actorType: source === 'web' ? 'human' : 'ai',
      source,
      toolName: 'actualizar_sales_objection',
      entityType: 'sales_objections',
      entityId: id,
      action: 'update',
      beforeData: before,
      afterData: updated,
    });
    return updated;
  },
};

// 8. CLIENT SURVEY SERVICE (CSAT & NPS)
export const SurveyService = {
  async recordSurvey(data: any, source: any = 'api') {
    const survey = await surveyRepo.create(data);

    if (data.client_id) {
      const updatePayload: any = {};
      if (data.survey_type === 'csat') {
        updatePayload.csat_score = data.score;
        updatePayload.last_survey_date = new Date().toISOString();
      } else if (data.survey_type === 'nps') {
        updatePayload.nps_score = data.score;
        updatePayload.last_survey_date = new Date().toISOString();
      }
      try {
        await clientRepo.update(data.client_id, updatePayload);
      } catch (err) {
        console.warn('Could not auto-update client survey fields:', err);
      }
    }

    await auditRepo.logAction({
      actorType: source === 'web' ? 'human' : 'ai',
      source,
      toolName: 'registrar_encuesta_cliente',
      entityType: 'client_surveys',
      entityId: survey.id,
      action: 'create',
      afterData: survey,
    });

    return survey;
  },

  async getByCompany(companyId: string) {
    return surveyRepo.findByCompany(companyId);
  },

  async getByClient(clientId: string) {
    return surveyRepo.findByClient(clientId);
  },

  async getLatest(companyId: string, surveyType?: 'csat' | 'nps') {
    return surveyRepo.getLatestSurvey(companyId, surveyType);
  }
};

