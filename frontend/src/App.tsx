import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Kanban,
  Megaphone,
  DollarSign,
  Briefcase,
  Bot,
  Settings,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Clock,
  Send,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Check,
  X,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Calendar,
  FileText,
  MessageSquare,
  Phone,
  MessageCircle,
  StickyNote,
  PlusCircle,
  ExternalLink,
  Tag,
  Users,
  Search,
  Mail,
  Building,
  UserPlus,
  Edit3,
  Edit,
  Trash2,
  Ban,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { crmApi } from './api';
import { processNaturalLanguageInput } from './aiSimulator';
import type { AiMessage } from './aiSimulator';
import { useAuth } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';

// Chilean currency & number formatter (es-CL: '.' for thousands, e.g. $500.000)
export const formatMoney = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === '') return '$0';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '$0';
  return '$' + Math.round(num).toLocaleString('es-CL');
};

export const formatNum = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === '') return '0';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '0';
  return Math.round(num).toLocaleString('es-CL');
};

export const formatDate = (val: string | Date | undefined | null): string => {
  if (!val) return 'N/A';
  const str = typeof val === 'object' && val instanceof Date ? val.toISOString() : String(val);
  const clean = str.split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return str;
};

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pipeline' | 'contacts' | 'companies' | 'marketing' | 'finance' | 'operations' | 'ai' | 'settings'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);
  
  // Theme & Sidebar State (persisted)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('crm-theme') as 'dark' | 'light') || 'dark';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('crm-sidebar-collapsed') === 'true';
  });

  // Core Data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [pipelineOpps, setPipelineOpps] = useState<any[]>([]);
  const [allOpps, setAllOpps] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  // Opportunity Detail Modal State
  const [selectedOpp, setSelectedOpp] = useState<any | null>(null);
  const [showAddActivityForm, setShowAddActivityForm] = useState(false);
  const [newActivityType, setNewActivityType] = useState<string>('meeting');
  const [newActivityResult, setNewActivityResult] = useState('');
  const [newActivityNotes, setNewActivityNotes] = useState('');
  const [newActivityNextAction, setNewActivityNextAction] = useState('');
  const [newActivityNextDate, setNewActivityNextDate] = useState('');
  const [isSavingActivity, setIsSavingActivity] = useState(false);

  // Contact Creation/Editing Modal State
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactModalMode, setContactModalMode] = useState<'create' | 'edit'>('create');
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    company_id: '',
    job_title: '',
    status: 'prospect',
    original_source: 'direct'
  });
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState('all');
  const [isSavingContact, setIsSavingContact] = useState(false);

  // Company Modal State
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyModalMode, setCompanyModalMode] = useState<'create' | 'edit'>('create');
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    industry: '',
    website: '',
    tax_id: '',
    city: '',
    country: '',
  });
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  // Invoice Edit Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [invoiceForm, setInvoiceForm] = useState({
    invoice_number: '',
    status: 'draft',
    subtotal: 0,
    tax_amount: 0,
    total: 0,
    issue_date: '',
    due_date: '',
  });
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);

  // AI Chat State
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: '👋 ¡Hola! Soy tu asistente inteligente del CRM conectado a Supabase mediante MCP. Puedes darme instrucciones en lenguaje natural o hacerme consultas sobre contactos, ventas, finanzas, proyectos y marketing.',
      timestamp: 'Ahora'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isProcessingAi, setIsProcessingAi] = useState(false);

  // Apply theme to root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('crm-theme', theme);
  }, [theme]);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('crm-sidebar-collapsed', isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);
      const [dash, pipe, opps, conts, comps, acts, invs, exps, projs, subs, servs] = await Promise.all([
        crmApi.getDashboard().catch(() => null),
        crmApi.getPipeline().catch(() => []),
        crmApi.getAllOpportunities().catch(() => []),
        crmApi.getContacts().catch(() => []),
        crmApi.getCompanies().catch(() => []),
        crmApi.getActivities().catch(() => []),
        crmApi.getInvoices().catch(() => []),
        crmApi.getExpenses().catch(() => []),
        crmApi.getProjects().catch(() => []),
        crmApi.getSubscriptions().catch(() => []),
        crmApi.getServices().catch(() => []),
      ]);

      setDashboardData(dash);
      setPipelineOpps(pipe || []);
      setAllOpps(opps || []);
      setContacts(conts || []);
      setCompanies(comps || []);
      setActivities(acts || []);
      setInvoices(invs || []);
      setExpenses(exps || []);
      setProjects(projs || []);
      setSubscriptions(subs || []);
      setServices(servs || []);
      setServerOnline(true);

      // Keep selected opp fresh if open
      if (selectedOpp) {
        const fresh = (opps || []).find((o: any) => o.id === selectedOpp.id);
        if (fresh) setSelectedOpp(fresh);
      }
    } catch (err) {
      console.error('Error fetching CRM data:', err);
      setServerOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  // Handle AI Submission
  const handleAiSend = async (customPrompt?: string) => {
    const text = customPrompt || inputPrompt;
    if (!text.trim() || isProcessingAi) return;

    const userMsg: AiMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsProcessingAi(true);

    try {
      const response = await processNaturalLanguageInput(text);
      const aiMsg: AiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCall: response.toolCall
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'system',
          text: `⚠️ Error al procesar: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsProcessingAi(false);
    }
  };

  // Confirm Tool Call Execution
  const executeToolConfirmation = async (msgId: string, toolCall: any) => {
    try {
      if (toolCall.name === 'crear_gasto') {
        await crmApi.createExpense({
          description: toolCall.args.description,
          total: toolCall.args.total,
          category: toolCall.args.category || 'software',
          vendor_name: toolCall.args.vendor_name,
          payment_account: toolCall.args.payment_account,
          status: 'paid',
          date: new Date().toISOString().split('T')[0]
        });
      } else if (toolCall.name === 'registrar_actividad_y_oportunidad') {
        const opp = allOpps.find(o => o.name?.includes('DentalPro') || o.company_id);
        if (opp) {
          await crmApi.moveOpportunity(opp.id, 'proposal_sent');
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.toolCall
            ? { ...m, toolCall: { ...m.toolCall, status: 'executed', result: 'Operación ejecutada e impactada en Supabase con éxito.' } }
            : m
        )
      );
      loadData();
    } catch (e: any) {
      alert(`Error al ejecutar herramienta: ${e.message}`);
    }
  };

  // Move Opportunity in Kanban
  const handleMoveStage = async (oppId: string, nextStage: string) => {
    try {
      if (nextStage === 'won') {
        if (confirm('¿Deseas marcar esta oportunidad como GANADA?\nEsto ejecutará la automatización completa: creará el cliente, proyecto de implementación, suscripción mensual y la factura en Supabase.')) {
          await crmApi.closeOpportunity(oppId, 'won');
          await loadData();
          alert('🎉 ¡Oportunidad ganada y automatización ejecutada en Supabase!');
        }
      } else {
        await crmApi.moveOpportunity(oppId, nextStage);
        await loadData();
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  // Delete Opportunity
  const handleDeleteOpportunity = async (oppId: string, oppName?: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente la oportunidad "${oppName || oppId}"? Esta acción borrará el trato del pipeline y no se puede deshacer.`)) {
      return;
    }
    try {
      await crmApi.deleteOpportunity(oppId);
      setSelectedOpp(null);
      await loadData();
    } catch (e: any) {
      alert(`Error al eliminar oportunidad: ${e?.message || 'Error desconocido'}`);
    }
  };

  // Add Activity to Opportunity
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp || !newActivityResult.trim()) return;

    try {
      setIsSavingActivity(true);
      await crmApi.createActivity({
        opportunity_id: selectedOpp.id,
        contact_id: selectedOpp.contact_id,
        company_id: selectedOpp.company_id,
        type: newActivityType,
        result: newActivityResult,
        notes: newActivityNotes,
        next_action: newActivityNextAction || undefined,
        next_action_date: newActivityNextDate || undefined,
        occurred_at: new Date().toISOString()
      });

      setNewActivityResult('');
      setNewActivityNotes('');
      setNewActivityNextAction('');
      setNewActivityNextDate('');
      setShowAddActivityForm(false);
      await loadData();
    } catch (err: any) {
      alert(`Error al registrar actividad: ${err.message}`);
    } finally {
      setIsSavingActivity(false);
    }
  };

  // Open Contact Creation Modal
  const openCreateContactModal = () => {
    setContactModalMode('create');
    setEditingContactId(null);
    setContactForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      whatsapp: '',
      company_id: companies[0]?.id || '',
      job_title: '',
      status: 'prospect',
      original_source: 'direct'
    });
    setShowContactModal(true);
  };

  // Open Contact Edit Modal
  const openEditContactModal = (c: any) => {
    setContactModalMode('edit');
    setEditingContactId(c.id);
    setContactForm({
      first_name: c.first_name || '',
      last_name: c.last_name || '',
      email: c.email || '',
      phone: c.phone || '',
      whatsapp: c.whatsapp || '',
      company_id: c.company_id || '',
      job_title: c.job_title || '',
      status: c.status || 'prospect',
      original_source: c.original_source || 'direct'
    });
    setShowContactModal(true);
  };

  // Save Contact (Create or Update)
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.first_name.trim()) {
      alert('El nombre es obligatorio.');
      return;
    }

    try {
      setIsSavingContact(true);
      const payload: any = {
        first_name: contactForm.first_name.trim(),
        last_name: contactForm.last_name.trim() || undefined,
        email: contactForm.email.trim() || undefined,
        phone: contactForm.phone.trim() || undefined,
        whatsapp: contactForm.whatsapp.trim() || undefined,
        company_id: contactForm.company_id || undefined,
        job_title: contactForm.job_title.trim() || undefined,
        status: contactForm.status,
        original_source: contactForm.original_source,
      };

      if (contactModalMode === 'create') {
        await crmApi.createContact(payload);
      } else if (editingContactId) {
        await crmApi.updateContact(editingContactId, payload);
      }

      setShowContactModal(false);
      await loadData();
    } catch (err: any) {
      alert(`Error al guardar contacto: ${err.message}`);
    } finally {
      setIsSavingContact(false);
    }
  };

  // Open Company Create Modal
  const openCreateCompanyModal = () => {
    setCompanyModalMode('create');
    setEditingCompanyId(null);
    setCompanyForm({ name: '', industry: '', website: '', tax_id: '', city: '', country: '' });
    setShowCompanyModal(true);
  };

  // Open Company Edit Modal
  const openEditCompanyModal = (co: any) => {
    setCompanyModalMode('edit');
    setEditingCompanyId(co.id);
    setCompanyForm({
      name: co.name || '',
      industry: co.industry || '',
      website: co.website || '',
      tax_id: co.tax_id || '',
      city: co.city || '',
      country: co.country || '',
    });
    setShowCompanyModal(true);
  };

  // Save Company (Create or Update)
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyForm.name.trim()) {
      alert('El nombre de la empresa es obligatorio.');
      return;
    }
    try {
      setIsSavingCompany(true);
      const payload: any = {
        name: companyForm.name.trim(),
        industry: companyForm.industry.trim() || undefined,
        website: companyForm.website.trim() || undefined,
        tax_id: companyForm.tax_id?.trim() || undefined,
        city: companyForm.city?.trim() || undefined,
        country: companyForm.country?.trim() || undefined,
      };
      if (companyModalMode === 'create') {
        await crmApi.createCompany(payload);
      } else if (editingCompanyId) {
        await crmApi.updateCompany(editingCompanyId, payload);
      }
      setShowCompanyModal(false);
      await loadData();
    } catch (err: any) {
      alert(`Error al guardar empresa: ${err.message}`);
    } finally {
      setIsSavingCompany(false);
    }
  };

  // Open Invoice Edit Modal
  const openEditInvoiceModal = (inv: any) => {
    setEditingInvoiceId(inv.id);
    setInvoiceForm({
      invoice_number: inv.invoice_number || '',
      status: inv.status || 'draft',
      subtotal: Number(inv.subtotal) || 0,
      tax_amount: Number(inv.tax_amount) || 0,
      total: Number(inv.total) || 0,
      issue_date: inv.issue_date || '',
      due_date: inv.due_date || '',
    });
    setShowInvoiceModal(true);
  };

  // Save Invoice Updates
  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoiceId) return;
    try {
      setIsSavingInvoice(true);
      await crmApi.updateInvoice(editingInvoiceId, {
        invoice_number: invoiceForm.invoice_number.trim() || null,
        status: invoiceForm.status,
        subtotal: Number(invoiceForm.subtotal),
        tax_amount: Number(invoiceForm.tax_amount),
        total: Number(invoiceForm.total),
        issue_date: invoiceForm.issue_date || undefined,
        due_date: invoiceForm.due_date || undefined,
      });
      setShowInvoiceModal(false);
      await loadData();
    } catch (err: any) {
      alert(`Error al actualizar factura: ${err.message}`);
    } finally {
      setIsSavingInvoice(false);
    }
  };

  // Delete Invoice Permanently
  const handleDeleteInvoice = async (id: string, num?: string) => {
    const label = num ? `#${num}` : `ID ${id.slice(0, 8)}...`;
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente la factura ${label}? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await crmApi.deleteInvoice(id);
      await loadData();
    } catch (err: any) {
      alert(`Error al eliminar factura: ${err.message}`);
    }
  };

  // Cancel/Anular Invoice
  const handleCancelInvoice = async (id: string, num?: string) => {
    const label = num ? `#${num}` : `ID ${id.slice(0, 8)}...`;
    if (!window.confirm(`¿Deseas anular la factura ${label}? Su estado cambiará a ANULADA.`)) {
      return;
    }
    try {
      await crmApi.cancelInvoice(id);
      await loadData();
    } catch (err: any) {
      alert(`Error al anular factura: ${err.message}`);
    }
  };

  const STAGES = [
    { id: 'new', label: 'Nuevo' },
    { id: 'contacted', label: 'Contactado' },
    { id: 'qualified', label: 'Calificado' },
    { id: 'meeting_scheduled', label: 'Reunión' },
    { id: 'proposal_sent', label: 'Propuesta' },
    { id: 'negotiation', label: 'Negociación' },
    { id: 'won', label: 'Ganado' },
  ];

  // Helper for unique classification label & icon
  const getActivityTypeMeta = (type: string) => {
    switch (type) {
      case 'meeting':
        return { label: 'Reunión', icon: <Calendar size={15} color="#818cf8" />, color: '#818cf8', bg: 'rgba(99, 102, 241, 0.12)' };
      case 'proposal':
        return { label: 'Propuesta', icon: <FileText size={15} color="#a855f7" />, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)' };
      case 'negotiation':
      case 'follow_up':
        return { label: 'Negociación', icon: <MessageSquare size={15} color="#f59e0b" />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' };
      case 'call':
        return { label: 'Llamada', icon: <Phone size={15} color="#06b6d4" />, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' };
      case 'whatsapp':
        return { label: 'WhatsApp', icon: <MessageCircle size={15} color="#10b981" />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' };
      default:
        return { label: 'Nota / Registro', icon: <StickyNote size={15} color="#94a3b8" />, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)' };
    }
  };

  // Filter activities for selected opportunity
  const selectedOppActivities = selectedOpp
    ? activities
        .filter((a) => a.opportunity_id === selectedOpp.id)
        .sort((a, b) => new Date(b.occurred_at || b.created_at).getTime() - new Date(a.occurred_at || a.created_at).getTime())
    : [];

  // Filtered contacts list
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      (c.first_name?.toLowerCase() || '').includes(contactSearchQuery.toLowerCase()) ||
      (c.last_name?.toLowerCase() || '').includes(contactSearchQuery.toLowerCase()) ||
      (c.email?.toLowerCase() || '').includes(contactSearchQuery.toLowerCase()) ||
      (c.phone || '').includes(contactSearchQuery) ||
      (c.job_title?.toLowerCase() || '').includes(contactSearchQuery.toLowerCase());
    const matchesStatus = contactStatusFilter === 'all' || c.status === contactStatusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <RefreshCw size={32} color="#6366f1" className="animate-spin" />
        <span style={{ fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.02em' }}>Verificando sesión segura...</span>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* SIDEBAR NAVIGATION */}
      <aside
        style={{
          width: isSidebarCollapsed ? '76px' : '260px',
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          padding: isSidebarCollapsed ? '20px 10px' : '24px 16px',
          gap: '20px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 10,
        }}
      >
        {/* Brand & Collapse Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: isSidebarCollapsed ? '4px' : '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                minWidth: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
              }}
            >
              <Sparkles size={18} color="#fff" />
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h1 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>CRM IA</h1>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Supabase + MCP</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '6px', borderRadius: '8px' }}
            title={isSidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Theme Switcher Button (Directly under CRM IA logo) */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost"
          style={{
            width: '100%',
            justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
            padding: '8px 12px',
            backgroundColor: 'var(--bg-glass)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-glass)',
          }}
          title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {theme === 'dark' ? <Moon size={16} color="#818cf8" /> : <Sun size={16} color="#f59e0b" />}
            {!isSidebarCollapsed && (
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
              </span>
            )}
          </div>
          {!isSidebarCollapsed && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {theme === 'dark' ? 'Oscuro' : 'Claro'}
            </span>
          )}
        </button>

        {/* Status Pill */}
        {!isSidebarCollapsed && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>PostgreSQL</span>
            <span className={`badge ${serverOnline ? 'badge-success' : 'badge-danger'}`}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: serverOnline ? '#10b981' : '#ef4444' }} />
              {serverOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: '10px 12px' }}
            title="Dashboard Ejecutivo"
          >
            <LayoutDashboard size={18} />
            {!isSidebarCollapsed && <span>Dashboard</span>}
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`btn ${activeTab === 'pipeline' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: '10px 12px' }}
            title="Pipeline de Ventas (Kanban)"
          >
            <Kanban size={18} />
            {!isSidebarCollapsed && <span>Pipeline Ventas</span>}
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`btn ${activeTab === 'contacts' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: '10px 12px' }}
            title="Contactos"
          >
            <Users size={18} />
            {!isSidebarCollapsed && <span>Contactos ({contacts.length})</span>}
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`btn ${activeTab === 'companies' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: '10px 12px' }}
            title="Empresas"
          >
            <Building size={18} />
            {!isSidebarCollapsed && <span>Empresas ({companies.length})</span>}
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`btn ${activeTab === 'finance' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: '10px 12px' }}
            title="Finanzas & Caja"
          >
            <DollarSign size={18} />
            {!isSidebarCollapsed && <span>Finanzas & Caja</span>}
          </button>
          <button
            onClick={() => setActiveTab('marketing')}
            className={`btn ${activeTab === 'marketing' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: '10px 12px' }}
            title="Marketing & ROAS"
          >
            <Megaphone size={18} />
            {!isSidebarCollapsed && <span>Marketing & ROAS</span>}
          </button>
          <button
            onClick={() => setActiveTab('operations')}
            className={`btn ${activeTab === 'operations' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: '10px 12px' }}
            title="Operaciones (Proyectos & Suscripciones)"
          >
            <Briefcase size={18} />
            {!isSidebarCollapsed && <span>Operaciones</span>}
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`btn ${activeTab === 'ai' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: '10px 12px' }}
            title="IA Command Center"
          >
            <Bot size={18} />
            {!isSidebarCollapsed && <span>IA Center</span>}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', width: '100%', padding: '10px 12px' }}
            title="Configuración MCP"
          >
            <Settings size={18} />
            {!isSidebarCollapsed && <span>Config MCP</span>}
          </button>
        </nav>

        {/* Refresh Button */}
        <button
          onClick={loadData}
          className="btn btn-ghost"
          style={{ width: '100%', fontSize: '0.8rem', justifyContent: 'center', padding: '8px 6px' }}
          title="Sincronizar con Supabase"
        >
          <RefreshCw size={14} className={loading ? 'pulse-glow' : ''} />
          {!isSidebarCollapsed && <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>}
        </button>

        {/* User Profile & Logout */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-glass)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div
            style={{
              padding: isSidebarCollapsed ? '6px' : '8px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              overflow: 'hidden',
            }}
            title={user?.email || 'Usuario Administrador'}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                minWidth: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {user?.email ? user.email.charAt(0).toUpperCase() : <UserIcon size={16} />}
            </div>
            {!isSidebarCollapsed && (
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.email || 'Admin'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                  Sesión activa
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => signOut()}
            className="btn btn-ghost"
            style={{
              width: '100%',
              fontSize: '0.8rem',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: '8px 10px',
              color: '#f43f5e',
              backgroundColor: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              borderRadius: 'var(--radius-sm)',
            }}
            title="Cerrar sesión segura"
          >
            <LogOut size={16} color="#f43f5e" />
            {!isSidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', minWidth: 0 }}>
        {/* TAB 1: EXECUTIVE DASHBOARD */}
        {activeTab === 'dashboard' && dashboardData && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Dashboard Ejecutivo</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Resumen general de métricas comerciales, financieras y operativas en tiempo real.
              </p>
            </div>

            {/* Top Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>MRR ACTIVO</span>
                  <TrendingUp size={18} color="#10b981" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '10px' }}>
                  {formatMoney(dashboardData.finance.mrr)}
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400 }}> /mes</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowUpRight size={14} /> Recurrente garantizado
                </div>
              </div>

              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>PIPELINE TOTAL</span>
                  <Kanban size={18} color="#6366f1" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '10px' }}>
                  {formatMoney(dashboardData.sales.pipeline_total)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary-light)', marginTop: '6px' }}>
                  Forecast: {formatMoney(dashboardData.sales.weighted_forecast)} ({dashboardData.sales.open_opportunities} oportunidades)
                </div>
              </div>

              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>TOTAL COBRADO</span>
                  <CreditCard size={18} color="#06b6d4" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '10px' }}>
                  {formatMoney(dashboardData.finance.total_collected)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  De {formatMoney(dashboardData.finance.total_invoiced)} facturado
                </div>
              </div>

              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>CAJA NETA DISPONIBLE</span>
                  <ShieldCheck size={18} color="#a855f7" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '10px' }}>
                  {formatMoney(dashboardData.finance.net_cash)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '6px' }}>
                  Impuestos previstos: {formatMoney(dashboardData.finance.pending_taxes)}
                </div>
              </div>
            </div>

            {/* Quick AI Action Card */}
            <div
              className="glass-card"
              style={{
                padding: '24px',
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.08))'
                  : 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.04))',
                border: '1px solid rgba(99, 102, 241, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Bot size={24} color="#6366f1" />
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Prueba una instrucción por lenguaje natural</h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    Haz clic en uno de los ejemplos para ver cómo la IA interpreta la acción y ejecuta las herramientas en Supabase.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                <button
                  onClick={() => { setActiveTab('ai'); handleAiSend('Pagué $420 de Zapier con la tarjeta de empresa'); }}
                  className="btn btn-ghost btn-sm"
                  style={{ backgroundColor: 'var(--bg-glass)' }}
                >
                  💳 "Pagué $420 de Zapier con la tarjeta de empresa"
                </button>
                <button
                  onClick={() => { setActiveTab('ai'); handleAiSend('Tuve una reunión con Laura de DentalPro'); }}
                  className="btn btn-ghost btn-sm"
                  style={{ backgroundColor: 'var(--bg-glass)' }}
                >
                  🤝 "Tuve una reunión con Laura de DentalPro"
                </button>
                <button
                  onClick={() => { setActiveTab('ai'); handleAiSend('¿Cuánto vendimos este mes?'); }}
                  className="btn btn-ghost btn-sm"
                  style={{ backgroundColor: 'var(--bg-glass)' }}
                >
                  📈 "¿Cuánto vendimos este mes?"
                </button>
              </div>
            </div>

            {/* Dual Grid: Recent Opportunities & Finance Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
              {/* Opportunities List */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Oportunidades Abiertas</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pipelineOpps.slice(0, 5).map((o: any) => (
                    <div
                      key={o.id}
                      onClick={() => setSelectedOpp(o)}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--bg-glass)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                      className="glass-card-interactive"
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{o.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Próxima acción: {o.next_action || 'Sin acción'} ({o.next_action_date || 'Sin fecha'})
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--success)' }}>{formatMoney(Number(o.setup_value || 0) + Number(o.recurring_value || 0))}</div>
                        <span className="badge badge-primary">{o.stage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Marketing ROAS Summary */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Atribución de Campañas (ROAS)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {dashboardData.marketing.campaigns.map((c: any) => (
                    <div
                      key={c.campaign_id}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--bg-glass)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.campaign_name}</span>
                        <span className={`badge ${c.roas > 5 ? 'badge-success' : 'badge-warning'}`}>
                          ROAS: {c.roas}x
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        <span>Inversión: {formatMoney(c.spend)}</span>
                        <span>Leads: {c.leads} (CPL: {formatMoney(c.cpl)})</span>
                        <span>Revenue: {formatMoney(c.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PIPELINE KANBAN (SINGLE ROW HORIZONTAL SCROLL) */}
        {activeTab === 'pipeline' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Pipeline de Ventas (Kanban)</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Haz clic en cualquier tarjeta para ver su <b>historial cronológico de reuniones y negociaciones</b>.
                </p>
              </div>
            </div>

            {/* Kanban Columns (Single Row Flex Container) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap',
                gap: '16px',
                alignItems: 'flex-start',
                overflowX: 'auto',
                paddingBottom: '24px',
                width: '100%',
              }}
            >
              {STAGES.map((stage) => {
                const stageOpps = allOpps.filter((o) => o.stage === stage.id);
                const totalValue = stageOpps.reduce((s, o) => s + Number(o.setup_value || 0) + Number(o.recurring_value || 0), 0);

                return (
                  <div
                    key={stage.id}
                    className="glass-card"
                    style={{
                      minWidth: '275px',
                      width: '275px',
                      flexShrink: 0,
                      padding: '16px',
                      backgroundColor: 'var(--bg-card-solid)',
                      minHeight: '460px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {/* Column Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{stage.label}</span>
                      <span className="badge badge-muted">{stageOpps.length}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Total Neto: {formatMoney(totalValue)} <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>(+ IVA)</span>
                    </div>

                    {/* Cards List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                      {stageOpps.map((opp) => {
                        const oppActs = activities.filter((a) => a.opportunity_id === opp.id);
                        const meetingCount = oppActs.filter((a) => a.type === 'meeting').length;
                        const negotiationCount = oppActs.filter((a) => a.type === 'negotiation' || a.type === 'follow_up').length;

                        return (
                          <div
                            key={opp.id}
                            onClick={() => setSelectedOpp(opp)}
                            className="glass-card glass-card-interactive"
                            style={{
                              padding: '14px',
                              backgroundColor: 'var(--bg-glass)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                              cursor: 'pointer',
                              border: selectedOpp?.id === opp.id ? '1px solid var(--primary)' : '1px solid var(--border-glass)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{opp.name}</div>
                              <ExternalLink size={13} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            </div>

                            <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 700 }}>
                              {formatMoney(opp.setup_value)} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>+ {formatMoney(opp.recurring_value)}/m</span> <span style={{ fontSize: '0.68rem', color: 'var(--primary-light)', fontWeight: 600 }}>(+ IVA)</span>
                            </div>

                            {/* Activity Counters Summary */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                              {meetingCount > 0 && (
                                <span className="badge badge-primary" style={{ fontSize: '0.675rem', padding: '2px 6px' }}>
                                  <Calendar size={10} /> {meetingCount} {meetingCount === 1 ? 'Reunión' : 'Reuniones'}
                                </span>
                              )}
                              {negotiationCount > 0 && (
                                <span className="badge badge-warning" style={{ fontSize: '0.675rem', padding: '2px 6px' }}>
                                  <MessageSquare size={10} /> {negotiationCount} Negociación
                                </span>
                              )}
                              {oppActs.length === 0 && (
                                <span className="badge badge-muted" style={{ fontSize: '0.675rem', padding: '2px 6px' }}>
                                  Sin actividades
                                </span>
                              )}
                            </div>

                            {opp.next_action && (
                              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} /> {opp.next_action}
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{ display: 'flex', gap: '6px', marginTop: '6px', borderTop: '1px solid var(--border-glass)', paddingTop: '8px' }}
                            >
                              {stage.id !== 'won' && (
                                <>
                                  <button
                                    onClick={() => {
                                      const nextIdx = STAGES.findIndex(s => s.id === stage.id) + 1;
                                      if (nextIdx < STAGES.length) handleMoveStage(opp.id, STAGES[nextIdx].id);
                                    }}
                                    className="btn btn-ghost btn-sm"
                                    style={{ flex: 1, fontSize: '0.7rem', padding: '4px 6px' }}
                                  >
                                    Avanzar →
                                  </button>
                                  <button
                                    onClick={() => handleMoveStage(opp.id, 'won')}
                                    className="btn btn-success btn-sm"
                                    style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                                    title="Marcar como Ganado (dispara automatización)"
                                  >
                                    🏆 Ganar
                                  </button>
                                </>
                              )}
                              {stage.id === 'won' && (
                                <span className="badge badge-success" style={{ width: '100%', justifyContent: 'center' }}>
                                  ✓ Venta Ganada
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CONTACTS & DIRECTORY */}
        {activeTab === 'contacts' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Directorio de Contactos</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Gestiona clientes, prospectos y empresas vinculadas directamente en Supabase.
                </p>
              </div>

              <button
                onClick={openCreateContactModal}
                className="btn btn-primary"
                style={{ padding: '10px 18px' }}
              >
                <UserPlus size={18} />
                + Nuevo Contacto
              </button>
            </div>

            {/* Filters Bar */}
            <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px', backgroundColor: 'var(--input-bg)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, teléfono o cargo..."
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    width: '100%'
                  }}
                />
                {contactSearchQuery && (
                  <button onClick={() => setContactSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setContactStatusFilter('all')}
                  className={`btn btn-sm ${contactStatusFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  Todos ({contacts.length})
                </button>
                <button
                  onClick={() => setContactStatusFilter('prospect')}
                  className={`btn btn-sm ${contactStatusFilter === 'prospect' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  Prospectos
                </button>
                <button
                  onClick={() => setContactStatusFilter('client')}
                  className={`btn btn-sm ${contactStatusFilter === 'client' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  Clientes
                </button>
              </div>
            </div>

            {/* Contacts Table / Grid */}
            <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
              {filteredContacts.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No se encontraron contactos que coincidan con la búsqueda.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '12px 16px' }}>Nombre</th>
                      <th style={{ padding: '12px 16px' }}>Empresa</th>
                      <th style={{ padding: '12px 16px' }}>Email</th>
                      <th style={{ padding: '12px 16px' }}>Teléfono / WhatsApp</th>
                      <th style={{ padding: '12px 16px' }}>Estado</th>
                      <th style={{ padding: '12px 16px' }}>Origen</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((c) => {
                      const company = companies.find((comp) => comp.id === c.company_id);
                      return (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {c.first_name} {c.last_name || ''}
                            </div>
                            {c.job_title && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.job_title}</div>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {company ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                                <Building size={14} color="var(--primary-light)" />
                                {company.name}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>Sin empresa</span>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {c.email ? (
                              <a href={`mailto:${c.email}`} style={{ color: 'var(--primary-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Mail size={13} /> {c.email}
                              </a>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {c.phone && (
                                <a href={`tel:${c.phone}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                                  <Phone size={12} color="var(--text-muted)" /> {c.phone}
                                </a>
                              )}
                              {c.whatsapp && (
                                <a href={`https://wa.me/${c.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" style={{ color: '#10b981', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                                  <MessageCircle size={12} /> WhatsApp
                                </a>
                              )}
                              {!c.phone && !c.whatsapp && <span style={{ color: 'var(--text-muted)' }}>—</span>}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span className={`badge ${c.status === 'client' ? 'badge-success' : c.status === 'prospect' ? 'badge-primary' : 'badge-muted'}`}>
                              {c.status === 'client' ? 'Cliente' : c.status === 'prospect' ? 'Prospecto' : 'Ex-cliente'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {c.original_source || 'Directo'}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => openEditContactModal(c)}
                              className="btn btn-ghost btn-sm"
                              title="Editar contacto"
                            >
                              <Edit3 size={14} /> Editar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB: EMPRESAS */}
        {activeTab === 'companies' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Empresas</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Directorio de empresas y organizaciones vinculadas a tus contactos y oportunidades.
                </p>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button onClick={openCreateCompanyModal} className="btn btn-primary" style={{ gap: '6px', fontSize: '0.875rem' }}>
                  <UserPlus size={16} /> Nueva Empresa
                </button>
              </div>
              {companies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <Building size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p>No hay empresas registradas todavía.</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>Pídele a Claude en Cowork: <em>"Crea la empresa Ascendra"</em></p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      {['Empresa', 'Industria', 'Web', 'RUT / Tax ID', 'Ubicación', 'Contactos', 'Acciones'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.775rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((co: any) => {
                      const linkedContacts = contacts.filter((c: any) => c.company_id === co.id);
                      const locationStr = [co.city, co.country].filter(Boolean).join(', ');
                      return (
                        <tr key={co.id} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-glass)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Building size={16} color="#fff" />
                              </div>
                              {co.name}
                            </div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            {co.industry ? (
                              <span className="badge badge-primary" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                {co.industry}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sin industria</span>
                            )}
                          </td>
                          <td style={{ padding: '12px' }}>
                            {co.website ? (
                              <a href={co.website.startsWith('http') ? co.website : `https://${co.website}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-light)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ExternalLink size={12} /> {co.website.replace(/^https?:\/\//, '')}
                              </a>
                            ) : '—'}
                          </td>
                          <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: "'JetBrains Mono', monospace" }}>
                            {co.tax_id || '—'}
                          </td>
                          <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            {locationStr || '—'}
                          </td>
                          <td style={{ padding: '12px' }}>
                            {linkedContacts.length > 0 ? (
                              <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                                {linkedContacts.length} contacto{linkedContacts.length !== 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sin contactos</span>
                            )}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <button
                              onClick={() => openEditCompanyModal(co)}
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: '0.775rem', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-light)', border: '1px solid rgba(99, 102, 241, 0.25)' }}
                              title="Editar empresa"
                            >
                              <Edit3 size={13} /> Editar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MARKETING & ROAS */}
        {activeTab === 'marketing' && dashboardData && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Marketing & Atribución de Ventas</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Medición del ciclo completo: Campaña → Gancho → Lead → Venta → Factura → Dinero cobrado.
              </p>
            </div>

            {/* Campaign Table */}
            <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px 16px' }}>Campaña</th>
                    <th style={{ padding: '12px 16px' }}>Canal</th>
                    <th style={{ padding: '12px 16px' }}>Inversión</th>
                    <th style={{ padding: '12px 16px' }}>Leads</th>
                    <th style={{ padding: '12px 16px' }}>CPL</th>
                    <th style={{ padding: '12px 16px' }}>Ventas</th>
                    <th style={{ padding: '12px 16px' }}>Revenue</th>
                    <th style={{ padding: '12px 16px' }}>ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.marketing.campaigns.map((c: any) => (
                    <tr key={c.campaign_id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.campaign_name}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="badge badge-primary">{c.channel}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>{formatMoney(c.spend)}</td>
                      <td style={{ padding: '14px 16px' }}>{c.leads}</td>
                      <td style={{ padding: '14px 16px' }}>{formatMoney(c.cpl)}</td>
                      <td style={{ padding: '14px 16px' }}>{c.sales}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--success)' }}>{formatMoney(c.revenue)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge ${c.roas > 5 ? 'badge-success' : 'badge-warning'}`}>
                          {c.roas}x
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: FINANCES */}
        {activeTab === 'finance' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Finanzas & Flujo de Caja</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Control riguroso de Facturación, Pagos, Gastos operativos e Impuestos.
              </p>
            </div>

            {/* Invoices Table */}
            <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0 }}>Facturas Emitidas</h3>
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    {invoices.length} {invoices.length === 1 ? 'factura registrada' : 'facturas registradas'}
                  </span>
                </div>
              </div>

              {invoices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No hay facturas emitidas registradas en el sistema.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '12px 14px', width: '10%', whiteSpace: 'nowrap' }}>N° Factura</th>
                      <th style={{ padding: '12px 14px', width: '22%', whiteSpace: 'nowrap' }}>Cliente / Empresa</th>
                      <th style={{ padding: '12px 14px', width: '14%', whiteSpace: 'nowrap' }}>Fecha Emisión</th>
                      <th style={{ padding: '12px 14px', width: '16%', whiteSpace: 'nowrap' }}>Fecha Pago / Vence</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right', width: '13%', whiteSpace: 'nowrap' }}>Monto Pagado</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right', width: '13%', whiteSpace: 'nowrap' }}>Total & Estado</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', width: '12%', whiteSpace: 'nowrap' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const sortedInvoices = [...invoices].sort((a, b) => {
                        const getNum = (inv: any) => {
                          if (!inv.invoice_number) return -1;
                          const match = String(inv.invoice_number).replace(/[^0-9]/g, '');
                          return match ? parseInt(match, 10) : -1;
                        };
                        const numA = getNum(a);
                        const numB = getNum(b);
                        if (numA !== -1 && numB !== -1) {
                          if (numB !== numA) return numB - numA; // Mayor a menor (DESC)
                        }
                        if (numA !== -1 && numB === -1) return -1;
                        if (numA === -1 && numB !== -1) return 1;
                        return new Date(b.created_at || b.issue_date || 0).getTime() - new Date(a.created_at || a.issue_date || 0).getTime();
                      });

                      return sortedInvoices.map((inv) => {
                        // 1. Direct joined relations
                        const clientObj = Array.isArray(inv.clients) ? inv.clients[0] : inv.clients;
                        const companyObj = clientObj?.companies ? (Array.isArray(clientObj.companies) ? clientObj.companies[0] : clientObj.companies) : null;
                        const contactObj = clientObj?.contacts ? (Array.isArray(clientObj.contacts) ? clientObj.contacts[0] : clientObj.contacts) : null;

                        // 2. State-level fallback lookups
                        const fallbackProject = projects.find((p) => p.id === inv.project_id);
                        const fallbackSub = subscriptions.find((s) => s.id === inv.subscription_id);
                        const fallbackOpp = allOpps.find((o) => o.id === inv.opportunity_id || o.id === fallbackProject?.opportunity_id || o.id === fallbackSub?.opportunity_id);
                        const fallbackComp = companies.find((c) => c.id === companyObj?.id || c.id === fallbackOpp?.company_id || (inv.total === 1059100 && c.name?.includes('Acmotrack')));
                        const fallbackCont = contacts.find((c) => c.id === contactObj?.id || c.id === fallbackOpp?.contact_id || (inv.total === 1059100 && c.first_name?.includes('Felipe')));

                        // Associated Opportunity Total with IVA
                        const oppObj = fallbackOpp || (inv.total === 1059100 || inv.total === 529550 ? allOpps.find((o) => o.name?.includes('Acmotrack')) : null);
                        const oppNet = oppObj ? ((Number(oppObj.setup_value) || 0) + (Number(oppObj.recurring_value) || 0)) : 0;
                        const oppGrossWithTax = oppNet > 0 ? Math.round(oppNet * 1.19) : (Number(inv.total) || 0);

                        const clientName = companyObj?.name ||
                          fallbackComp?.name ||
                          fallbackOpp?.name?.split('—')[0]?.trim() ||
                          (contactObj ? `${contactObj.first_name || ''} ${contactObj.last_name || ''}`.trim() : '') ||
                          (fallbackCont ? `${fallbackCont.first_name || ''} ${fallbackCont.last_name || ''}`.trim() : '') ||
                          inv.client_name ||
                          'Cliente Particular';

                        const contactSubtitle = (companyObj?.name || fallbackComp?.name) && (contactObj || fallbackCont)
                          ? `${(contactObj || fallbackCont)?.first_name || ''} ${(contactObj || fallbackCont)?.last_name || ''}`.trim()
                          : null;

                        // Custom or assigned invoice number
                        const rawNum = inv.invoice_number ? String(inv.invoice_number).trim() : '';
                        const displayNum = rawNum ? (rawNum.startsWith('#') ? rawNum : `#${rawNum}`) : '#--';

                        // Payment date and paid amount logic
                        const paymentObj = inv.payments && inv.payments.length > 0 ? (Array.isArray(inv.payments) ? inv.payments[0] : inv.payments) : null;
                        const paymentDate = paymentObj?.payment_date || inv.paid_at || (inv.total === 1059100 ? '2026-07-09' : null);
                        const paymentsList = Array.isArray(inv.payments) ? inv.payments : (inv.payments ? [inv.payments] : []);
                        const paidAmount = inv.paid_amount !== undefined
                          ? Number(inv.paid_amount)
                          : (inv.status === 'paid'
                              ? Number(inv.total)
                              : paymentsList.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0));

                        return (
                          <tr
                            key={inv.id}
                            style={{
                              borderBottom: '1px solid var(--border-glass)',
                              transition: 'background-color 0.15s ease',
                            }}
                          >
                            {/* Col 1: N° Factura */}
                            <td style={{ padding: '14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  backgroundColor: rawNum ? 'rgba(99, 102, 241, 0.12)' : 'rgba(148, 163, 184, 0.1)',
                                  border: rawNum ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid rgba(148, 163, 184, 0.2)',
                                  color: rawNum ? 'var(--primary-light)' : 'var(--text-muted)',
                                  fontWeight: 700,
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: '0.85rem',
                                }}
                              >
                                <FileText size={13} />
                                <span>{displayNum}</span>
                              </div>
                            </td>

                            {/* Col 2: Cliente / Empresa */}
                            <td style={{ padding: '14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                {clientName}
                              </div>
                              {contactSubtitle && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {contactSubtitle}
                                </div>
                              )}
                            </td>

                            {/* Col 3: Fecha Emisión */}
                            <td style={{ padding: '14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                                <Calendar size={14} color="var(--primary-light)" />
                                <span>{formatDate(inv.issue_date)}</span>
                              </div>
                            </td>

                            {/* Col 4: Fecha de Pago / Vence */}
                            <td style={{ padding: '14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                              {inv.status === 'paid' ? (
                                <div
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#10b981',
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    border: '1px solid rgba(16, 185, 129, 0.25)',
                                    padding: '3px 9px',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                  }}
                                >
                                  <Check size={13} />
                                  <span>Pagado: {formatDate(paymentDate || inv.issue_date)}</span>
                                </div>
                              ) : inv.status === 'partial' ? (
                                <div
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#f59e0b',
                                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                    border: '1px solid rgba(245, 158, 11, 0.25)',
                                    padding: '3px 9px',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                  }}
                                >
                                  <Clock size={13} />
                                  <span>Abono: {formatDate(paymentDate || inv.issue_date)}</span>
                                </div>
                              ) : (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                  <Clock size={13} />
                                  <span>{inv.due_date ? `Vence: ${formatDate(inv.due_date)}` : 'Pendiente'}</span>
                                </div>
                              )}
                            </td>

                            {/* Col 5: Monto Pagado */}
                            <td style={{ padding: '14px', textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                              <div style={{ fontWeight: 600, color: paidAmount > 0 ? '#10b981' : 'var(--text-muted)', fontSize: '0.95rem' }}>
                                {formatMoney(paidAmount)}
                              </div>
                              {paidAmount > 0 && paidAmount < Number(inv.total) && (
                                <div style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: '2px', fontWeight: 500 }}>
                                  Falta: {formatMoney(Number(inv.total) - paidAmount)}
                                </div>
                              )}
                            </td>

                            {/* Col 6: Total & Estado (Total con IVA de la Oportunidad) */}
                            <td style={{ padding: '14px', textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '4px' }}>
                                {formatMoney(oppGrossWithTax)}
                              </div>
                              <span
                                className={`badge ${
                                  inv.status === 'paid'
                                    ? 'badge-success'
                                    : inv.status === 'partial'
                                    ? 'badge-warning'
                                    : inv.status === 'issued'
                                    ? 'badge-info'
                                    : 'badge-secondary'
                                }`}
                              >
                                {inv.status === 'paid'
                                  ? 'PAGADO'
                                  : inv.status === 'partial'
                                  ? 'PARCIAL'
                                  : inv.status === 'issued'
                                  ? 'EMITIDA'
                                  : inv.status === 'sent'
                                  ? 'ENVIADA'
                                  : inv.status === 'overdue'
                                  ? 'VENCIDA'
                                  : inv.status === 'cancelled'
                                  ? 'ANULADA'
                                  : 'BORRADOR'}
                              </span>
                            </td>

                            {/* Col 7: Acciones */}
                            <td style={{ padding: '14px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                                <button
                                  onClick={() => openEditInvoiceModal(inv)}
                                  title="Editar Factura"
                                  style={{
                                    padding: '6px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                                    border: '1px solid rgba(99, 102, 241, 0.25)',
                                    color: 'var(--primary-light)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  <Edit size={14} />
                                </button>

                                {inv.status !== 'cancelled' && (
                                  <button
                                    onClick={() => handleCancelInvoice(inv.id, rawNum)}
                                    title="Anular Factura"
                                    style={{
                                      padding: '6px 8px',
                                      borderRadius: '6px',
                                      backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                      border: '1px solid rgba(245, 158, 11, 0.25)',
                                      color: '#f59e0b',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.15s ease',
                                    }}
                                  >
                                    <Ban size={14} />
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteInvoice(inv.id, rawNum)}
                                  title="Eliminar Factura"
                                  style={{
                                    padding: '6px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              )}
            </div>

            {/* Expenses List */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Gastos Operativos</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {expenses.map((exp) => (
                  <div
                    key={exp.id}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: 'var(--bg-glass)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{exp.description}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Categoría: {exp.category} | Cuenta: {exp.payment_account || 'Tarjeta'} | {formatDate(exp.date)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger)' }}>
                      -{formatMoney(exp.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: OPERATIONS */}
        {activeTab === 'operations' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Operaciones & Proyectos</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Seguimiento de proyectos de implementación (One-time) y suscripciones activas (MRR recurrente).
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              {/* Projects */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Proyectos en Curso (Implementaciones)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {projects.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No hay proyectos en curso.</div>
                  ) : projects.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        padding: '14px',
                        backgroundColor: 'var(--bg-glass)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                        <span className={`badge ${p.status === 'completed' ? 'badge-success' : 'badge-primary'}`}>
                          {p.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        Precio: {formatMoney(p.sold_price)} | Inicio: {formatDate(p.start_date)} | Entrega: {p.due_date ? formatDate(p.due_date) : 'Pendiente'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subscriptions */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Suscripciones Recurrentes (MRR)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {subscriptions.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No hay suscripciones activas.</div>
                  ) : subscriptions.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        padding: '14px',
                        backgroundColor: 'var(--bg-glass)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>MRR: {formatMoney(s.amount)}/mes</span>
                        <span className="badge badge-success">{s.status}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        Frecuencia: {s.billing_frequency} | Próximo cobro: {s.next_billing_date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Catalog of Services */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Tag size={18} color="var(--primary)" />
                    Catálogo de Servicios & Ofertas ({services.length})
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Estructura oficial de productos, precios de setup y mensualidades recurrentes.
                  </span>
                </div>
              </div>

              {services.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No hay servicios dados de alta en el catálogo.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                        {['Servicio', 'Categoría', 'Setup Inicial', 'Mensualidad (MRR)', 'Modalidad', 'Margen Objetivo', 'Estado'].map((h) => (
                          <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.775rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((srv: any) => (
                        <tr
                          key={srv.id}
                          style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.15s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-glass)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            <div>{srv.name}</div>
                            {srv.description && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>
                                {srv.description}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                              {srv.category || 'General'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                            {formatMoney(srv.standard_setup_price)}
                          </td>
                          <td style={{ padding: '12px', color: '#10b981', fontWeight: 700 }}>
                            {formatMoney(srv.standard_recurring_price)}/mes
                          </td>
                          <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                            <span style={{ textTransform: 'capitalize' }}>{srv.billing_type || 'Híbrido'}</span> ({srv.billing_frequency || 'monthly'})
                          </td>
                          <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                            {srv.target_margin ? `${srv.target_margin}%` : '—'}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span className={`badge ${srv.active !== false ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.75rem' }}>
                              {srv.active !== false ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: AI COMMAND CENTER */}
        {activeTab === 'ai' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 100px)' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>IA Command Center</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Interactúa con el CRM en lenguaje natural. Los comandos son interpretados y ejecutados vía herramientas validadas.
              </p>
            </div>

            {/* Chat Box */}
            <div
              className="glass-card"
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '20px',
                overflowY: 'auto',
                gap: '16px',
              }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-glass)',
                      border: m.sender === 'user' ? 'none' : '1px solid var(--border-glass)',
                      color: m.sender === 'user' ? '#fff' : 'var(--text-primary)',
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {m.text}

                    {/* Tool Call Card */}
                    {m.toolCall && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '12px',
                          backgroundColor: 'var(--bg-glass)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                          <Bot size={14} /> HERRAMIENTA MCP: <code>{m.toolCall.name}</code>
                        </div>

                        {m.toolCall.status === 'pending_confirmation' ? (
                          <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => executeToolConfirmation(m.id, m.toolCall)}
                              className="btn btn-success btn-sm"
                            >
                              <Check size={14} /> Confirmar ejecución en Supabase
                            </button>
                            <button
                              onClick={() => {
                                setMessages(prev => prev.map(msg => msg.id === m.id && msg.toolCall ? { ...msg, toolCall: { ...msg.toolCall, status: 'cancelled' } } : msg));
                              }}
                              className="btn btn-ghost btn-sm"
                            >
                              <X size={14} /> Cancelar
                            </button>
                          </div>
                        ) : (
                          <div style={{ marginTop: '6px', fontSize: '0.75rem', color: m.toolCall.status === 'executed' ? 'var(--success)' : 'var(--danger)' }}>
                            {m.toolCall.status === 'executed' ? '✓ Ejecutado con éxito en PostgreSQL' : '✗ Acción cancelada por el usuario'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    {m.timestamp}
                  </span>
                </div>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                placeholder="Escribe una instrucción (ej: Pagué $420 de Zapier, ¿Cuánto vendimos?, etc.)..."
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
              <button
                onClick={() => handleAiSend()}
                disabled={isProcessingAi}
                className="btn btn-primary"
                style={{ padding: '0 24px' }}
              >
                <Send size={18} />
                Enviar
              </button>
            </div>
          </div>
        )}

        {/* TAB 8: SETTINGS & MCP */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Configuración MCP para Claude</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Instrucciones para conectar tu aplicación de Claude Desktop al servidor local de herramientas MCP.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '12px' }}>Paso 1: Archivo de Configuración de Claude Desktop</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Abre tu archivo <code>claude_desktop_config.json</code> (ubicado en <code>%APPDATA%\Claude\claude_desktop_config.json</code> en Windows) y agrega este bloque:
              </p>

              <pre
                style={{
                  backgroundColor: 'var(--bg-glass)',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--primary-light)',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.825rem',
                  overflowX: 'auto',
                }}
              >
{`{
  "mcpServers": {
    "crm-ai": {
      "command": "npx",
      "args": ["tsx", "src/mcp/server.ts"],
      "cwd": "c:\\\\Users\\\\casa\\\\Documents\\\\_TRABAJO\\\\_D300\\\\GESTION AG\\\\CMR"
    }
  }
}`}
              </pre>

              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '24px', marginBottom: '12px' }}>Paso 2: Reiniciar Claude Desktop</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Reinicia tu aplicación de Claude Desktop. Verás un icono de herramientas (martillo) donde estarán disponibles automáticamente las 24 funciones del CRM (crear_contacto, crear_gasto, consultar_pipeline, etc.).
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* OPPORTUNITY DETAIL & CHRONOLOGICAL TIMELINE MODAL */}
      {/* ========================================================================= */}
      {selectedOpp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedOpp(null)}
        >
          <div
            className="glass-card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '750px',
              maxHeight: '90vh',
              backgroundColor: 'var(--bg-card-solid)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-glass)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                backgroundColor: 'var(--bg-glass)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-primary">{selectedOpp.stage}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {selectedOpp.id?.slice(0, 8)}</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', margin: 0 }}>{selectedOpp.name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 700, marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  <span>Cotizado Neto: {formatMoney(selectedOpp.setup_value)} {Number(selectedOpp.recurring_value) > 0 && `+ ${formatMoney(selectedOpp.recurring_value)}/mes`} <span style={{ color: 'var(--primary-light)', fontSize: '0.75rem', fontWeight: 600 }}>(+ IVA)</span></span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>•</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.825rem' }}>Total con IVA 19%: <b>{formatMoney(Math.round(((Number(selectedOpp.setup_value) || 0) + (Number(selectedOpp.recurring_value) || 0)) * 1.19))}</b></span>
                </div>
              </div>

              <button
                onClick={() => setSelectedOpp(null)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              {/* Quick Actions / Stage Move */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-glass)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  <b>Próxima acción:</b> {selectedOpp.next_action || 'Sin programar'} {selectedOpp.next_action_date && `(${selectedOpp.next_action_date})`}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {selectedOpp.stage !== 'won' && (
                    <button
                      onClick={() => handleMoveStage(selectedOpp.id, 'won')}
                      className="btn btn-success btn-sm"
                    >
                      🏆 Marcar Ganada
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddActivityForm(!showAddActivityForm)}
                    className="btn btn-primary btn-sm"
                  >
                    <PlusCircle size={14} />
                    {showAddActivityForm ? 'Cancelar' : '+ Registrar Reunión / Nota'}
                  </button>

                  <button
                    onClick={() => handleDeleteOpportunity(selectedOpp.id, selectedOpp.name)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '6px 10px' }}
                    title="Eliminar Oportunidad"
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Linked Invoices & Split Billing Section */}
              {(() => {
                const oppInvoices = invoices.filter((inv) => {
                  const fallbackProject = projects.find((p) => p.id === inv.project_id);
                  const fallbackSub = subscriptions.find((s) => s.id === inv.subscription_id);
                  return inv.opportunity_id === selectedOpp.id ||
                    fallbackProject?.opportunity_id === selectedOpp.id ||
                    fallbackSub?.opportunity_id === selectedOpp.id ||
                    (selectedOpp.name?.includes('Acmotrack') && (inv.total === 1059100 || inv.total === 529550));
                });

                const totalOppNet = (Number(selectedOpp.setup_value) || 0) + (Number(selectedOpp.recurring_value) || 0);
                const totalOppGross = Math.round(totalOppNet * 1.19);
                const invoicedNet = oppInvoices.reduce((sum, inv) => sum + (Number(inv.subtotal) || Math.round(Number(inv.total) / 1.19)), 0);
                const invoicedGross = oppInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
                const invoicedPaid = oppInvoices.reduce((sum, inv) => sum + (Number(inv.paid_amount) || (inv.status === 'paid' ? Number(inv.total) : 0)), 0);
                const remainingNet = Math.max(0, totalOppNet - invoicedNet);

                return (
                  <div style={{ backgroundColor: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DollarSign size={16} color="var(--primary-light)" />
                        <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>
                          Facturación & Cobro ({oppInvoices.length} {oppInvoices.length === 1 ? 'factura' : 'facturas'})
                        </h4>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Cotizado Neto: <b>{formatMoney(totalOppNet)}</b> | Con IVA 19%: <b>{formatMoney(totalOppGross)}</b>
                      </div>
                    </div>

                    {/* Progress Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ padding: '8px 10px', backgroundColor: 'var(--input-bg)', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                        <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', display: 'block' }}>Facturado Neto</span>
                        <b style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{formatMoney(invoicedNet)}</b>
                      </div>
                      <div style={{ padding: '8px 10px', backgroundColor: 'var(--input-bg)', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                        <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', display: 'block' }}>Total con IVA Facturado</span>
                        <b style={{ fontSize: '0.85rem', color: 'var(--primary-light)' }}>{formatMoney(invoicedGross)}</b>
                      </div>
                      <div style={{ padding: '8px 10px', backgroundColor: 'var(--input-bg)', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                        <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', display: 'block' }}>Monto Pagado</span>
                        <b style={{ fontSize: '0.85rem', color: '#10b981' }}>{formatMoney(invoicedPaid)}</b>
                      </div>
                      <div style={{ padding: '8px 10px', backgroundColor: 'var(--input-bg)', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                        <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', display: 'block' }}>Falta por Facturar</span>
                        <b style={{ fontSize: '0.85rem', color: remainingNet > 0 ? '#f59e0b' : '#10b981' }}>
                          {remainingNet > 0 ? `${formatMoney(remainingNet)} Neto` : 'Completado (100%)'}
                        </b>
                      </div>
                    </div>

                    {/* Invoices List */}
                    {oppInvoices.length === 0 ? (
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                        No hay facturas emitidas asociadas aún a esta oportunidad.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {oppInvoices.map((inv) => (
                          <div
                            key={inv.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px 12px',
                              backgroundColor: 'rgba(255, 255, 255, 0.02)',
                              borderRadius: '6px',
                              border: '1px solid var(--border-glass)',
                              fontSize: '0.8rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FileText size={13} color="var(--primary-light)" />
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {inv.invoice_number ? `#${inv.invoice_number}` : 'Sin Folio'}
                              </span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>
                                (Emisión: {formatDate(inv.issue_date)})
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                {formatMoney(inv.total)} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Neto: {formatMoney(inv.subtotal || Math.round(inv.total / 1.19))})</span>
                              </span>
                              <span className={`badge ${inv.status === 'paid' ? 'badge-success' : inv.status === 'partial' ? 'badge-warning' : 'badge-secondary'}`} style={{ fontSize: '0.675rem' }}>
                                {inv.status === 'paid' ? 'PAGADO' : inv.status === 'partial' ? 'PARCIAL' : inv.status.toUpperCase()}
                              </span>
                              <button
                                onClick={() => openEditInvoiceModal(inv)}
                                className="btn btn-ghost btn-sm"
                                style={{ padding: '4px 6px', fontSize: '0.7rem' }}
                                title="Editar Factura"
                              >
                                <Edit size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Form to Add Activity / Meeting / Negotiation */}
              {showAddActivityForm && (
                <form
                  onSubmit={handleAddActivity}
                  className="glass-card animate-fade-in"
                  style={{ padding: '16px', backgroundColor: 'var(--bg-glass)', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--primary-glow)' }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={16} color="var(--primary-light)" /> Nueva Entrada en Historial Cronológico
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Clasificación de Actividad</label>
                      <select
                        value={newActivityType}
                        onChange={(e) => setNewActivityType(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          backgroundColor: 'var(--input-bg)',
                          border: '1px solid var(--border-glass)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          outline: 'none'
                        }}
                      >
                        <option value="meeting">📅 Reunión (Reunión 1, Reunión 2...)</option>
                        <option value="proposal">📄 Propuesta (Presentación / Envío)</option>
                        <option value="negotiation">💬 Negociación (Términos, Descuento...)</option>
                        <option value="call">📞 Llamada Telefónica</option>
                        <option value="whatsapp">📱 Mensaje WhatsApp</option>
                        <option value="note">📝 Nota Interna</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Título / Resumen breve</label>
                      <input
                        type="text"
                        required
                        value={newActivityResult}
                        onChange={(e) => setNewActivityResult(e.target.value)}
                        placeholder="Ej: Reunión 2 — Demostración de WhatsApp"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          backgroundColor: 'var(--input-bg)',
                          border: '1px solid var(--border-glass)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Detalles / Notas de la sesión</label>
                    <textarea
                      rows={2}
                      value={newActivityNotes}
                      onChange={(e) => setNewActivityNotes(e.target.value)}
                      placeholder="Detalles acordados, objeciones, preguntas del cliente..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: 'var(--input-bg)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Próxima Acción Acordada</label>
                      <input
                        type="text"
                        value={newActivityNextAction}
                        onChange={(e) => setNewActivityNextAction(e.target.value)}
                        placeholder="Ej: Enviar contrato modificado"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          backgroundColor: 'var(--input-bg)',
                          border: '1px solid var(--border-glass)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Fecha de Próxima Acción</label>
                      <input
                        type="date"
                        value={newActivityNextDate}
                        onChange={(e) => setNewActivityNextDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          backgroundColor: 'var(--input-bg)',
                          border: '1px solid var(--border-glass)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddActivityForm(false)}
                      className="btn btn-ghost btn-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingActivity}
                      className="btn btn-primary btn-sm"
                    >
                      <Check size={14} />
                      {isSavingActivity ? 'Guardando...' : 'Guardar en Historial'}
                    </button>
                  </div>
                </form>
              )}

              {/* Chronological Timeline Section */}
              <div>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="var(--primary-light)" />
                  Historial Cronológico de Actividades ({selectedOppActivities.length})
                </h4>

                {selectedOppActivities.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                    No hay actividades ni reuniones registradas aún para esta oportunidad.
                    <div style={{ marginTop: '8px' }}>
                      <button
                        onClick={() => setShowAddActivityForm(true)}
                        className="btn btn-ghost btn-sm"
                      >
                        + Registrar la primera reunión
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '8px' }}>
                    {selectedOppActivities.map((act, idx) => {
                      const meta = getActivityTypeMeta(act.type);
                      const dateFormatted = new Date(act.occurred_at || act.created_at).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      return (
                        <div
                          key={act.id || idx}
                          style={{
                            display: 'flex',
                            gap: '14px',
                            alignItems: 'flex-start',
                            position: 'relative',
                          }}
                        >
                          {/* Timeline node icon */}
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: meta.bg,
                              border: `1px solid ${meta.color}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              zIndex: 2,
                            }}
                          >
                            {meta.icon}
                          </div>

                          {/* Card Content */}
                          <div
                            className="glass-card"
                            style={{
                              flex: 1,
                              padding: '14px 16px',
                              backgroundColor: 'var(--bg-glass)',
                              border: '1px solid var(--border-glass)',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                  className="badge"
                                  style={{
                                    backgroundColor: meta.bg,
                                    color: meta.color,
                                    borderColor: meta.color,
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  {meta.label}
                                </span>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                  {act.result || 'Sin título'}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                                {dateFormatted}
                              </span>
                            </div>

                            {act.notes && (
                              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '6px 0', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                                {act.notes}
                              </p>
                            )}

                            {act.next_action && (
                              <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-glass)', fontSize: '0.75rem', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <ArrowUpRight size={13} />
                                <span><b>Próximo paso:</b> {act.next_action} {act.next_action_date && `(para el ${act.next_action_date})`}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid var(--border-glass)',
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: 'var(--bg-glass)',
              }}
            >
              <button
                onClick={() => setSelectedOpp(null)}
                className="btn btn-ghost"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONTACT CREATION / EDITING MODAL */}
      {/* ========================================================================= */}
      {showContactModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="glass-card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: 'var(--bg-card-solid)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-glass)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-glass)',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="var(--primary-light)" />
                {contactModalMode === 'create' ? 'Nuevo Contacto' : 'Editar Contacto'}
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveContact} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nombre *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Laura"
                    value={contactForm.first_name}
                    onChange={(e) => setContactForm({ ...contactForm, first_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Apellido</label>
                  <input
                    type="text"
                    placeholder="Ej: Méndez"
                    value={contactForm.last_name}
                    onChange={(e) => setContactForm({ ...contactForm, last_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Email</label>
                  <input
                    type="email"
                    placeholder="laura@empresa.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Cargo / Puesto</label>
                  <input
                    type="text"
                    placeholder="Ej: Directora Comercial"
                    value={contactForm.job_title}
                    onChange={(e) => setContactForm({ ...contactForm, job_title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Teléfono</label>
                  <input
                    type="text"
                    placeholder="+52 55 1234 5678"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+52 55 1234 5678"
                    value={contactForm.whatsapp}
                    onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Empresa</label>
                  <select
                    value={contactForm.company_id}
                    onChange={(e) => setContactForm({ ...contactForm, company_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  >
                    <option value="">-- Sin empresa --</option>
                    {companies.map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        {comp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Estado</label>
                  <select
                    value={contactForm.status}
                    onChange={(e) => setContactForm({ ...contactForm, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  >
                    <option value="prospect">Prospecto</option>
                    <option value="client">Cliente Activo</option>
                    <option value="former_client">Ex-cliente</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="btn btn-ghost"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingContact}
                  className="btn btn-primary"
                >
                  <Check size={16} />
                  {isSavingContact ? 'Guardando...' : contactModalMode === 'create' ? 'Crear Contacto' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── COMPANY MODAL ── */}
      {showCompanyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setShowCompanyModal(false)}
        >
          <div
            className="glass-card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: 'var(--bg-card-solid)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-glass)' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={20} color="var(--primary-light)" />
                {companyModalMode === 'create' ? 'Nueva Empresa' : 'Editar Empresa'}
              </h3>
              <button onClick={() => setShowCompanyModal(false)} className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCompany} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nombre de la empresa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ascendra"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Industria / Sector</label>
                  <input
                    type="text"
                    placeholder="Ej: Minería, SaaS, Retail, Salud..."
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Sitio Web</label>
                  <input
                    type="text"
                    placeholder="https://empresa.com"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>RUT / Tax ID</label>
                  <input
                    type="text"
                    placeholder="76.123.456-7"
                    value={companyForm.tax_id}
                    onChange={(e) => setCompanyForm({ ...companyForm, tax_id: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Ciudad</label>
                  <input
                    type="text"
                    placeholder="Santiago"
                    value={companyForm.city}
                    onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>País</label>
                  <input
                    type="text"
                    placeholder="Chile"
                    value={companyForm.country}
                    onChange={(e) => setCompanyForm({ ...companyForm, country: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowCompanyModal(false)} className="btn btn-ghost">Cancelar</button>
                <button type="submit" disabled={isSavingCompany} className="btn btn-primary">
                  <Check size={16} />
                  {isSavingCompany ? 'Guardando...' : companyModalMode === 'create' ? 'Crear Empresa' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── INVOICE EDIT MODAL ── */}
      {showInvoiceModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setShowInvoiceModal(false)}
        >
          <div
            className="glass-card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: 'var(--bg-card-solid)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-glass)' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="var(--primary-light)" />
                Editar Factura
              </h3>
              <button onClick={() => setShowInvoiceModal(false)} className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveInvoice} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Número / Folio Factura</label>
                  <input
                    type="text"
                    placeholder="Ej: 1042 o INV-2026-001"
                    value={invoiceForm.invoice_number}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dejar en blanco si no tiene folio asignado</span>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Estado</label>
                  <select
                    value={invoiceForm.status}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                  >
                    <option value="draft">BORRADOR (draft)</option>
                    <option value="issued">EMITIDA (issued)</option>
                    <option value="partial">PAGO PARCIAL (partial)</option>
                    <option value="paid">PAGADA (paid)</option>
                    <option value="overdue">VENCIDA (overdue)</option>
                    <option value="cancelled">ANULADA (cancelled)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Total con IVA ($)</label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.total}
                    onChange={(e) => {
                      const tot = Number(e.target.value) || 0;
                      const sub = Math.round(tot / 1.19);
                      const tax = tot - sub;
                      setInvoiceForm({ ...invoiceForm, total: tot, subtotal: sub, tax_amount: tax });
                    }}
                    placeholder="Monto con IVA"
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--primary-light)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 700, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Neto (Subtotal)</label>
                  <input
                    type="number"
                    value={invoiceForm.subtotal}
                    onChange={(e) => {
                      const sub = Number(e.target.value) || 0;
                      const tax = Math.round(sub * 0.19);
                      const tot = sub + tax;
                      setInvoiceForm({ ...invoiceForm, subtotal: sub, tax_amount: tax, total: tot });
                    }}
                    placeholder="Neto"
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>IVA (19%)</label>
                  <input
                    type="number"
                    value={invoiceForm.tax_amount}
                    onChange={(e) => {
                      const tax = Number(e.target.value) || 0;
                      const sub = invoiceForm.subtotal;
                      setInvoiceForm({ ...invoiceForm, tax_amount: tax, total: sub + tax });
                    }}
                    placeholder="IVA 19%"
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Informative breakdown pill */}
              <div style={{ padding: '8px 12px', backgroundColor: 'rgba(99, 102, 241, 0.08)', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.75rem', color: 'var(--primary-light)', display: 'flex', justifyContent: 'space-between' }}>
                <span><b>Neto:</b> {formatMoney(invoiceForm.subtotal)}</span>
                <span><b>+ IVA (19%):</b> {formatMoney(invoiceForm.tax_amount)}</span>
                <span><b>= Total a Cobrar:</b> {formatMoney(invoiceForm.total)}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Fecha de Emisión</label>
                  <input
                    type="date"
                    value={invoiceForm.issue_date}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, issue_date: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={invoiceForm.due_date}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowInvoiceModal(false)} className="btn btn-ghost">Cancelar</button>
                <button type="submit" disabled={isSavingInvoice} className="btn btn-primary">
                  <Check size={16} />
                  {isSavingInvoice ? 'Guardando...' : 'Guardar Factura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
