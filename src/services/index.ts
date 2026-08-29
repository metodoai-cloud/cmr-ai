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
  AuditLogRepository
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
  async create(data: any, source: 'web' | 'mcp' = 'web') {
    // Check idempotency
    if (data.idempotency_key) {
      const existing = await expenseRepo.findAll();
      const dup = existing.find((e: any) => e.idempotency_key === data.idempotency_key);
      if (dup) return dup;
    }

    // Auto-find or create vendor
    if (data.vendor_name && !data.vendor_id) {
      const vendors = await vendorRepo.searchByName(data.vendor_name);
      if (vendors.length === 1) {
        data.vendor_id = vendors[0].id;
      } else if (vendors.length === 0) {
        const newVendor = await vendorRepo.create({
          name: data.vendor_name,
          type: 'software',
        });
        data.vendor_id = newVendor.id;
      }
      delete data.vendor_name;
    }

    const expense = await expenseRepo.create(data);

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

  async getAll(filters: any = {}) {
    return expenseRepo.findAll(filters);
  },
};

// ============================================================================
// TAX SERVICE
// ============================================================================
export const TaxService = {
  async register(data: any, source: 'web' | 'mcp' = 'web') {
    const tax = await taxRepo.create(data);
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
    return serviceRepo.findAll({ ...filters, active: activeFilter });
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
  async update(id: string, data: any) { return projectRepo.update(id, data); },
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
    const overdueAmount = overdueInvoices.reduce((s: number, i: any) => s + Number(i.total), 0);

    return {
      total_invoiced: totalInvoiced,
      total_collected: totalCollected,
      outstanding: totalInvoiced - totalCollected,
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
};

// ============================================================================
// VENDOR SERVICE
// ============================================================================
export const VendorService = {
  async search(name: string) { return vendorRepo.searchByName(name); },
  async getAll() { return vendorRepo.findAll(); },
  async create(data: any) { return vendorRepo.create(data); },
};
