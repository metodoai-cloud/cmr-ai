// API Client for the CRM Backend

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const crmApi = {
  // Dashboard & Analytics
  getDashboard: () => fetchApi('/dashboard'),
  getSalesSummary: () => fetchApi('/analytics/sales'),
  getFinanceSummary: () => fetchApi('/analytics/finance'),
  getMarketingSummary: () => fetchApi('/analytics/marketing'),

  // Opportunities / Pipeline
  getPipeline: () => fetchApi('/opportunities/pipeline'),
  getAllOpportunities: () => fetchApi('/opportunities'),
  createOpportunity: (data: any) => fetchApi('/opportunities', { method: 'POST', body: JSON.stringify(data) }),
  moveOpportunity: (id: string, stage: string) => fetchApi(`/opportunities/${id}/move`, { method: 'POST', body: JSON.stringify({ stage }) }),
  closeOpportunity: (id: string, outcome: 'won' | 'lost', lost_reason?: string) => 
    fetchApi(`/opportunities/${id}/close`, { method: 'POST', body: JSON.stringify({ outcome, lost_reason }) }),

  // Contacts & Companies
  getContacts: () => fetchApi('/contacts'),
  searchContacts: (search: string) => fetchApi(`/contacts?search=${encodeURIComponent(search)}`),
  createContact: (data: any) => fetchApi('/contacts', { method: 'POST', body: JSON.stringify(data) }),
  updateContact: (id: string, data: any) => fetchApi(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getCompanies: () => fetchApi('/companies'),
  createCompany: (data: any) => fetchApi('/companies', { method: 'POST', body: JSON.stringify(data) }),

  // Leads
  getLeads: () => fetchApi('/leads'),
  createLead: (data: any) => fetchApi('/leads', { method: 'POST', body: JSON.stringify(data) }),

  // Operations
  getClients: () => fetchApi('/clients'),
  getProjects: () => fetchApi('/projects'),
  getSubscriptions: () => fetchApi('/subscriptions'),

  // Finance
  getInvoices: () => fetchApi('/invoices'),
  getInvoiceById: (id: string) => fetchApi(`/invoices/${id}`),
  createInvoice: (data: any) => fetchApi('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  updateInvoice: (id: string, data: any) => fetchApi(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getPayments: () => fetchApi('/payments'),
  registerPayment: (data: any) => fetchApi('/payments', { method: 'POST', body: JSON.stringify(data) }),
  getExpenses: () => fetchApi('/expenses'),
  createExpense: (data: any) => fetchApi('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  getTaxes: () => fetchApi('/taxes'),
  getWithdrawals: () => fetchApi('/withdrawals'),

  // Marketing
  getCampaigns: () => fetchApi('/campaigns'),
  getHooks: () => fetchApi('/hooks'),
  getServices: () => fetchApi('/services'),

  // Activities
  getActivities: () => fetchApi('/activities'),
  createActivity: (data: any) => fetchApi('/activities', { method: 'POST', body: JSON.stringify(data) }),
};
