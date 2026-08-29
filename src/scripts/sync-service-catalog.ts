import { supabase } from '../db/connection.js';

const CATALOG_ITEMS = [
  // --- SERVICIO 1: Creación de Empresa desde Cero ---
  {
    name: 'Creación de Empresa desde Cero — Starter',
    category: 'Servicio 1: Creación de Empresa',
    description: 'Etapa de entrada: Constitución legal, iniciación de actividades y configuración básica para nuevos emprendimientos.',
    standard_setup_price: 390000,
    standard_recurring_price: 0,
    billing_type: 'one_time',
    billing_frequency: 'one_time',
    estimated_cost: 90000,
    target_margin: 75,
    active: true,
  },
  {
    name: 'Creación de Empresa desde Cero — VIP',
    category: 'Servicio 1: Creación de Empresa',
    description: 'Etapa de entrada VIP: Constitución legal integral, cuenta bancaria, imagen corporativa inicial y asesoría personalizada.',
    standard_setup_price: 780000,
    standard_recurring_price: 0,
    billing_type: 'one_time',
    billing_frequency: 'one_time',
    estimated_cost: 180000,
    target_margin: 77,
    active: true,
  },

  // --- SERVICIO 2.1: Diagnóstico y Documentación de Procesos ---
  {
    name: 'Diagnóstico y Documentación de Procesos',
    category: 'Servicio 2.1: Diagnóstico de Procesos',
    description: 'Puente estratégico: Levantamiento completo de flujos operativos, mapa de procesos y detección de cuellos de botella.',
    standard_setup_price: 890000,
    standard_recurring_price: 0,
    billing_type: 'one_time',
    billing_frequency: 'one_time',
    estimated_cost: 200000,
    target_margin: 78,
    active: true,
  },

  // --- SERVICIO 2.2: Automatización de Procesos ---
  {
    name: '1 Automatización Puntual',
    category: 'Servicio 2.2: Automatización de Procesos',
    description: 'Implementación core puntual: Flujo automatizado único (ej: WhatsApp a CRM o captura de leads).',
    standard_setup_price: 500000,
    standard_recurring_price: 0,
    billing_type: 'one_time',
    billing_frequency: 'one_time',
    estimated_cost: 100000,
    target_margin: 80,
    active: true,
  },
  {
    name: '2 Automatizaciones Puntuales',
    category: 'Servicio 2.2: Automatización de Procesos',
    description: 'Implementación core dual: Dos flujos interconectados de automatización operativa.',
    standard_setup_price: 750000,
    standard_recurring_price: 0,
    billing_type: 'one_time',
    billing_frequency: 'one_time',
    estimated_cost: 150000,
    target_margin: 80,
    active: true,
  },
  {
    name: '3 Automatizaciones Puntuales',
    category: 'Servicio 2.2: Automatización de Procesos',
    description: 'Implementación core completa: Tres flujos clave de automatización de ventas y operaciones.',
    standard_setup_price: 1000000,
    standard_recurring_price: 0,
    billing_type: 'one_time',
    billing_frequency: 'one_time',
    estimated_cost: 200000,
    target_margin: 80,
    active: true,
  },
  {
    name: 'Automatización de Procesos — Retainer Continuo',
    category: 'Servicio 2.2: Automatización de Procesos',
    description: 'Up-selling / Retención mensual: Optimización continua, mantenimiento y nuevas automatizaciones mensuales.',
    standard_setup_price: 0,
    standard_recurring_price: 750000,
    billing_type: 'recurring',
    billing_frequency: 'monthly',
    estimated_cost: 150000,
    target_margin: 80,
    active: true,
  },

  // --- SERVICIO 3: Marketing & Campaña ---
  {
    name: 'Marketing / Campaña Growth',
    category: 'Servicio 3: Marketing & Campaña',
    description: 'Up-selling de crecimiento: Gestión de pauta publicitaria (Meta/Google), embudos de captación y optimización de CAC.',
    standard_setup_price: 0,
    standard_recurring_price: 250000,
    billing_type: 'recurring',
    billing_frequency: 'monthly',
    estimated_cost: 50000,
    target_margin: 80,
    active: true,
  },

  // --- SERVICIO 4: Desarrollo de Producto / Web App ---
  {
    name: 'Desarrollo de Producto / Web App',
    category: 'Servicio 4: Desarrollo de Producto / Web App',
    description: 'High-Ticket / Escala: Desarrollo de plataformas a medida, portales de clientes y aplicaciones web.',
    standard_setup_price: 500000,
    standard_recurring_price: 0,
    billing_type: 'one_time',
    billing_frequency: 'one_time',
    estimated_cost: 150000,
    target_margin: 70,
    active: true,
  },
];

async function main() {
  console.log('🔄 Sincronizando Catálogo Comercial en Supabase...');

  // 1. Limpiar servicios anteriores para insertar los 9 servicios oficiales con orden limpio
  const { data: existing } = await supabase.from('services').select('id, name');
  
  // Borrar registros existentes de catálogo
  if (existing && existing.length > 0) {
    for (const e of existing) {
      await supabase.from('services').delete().eq('id', e.id);
    }
  }

  // 2. Insertar los 9 ítems oficiales en orden ascendente
  const { data: inserted, error: inErr } = await supabase
    .from('services')
    .insert(CATALOG_ITEMS)
    .select();

  if (inErr) {
    console.error('Error insertando catálogo:', inErr);
    process.exit(1);
  }

  console.log(`\n✅ ${inserted.length} servicios oficiales insertados en Supabase.`);

  // 3. Imprimir resultado ordenado
  const { data: finalServices } = await supabase
    .from('services')
    .select('*')
    .order('category', { ascending: true })
    .order('standard_setup_price', { ascending: true });

  console.log('\n📋 Catálogo oficial ordenado por Servicio Madre (Ascendente):');
  finalServices?.forEach((s, idx) => {
    console.log(`${idx + 1}. [${s.category}] ${s.name} | Setup: $${Number(s.standard_setup_price).toLocaleString('es-CL')} | MRR: $${Number(s.standard_recurring_price).toLocaleString('es-CL')}/mes`);
  });

  process.exit(0);
}

main();
