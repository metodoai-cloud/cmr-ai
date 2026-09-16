import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  Clock3,
  Circle,
  FileCode2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Plus,
  X,
  Check,
  Save,
  Target,
  ArrowRight,
} from 'lucide-react';

export interface AgencyTask {
  id: number | string;
  title: string;
  entity: string;
  entityDisplay?: string;
  typeTag: 'Cliente' | 'Agencia' | 'Finanzas' | 'Comercial';
  expectedOutcome?: string; // Resultado esperado o entregable concreto
  nextAction?: string;      // Siguiente paso posterior (distinto al título)
  source?: string;
  status: 'pending' | 'in_progress' | 'completed';
  borderColor?: string;
}

const ENTITY_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  Agencia: {
    color: '#818cf8',
    bg: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.35)',
  },
  Ascendra: {
    color: '#2dd4bf',
    bg: 'rgba(13, 148, 136, 0.15)',
    border: '1px solid rgba(13, 148, 136, 0.35)',
  },
  Gafexterna: {
    color: '#fb923c',
    bg: 'rgba(249, 115, 22, 0.15)',
    border: '1px solid rgba(249, 115, 22, 0.35)',
  },
  Acmotrack: {
    color: '#c084fc',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: '1px solid rgba(168, 85, 247, 0.35)',
  },
  'Agrícola Protea': {
    color: '#34d399',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.35)',
  },
};

const DYNAMIC_PALETTE = [
  { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.35)' }, // sky
  { color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.35)' }, // rose
  { color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.35)' }, // amber
  { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.35)' }, // pink
  { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.35)' }, // cyan
];

const getEntityBadgeStyle = (entity: string) => {
  if (ENTITY_STYLES[entity]) return ENTITY_STYLES[entity];
  let hash = 0;
  for (let i = 0; i < entity.length; i++) hash = entity.charCodeAt(i) + ((hash << 5) - hash);
  const index = Math.abs(hash) % DYNAMIC_PALETTE.length;
  return DYNAMIC_PALETTE[index];
};

const INITIAL_TASKS: AgencyTask[] = [
  // --- Gafexterna (4) ---
  {
    id: 1,
    title: 'Correr entrevistas Mom Test y definir cliente(s) piloto',
    entity: 'Gafexterna',
    entityDisplay: 'Gafexterna',
    typeTag: 'Cliente',
    expectedOutcome: 'Documento con 5 entrevistas analizadas y 2 clientes piloto pre-acordados.',
    nextAction: 'Sintetizar matriz de dolores y validar propuesta comercial.',
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
    expectedOutcome: 'Checklist de fases del pipeline 1 a 6 con confirmación de Paola.',
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
    expectedOutcome: 'Figma interactivo con pantallas de onboarding y panel principal.',
    nextAction: 'Agendar sesión de feedback de 30 minutos.',
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
    expectedOutcome: 'PDF de entregables aprobado por el cliente.',
    source: 'preguntas-pendientes-paola.md',
    status: 'pending',
    borderColor: '#f97316',
  },

  // --- Ascendra (5) ---
  {
    id: 5,
    title: 'Construir fases 9 y 10 del pipeline de Ascendra (Redes sociales y Go-to-market)',
    entity: 'Ascendra',
    entityDisplay: 'Ascendra Gestión Inmobiliaria',
    typeTag: 'Cliente',
    expectedOutcome: 'Estructura de embudo de captación de inversionistas en CRM.',
    nextAction: 'Validar con los socios en reunión semanal.',
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
    expectedOutcome: 'Reunión fijada en Google Calendar con acta de acuerdos lista.',
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
    expectedOutcome: 'Diagrama de integraciones Supabase + WhatsApp validado.',
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
    expectedOutcome: 'Documento de SLAs con tiempos de respuesta < 5 min por lead.',
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
    expectedOutcome: 'Pipeline base configurado con etapas y criterios de pase.',
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
    expectedOutcome: 'Comprobante de transferencia bancaria por $529.550 recibido.',
    nextAction: 'Registrar pago en el CRM y emitir recibo.',
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
    expectedOutcome: 'Planilla de saldos bancarios conciliada al 100%.',
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
    expectedOutcome: 'Verificación de transferencias ejecutadas a cuentas de reserva.',
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
    expectedOutcome: 'Fondos distribuidos en subcuentas de Ganancia, Impuestos y Operaciones.',
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
    expectedOutcome: 'Fórmulas del libro actualizadas sin errores de referencia.',
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
    expectedOutcome: 'Columna agregada que suma únicamente facturas pagadas.',
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
    expectedOutcome: 'Provisión del F29 depositada generando intereses mensuales.',
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
    expectedOutcome: 'Contrato firmado por retainer de automatización mensual.',
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
    expectedOutcome: 'Métrica VET recalculada con margen operativo > 60%.',
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
    expectedOutcome: 'Las 5 cuentas operativas y vinculadas a la plataforma contable.',
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
    expectedOutcome: 'Regla documentada y acordada formalmente.',
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
    expectedOutcome: 'Costos fijos actualizados en el modelo financiero.',
    source: 'finanzas-data.json',
    status: 'completed',
    borderColor: '#10b981',
  },
];

const LOCAL_STORAGE_KEY = 'crm_agency_tasks_custom_v2';

export const AgencyTasksSection: React.FC = () => {
  const [tasks, setTasks] = useState<AgencyTask[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_TASKS;
  });

  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [companies, setCompanies] = useState<string[]>([]);
  const [showTasksList, setShowTasksList] = useState<boolean>(true);

  // Edit / Create Modal State
  const [editingTask, setEditingTask] = useState<AgencyTask | null>(null);
  const [isNewTask, setIsNewTask] = useState<boolean>(false);

  // Sync to local storage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Error saving tasks to localStorage:', e);
    }
  }, [tasks]);

  useEffect(() => {
    const loadDbTasks = async () => {
      try {
        const [resAct, resCo] = await Promise.all([
          fetch('/api/activities').then((r) => (r.ok ? r.json() : [])),
          fetch('/api/companies').then((r) => (r.ok ? r.json() : [])),
        ]);

        const coMap: Record<string, string> = {};
        if (Array.isArray(resCo)) {
          const names: string[] = [];
          resCo.forEach((c: any) => {
            if (c.id && c.name) {
              coMap[c.id] = c.name;
              names.push(c.name);
            }
          });
          setCompanies(names);
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
              const rawCompanyName = a.company_id ? (coMap[a.company_id] || '').trim() : '';

              let entity = 'Agencia';
              let entityDisplay = 'Agencia-IA';
              let typeTag: 'Cliente' | 'Agencia' | 'Finanzas' | 'Comercial' = 'Agencia';

              if (rawCompanyName && rawCompanyName.toLowerCase() !== 'agencia') {
                entity = rawCompanyName;
                entityDisplay = rawCompanyName;
                typeTag = 'Cliente';
              } else if (title.toLowerCase().includes('protea') || (a.notes && a.notes.toLowerCase().includes('protea'))) {
                entity = 'Agrícola Protea';
                entityDisplay = 'Agrícola Protea';
                typeTag = 'Cliente';
              } else if (title.toLowerCase().includes('ascendra') || (a.notes && a.notes.toLowerCase().includes('ascendra'))) {
                entity = 'Ascendra';
                entityDisplay = 'Ascendra Gestión Inmobiliaria';
                typeTag = 'Cliente';
              } else if (title.toLowerCase().includes('gafexterna') || (a.notes && (a.notes.toLowerCase().includes('gafexterna') || a.notes.toLowerCase().includes('paola')))) {
                entity = 'Gafexterna';
                entityDisplay = 'Gafexterna';
                typeTag = 'Cliente';
              } else if (title.toLowerCase().includes('acmotrack') || (a.notes && a.notes.toLowerCase().includes('acmotrack'))) {
                entity = 'Acmotrack';
                entityDisplay = 'Acmotrack';
                typeTag = 'Cliente';
              }

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

              const badgeStyle = getEntityBadgeStyle(entity);
              const borderColor =
                status === 'completed'
                  ? '#10b981'
                  : status === 'in_progress'
                  ? '#f59e0b'
                  : badgeStyle.color;

              // Check if next_action is distinct from title / notes (prevent duplicate)
              const rawNext = a.next_action ? a.next_action.trim() : '';
              const isDuplicateNext =
                rawNext.toLowerCase() === title.toLowerCase().trim() ||
                (a.notes && rawNext.toLowerCase() === a.notes.toLowerCase().trim());
              const cleanNextAction = isDuplicateNext || !rawNext ? undefined : rawNext;

              return {
                id: a.id || `db-${idx}`,
                title,
                entity,
                entityDisplay,
                typeTag,
                expectedOutcome: a.desired_outcome || undefined,
                nextAction: cleanNextAction,
                source: 'CRM DB (Claude Cowork / MCP)',
                status,
                borderColor,
              };
            });

          if (dbTasks.length > 0) {
            setTasks((prev) => {
              const existingIds = new Set(prev.map((p) => String(p.id)));
              const newFromDb = dbTasks.filter((d) => !existingIds.has(String(d.id)));
              return [...prev, ...newFromDb];
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
              : getEntityBadgeStyle(t.entity).color;

          // Sync to backend if it's a DB record (UUID)
          if (typeof taskId === 'string' && taskId.length > 10 && !taskId.startsWith('custom-')) {
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

  const handleOpenEdit = (task: AgencyTask, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask({ ...task });
    setIsNewTask(false);
  };

  const handleOpenNewTask = () => {
    setEditingTask({
      id: `custom-${Date.now()}`,
      title: '',
      entity: selectedEntity !== 'all' ? selectedEntity : 'Agencia',
      entityDisplay: selectedEntity !== 'all' ? selectedEntity : 'Agencia-IA',
      typeTag: 'Agencia',
      expectedOutcome: '',
      nextAction: '',
      source: 'Manual / Interfaz Web',
      status: 'pending',
    });
    setIsNewTask(true);
  };

  const handleSaveEdit = () => {
    if (!editingTask || !editingTask.title.trim()) return;

    const badgeStyle = getEntityBadgeStyle(editingTask.entity);
    const updatedBorder =
      editingTask.status === 'completed'
        ? '#10b981'
        : editingTask.status === 'in_progress'
        ? '#f59e0b'
        : badgeStyle.color;

    const taskToSave: AgencyTask = {
      ...editingTask,
      title: editingTask.title.trim(),
      entityDisplay:
        editingTask.entity === 'Agencia'
          ? 'Agencia-IA'
          : editingTask.entity,
      expectedOutcome: editingTask.expectedOutcome?.trim() || undefined,
      nextAction: editingTask.nextAction?.trim() || undefined,
      borderColor: updatedBorder,
    };

    if (isNewTask) {
      setTasks((prev) => [taskToSave, ...prev]);
    } else {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskToSave.id ? taskToSave : t))
      );

      // Sync to backend if it's a DB record
      if (typeof taskToSave.id === 'string' && taskToSave.id.length > 10 && !taskToSave.id.startsWith('custom-')) {
        fetch(`/api/activities/${taskToSave.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notes: taskToSave.title,
            desired_outcome: taskToSave.expectedOutcome || null,
            next_action: taskToSave.nextAction || null,
            result:
              taskToSave.status === 'completed'
                ? 'completada'
                : taskToSave.status === 'in_progress'
                ? 'en proceso'
                : 'pendiente',
          }),
        }).catch(console.warn);
      }
    }

    setEditingTask(null);
  };

  const handleMarkAsCompletedDirect = () => {
    if (!editingTask) return;
    setEditingTask({ ...editingTask, status: 'completed' });
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

  const entityList = React.useMemo(() => {
    const list: string[] = ['Agencia'];
    const standardClients = ['Ascendra', 'Agrícola Protea', 'Gafexterna', 'Acmotrack'];
    standardClients.forEach((c) => {
      if (!list.includes(c)) list.push(c);
    });
    companies.forEach((c) => {
      if (!list.includes(c)) list.push(c);
    });
    tasks.forEach((t) => {
      if (t.entity && !list.includes(t.entity)) {
        list.push(t.entity);
      }
    });
    return list;
  }, [companies, tasks]);

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
          borderLeft: `4px solid ${task.borderColor || badgeStyle.color}`,
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isDone ? 0.82 : 1,
          position: 'relative',
        }}
        className="glass-card-interactive group-card"
        title="Haz clic para alternar estado (Pendiente → En proceso → Hecha)"
      >
        {/* Top Header: Title + Edit Button + Status Icon */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
          <div
            style={{
              fontWeight: 650,
              fontSize: '1rem',
              color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)',
              lineHeight: 1.45,
              textDecoration: isDone ? 'line-through' : 'none',
              flex: 1,
            }}
          >
            {task.title}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginTop: '2px' }}>
            {/* Edit Button */}
            <button
              type="button"
              onClick={(e) => handleOpenEdit(task, e)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-glass)',
                borderRadius: '6px',
                padding: '5px 8px',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.75rem',
                transition: 'all 0.15s ease',
              }}
              title="Editar tarea"
            >
              <Edit3 size={13} />
              <span style={{ fontSize: '0.72rem', fontWeight: 500 }}>Editar</span>
            </button>

            {/* Status Icon */}
            <div>
              {task.status === 'completed' ? (
                <CheckCircle2 size={19} color="#10b981" />
              ) : task.status === 'in_progress' ? (
                <Clock3 size={19} color="#f59e0b" />
              ) : (
                <Circle size={19} color="var(--text-muted)" />
              )}
            </div>
          </div>
        </div>

        {/* 🎯 Resultado Esperado (Entregable) Callout Box */}
        {task.expectedOutcome && (
          <div
            style={{
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '6px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <Target size={15} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '0.82rem', lineHeight: 1.4, color: 'var(--text-primary)' }}>
              <span style={{ fontWeight: 650, color: 'var(--primary-light)', marginRight: '5px' }}>Resultado esperado:</span>
              <span>{task.expectedOutcome}</span>
            </div>
          </div>
        )}

        {/* Tags Row */}
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
              backgroundColor: 'rgba(148, 163, 184, 0.12)',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              color: 'var(--text-secondary)',
            }}
          >
            {task.typeTag}
          </span>

          {/* Status Label Badge */}
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: 600,
              backgroundColor:
                task.status === 'completed'
                  ? 'rgba(16, 185, 129, 0.12)'
                  : task.status === 'in_progress'
                  ? 'rgba(245, 158, 11, 0.12)'
                  : 'rgba(148, 163, 184, 0.1)',
              color:
                task.status === 'completed'
                  ? 'var(--success)'
                  : task.status === 'in_progress'
                  ? 'var(--warning)'
                  : 'var(--text-muted)',
              border: `1px solid ${
                task.status === 'completed'
                  ? 'rgba(16, 185, 129, 0.3)'
                  : task.status === 'in_progress'
                  ? 'rgba(245, 158, 11, 0.3)'
                  : 'rgba(148, 163, 184, 0.25)'
              }`,
            }}
          >
            {task.status === 'completed'
              ? '✓ Hecha'
              : task.status === 'in_progress'
              ? '⏳ En proceso'
              : '○ Pendiente'}
          </span>
        </div>

        {/* Next Action & Source Footer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
          {/* Siguiente Paso Posterior (si es diferente al título) */}
          {task.nextAction && (
            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--info)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 500,
              }}
            >
              <ArrowRight size={13} color="var(--info)" />
              <span>
                <strong style={{ opacity: 0.9 }}>Siguiente paso:</strong> {task.nextAction}
              </span>
            </div>
          )}

          {/* Source File */}
          {task.source && (
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FileCode2 size={12} style={{ opacity: 0.7 }} />
              <span>{task.source}</span>
            </div>
          )}
        </div>
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
              {totalCount} tareas registradas · Haz clic para cambiar estado o pulsa <b>Editar</b>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Botón Nueva Tarea */}
            <button
              type="button"
              onClick={handleOpenNewTask}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                transition: 'all 0.15s ease',
              }}
            >
              <Plus size={16} />
              <span>Nueva Tarea</span>
            </button>

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
                backgroundColor: showTasksList ? 'rgba(99, 102, 241, 0.12)' : 'var(--primary)',
                color: showTasksList ? 'var(--primary-light)' : '#ffffff',
                border: '1px solid var(--primary)',
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
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)' }} />
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
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
            Hechas (Histórico)
          </div>
        </div>
      </div>

      {/* Filter Tabs (Entity Pills) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
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
          <span style={{ opacity: 0.85, fontSize: '0.8rem', fontWeight: 700 }}>{tasks.length}</span>
        </button>

        {entityList.map((ent) => {
          const style = getEntityBadgeStyle(ent);
          const isSelected = selectedEntity === ent;
          const count = tasks.filter((t) => t.entity === ent).length;
          return (
            <button
              key={ent}
              type="button"
              onClick={() => setSelectedEntity(ent)}
              style={{
                padding: '8px 18px',
                borderRadius: '24px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: isSelected ? style.bg : 'var(--bg-card-solid)',
                color: isSelected ? style.color : 'var(--text-secondary)',
                border: isSelected ? style.border : '1px solid var(--border-glass)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: style.color }} />
              <span>{ent}</span>
              <span style={{ opacity: 0.85, fontSize: '0.8rem', fontWeight: 700 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Task Sections Grouped by Status (Colapsable) */}
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
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: 'var(--warning)' }} />
                  <span>En proceso</span>
                </div>
                <span
                  style={{
                    padding: '2px 9px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--warning)',
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
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                  <span>Hechas (Guardadas en histórico)</span>
                </div>
                <span
                  style={{
                    padding: '2px 9px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--success)',
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

      {/* Modal / Panel para Editar o Crear Tarea (Renderizado en document.body vía Portal para estar siempre centrado en el viewport) */}
      {editingTask &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(10, 15, 29, 0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999999,
              padding: '20px',
              boxSizing: 'border-box',
            }}
            onClick={() => setEditingTask(null)}
          >
            <div
              className="glass-card animate-fade-in"
              style={{
                width: '100%',
                maxWidth: '560px',
                backgroundColor: 'var(--bg-card-solid)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md, 14px)',
                padding: '28px',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxSizing: 'border-box',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      padding: '8px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isNewTask ? <Plus size={22} /> : <Edit3 size={22} />}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                      {isNewTask ? 'Crear Nueva Tarea' : 'Editar Tarea'}
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Actualiza los detalles, resultado esperado o estado de la tarea.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Title / Action */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Nombre / Tarea Actual *
                  </label>
                  <textarea
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    rows={2}
                    placeholder="Ej: Correr entrevistas Mom Test con cliente piloto"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                      lineHeight: 1.45,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* 🎯 Resultado Esperado */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 650, color: 'var(--primary)', marginBottom: '6px' }}>
                    <Target size={15} color="var(--primary)" />
                    <span>Resultado Esperado (Entregable / Meta que valida el éxito)</span>
                  </label>
                  <textarea
                    value={editingTask.expectedOutcome || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, expectedOutcome: e.target.value })}
                    rows={2}
                    placeholder="Ej: 5 entrevistas grabadas, documento de feedback y 2 acuerdos firmados"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(99, 102, 241, 0.06)',
                      border: '1px solid rgba(99, 102, 241, 0.35)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                      lineHeight: 1.45,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* ➔ Siguiente Paso Posterior */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 650, color: 'var(--info)', marginBottom: '6px' }}>
                    <ArrowRight size={15} color="var(--info)" />
                    <span>Siguiente Paso Posterior (Opcional, acción que viene después)</span>
                  </label>
                  <input
                    type="text"
                    value={editingTask.nextAction || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, nextAction: e.target.value })}
                    placeholder="Ej: Presentar matriz de dolores al equipo directivo (solo si es diferente a la tarea actual)"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Entity & Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Entidad / Cliente
                    </label>
                    <select
                      value={editingTask.entity}
                      onChange={(e) => setEditingTask({ ...editingTask, entity: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-main)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    >
                      {entityList.map((ent) => (
                        <option key={ent} value={ent}>
                          {ent}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Categoría / Tipo
                    </label>
                    <select
                      value={editingTask.typeTag}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          typeTag: e.target.value as 'Cliente' | 'Agencia' | 'Finanzas' | 'Comercial',
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-main)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="Agencia">Agencia</option>
                      <option value="Cliente">Cliente</option>
                      <option value="Finanzas">Finanzas</option>
                      <option value="Comercial">Comercial</option>
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Estado de la Tarea
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setEditingTask({ ...editingTask, status: 'pending' })}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        backgroundColor: editingTask.status === 'pending' ? 'rgba(148, 163, 184, 0.25)' : 'var(--bg-main)',
                        color: editingTask.status === 'pending' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        border: editingTask.status === 'pending' ? '1.5px solid #94a3b8' : '1px solid var(--border-glass)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Circle size={15} />
                      <span>Pendiente</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingTask({ ...editingTask, status: 'in_progress' })}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        backgroundColor: editingTask.status === 'in_progress' ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-main)',
                        color: editingTask.status === 'in_progress' ? 'var(--warning)' : 'var(--text-secondary)',
                        border: editingTask.status === 'in_progress' ? '1.5px solid var(--warning)' : '1px solid var(--border-glass)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Clock3 size={15} />
                      <span>En proceso</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingTask({ ...editingTask, status: 'completed' })}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        backgroundColor: editingTask.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-main)',
                        color: editingTask.status === 'completed' ? 'var(--success)' : 'var(--text-secondary)',
                        border: editingTask.status === 'completed' ? '1.5px solid var(--success)' : '1px solid var(--border-glass)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <CheckCircle2 size={15} />
                      <span>Hecha</span>
                    </button>
                  </div>
                </div>

                {/* Source / Note */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Origen / Archivo fuente
                  </label>
                  <input
                    type="text"
                    value={editingTask.source || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, source: e.target.value })}
                    placeholder="Ej: finanzas-data.json, CRM DB, o nota personal"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', gap: '10px' }}>
                <div>
                  {editingTask.status !== 'completed' && (
                    <button
                      type="button"
                      onClick={handleMarkAsCompletedDirect}
                      style={{
                        padding: '9px 15px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: 'var(--success)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Check size={16} />
                      <span>Completar</span>
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    style={{
                      padding: '9px 18px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: 'transparent',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-glass)',
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={!editingTask.title.trim()}
                    style={{
                      padding: '9px 22px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: editingTask.title.trim() ? 'pointer' : 'not-allowed',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      border: '1px solid var(--primary)',
                      boxShadow: 'var(--shadow-glow)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: editingTask.title.trim() ? 1 : 0.6,
                    }}
                  >
                    <Save size={16} />
                    <span>Guardar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default AgencyTasksSection;
