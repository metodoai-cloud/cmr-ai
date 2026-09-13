import React, { useState } from 'react';
import {
  Building,
  CreditCard,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Scale,
  Wallet,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatMoney } from '../App';

interface FinanceHealthProps {
  currentCash?: number;
  totalInvoiced?: number;
  expenses?: any[];
  invoices?: any[];
}

export const FinanceHealthSection: React.FC<FinanceHealthProps> = ({
  currentCash = 1426168,
  totalInvoiced = 2647750,
  expenses = [],
  invoices = [],
}) => {
  const [runwayScenario, setRunwayScenario] = useState<'with_salary' | 'without_salary'>('with_salary');
  const [dispersionViewMode, setDispersionViewMode] = useState<'single_period' | 'multi_month'>('single_period');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all'); // 'all' (Histórico Total) por defecto
  const [dispersionInput, setDispersionInput] = useState<number>(totalInvoiced);
  const [showCostMatrix, setShowCostMatrix] = useState<boolean>(false);
  const [showBankDispersion, setShowBankDispersion] = useState<boolean>(false);
  const [showVetTable, setShowVetTable] = useState<boolean>(false);

  // Constants based on Junta 2026-09-01
  const ownerSalaryTarget = 650000;
  const baseCostsWithoutSalary = 180050; // $76.668 + $87.482 + $15.900
  const baseCostsWithSalary = 830050; // $180.050 + $650.000

  // Daily spend
  const dailySpendWithSalary = Math.round(baseCostsWithSalary / 30); // $27.668
  const dailySpendWithoutSalary = Math.round(baseCostsWithoutSalary / 30); // $6.002

  // Runway days
  const runwayDaysWithSalary = parseFloat((currentCash / (baseCostsWithSalary / 30)).toFixed(1)); // 51.5 days
  const runwayDaysWithoutSalary = parseFloat((currentCash / (baseCostsWithoutSalary / 30)).toFixed(1)); // 237.6 days

  // Break-even
  const breakEvenTarget = Math.round(ownerSalaryTarget / 0.45); // $1.444.444
  const confirmedRetainer = 790000; // Acmotrack retainer
  const gapVsRetainer = breakEvenTarget - confirmedRetainer; // $654.444

  // Target 90 days runway
  const targetDays = 90;
  const progressPercentWithSalary = Math.min(100, Math.round((runwayDaysWithSalary / targetDays) * 100));

  // Non-deleted datasets
  const nonDeletedExpenses = expenses.filter((e) => !e.deleted_at);
  const nonDeletedInvoices = invoices.filter((i) => !i.deleted_at);

  // Helper to extract YYYY-MM
  const getMonthKey = (dateStr?: string) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 7);
  };

  const getMonthLabel = (key: string) => {
    if (key === 'all') return 'Histórico Total';
    const [year, month] = key.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const idx = parseInt(month, 10) - 1;
    return `${months[idx] || month} ${year}`;
  };

  // Discover all unique months from invoices and expenses
  const rawMonthKeys = Array.from(
    new Set([
      ...nonDeletedInvoices.map((i) => getMonthKey(i.issue_date || i.created_at)),
      ...nonDeletedExpenses.map((e) => getMonthKey(e.date || e.paid_at || e.created_at)),
    ])
  ).filter(Boolean);

  // Ensure default known months exist if dataset is small
  ['2026-09', '2026-08', '2026-06'].forEach((m) => {
    if (!rawMonthKeys.includes(m)) rawMonthKeys.push(m);
  });

  // Sort ascending for matrix columns (Jun -> Ago -> Sep), and descending for pills
  const sortedAscMonthKeys = [...rawMonthKeys].sort();
  const sortedDescMonthKeys = [...rawMonthKeys].sort().reverse();

  // Helper to compute metrics for any month key (or 'all')
  const computePeriodMetrics = (key: string) => {
    const isAll = key === 'all';

    // Invoiced
    const pInvoices = isAll
      ? nonDeletedInvoices
      : nonDeletedInvoices.filter((i) => getMonthKey(i.issue_date || i.created_at) === key);
    
    let pInvoiced = pInvoices.reduce((sum, i) => sum + Number(i.total || 0), 0);
    if (isAll && pInvoiced === 0) pInvoiced = totalInvoiced;
    if (!isAll && pInvoiced === 0) {
      if (key === '2026-09') pInvoiced = 595000;
      else if (key === '2026-08') pInvoiced = 1559100;
      else if (key === '2026-06') pInvoiced = 500000;
    }

    // Expenses
    const pExpenses = isAll
      ? nonDeletedExpenses
      : nonDeletedExpenses.filter((e) => getMonthKey(e.date || e.paid_at || e.created_at) === key);

    const taxesSum = pExpenses
      .filter((e) => {
        const cat = (e.category || '').toLowerCase();
        const desc = (e.description || '').toLowerCase();
        return cat.includes('tax') || cat.includes('impuesto') || desc.includes('f29') || desc.includes('impuesto');
      })
      .reduce((sum, e) => sum + Number(e.total || e.amount || 0), 0);
    
    let pTaxes = taxesSum;
    if (isAll && pTaxes === 0) pTaxes = 87482;
    if (!isAll && pTaxes === 0) {
      if (key === '2026-08') pTaxes = 87482;
      else if (key === '2026-09') pTaxes = 245821;
    }

    const opExSum = pExpenses
      .filter((e) => {
        const cat = (e.category || '').toLowerCase();
        const desc = (e.description || '').toLowerCase();
        const isTax = cat.includes('tax') || cat.includes('impuesto') || desc.includes('f29') || desc.includes('impuesto');
        const isSalary = cat.includes('salary') || cat.includes('sueldo') || desc.includes('sueldo');
        return !isTax && !isSalary;
      })
      .reduce((sum, e) => sum + Number(e.total || e.amount || 0), 0);

    let pOpEx = opExSum;
    if (isAll && pOpEx === 0) pOpEx = 92568;
    if (!isAll && pOpEx === 0) {
      if (key === '2026-09') pOpEx = 92568;
    }

    const pProfitReal = 0;
    const pOwnerReal = 0;

    const bProfit5 = Math.round(pInvoiced * 0.05);
    const bOwner45 = Math.round(pInvoiced * 0.45);
    const bTaxes20 = Math.round(pInvoiced * 0.20);
    const bOpEx30 = Math.round(pInvoiced * 0.30);

    return {
      key,
      label: getMonthLabel(key),
      invoiced: pInvoiced,
      profit5: bProfit5,
      profitReal: pProfitReal,
      profitDiff: bProfit5 - pProfitReal,
      owner45: bOwner45,
      ownerReal: pOwnerReal,
      ownerDiff: bOwner45 - pOwnerReal,
      taxes20: bTaxes20,
      taxesReal: pTaxes,
      taxesDiff: bTaxes20 - pTaxes,
      opex30: bOpEx30,
      opexReal: pOpEx,
      opexDiff: bOpEx30 - pOpEx,
      totalSpent: pProfitReal + pOwnerReal + pTaxes + pOpEx,
      netRemanente: pInvoiced - (pProfitReal + pOwnerReal + pTaxes + pOpEx),
    };
  };

  // Build options for pills (with 'all' first)
  const allPeriodMetrics = computePeriodMetrics('all');
  const periodOptions = [
    allPeriodMetrics,
    ...sortedDescMonthKeys.map((k) => computePeriodMetrics(k)),
  ];

  // Active metrics for single period view
  const activePeriodMetrics = computePeriodMetrics(selectedPeriod);
  const activeBase = selectedPeriod === 'all' && dispersionInput !== allPeriodMetrics.invoiced
    ? dispersionInput
    : dispersionInput;

  // Active budgeted allocations
  const activeBudgeted = {
    income: activeBase,
    profit5: Math.round(activeBase * 0.05),
    owner45: Math.round(activeBase * 0.45),
    taxes20: Math.round(activeBase * 0.20),
    opex30: Math.round(activeBase * 0.30),
  };

  const activeAccountRows = [
    {
      id: 'income',
      name: 'Cuenta Empresa (Ingresos)',
      bank: 'Banco Estado Empresa',
      pctLabel: 'Base (100%)',
      budget: activeBase,
      real: currentCash,
      diff: currentCash - activeBase,
      note: selectedPeriod === 'all'
        ? 'Total Facturado vs Caja Neta Disponible en cuenta'
        : `Facturación de ${getMonthLabel(selectedPeriod)} vs Caja Neta Actual`,
      isSource: true,
    },
    {
      id: 'profit',
      name: 'Ganancias',
      bank: 'Banco Chile',
      pctLabel: '5%',
      budget: activeBudgeted.profit5,
      real: activePeriodMetrics.profitReal,
      diff: activeBudgeted.profit5 - activePeriodMetrics.profitReal,
      note: 'Fondo de utilidades y reservas (No retirado)',
      isSource: false,
    },
    {
      id: 'owner',
      name: 'Compensación Dueño',
      bank: 'Banco Falabella',
      pctLabel: '45%',
      budget: activeBudgeted.owner45,
      real: activePeriodMetrics.ownerReal,
      diff: activeBudgeted.owner45 - activePeriodMetrics.ownerReal,
      note: 'Sueldo / Retiro del socio (No retirado)',
      isSource: false,
    },
    {
      id: 'taxes',
      name: 'Impuestos (Provisión)',
      bank: 'Tenpo (Remunerada 6% anual)',
      pctLabel: '20%',
      budget: activeBudgeted.taxes20,
      real: activePeriodMetrics.taxesReal,
      diff: activeBudgeted.taxes20 - activePeriodMetrics.taxesReal,
      note: selectedPeriod === 'all'
        ? 'Suma de impuestos y F29 pagados desde cuenta empresa'
        : `Impuestos / F29 del periodo ${getMonthLabel(selectedPeriod)}`,
      isSource: false,
    },
    {
      id: 'opex',
      name: 'Gastos de Operación',
      bank: 'Banco Santander',
      pctLabel: '30%',
      budget: activeBudgeted.opex30,
      real: activePeriodMetrics.opexReal,
      diff: activeBudgeted.opex30 - activePeriodMetrics.opexReal,
      note: selectedPeriod === 'all'
        ? 'Suma de SaaS, herramientas y OpEx pagados'
        : `Costos operativos y SaaS del periodo ${getMonthLabel(selectedPeriod)}`,
      isSource: false,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. RUNWAY & DIAS DE FLUJO CARD */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>
                Días de Flujo & Runway de Caja
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Fórmula: Saldo actual ({formatMoney(currentCash)}) ÷ Gasto diario promedio (Gasto mensual ÷ 30)
            </p>
          </div>

          {/* Scenario Toggle */}
          <div style={{ display: 'inline-flex', backgroundColor: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', padding: '3px', border: '1px solid var(--border-glass)' }}>
            <button
              type="button"
              onClick={() => setRunwayScenario('with_salary')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: runwayScenario === 'with_salary' ? 'var(--primary)' : 'transparent',
                color: runwayScenario === 'with_salary' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              Con Sueldo Objetivo ($650k)
            </button>
            <button
              type="button"
              onClick={() => setRunwayScenario('without_salary')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: runwayScenario === 'without_salary' ? 'var(--primary)' : 'transparent',
                color: runwayScenario === 'without_salary' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              Sin Sueldo Actual ($0)
            </button>
          </div>
        </div>

        {/* Runway Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {/* Main Runway Indicator */}
          <div
            style={{
              padding: '18px 20px',
              backgroundColor: 'var(--bg-card-solid)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {runwayScenario === 'with_salary' ? 'DÍAS DE FLUJO (SUELDO OBJETIVO)' : 'DÍAS DE FLUJO (ESTADO ACTUAL)'}
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: runwayScenario === 'with_salary' ? '#f59e0b' : '#10b981', marginTop: '6px' }}>
              {runwayScenario === 'with_salary' ? runwayDaysWithSalary : runwayDaysWithoutSalary}{' '}
              <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>días</span>
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Meta de seguridad: <b>90 días</b> (3 meses de reserva)
            </div>
          </div>

          {/* Daily Spend */}
          <div
            style={{
              padding: '18px 20px',
              backgroundColor: 'var(--bg-card-solid)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              GASTO DIARIO PROMEDIO
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
              {formatMoney(runwayScenario === 'with_salary' ? dailySpendWithSalary : dailySpendWithoutSalary)}
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}> /día</span>
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Base mensual: {formatMoney(runwayScenario === 'with_salary' ? baseCostsWithSalary : baseCostsWithoutSalary)}/mes
            </div>
          </div>

          {/* Break-Even Point */}
          <div
            style={{
              padding: '18px 20px',
              backgroundColor: 'var(--bg-card-solid)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              PUNTO DE EQUILIBRIO
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-light)', marginTop: '6px' }}>
              {formatMoney(breakEvenTarget)}
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}> /mes</span>
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Sueldo ($650k) ÷ 45% (Compensación Dueño)
            </div>
          </div>

          {/* Gap vs Retainer */}
          <div
            style={{
              padding: '18px 20px',
              backgroundColor: 'var(--bg-card-solid)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              BRECHA VS RETAINER CERRADO
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>
              -{formatMoney(gapVsRetainer)}
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}> /mes</span>
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Faltante para equilibrio con Acmotrack ($790k)
            </div>
          </div>
        </div>

        {/* Progress Bar towards 90 days target */}
        <div style={{ marginTop: '20px', backgroundColor: 'var(--bg-card-solid)', padding: '16px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.825rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              Avance hacia la meta de reserva (90 días de flujo):
            </span>
            <span style={{ color: runwayDaysWithSalary >= 90 ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
              {runwayDaysWithSalary} / 90 días ({progressPercentWithSalary}%)
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progressPercentWithSalary}%`,
                backgroundColor: runwayDaysWithSalary >= 90 ? '#10b981' : '#f59e0b',
                borderRadius: '4px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            💡 Al mantener el sueldo sin retirar ($0), el saldo actual entrega <b>{runwayDaysWithoutSalary} días</b> de autonomía para acelerar ventas y concretar cobros.
          </div>
        </div>
      </div>

      {/* 2. MATRIZ DE COSTOS MENSUALES (TEÓRICO VS CUENTA EMPRESA VS TARJETA PERSONAL) */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>
              Matriz de Costos Mensuales
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setShowCostMatrix(!showCostMatrix)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              backgroundColor: showCostMatrix ? 'rgba(99, 102, 241, 0.15)' : 'var(--primary)',
              color: showCostMatrix ? 'var(--primary-light)' : '#ffffff',
              border: showCostMatrix ? '1px solid var(--primary)' : '1px solid var(--primary)',
              boxShadow: showCostMatrix ? 'none' : 'var(--shadow-glow)',
              transition: 'all 0.15s ease',
            }}
          >
            {showCostMatrix ? (
              <>
                <ChevronUp size={16} />
                <span>Ocultar Matriz</span>
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                <span>Mostrar Matriz (7 conceptos)</span>
              </>
            )}
          </button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px', marginBottom: showCostMatrix ? '18px' : 0 }}>
          Diferenciación entre costo total de operación vs. lo que realmente se paga hoy desde la cuenta empresa y lo cubierto por tarjeta personal del dueño.
        </p>

        {showCostMatrix && (
          <div className="animate-fade-in" style={{ overflowX: 'auto', marginTop: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 14px' }}>Concepto / Servicio</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Costo Teórico</th>
                  <th style={{ padding: '12px 14px' }}>Método de Pago Actual</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Cuenta Empresa</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Tarjeta Personal</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>¿Carga al Total?</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>Google AI Pro</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>$21.700</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: '0.775rem', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      Tarjeta Personal
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>—</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#f59e0b' }}>$21.700</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Sí</span>
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>Anthropic Claude</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>$22.768</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: '0.775rem', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      Tarjeta Personal
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>—</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#f59e0b' }}>$22.768</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Sí</span>
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>ChatGPT Plus</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>$20.200</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: '0.775rem', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      Tarjeta Personal
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>—</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#f59e0b' }}>$20.200</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Sí</span>
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>Notion</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>$12.000</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: '0.775rem', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      Tarjeta Personal
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>—</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#f59e0b' }}>$12.000</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Sí</span>
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Google Workspace
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary-light)', marginLeft: '6px' }}>(1-sep)</span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>$15.900</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: '0.775rem', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      Cuenta Empresa
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#10b981' }}>$15.900</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>—</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Sí</span>
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    F29 SII (Impuestos / Provisión)
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary-light)', marginLeft: '6px' }}>(Variable)</span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>$87.482</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: '0.775rem', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      Cuenta Empresa (Tenpo 20%)
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#10b981' }}>$87.482</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>—</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Sí</span>
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Sueldo Dueño
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '6px' }}>(Objetivo)</span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>$650.000</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', backgroundColor: 'rgba(148, 163, 184, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      No retirado (Condicionado)
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>$0</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>$0</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>No (0 retirado)</span>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', fontWeight: 700 }}>
                  <td style={{ padding: '14px', color: 'var(--text-primary)' }}>TOTAL CARGADO / PROYECTADO</td>
                  <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: 'var(--primary-light)', fontSize: '1rem' }}>
                    $830.050
                  </td>
                  <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Real cargado: $180.050/mes
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#10b981' }}>
                    $103.382
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#f59e0b' }}>
                    $76.668
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Total Real: $180.050
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* 3. SISTEMA DE CUENTAS BANCARIAS Y DISPERSIÓN PROFIT FIRST (RANGO A) */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>
              Cuentas Bancarias & Dispersión (Profit First Rango A)
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* View Mode Toggle Switch */}
            <div style={{ display: 'inline-flex', backgroundColor: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', padding: '3px', border: '1px solid var(--border-glass)' }}>
              <button
                type="button"
                onClick={() => setDispersionViewMode('single_period')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: dispersionViewMode === 'single_period' ? 'var(--primary)' : 'transparent',
                  color: dispersionViewMode === 'single_period' ? '#ffffff' : 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Wallet size={14} />
                <span>Vista Detalle por Periodo</span>
              </button>
              <button
                type="button"
                onClick={() => setDispersionViewMode('multi_month')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: dispersionViewMode === 'multi_month' ? 'var(--primary)' : 'transparent',
                  color: dispersionViewMode === 'multi_month' ? '#ffffff' : 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Clock size={14} />
                <span>Matriz Histórica Multimes</span>
              </button>
            </div>

            {/* Dispersion Alert Status */}
            <div
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                color: '#f59e0b',
                fontWeight: 600,
              }}
            >
              <AlertTriangle size={15} />
              <span>Dispersión Pendiente: 100% en Banco Estado</span>
            </div>

            <button
              type="button"
              onClick={() => setShowBankDispersion(!showBankDispersion)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                backgroundColor: showBankDispersion ? 'rgba(99, 102, 241, 0.15)' : 'var(--primary)',
                color: showBankDispersion ? 'var(--primary-light)' : '#ffffff',
                border: showBankDispersion ? '1px solid var(--primary)' : '1px solid var(--primary)',
                boxShadow: showBankDispersion ? 'none' : 'var(--shadow-glow)',
                transition: 'all 0.15s ease',
              }}
            >
              {showBankDispersion ? (
                <>
                  <ChevronUp size={16} />
                  <span>Ocultar Cuentas & Dispersión</span>
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  <span>Mostrar Cuentas & Dispersión</span>
                </>
              )}
            </button>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px', marginBottom: showBankDispersion ? '20px' : 0 }}>
          Regla de distribución del 100% de los cobros en 5 cuentas independientes según matriz Profit First (5% Ganancias, 45% Dueño, 20% Impuestos, 30% OpEx).
        </p>

        {showBankDispersion && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
            
            {/* VISTA 1: DETALLE POR PERIODO (MODO FOCO & SIMULADOR) */}
            {dispersionViewMode === 'single_period' && (
              <>
                {/* Period Selector Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px' }}>
                    Periodo a dispersar:
                  </span>
                  {periodOptions.map((p) => {
                    const isSelected = selectedPeriod === p.key;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => {
                          setSelectedPeriod(p.key);
                          setDispersionInput(p.invoiced);
                        }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                          backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-glass)',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                          boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
                          transition: 'all 0.15s ease',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>🗓️</span>
                        <span>{p.label}</span>
                        <span style={{ fontSize: '0.725rem', opacity: isSelected ? 0.9 : 0.6, fontFamily: "'JetBrains Mono', monospace" }}>
                          ({formatMoney(p.invoiced)})
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Live Dispersion Simulator Box */}
                <div
                  style={{
                    padding: '16px 20px',
                    backgroundColor: 'var(--bg-card-solid)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-glass)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Wallet size={18} color="var(--primary-light)" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Dispersión del Periodo: {getMonthLabel(selectedPeriod)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Monto facturado asignable según la regla 5/45/20/30 (puedes ajustar el valor para simular):
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Monto ($):</span>
                    <input
                      type="number"
                      value={dispersionInput}
                      onChange={(e) => setDispersionInput(Number(e.target.value) || 0)}
                      style={{
                        width: '140px',
                        padding: '6px 10px',
                        backgroundColor: 'var(--bg-glass)',
                        border: '1px solid var(--border-focus)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setDispersionInput(activePeriodMetrics.invoiced)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Restablecer Facturado
                    </button>
                  </div>
                </div>

                {/* Tabla Comparativa de Cuentas Bancarias & Dispersión (Presupuestado vs Real vs Diferencia) */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '12px 14px' }}>Cuenta Bancaria, Criterio & Destino</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>Presupuestado</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>Retirado</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>Diferencia</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center' }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeAccountRows.map((acc) => {
                        const isSource = acc.isSource;
                        const isFavorable = acc.diff > 0;
                        const isOverBudget = acc.diff < 0;

                        // Colores: Azul (#3b82f6) si es ahorro/favorable (sin signo -), Rojo (#ef4444) si es sobregasto (con signo -)
                        const diffColor = isSource
                          ? (acc.diff < 0 ? '#ef4444' : '#3b82f6')
                          : isFavorable
                          ? '#3b82f6'
                          : isOverBudget
                          ? '#ef4444'
                          : 'var(--text-muted)';

                        const diffBg = isSource
                          ? (acc.diff < 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)')
                          : isFavorable
                          ? 'rgba(59, 130, 246, 0.1)'
                          : isOverBudget
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'transparent';

                        const diffBorder = isSource
                          ? (acc.diff < 0 ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(59, 130, 246, 0.25)')
                          : isFavorable
                          ? '1px solid rgba(59, 130, 246, 0.25)'
                          : isOverBudget
                          ? '1px solid rgba(239, 68, 68, 0.25)'
                          : 'none';

                        const diffFormatted = acc.diff < 0
                          ? `-${formatMoney(Math.abs(acc.diff))}`
                          : formatMoney(acc.diff);

                        return (
                          <tr key={acc.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                            <td style={{ padding: '14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{acc.name}</span>
                                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                                  {acc.pctLabel}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 600, marginTop: '3px' }}>
                                {acc.bank}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {acc.note}
                              </div>
                            </td>
                            <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                              {formatMoney(acc.budget)}
                            </td>
                            {/* Números en gris (var(--text-muted)) para filas 2 a 5, blanco para cuenta empresa */}
                            <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '0.95rem', color: isSource ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                              {formatMoney(acc.real)}
                            </td>
                            <td style={{ padding: '14px', textAlign: 'right' }}>
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: diffBg,
                                  border: diffBorder,
                                  color: diffColor,
                                  fontWeight: 700,
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: '0.85rem',
                                }}
                              >
                                {diffFormatted}
                              </div>
                            </td>
                            <td style={{ padding: '14px', textAlign: 'center' }}>
                              {isSource ? (
                                <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                                  CUENTA MATRIZ
                                </span>
                              ) : isFavorable ? (
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                                  🔵 Saldo a favor / Ahorro
                                </span>
                              ) : isOverBudget ? (
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                                  🔴 Sobregasto / Exceso
                                </span>
                              ) : (
                                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                                  EN META
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', fontWeight: 700 }}>
                        <td colSpan={1} style={{ padding: '14px', color: 'var(--text-primary)' }}>
                          TOTALES {selectedPeriod === 'all' ? 'HISTÓRICO TOTAL' : getMonthLabel(selectedPeriod).toUpperCase()}
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: 'var(--primary-light)', fontSize: '1rem' }}>
                          {formatMoney(activeBase)}
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)', fontSize: '1rem' }}>
                          {formatMoney(activePeriodMetrics.totalSpent)}
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#3b82f6', fontSize: '1rem' }}>
                          {formatMoney(activeBase - activePeriodMetrics.totalSpent)}
                        </td>
                        <td style={{ padding: '14px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Saldo Remanente: {formatMoney(activeBase - activePeriodMetrics.totalSpent)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}

            {/* VISTA 2: MATRIZ HISTÓRICA MULTIMES (MODO EVOLUCIÓN & AUDITORÍA) */}
            {dispersionViewMode === 'multi_month' && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '12px 14px', minWidth: '220px' }}>Concepto / Cuenta Profit First</th>
                      {sortedAscMonthKeys.map((mk) => (
                        <th key={mk} style={{ padding: '12px 14px', textAlign: 'right', minWidth: '130px' }}>
                          {getMonthLabel(mk)}
                        </th>
                      ))}
                      <th style={{ padding: '12px 14px', textAlign: 'right', minWidth: '150px', backgroundColor: 'rgba(99, 102, 241, 0.08)', color: 'var(--primary-light)' }}>
                        Acumulado Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Fila Base Facturada */}
                    <tr style={{ borderBottom: '1px solid var(--border-glass)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        📥 Base Facturada (100%)
                      </td>
                      {sortedAscMonthKeys.map((mk) => {
                        const m = computePeriodMetrics(mk);
                        return (
                          <td key={mk} style={{ padding: '12px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'var(--text-primary)' }}>
                            {formatMoney(m.invoiced)}
                          </td>
                        );
                      })}
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: 'var(--primary-light)', backgroundColor: 'rgba(99, 102, 241, 0.08)' }}>
                        {formatMoney(allPeriodMetrics.invoiced)}
                      </td>
                    </tr>

                    {/* Fila 1. Ganancias (5%) */}
                    <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>🏦 1. Ganancias (5%)</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Banco Chile (Reserva)</div>
                      </td>
                      {sortedAscMonthKeys.map((mk) => {
                        const m = computePeriodMetrics(mk);
                        return (
                          <td key={mk} style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)', fontWeight: 600 }}>
                              {formatMoney(m.profit5)}
                            </div>
                            <div style={{ fontSize: '0.725rem', color: '#3b82f6', fontWeight: 600, marginTop: '2px' }}>
                              +{formatMoney(m.profitDiff)}
                            </div>
                          </td>
                        );
                      })}
                      <td style={{ padding: '12px 14px', textAlign: 'right', backgroundColor: 'rgba(99, 102, 241, 0.08)' }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--primary-light)', fontWeight: 700 }}>
                          {formatMoney(allPeriodMetrics.profit5)}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: '#3b82f6', fontWeight: 700, marginTop: '2px' }}>
                          +{formatMoney(allPeriodMetrics.profitDiff)}
                        </div>
                      </td>
                    </tr>

                    {/* Fila 2. Compensación Dueño (45%) */}
                    <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>👤 2. Compensación Dueño (45%)</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Banco Falabella (Sueldo)</div>
                      </td>
                      {sortedAscMonthKeys.map((mk) => {
                        const m = computePeriodMetrics(mk);
                        return (
                          <td key={mk} style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)', fontWeight: 600 }}>
                              {formatMoney(m.owner45)}
                            </div>
                            <div style={{ fontSize: '0.725rem', color: '#3b82f6', fontWeight: 600, marginTop: '2px' }}>
                              +{formatMoney(m.ownerDiff)}
                            </div>
                          </td>
                        );
                      })}
                      <td style={{ padding: '12px 14px', textAlign: 'right', backgroundColor: 'rgba(99, 102, 241, 0.08)' }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--primary-light)', fontWeight: 700 }}>
                          {formatMoney(allPeriodMetrics.owner45)}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: '#3b82f6', fontWeight: 700, marginTop: '2px' }}>
                          +{formatMoney(allPeriodMetrics.ownerDiff)}
                        </div>
                      </td>
                    </tr>

                    {/* Fila 3. Impuestos (20%) */}
                    <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>🏛️ 3. Impuestos (20%)</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Tenpo (F29 / Provisión)</div>
                      </td>
                      {sortedAscMonthKeys.map((mk) => {
                        const m = computePeriodMetrics(mk);
                        const isFav = m.taxesDiff >= 0;
                        return (
                          <td key={mk} style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)', fontWeight: 600 }}>
                              {formatMoney(m.taxes20)}
                            </div>
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              F29: {formatMoney(m.taxesReal)}
                            </div>
                            <div style={{ fontSize: '0.725rem', color: isFav ? '#3b82f6' : '#ef4444', fontWeight: 600, marginTop: '2px' }}>
                              {isFav ? `+${formatMoney(m.taxesDiff)}` : `-${formatMoney(Math.abs(m.taxesDiff))}`}
                            </div>
                          </td>
                        );
                      })}
                      <td style={{ padding: '12px 14px', textAlign: 'right', backgroundColor: 'rgba(99, 102, 241, 0.08)' }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--primary-light)', fontWeight: 700 }}>
                          {formatMoney(allPeriodMetrics.taxes20)}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          F29: {formatMoney(allPeriodMetrics.taxesReal)}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: allPeriodMetrics.taxesDiff >= 0 ? '#3b82f6' : '#ef4444', fontWeight: 700, marginTop: '2px' }}>
                          {allPeriodMetrics.taxesDiff >= 0 ? `+${formatMoney(allPeriodMetrics.taxesDiff)}` : `-${formatMoney(Math.abs(allPeriodMetrics.taxesDiff))}`}
                        </div>
                      </td>
                    </tr>

                    {/* Fila 4. Gastos OpEx (30%) */}
                    <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>⚙️ 4. Gastos OpEx (30%)</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Santander (Operación & SaaS)</div>
                      </td>
                      {sortedAscMonthKeys.map((mk) => {
                        const m = computePeriodMetrics(mk);
                        const isFav = m.opexDiff >= 0;
                        return (
                          <td key={mk} style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)', fontWeight: 600 }}>
                              {formatMoney(m.opex30)}
                            </div>
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              OpEx: {formatMoney(m.opexReal)}
                            </div>
                            <div style={{ fontSize: '0.725rem', color: isFav ? '#3b82f6' : '#ef4444', fontWeight: 600, marginTop: '2px' }}>
                              {isFav ? `+${formatMoney(m.opexDiff)}` : `-${formatMoney(Math.abs(m.opexDiff))}`}
                            </div>
                          </td>
                        );
                      })}
                      <td style={{ padding: '12px 14px', textAlign: 'right', backgroundColor: 'rgba(99, 102, 241, 0.08)' }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--primary-light)', fontWeight: 700 }}>
                          {formatMoney(allPeriodMetrics.opex30)}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          OpEx: {formatMoney(allPeriodMetrics.opexReal)}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: allPeriodMetrics.opexDiff >= 0 ? '#3b82f6' : '#ef4444', fontWeight: 700, marginTop: '2px' }}>
                          {allPeriodMetrics.opexDiff >= 0 ? `+${formatMoney(allPeriodMetrics.opexDiff)}` : `-${formatMoney(Math.abs(allPeriodMetrics.opexDiff))}`}
                        </div>
                      </td>
                    </tr>
                  </tbody>

                  <tfoot>
                    <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', fontWeight: 700 }}>
                      <td style={{ padding: '14px', color: 'var(--text-primary)' }}>
                        📊 REMANENTE NETO DEL PERIODO
                      </td>
                      {sortedAscMonthKeys.map((mk) => {
                        const m = computePeriodMetrics(mk);
                        return (
                          <td key={mk} style={{ padding: '14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#3b82f6', fontSize: '0.95rem' }}>
                            {formatMoney(m.netRemanente)}
                          </td>
                        );
                      })}
                      <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#3b82f6', fontSize: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                        {formatMoney(allPeriodMetrics.netRemanente)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. TABLA DE VET POR SERVICIO VENDIDO */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>
              Tabla de VET por Servicio Vendido (Valor Económico Total)
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setShowVetTable(!showVetTable)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              backgroundColor: showVetTable ? 'rgba(99, 102, 241, 0.15)' : 'var(--primary)',
              color: showVetTable ? 'var(--primary-light)' : '#ffffff',
              border: showVetTable ? '1px solid var(--primary)' : '1px solid var(--primary)',
              boxShadow: showVetTable ? 'none' : 'var(--shadow-glow)',
              transition: 'all 0.15s ease',
            }}
          >
            {showVetTable ? (
              <>
                <ChevronUp size={16} />
                <span>Ocultar VET</span>
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                <span>Mostrar VET (3 servicios)</span>
              </>
            )}
          </button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px', marginBottom: showVetTable ? '18px' : 0 }}>
          Auditoría del valor económico generado y justificación de precios para retención y negociación con clientes.
        </p>

        {showVetTable && (
          <div className="animate-fade-in" style={{ overflowX: 'auto', marginTop: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 14px' }}>Cliente / Servicio</th>
                  <th style={{ padding: '12px 14px' }}>Tipo</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Precio Real</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Ref. Mercado</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>VET Defendible</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Ratio VET</th>
                  <th style={{ padding: '12px 14px' }}>Palancas de Valor & Justificación</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {/* Acmotrack */}
                <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Acmotrack</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2.1 Diagnóstico + Ventas Fraccional</div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#c084fc', backgroundColor: 'rgba(168, 85, 247, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      Retainer + Setup
                    </span>
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                    <div>$790.000<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/m</span></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Setup: $1.059.100</div>
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)' }}>
                    $1.800.000
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#10b981', fontWeight: 800, fontSize: '0.95rem' }}>
                    $4.145.000
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#10b981', fontWeight: 800, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                      <ArrowUpRight size={14} /> 5,25x
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>4,19x s/ref</div>
                  </td>
                  <td style={{ padding: '14px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Ahorro de horas en prospección manual, mitigación de fuga de leads y automatización centralizada de pipeline.
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>DEFENDIDO</span>
                  </td>
                </tr>

                {/* Protea */}
                <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Protea</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automatización Comercial & IA</div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#818cf8', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      Proyecto One-Time
                    </span>
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                    $890.000
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)' }}>
                    $1.500.000
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#10b981', fontWeight: 800, fontSize: '0.95rem' }}>
                    $3.200.000
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#818cf8', fontWeight: 800, backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                      <ArrowUpRight size={14} /> 3,60x
                    </div>
                  </td>
                  <td style={{ padding: '14px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Reducción drástica del tiempo de respuesta a solicitudes entrantes y captura estandarizada de cotizaciones.
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>EN ANÁLISIS</span>
                  </td>
                </tr>

                {/* Go Plan Be */}
                <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Go Plan Be</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Diagnóstico & Sistema IA</div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#2dd4bf', backgroundColor: 'rgba(13, 148, 136, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      Setup
                    </span>
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                    $650.000
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)' }}>
                    $1.200.000
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#10b981', fontWeight: 800, fontSize: '0.95rem' }}>
                    $2.400.000
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#2dd4bf', fontWeight: 800, backgroundColor: 'rgba(13, 148, 136, 0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                      <ArrowUpRight size={14} /> 3,69x
                    </div>
                  </td>
                  <td style={{ padding: '14px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Estandarización de flujos operativos y eliminación de cuellos de botella en la administración de proyectos.
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>EN ANÁLISIS</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceHealthSection;
