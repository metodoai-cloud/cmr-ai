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
  Repeat
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
  producto: { dot: '#ec4899', label: 'Desarrollo de producto' },
  fuera_catalogo: { dot: '#94a3b8', label: 'Fuera del catálogo de 4 servicios' },
};

export const ClientPanelScreen: React.FC = () => {
  const [data, setData] = useState<ClientPanelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/client-panel');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Error cargando panel de clientes:', err);
      setError(err.message || 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredClients = useMemo(() => {
    if (!data?.clients) return [];
    return data.clients
      .filter(c => {
        const matchesSearch =
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.services.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.stage.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.billing_status.toLowerCase().includes(searchTerm.toLowerCase());

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
                  background: isSelected ? 'var(--bg-glass)' : 'transparent',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                  borderRadius: '12px',
                  padding: '3px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
                title={`Filtrar por ${item.label}`}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.dot, display: 'inline-block' }} />
                <span>{item.label}</span>
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

      {/* VIEW: TABLE MODE */}
      {viewMode === 'table' && (
        <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>CLIENTE</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>ESTADO</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>SERVICIO(S)</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>ETAPA</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>COBRO / PAGO</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => {
                  const badge = getStatusBadgeStyle(client.status);
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

                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No se encontraron clientes con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: CARDS MODE */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          {filteredClients.map((client) => {
            const badge = getStatusBadgeStyle(client.status);
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
                  </div>

                  {/* Services */}
                  <div style={{ marginTop: '14px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-glass)' }}>
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
          * <strong>"Ventas Fraccional"</strong> aparece en el playbook de Acmotrack pero todavía no está documentada como un 5° servicio formal en el catálogo de servicios.
        </div>
        <div style={{ marginTop: '4px' }}>
          <strong>Fuentes:</strong> Base de datos PostgreSQL Supabase (Clientes, Empresas, Proyectos, Oportunidades, Facturación y Movimientos). Sincronización continua en tiempo real.
        </div>
      </div>
    </div>
  );
};
