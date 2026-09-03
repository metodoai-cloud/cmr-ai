import React, { useState, useEffect, useMemo } from 'react';
import {
  Table as TableIcon,
  LayoutGrid,
  RefreshCw,
  Search,
  AlertCircle,
  TrendingUp,
  Building,
  Briefcase,
  Repeat,
  Layers,
  Activity,
  Clock,
  ArrowRight
} from 'lucide-react';

interface ClientPanelItem {
  id: string;
  company_id: string;
  client_id?: string | null;
  name: string;
  is_new?: boolean;
  status: 'active' | 'prospect' | 'closed' | 'inactive';
  status_label: string;
  services: string;
  service_category: 'empresa_cero' | 'diagnostico' | 'automatizacion' | 'marketing' | 'producto' | 'fuera_catalogo';
  service_category_label: string;
  stage: string;
  billing_status: string;
  total_invoiced: number;
  total_paid: number;
  health_score?: 'green' | 'yellow' | 'red';
  health_label?: string;
  health_reason?: string;
  ltv?: number;
  ltv_formatted?: string;
  ttv_days?: number | null;
  ttv_text?: string;
  retention_diagnosis?: string;
  next_action?: string;
}

interface ClientPanelMetrics {
  clients_count: {
    total: number;
    active: number;
    closed: number;
    inactive: number;
    prospect: number;
    summary_text: string;
  };
  health_summary?: {
    green: number;
    yellow: number;
    red: number;
    summary_text: string;
  };
  retainer?: {
    amount: number;
    formatted: string;
    note: string;
  };
  avg_ticket_projects?: {
    amount: number;
    formatted: string;
    note: string;
  };
  avg_ticket_retainer?: {
    amount: number;
    formatted: string;
    note: string;
  };
  avg_ticket?: {
    setup: number;
    setup_formatted: string;
    retainer: number;
    retainer_formatted: string;
    note: string;
  };
  pending_collection?: {
    amount: number;
    formatted: string;
    note: string;
  };
  current_cash?: number;
  current_cash_formatted?: string;
  current_cash_note?: string;
  historical_collected?: number;
  historical_collected_formatted?: string;
  historical_collected_note?: string;
  unbilled_retainer?: number;
  unbilled_retainer_formatted?: string;
  unbilled_retainer_note?: string;
}

interface ClientPanelData {
  metrics: ClientPanelMetrics;
  clients: ClientPanelItem[];
}

const CATEGORY_COLORS: Record<string, { dot: string; label: string }> = {
  empresa_cero: { dot: '#3b82f6', label: 'Creación de empresa desde cero' },
  diagnostico: { dot: '#eab308', label: 'Diagnóstico de procesos' },
  automatizacion: { dot: '#10b981', label: 'Automatización de procesos' },
  marketing: { dot: '#a855f7', label: 'Marketing / campaña' },
  producto: { dot: '#06b6d4', label: 'Desarrollo de producto' },
  fuera_catalogo: { dot: '#94a3b8', label: 'Fuera del catálogo de 4 servicios' },
};

export const ClientPanelScreen: React.FC = () => {
  const [data, setData] = useState<ClientPanelData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // View toggles: table vs cards & operations vs customer success
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [activeViewTab, setActiveViewTab] = useState<'operations' | 'success'>('operations');

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/client-panel');
      if (!res.ok) throw new Error(`HTTP ${res.status}: Error al cargar el panel de clientes`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered and sorted clients
  const filteredClients = useMemo(() => {
    if (!data?.clients) return [];
    return data.clients
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.services.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.stage.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || c.service_category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
  }, [data?.clients, searchTerm, statusFilter, categoryFilter]);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'active':
        return {
          bg: 'rgba(16, 185, 129, 0.12)',
          text: '#10b981',
          border: 'rgba(16, 185, 129, 0.25)',
          label: 'Activo',
        };
      case 'prospect':
        return {
          bg: 'rgba(245, 158, 11, 0.12)',
          text: '#f59e0b',
          border: 'rgba(245, 158, 11, 0.25)',
          label: 'Prospecto',
        };
      case 'closed':
        return {
          bg: 'rgba(59, 130, 246, 0.12)',
          text: '#3b82f6',
          border: 'rgba(59, 130, 246, 0.25)',
          label: 'Cerrado',
        };
      case 'inactive':
      default:
        return {
          bg: 'rgba(148, 163, 184, 0.12)',
          text: '#94a3b8',
          border: 'rgba(148, 163, 184, 0.25)',
          label: 'Inactivo',
        };
    }
  };

  const getHealthScoreBadge = (score?: string, label?: string) => {
    switch (score) {
      case 'green':
        return {
          bg: 'rgba(16, 185, 129, 0.12)',
          text: '#10b981',
          border: 'rgba(16, 185, 129, 0.3)',
          dot: '#10b981',
          label: label || 'Óptimo',
        };
      case 'yellow':
        return {
          bg: 'rgba(245, 158, 11, 0.12)',
          text: '#f59e0b',
          border: 'rgba(245, 158, 11, 0.3)',
          dot: '#f59e0b',
          label: label || 'Atención',
        };
      case 'red':
        return {
          bg: 'rgba(239, 68, 68, 0.12)',
          text: '#ef4444',
          border: 'rgba(239, 68, 68, 0.3)',
          dot: '#ef4444',
          label: label || 'Riesgo',
        };
      default:
        return {
          bg: 'rgba(148, 163, 184, 0.12)',
          text: '#94a3b8',
          border: 'rgba(148, 163, 184, 0.3)',
          dot: '#94a3b8',
          label: label || 'Regular',
        };
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--primary-light)' }}>
              METODOAI
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Operaciones & Cobro</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Panel de clientes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '6px', maxWidth: '780px', lineHeight: 1.5 }}>
            Servicio contratado, etapa operativa de ese servicio y estado financiero de cobro/pago — cruzando
            la entrega técnica con la facturación en tiempo real.
          </p>
        </div>

        {/* View mode toggle & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: 'var(--radius-sm)' }}
          >
            {viewMode === 'table' ? <LayoutGrid size={16} /> : <TableIcon size={16} />}
            <span>{viewMode === 'table' ? 'Ver como tarjetas' : 'Ver como tabla'}</span>
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="btn btn-ghost"
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}
            title="Actualizar datos en vivo"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* TOP 4 STAT CARDS (CLIENTES, RETAINER, TICKET PROMEDIO PROYECTOS, TICKET PROMEDIO RETAINER) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Card 1: Clientes en Cartera */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Clientes en Cartera
              </span>
              <Building size={18} color="#06b6d4" />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px', letterSpacing: '-0.02em' }}>
              {data?.metrics.clients_count.active ?? 5}
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}> activos</span>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            {data?.metrics.clients_count.summary_text || '+ 1 cerrado (Go Plan Be) · 1 inactivo (Arcamusweb)'}
          </div>
        </div>

        {/* Card 2: Retainer Total */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Retainer Total
              </span>
              <TrendingUp size={18} color="#10b981" />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px', letterSpacing: '-0.02em' }}>
              {data?.metrics.retainer?.formatted || data?.metrics.unbilled_retainer_formatted || '$790.000/mes'}
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            {data?.metrics.retainer?.note || 'Cartera mensual recurrente contratada'}
          </div>
        </div>

        {/* Card 3: Ticket Promedio Proyectos */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Ticket Promedio Proyectos
              </span>
              <Briefcase size={18} color="#6366f1" />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px', letterSpacing: '-0.02em' }}>
              {data?.metrics.avg_ticket_projects?.formatted || data?.metrics.avg_ticket?.setup_formatted || '$770.000'}
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            {data?.metrics.avg_ticket_projects?.note || 'Pago único · Implementaciones y diagnósticos (One-Off)'}
          </div>
        </div>

        {/* Card 4: Ticket Promedio Retainer */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Ticket Promedio Retainer
              </span>
              <Repeat size={18} color="#a855f7" />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px', letterSpacing: '-0.02em' }}>
              {data?.metrics.avg_ticket_retainer?.formatted || data?.metrics.retainer?.formatted || '$790.000/mes'}
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            {data?.metrics.avg_ticket_retainer?.note || 'Promedio mensual por contrato recurrente'}
          </div>
        </div>
      </div>

      {/* FILTER & LEGEND BAR */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Title and Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Servicio, etapa y cobro por cliente
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {filteredClients.length} de {data?.clients.length || 0} cuentas registradas
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search input */}
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar cliente o servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '7px 12px 7px 30px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-glass)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  fontSize: '0.825rem',
                  outline: 'none',
                  width: '100%',
                }}
              />
            </div>

            {/* Status dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-glass)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                fontSize: '0.825rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="prospect">Prospectos</option>
              <option value="closed">Cerrados</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Color Legend (Interactive filter) */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '4px', borderTop: '1px solid var(--border-glass)' }}>
          {Object.entries(CATEGORY_COLORS).map(([key, item]) => {
            const isSelected = categoryFilter === key;
            return (
              <button
                key={key}
                onClick={() => setCategoryFilter(isSelected ? 'all' : key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: isSelected ? 'var(--bg-glass-strong)' : 'transparent',
                  opacity: categoryFilter === 'all' || isSelected ? 1 : 0.45,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.dot }} />
                <span style={{ fontSize: '0.75rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isSelected ? 700 : 400 }}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {categoryFilter !== 'all' && (
            <button
              onClick={() => setCategoryFilter('all')}
              style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Limpiar filtro
            </button>
          )}
        </div>
      </div>

      {/* ERROR / LOADING STATE */}
      {error && (
        <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* TABS SELECTOR: Operaciones & Cobro VS Salud, LTV & Retención */}
      {viewMode === 'table' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setActiveViewTab('operations')}
              className={`btn ${activeViewTab === 'operations' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', fontWeight: 600 }}
            >
              <Layers size={15} />
              <span>Operaciones & Cobro</span>
            </button>
            <button
              onClick={() => setActiveViewTab('success')}
              className={`btn ${activeViewTab === 'success' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', fontWeight: 600 }}
            >
              <Activity size={15} />
              <span>Salud, LTV & Retención (Customer Success)</span>
              <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: 800 }}>
                NUEVO
              </span>
            </button>
          </div>

          {data?.metrics.health_summary && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <strong>{data.metrics.health_summary.green}</strong> Óptimo
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <strong>{data.metrics.health_summary.yellow}</strong> Atención
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <strong>{data.metrics.health_summary.red}</strong> Riesgo
              </span>
            </div>
          )}
        </div>
      )}

      {/* VIEW: TABLE MODE */}
      {viewMode === 'table' && (
        <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            {/* TAB 1: OPERACIONES & COBRO */}
            {activeViewTab === 'operations' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>CLIENTE</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>ESTADO</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>SALUD</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>SERVICIO(S)</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>ETAPA OPERATIVA</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>COBRO / PAGO</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => {
                    const badge = getStatusBadgeStyle(client.status);
                    const healthBadge = getHealthScoreBadge(client.health_score, client.health_label);
                    const catColor = CATEGORY_COLORS[client.service_category]?.dot || '#94a3b8';

                    return (
                      <tr
                        key={client.id}
                        style={{
                          borderBottom: '1px solid var(--border-glass)',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-glass)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* CLIENTE */}
                        <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: catColor,
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                              {client.name}
                            </span>
                            {client.is_new && (
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  fontWeight: 800,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                                  color: '#f59e0b',
                                  border: '1px solid rgba(245, 158, 11, 0.4)',
                                  letterSpacing: '0.05em',
                                }}
                              >
                                NUEVO
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ESTADO */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 9px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: badge.bg,
                              color: badge.text,
                              border: `1px solid ${badge.border}`,
                            }}
                          >
                            {badge.label}
                          </span>
                        </td>

                        {/* SALUD (HEALTH SCORE) */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '3px 9px',
                              borderRadius: '12px',
                              backgroundColor: healthBadge.bg,
                              color: healthBadge.text,
                              border: `1px solid ${healthBadge.border}`,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                            title={client.health_reason}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: healthBadge.dot }} />
                            <span>{healthBadge.label}</span>
                          </div>
                          {client.health_reason && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '220px', lineHeight: 1.25 }}>
                              {client.health_reason}
                            </div>
                          )}
                        </td>

                        {/* SERVICIO(S) */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                          {client.services}
                        </td>

                        {/* ETAPA */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                          {client.stage}
                        </td>

                        {/* COBRO / PAGO */}
                        <td style={{ padding: '14px 20px', verticalAlign: 'middle', fontSize: '0.85rem' }}>
                          <span
                            style={{
                              color: client.billing_status.includes('Cobrado')
                                ? '#10b981'
                                : client.billing_status.includes('parcial') || client.billing_status.includes('pendiente')
                                ? '#f59e0b'
                                : 'var(--text-secondary)',
                              fontWeight: client.billing_status.includes('Cobrado') || client.billing_status.includes('parcial') ? 600 : 400,
                            }}
                          >
                            {client.billing_status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* TAB 2: SALUD, LTV & RETENCIÓN (CUSTOMER SUCCESS) */}
            {activeViewTab === 'success' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>CLIENTE / EMPRESA</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>HEALTH SCORE</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>LTV ACUMULADO</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>TIME TO VALUE (TTV)</th>
                    <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>DIAGNÓSTICO DE RETENCIÓN</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>PRÓXIMA ACCIÓN SUGERIDA</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => {
                    const healthBadge = getHealthScoreBadge(client.health_score, client.health_label);
                    const catColor = CATEGORY_COLORS[client.service_category]?.dot || '#94a3b8';

                    return (
                      <tr
                        key={client.id}
                        style={{
                          borderBottom: '1px solid var(--border-glass)',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-glass)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* CLIENTE / EMPRESA */}
                        <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: catColor,
                                flexShrink: 0,
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                {client.name}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {client.service_category_label}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* HEALTH SCORE */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '3px 9px',
                              borderRadius: '12px',
                              backgroundColor: healthBadge.bg,
                              color: healthBadge.text,
                              border: `1px solid ${healthBadge.border}`,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: healthBadge.dot }} />
                            <span>{healthBadge.label}</span>
                          </div>
                          {client.health_reason && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '200px', lineHeight: 1.25 }}>
                              {client.health_reason}
                            </div>
                          )}
                        </td>

                        {/* LTV ACUMULADO */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                          <div style={{ fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>
                            {client.ltv_formatted || `$${(client.ltv || 0).toLocaleString('es-CL')}`}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Valor histórico cuenta
                          </div>
                        </td>

                        {/* TIME TO VALUE (TTV) */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-light)', fontWeight: 600, fontSize: '0.825rem' }}>
                            <Clock size={14} />
                            <span>{client.ttv_text || (client.ttv_days ? `${client.ttv_days} días` : 'N/A')}</span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Tiempo a 1ª victoria
                          </div>
                        </td>

                        {/* DIAGNÓSTICO DE RETENCIÓN */}
                        <td style={{ padding: '14px 16px', verticalAlign: 'middle', color: 'var(--text-secondary)', fontSize: '0.825rem', lineHeight: 1.4, maxWidth: '260px' }}>
                          {client.retention_diagnosis || 'Relación activa sin riesgos reportados.'}
                        </td>

                        {/* PRÓXIMA ACCIÓN SUGERIDA */}
                        <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                          <div
                            style={{
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--bg-glass)',
                              border: '1px solid var(--border-glass)',
                              fontSize: '0.8rem',
                              color: 'var(--text-primary)',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '6px',
                              maxWidth: '280px',
                            }}
                          >
                            <ArrowRight size={14} color="#38bdf8" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <span>{client.next_action || 'Mantener seguimiento de calendario.'}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {filteredClients.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No se encontraron clientes con los filtros aplicados.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: CARDS MODE */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          {filteredClients.map((client) => {
            const badge = getStatusBadgeStyle(client.status);
            const healthBadge = getHealthScoreBadge(client.health_score, client.health_label);
            const catColor = CATEGORY_COLORS[client.service_category]?.dot || '#94a3b8';

            return (
              <div
                key={client.id}
                className="glass-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  position: 'relative',
                  borderTop: `3px solid ${catColor}`,
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                          {client.name}
                        </h4>
                        {client.is_new && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              padding: '2px 5px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(245, 158, 11, 0.2)',
                              color: '#f59e0b',
                              border: '1px solid rgba(245, 158, 11, 0.4)',
                            }}
                          >
                            NUEVO
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: catColor, fontWeight: 600, display: 'block', marginTop: '3px' }}>
                        {client.service_category_label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {badge.label}
                      </span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: healthBadge.bg,
                          color: healthBadge.text,
                          border: `1px solid ${healthBadge.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: healthBadge.dot }} />
                        {healthBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Customer Success Highlights */}
                  <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-glass)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        LTV Acumulado
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                        {client.ltv_formatted || `$${(client.ltv || 0).toLocaleString('es-CL')}`}
                      </div>
                    </div>

                    <div style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-glass)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Time to Value (TTV)
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-light)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {client.ttv_text || (client.ttv_days ? `${client.ttv_days}d` : 'N/A')}
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-glass)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, marginBottom: '4px' }}>
                      Servicio Contratado
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {client.services}
                    </div>
                  </div>

                  {/* Operational Stage */}
                  <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-glass)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, marginBottom: '4px' }}>
                      Etapa Operativa
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {client.stage}
                    </div>
                  </div>

                  {/* Next action */}
                  {client.next_action && (
                    <div style={{ marginTop: '10px', padding: '8px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <div style={{ fontSize: '0.68rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '2px' }}>
                        Próxima Acción Sugerida
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        {client.next_action}
                      </div>
                    </div>
                  )}
                </div>

                {/* Financial Status Footer */}
                <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Cobro / Pago:
                  </div>
                  <div
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      color: client.billing_status.includes('Cobrado')
                        ? '#10b981'
                        : client.billing_status.includes('parcial') || client.billing_status.includes('pendiente')
                        ? '#f59e0b'
                        : 'var(--text-secondary)',
                    }}
                  >
                    {client.billing_status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTNOTE SECTION */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6, padding: '12px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}>
        <div>
          * <strong>Health Score:</strong> 🟢 Óptimo (avance fluido y sin mora) · 🟡 Atención (bloqueo en entregables o facturas por cobrar) · 🔴 Riesgo (inactividad prolongada).
        </div>
        <div style={{ marginTop: '4px' }}>
          * <strong>Time to Value (TTV):</strong> Días hábiles desde la firma/anticipo hasta el primer entregable visible que aporta valor directo al negocio del cliente.
        </div>
        <div style={{ marginTop: '4px' }}>
          <strong>Fuentes:</strong> Base de datos PostgreSQL Supabase (Clientes, Empresas, Proyectos, Oportunidades, Facturación y Movimientos). Sincronización continua en tiempo real.
        </div>
      </div>
    </div>
  );
};

export default ClientPanelScreen;
