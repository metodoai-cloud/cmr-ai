import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock3,
  Circle,
  FileCode2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface AgencyTask {
  id: number | string;
  title: string;
  entity: 'Agencia' | 'Ascendra' | 'Gafexterna' | 'Acmotrack';
  entityDisplay?: string;
  typeTag: 'Cliente' | 'Agencia' | 'Finanzas' | 'Comercial';
  source?: string;
  status: 'pending' | 'in_progress' | 'completed';
  borderColor?: string;
}

const INITIAL_TASKS: AgencyTask[] = [
  // --- Gafexterna (4) ---
  {
    id: 1,
    title: 'Correr entrevistas Mom Test y definir cliente(s) piloto',
    entity: 'Gafexterna',
    entityDisplay: 'Gafexterna',
    typeTag: 'Cliente',
    source: 'landing-page.md / preguntas-pendientes-paola.md',
    status: 'pending',
    borderColor: '#f97316',
  },
  {
    id: 2,
    title: 'Ir actualizando a VALIDADO cada fase del pipeline de Gafexterna',
    entity: 'Gafexterna',
    entityDisplay: 'Gafexterna',
    typeTag: 'Cliente',
    source: 'estado-cliente',
    status: 'pending',
    borderColor: '#f97316',
  },
  {
    id: 3,
    title: 'Diseño de wireframes de interfaz y validación de propuesta de valor',
    entity: 'Gafexterna',
    entityDisplay: 'Gafexterna',
    typeTag: 'Cliente',
    source: 'landing-page.md',
    status: 'pending',
    borderColor: '#f97316',
  },
  {
    id: 4,
    title: 'Revisión y ajustes de entregables iniciales de Gafexterna',
    entity: 'Gafexterna',
    entityDisplay: 'Gafexterna',
    typeTag: 'Cliente',
    source: 'preguntas-pendientes-paola.md',
    status: 'pending',
    borderColor: '#f97316',
  },

  // --- Ascendra (5) ---
  {
    id: 5,
    title: 'Construir fases 9 y 10 del pipeline de Ascendra (Redes sociales y Lanzamiento/Go-to-market)',
    entity: 'Ascendra',
    entityDisplay: 'Ascendra Gestión Inmobiliaria',
    typeTag: 'Cliente',
    source: 'estado-general.md',
    status: 'pending',
    borderColor: '#0d9488',
  },
  {
    id: 6,
    title: 'Agendar reunión de socios para validar las fases en borrador de Ascendra',
    entity: 'Ascendra',
    entityDisplay: 'Ascendra Gestión Inmobiliaria',
    typeTag: 'Cliente',
    source: 'estado-general.md',
    status: 'pending',
    borderColor: '#0d9488',
  },
  {
    id: 7,
    title: 'Revisión de arquitectura técnica y catálogo para Ascendra',
    entity: 'Ascendra',
    entityDisplay: 'Ascendra Gestión Inmobiliaria',
    typeTag: 'Cliente',
    source: 'estado-general.md',
    status: 'pending',
    borderColor: '#0d9488',
  },
  {
    id: 8,
    title: 'Definición de SLA y roadmap de automatización de ventas de Ascendra',
    entity: 'Ascendra',
    entityDisplay: 'Ascendra Gestión Inmobiliaria',
    typeTag: 'Cliente',
    source: 'estado-general.md',
    status: 'pending',
    borderColor: '#0d9488',
  },
  {
    id: 9,
    title: 'Mapeo inicial de fases de pipeline de Ascendra (Fases 1 a 8)',
    entity: 'Ascendra',
    entityDisplay: 'Ascendra Gestión Inmobiliaria',
    typeTag: 'Cliente',
    source: 'estado-general.md',
    status: 'completed',
    borderColor: '#10b981',
  },

  // --- Acmotrack (1) ---
  {
    id: 10,
    title: 'Enviar y cobrar la Factura N°68 de Acmotrack ($529.550)',
    entity: 'Acmotrack',
    entityDisplay: 'Acmotrack',
    typeTag: 'Cliente',
    source: 'finanzas-data.json',
    status: 'pending',
    borderColor: '#a855f7',
  },

  // --- Agencia (11) ---
  {
    id: 11,
    title: 'Confirmar saldo real consolidado en las cuentas',
    entity: 'Agencia',
    entityDisplay: 'Agencia-IA',
    typeTag: 'Finanzas',
    source: 'finanzas-data.json',
    status: 'pending',
    borderColor: '#6366f1',
  },
  {
    id: 12,
    title: 'Confirmar si se ejecutó la dispersión y en qué %',
    entity: 'Agencia',
    entityDisplay: 'Agencia-IA',
    typeTag: 'Finanzas',
    source: 'finanzas-data.json',
    status: 'pending',
    borderColor: '#6366f1',
  },
  {
    id: 13,
    title: 'Ejecutar la primera dispersión real 5/45/20/30 a las 4 subcuentas',
    entity: 'Agencia',
    entityDisplay: 'Agencia-IA',
    typeTag: 'Finanzas',
    source: 'finanzas-data.json',
    status: 'pending',
    borderColor: '#6366f1',
  },
  {
    id: 14,
    title: 'Recalcular Registro-Movimientos.xlsx en Excel (bug de caché, Ctrl+Alt+F9)',
    entity: 'Agencia',
    entityDisplay: 'Agencia-IA',
    typeTag: 'Finanzas',
    source: 'finanzas-data.json',
    status: 'pending',
    borderColor: '#6366f1',
  },
  {
    id: 15,
    title: 'Evaluar agregar columna de "cobrado real" filtrada por Estado en el libro',
    entity: 'Agencia',
    entityDisplay: 'Agencia-IA',
    typeTag: 'Finanzas',
    source: 'finanzas-data.json',
    status: 'pending',
    borderColor: '#6366f1',
  },
  {
    id: 16,
    title: 'Validar provisión variable de impuestos en cuenta Tenpo (remunerada 6% anual)',
    entity: 'Agencia',
    entityDisplay: 'Agencia-IA',
    typeTag: 'Finanzas',
    source: 'finanzas-data.json',
    status: 'pending',
    borderColor: '#6366f1',
  },
  {
    id: 17,
    title: 'Cerrar propuesta de retainer recurrente para Arcamusweb',
    entity: 'Agencia',
    entityDisplay: 'Agencia-IA',
    typeTag: 'Comercial',
    source: 'pipeline-crm',
    status: 'in_progress',
    borderColor: '#f59e0b',
  },
  {
    id: 18,
    title: 'Actualizar y defender cálculo de VET sobre precio real cerrado ($790.000)',
    entity: 'Agencia',
    entityDisplay: 'Agencia-IA',
    typeTag: 'Finanzas',
    source: 'finanzas-data.json',
    status: 'in_progress',
    borderColor: '#f59e0b',
  },
  {
    id: 19,
    title: 'Apertura de las 5 cuentas bancarias (Estado, Chile, Falabella, Tenpo, Santander al 22-ago)',
    entity: 'Agencia',
    entityDisplay: 'Agencia-IA',
    typeTag: 'Finanzas',
    source: 'finanzas-data.json',
    status: 'completed',
    borderColor: '#10b981',
  },
  {
    id: 20,
    title: 'Definición de regla de distribución Profit First Rango A (5/45/20/30)',
    entity: 'Agencia',
    entityDisplay: 'Agencia-IA',
    typeTag: 'Finanzas',
    source: 'finanzas-data.json',
    status: 'completed',
    borderColor: '#10b981',
  },
  {
    id: 21,
    title: 'Incorporación de Google Workspace y F29 a base de costos (1-sep)',
    entity: 'Agencia',
    entityDisplay: 'Agencia-IA',
    typeTag: 'Finanzas',
    source: 'finanzas-data.json',
    status: 'completed',
    borderColor: '#10b981',
  },
];

export const AgencyTasksSection: React.FC = () => {
  const [tasks, setTasks] = useState<AgencyTask[]>(INITIAL_TASKS);
  const [selectedEntity, setSelectedEntity] = useState<'all' | 'Agencia' | 'Ascendra' | 'Gafexterna' | 'Acmotrack'>('all');
  const [showTasksList, setShowTasksList] = useState<boolean>(false); // Oculto por defecto al ingresar

  useEffect(() => {
    const loadDbTasks = async () => {
      try {
        const [resAct, resCo] = await Promise.all([
          fetch('/api/activities').then((r) => (r.ok ? r.json() : [])),
          fetch('/api/companies').then((r) => (r.ok ? r.json() : [])),
        ]);

        const coMap: Record<string, string> = {};
        if (Array.isArray(resCo)) {
          resCo.forEach((c: any) => {
            coMap[c.id] = c.name;
          });
        }

        if (Array.isArray(resAct)) {
          const dbTasks: AgencyTask[] = resAct
            .filter(
              (a: any) =>
                a.type === 'task' ||
                (a.notes &&
                  (a.notes.includes('landing') ||
                    a.notes.includes('LinkedIn') ||
                    a.notes.includes('Instagram') ||
                    a.notes.includes('hosting') ||
                    a.notes.includes('email') ||
                    a.notes.includes('analítica') ||
                    a.notes.includes('agendamiento')))
            )
            .map((a: any, idx: number) => {
              const notesParts = (a.notes || '').split(' — ');
              const title = notesParts[0] || a.notes || 'Tarea sin título';
              const companyName = a.company_id ? coMap[a.company_id] || 'Cliente' : 'Agencia';

              let entity: 'Agencia' | 'Ascendra' | 'Gafexterna' | 'Acmotrack' = 'Agencia';
              if (companyName.toLowerCase().includes('ascendra')) entity = 'Ascendra';
              else if (
                companyName.toLowerCase().includes('gafexterna') ||
                companyName.toLowerCase().includes('paola')
              )
                entity = 'Gafexterna';
              else if (companyName.toLowerCase().includes('acmotrack')) entity = 'Acmotrack';

              let status: 'pending' | 'in_progress' | 'completed' = 'pending';
              if (
                a.result?.toLowerCase().includes('complet') ||
                a.result?.toLowerCase().includes('done')
              )
                status = 'completed';
              else if (
                a.result?.toLowerCase().includes('proceso') ||
                a.result?.toLowerCase().includes('progress')
              )
                status = 'in_progress';

              const borderColor =
                status === 'completed'
                  ? '#10b981'
                  : status === 'in_progress'
                  ? '#f59e0b'
                  : entity === 'Gafexterna'
                  ? '#f97316'
                  : entity === 'Ascendra'
                  ? '#0d9488'
                  : entity === 'Acmotrack'
                  ? '#a855f7'
                  : '#6366f1';

              return {
                id: a.id || `db-${idx}`,
                title,
                entity,
                entityDisplay: companyName === 'Agencia' ? 'Agencia-IA' : companyName,
                typeTag: entity === 'Agencia' ? 'Agencia' : 'Cliente',
                source: a.next_action
                  ? `Siguiente acción: ${a.next_action}`
                  : 'CRM DB (Claude Cowork / MCP)',
                status,
                borderColor,
              };
            });

          if (dbTasks.length > 0) {
            setTasks((prev) => {
              const titles = new Set(dbTasks.map((d) => d.title.toLowerCase().trim()));
              const remainingInit = prev.filter(
                (p) => !titles.has(p.title.toLowerCase().trim())
              );
              return [...dbTasks, ...remainingInit];
            });
          }
        }
      } catch (err) {
        console.warn('Error cargando tareas dinámicas de la agencia:', err);
      }
    };

    loadDbTasks();
  }, []);

  const handleToggleStatus = (taskId: number | string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus: 'pending' | 'in_progress' | 'completed' =
            t.status === 'pending'
              ? 'in_progress'
              : t.status === 'in_progress'
              ? 'completed'
              : 'pending';
          const newBorderColor =
            nextStatus === 'completed'
              ? '#10b981'
              : nextStatus === 'in_progress'
              ? '#f59e0b'
              : t.entity === 'Gafexterna'
              ? '#f97316'
              : t.entity === 'Ascendra'
              ? '#0d9488'
              : t.entity === 'Acmotrack'
              ? '#a855f7'
              : '#6366f1';

          // Sync to backend if it's a DB record (UUID)
          if (typeof taskId === 'string' && taskId.length > 10) {
            fetch(`/api/activities/${taskId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                result:
                  nextStatus === 'completed'
                    ? 'completada'
                    : nextStatus === 'in_progress'
                    ? 'en proceso'
                    : 'pendiente',
              }),
            }).catch(console.warn);
          }

          return { ...t, status: nextStatus, borderColor: newBorderColor };
        }
        return t;
      })
    );
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedEntity === 'all') return true;
    return t.entity === selectedEntity;
  });

  const totalCount = tasks.length;
  const pendingTasks = filteredTasks.filter((t) => t.status === 'pending');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  const pendingCountAll = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCountAll = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCountAll = tasks.filter((t) => t.status === 'completed').length;

  const countByEntity = {
    all: tasks.length,
    Agencia: tasks.filter((t) => t.entity === 'Agencia').length,
    Ascendra: tasks.filter((t) => t.entity === 'Ascendra').length,
    Gafexterna: tasks.filter((t) => t.entity === 'Gafexterna').length,
    Acmotrack: tasks.filter((t) => t.entity === 'Acmotrack').length,
  };

  const getEntityBadgeStyle = (entity: string) => {
    switch (entity) {
      case 'Gafexterna':
        return {
          bg: 'rgba(249, 115, 22, 0.12)',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          color: '#fb923c',
        };
      case 'Ascendra':
        return {
          bg: 'rgba(13, 148, 136, 0.12)',
          border: '1px solid rgba(13, 148, 136, 0.3)',
          color: '#2dd4bf',
        };
      case 'Acmotrack':
        return {
          bg: 'rgba(168, 85, 247, 0.12)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          color: '#c084fc',
        };
      default:
        return {
          bg: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#818cf8',
        };
    }
  };

  const renderTaskCard = (task: AgencyTask) => {
    const badgeStyle = getEntityBadgeStyle(task.entity);
    const isDone = task.status === 'completed';

    return (
      <div
        key={task.id}
        onClick={() => handleToggleStatus(task.id)}
        style={{
          padding: '16px 20px',
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-glass)',
          borderLeft: `4px solid ${task.borderColor || '#6366f1'}`,
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isDone ? 0.8 : 1,
        }}
        className="glass-card-interactive"
        title="Haz clic para cambiar de estado (Pendiente → En proceso → Hecha)"
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
          <div style={{ fontWeight: 600, fontSize: '0.975rem', color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: 1.4, textDecoration: isDone ? 'line-through' : 'none' }}>
            {task.title}
          </div>
          <div style={{ flexShrink: 0, marginTop: '2px' }}>
            {task.status === 'completed' ? (
              <CheckCircle2 size={18} color="#10b981" />
            ) : task.status === 'in_progress' ? (
              <Clock3 size={18} color="#f59e0b" />
            ) : (
              <Circle size={18} color="var(--text-muted)" />
            )}
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          {/* Entity Tag */}
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: badgeStyle.bg,
              border: badgeStyle.border,
              color: badgeStyle.color,
            }}
          >
            {task.entityDisplay || task.entity}
          </span>

          {/* Type Tag */}
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 500,
              backgroundColor: 'rgba(148, 163, 184, 0.1)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              color: 'var(--text-secondary)',
            }}
          >
            {task.typeTag}
          </span>
        </div>

        {/* Source File */}
        {task.source && (
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '2px',
            }}
          >
            <FileCode2 size={13} style={{ opacity: 0.7 }} />
            <span>{task.source}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.45rem', color: 'var(--text-primary)', margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Tareas de la agencia
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Fotografía al 13 sep 2026 · {totalCount} tareas registradas
            </p>
          </div>

          {/* Botón Mostrar/Ocultar Tareas */}
          <button
            type="button"
            onClick={() => setShowTasksList(!showTasksList)}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              backgroundColor: showTasksList ? 'rgba(99, 102, 241, 0.15)' : 'var(--primary)',
              color: showTasksList ? 'var(--primary-light)' : '#ffffff',
              border: showTasksList ? '1px solid var(--primary)' : '1px solid var(--primary)',
              boxShadow: showTasksList ? 'none' : 'var(--shadow-glow)',
              transition: 'all 0.15s ease',
            }}
          >
            {showTasksList ? (
              <>
                <ChevronUp size={16} />
                <span>Ocultar Tareas</span>
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                <span>Mostrar Tareas ({filteredTasks.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
        {/* Total */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--bg-card-solid)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Total de tareas
          </div>
        </div>

        {/* Pendientes */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--bg-card-solid)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {pendingCountAll}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
            Pendientes
          </div>
        </div>

        {/* En proceso */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--bg-card-solid)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {inProgressCountAll}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            En proceso
          </div>
        </div>

        {/* Hechas */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--bg-card-solid)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {completedCountAll}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            Hechas
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setSelectedEntity('all')}
          style={{
            padding: '8px 18px',
            borderRadius: '24px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: selectedEntity === 'all' ? 'var(--primary)' : 'var(--bg-card-solid)',
            color: selectedEntity === 'all' ? '#ffffff' : 'var(--text-secondary)',
            border: selectedEntity === 'all' ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <span>Todas</span>
          <span style={{ opacity: 0.85, fontSize: '0.8rem', fontWeight: 700 }}>{countByEntity.all}</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedEntity('Agencia')}
          style={{
            padding: '8px 18px',
            borderRadius: '24px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: selectedEntity === 'Agencia' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-card-solid)',
            color: selectedEntity === 'Agencia' ? 'var(--primary-light)' : 'var(--text-secondary)',
            border: selectedEntity === 'Agencia' ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1' }} />
          <span>Agencia</span>
          <span style={{ opacity: 0.85, fontSize: '0.8rem', fontWeight: 700 }}>{countByEntity.Agencia}</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedEntity('Ascendra')}
          style={{
            padding: '8px 18px',
            borderRadius: '24px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: selectedEntity === 'Ascendra' ? 'rgba(13, 148, 136, 0.2)' : 'var(--bg-card-solid)',
            color: selectedEntity === 'Ascendra' ? '#2dd4bf' : 'var(--text-secondary)',
            border: selectedEntity === 'Ascendra' ? '1px solid #0d9488' : '1px solid var(--border-glass)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0d9488' }} />
          <span>Ascendra</span>
          <span style={{ opacity: 0.85, fontSize: '0.8rem', fontWeight: 700 }}>{countByEntity.Ascendra}</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedEntity('Gafexterna')}
          style={{
            padding: '8px 18px',
            borderRadius: '24px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: selectedEntity === 'Gafexterna' ? 'rgba(249, 115, 22, 0.2)' : 'var(--bg-card-solid)',
            color: selectedEntity === 'Gafexterna' ? '#fb923c' : 'var(--text-secondary)',
            border: selectedEntity === 'Gafexterna' ? '1px solid #f97316' : '1px solid var(--border-glass)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316' }} />
          <span>Gafexterna</span>
          <span style={{ opacity: 0.85, fontSize: '0.8rem', fontWeight: 700 }}>{countByEntity.Gafexterna}</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedEntity('Acmotrack')}
          style={{
            padding: '8px 18px',
            borderRadius: '24px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: selectedEntity === 'Acmotrack' ? 'rgba(168, 85, 247, 0.2)' : 'var(--bg-card-solid)',
            color: selectedEntity === 'Acmotrack' ? '#c084fc' : 'var(--text-secondary)',
            border: selectedEntity === 'Acmotrack' ? '1px solid #a855f7' : '1px solid var(--border-glass)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a855f7' }} />
          <span>Acmotrack</span>
          <span style={{ opacity: 0.85, fontSize: '0.8rem', fontWeight: 700 }}>{countByEntity.Acmotrack}</span>
        </button>
      </div>

      {/* Task Sections Grouped by Status (Colapsable / Oculto por defecto) */}
      {showTasksList && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '26px', marginTop: '6px' }}>
          {/* 1. Pendiente */}
          {pendingTasks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                  <span>Pendiente</span>
                </div>
                <span
                  style={{
                    padding: '2px 9px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(148, 163, 184, 0.15)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {pendingTasks.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pendingTasks.map(renderTaskCard)}
              </div>
            </div>
          )}

          {/* 2. En proceso */}
          {inProgressTasks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  <span>En proceso</span>
                </div>
                <span
                  style={{
                    padding: '2px 9px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#f59e0b',
                  }}
                >
                  {inProgressTasks.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {inProgressTasks.map(renderTaskCard)}
              </div>
            </div>
          )}

          {/* 3. Hechas */}
          {completedTasks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span>Hechas</span>
                </div>
                <span
                  style={{
                    padding: '2px 9px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#10b981',
                  }}
                >
                  {completedTasks.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {completedTasks.map(renderTaskCard)}
              </div>
            </div>
          )}

          {filteredTasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No hay tareas en este filtro.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgencyTasksSection;
