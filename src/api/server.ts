// ============================================================================
// REST API Server — Express endpoints for the React Dashboard
// Uses the same Business Services as MCP (no logic duplication)
// ============================================================================

import express from 'express';
import cors from 'cors';
import {
  ContactService, CompanyService, LeadService, OpportunityService,
  ActivityService, ClientService, InvoiceService, PaymentService,
  ExpenseService, TaxService, WithdrawalService, CampaignService,
  HookService, ServiceCatalog, SubscriptionService, ProjectService,
  AnalyticsService, VendorService,
} from '../services/index.js';

const app = express();
app.use(cors());
app.use(express.json());

// === Health ===
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// === Dashboard ===
app.get('/api/dashboard', async (_req, res) => {
  try {
    const data = await AnalyticsService.getDashboard();
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/analytics/sales', async (_req, res) => {
  try { res.json(await AnalyticsService.getSalesSummary()); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/analytics/finance', async (_req, res) => {
  try { res.json(await AnalyticsService.getFinanceSummary()); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/analytics/marketing', async (_req, res) => {
  try { res.json(await AnalyticsService.getMarketingSummary()); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Contacts ===
app.get('/api/contacts', async (req, res) => {
  try {
    if (req.query.search) {
      res.json(await ContactService.search(req.query.search as string));
    } else {
      res.json(await ContactService.getAll(req.query));
    }
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/contacts', async (req, res) => {
  try { res.json(await ContactService.create(req.body)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/contacts/:id', async (req, res) => {
  try { res.json(await ContactService.update(req.params.id, req.body)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Companies ===
app.get('/api/companies', async (req, res) => {
  try {
    if (req.query.search) {
      res.json(await CompanyService.search(req.query.search as string));
    } else {
      res.json(await CompanyService.getAll(req.query));
    }
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/companies', async (req, res) => {
  try { res.json(await CompanyService.create(req.body)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/companies/:id', async (req, res) => {
  try { res.json(await CompanyService.update(req.params.id, req.body)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Leads ===
app.get('/api/leads', async (req, res) => {
  try { res.json(await LeadService.getAll(req.query)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/leads', async (req, res) => {
  try { res.json(await LeadService.create(req.body)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Opportunities ===
app.get('/api/opportunities', async (req, res) => {
  try { res.json(await OpportunityService.getAll(req.query)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/opportunities/pipeline', async (_req, res) => {
  try { res.json(await OpportunityService.getPipeline()); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/opportunities/overdue', async (_req, res) => {
  try { res.json(await OpportunityService.getOverdue()); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/opportunities', async (req, res) => {
  try { res.json(await OpportunityService.create(req.body)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/opportunities/:id', async (req, res) => {
  try { res.json(await OpportunityService.update(req.params.id, req.body)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/opportunities/:id/move', async (req, res) => {
  try { res.json(await OpportunityService.moveStage(req.params.id, req.body.stage)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/opportunities/:id/close', async (req, res) => {
  try {
    res.json(await OpportunityService.closeOpportunity(
      req.params.id, req.body.outcome, req.body.lost_reason
    ));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/opportunities/:id', async (req, res) => {
  try { res.json(await OpportunityService.delete(req.params.id, 'web')); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Activities ===
app.get('/api/activities', async (req, res) => {
  try { res.json(await ActivityService.getAll(req.query)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/activities', async (req, res) => {
  try { res.json(await ActivityService.create(req.body)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Clients ===
app.get('/api/clients', async (_req, res) => {
  try { res.json(await ClientService.getAll()); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Projects ===
app.get('/api/projects', async (req, res) => {
  try { res.json(await ProjectService.getAll(req.query)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Subscriptions ===
app.get('/api/subscriptions', async (_req, res) => {
  try { res.json(await SubscriptionService.getAll()); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/subscriptions/active', async (_req, res) => {
  try { res.json(await SubscriptionService.getActive()); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Invoices ===
app.get('/api/invoices', async (req, res) => {
  try { res.json(await InvoiceService.getAll(req.query)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/invoices/overdue', async (_req, res) => {
  try { res.json(await InvoiceService.getOverdue()); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/invoices/:id', async (req, res) => {
  try { res.json(await InvoiceService.getById(req.params.id)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/invoices', async (req, res) => {
  try { res.json(await InvoiceService.create(req.body)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/invoices/:id', async (req, res) => {
  try { res.json(await InvoiceService.update(req.params.id, req.body)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/invoices/:id', async (req, res) => {
  try { res.json(await InvoiceService.update(req.params.id, req.body)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try { res.json(await InvoiceService.delete(req.params.id)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/invoices/:id/cancel', async (req, res) => {
  try { res.json(await InvoiceService.cancel(req.params.id)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/invoices/:id/issue', async (req, res) => {
  try { res.json(await InvoiceService.issue(req.params.id)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Payments ===
app.get('/api/payments', async (req, res) => {
  try { res.json(await PaymentService.getAll(req.query)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/payments', async (req, res) => {
  try { res.json(await PaymentService.register(req.body)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Expenses ===
app.get('/api/expenses', async (req, res) => {
  try { res.json(await ExpenseService.getAll(req.query)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/expenses', async (req, res) => {
  try { res.json(await ExpenseService.create(req.body)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Taxes ===
app.get('/api/taxes', async (req, res) => {
  try { res.json(await TaxService.getAll(req.query)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/taxes', async (req, res) => {
  try { res.json(await TaxService.register(req.body)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Withdrawals ===
app.get('/api/withdrawals', async (req, res) => {
  try { res.json(await WithdrawalService.getAll(req.query)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/withdrawals', async (req, res) => {
  try { res.json(await WithdrawalService.register(req.body)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Campaigns ===
app.get('/api/campaigns', async (req, res) => {
  try { res.json(await CampaignService.getAll(req.query)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Hooks ===
app.get('/api/hooks', async (req, res) => {
  try { res.json(await HookService.getAll(req.query)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Services ===
app.get('/api/services', async (req, res) => {
  try { res.json(await ServiceCatalog.getAll(req.query)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/services', async (req, res) => {
  try { res.json(await ServiceCatalog.create(req.body)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/services/:id', async (req, res) => {
  try { res.json(await ServiceCatalog.update(req.params.id, req.body)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Vendors ===
app.get('/api/vendors', async (req, res) => {
  try {
    if (req.query.search) {
      res.json(await VendorService.search(req.query.search as string));
    } else {
      res.json(await VendorService.getAll());
    }
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Projects ===
app.get('/api/projects', async (req, res) => {
  try { res.json(await ProjectService.getAll(req.query)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/projects/:id', async (req, res) => {
  try { res.json(await ProjectService.getById(req.params.id)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/projects/:id', async (req, res) => {
  try { res.json(await ProjectService.update(req.params.id, req.body)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Subscriptions ===
app.get('/api/subscriptions', async (req, res) => {
  try { res.json(await SubscriptionService.getAll(req.query)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/subscriptions/:id/cancel', async (req, res) => {
  try { res.json(await SubscriptionService.cancel(req.params.id)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// === Static Frontend Production Serving ===
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidatePaths = [
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(__dirname, '../../dist'),
  path.resolve(__dirname, '../dist'),
];

let distPath: string | null = null;
for (const p of candidatePaths) {
  if (fs.existsSync(path.join(p, 'index.html'))) {
    distPath = p;
    break;
  }
}

if (distPath) {
  console.log(`🌐 Serving frontend SPA from: ${distPath}`);
  app.use(express.static(distPath, {
    maxAge: '1h',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/mcp') && !req.path.startsWith('/sse')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.sendFile(path.join(distPath!, 'index.html'));
    }
    next();
  });
}

export { app };
