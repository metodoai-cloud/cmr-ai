import { supabase } from '../db/connection.js';
import dotenv from 'dotenv';
dotenv.config();

const realServices = [
  {
    name: 'Creación de Empresa desde Cero — Starter',
    category: 'Consultoría',
    description: 'Constitución legal, estatutos, inicio de actividades y cuenta bancaria para empresas que parten.',
    standard_setup_price: 390000,
    standard_recurring_price: 0,
    billing_type: 'one_time',
    billing_frequency: 'one_time',
    active: true,
  },
  {
    name: 'Creación de Empresa desde Cero — VIP',
    category: 'Consultoría',
    description: 'Constitución legal completa, asesoría tributaria inicial, registro de marca y acompañamiento personalizado.',
    standard_setup_price: 780000,
    standard_recurring_price: 0,
    billing_type: 'one_time',
    billing_frequency: 'one_time',
    active: true,
  },
  {
    name: 'Diagnóstico y Documentación de Procesos',
    category: 'Consultoría',
    description: 'Levantamiento de procesos operativos, mapeo de flujos, identificación de cuellos de botella y manual de procedimientos.',
    standard_setup_price: 890000,
    standard_recurring_price: 0,
    billing_type: 'one_time',
    billing_frequency: 'one_time',
    active: true,
  },
  {
    name: 'Automatización de Procesos',
    category: 'Automatización',
    description: 'Gestión y mantención continua de flujos automatizados, integraciones y optimización operativa mensual.',
    standard_setup_price: 0,
    standard_recurring_price: 750000,
    billing_type: 'recurring',
    billing_frequency: 'monthly',
    active: true,
  },
  {
    name: '1 Automatización Puntual',
    category: 'Automatización',
    description: 'Desarrollo e implementación de 1 flujo automatizado puntual (ej: WhatsApp a CRM o webhook de pagos).',
    standard_setup_price: 500000,
    standard_recurring_price: 0,
    billing_type: 'one_time',
    billing_frequency: 'one_time',
    active: true,
  },
  {
    name: '2 Automatizaciones Puntuales',
    category: 'Automatización',
    description: 'Desarrollo e implementación de 2 flujos automatizados integrados.',
    standard_setup_price: 750000,
    standard_recurring_price: 0,
    billing_type: 'one_time',
    billing_frequency: 'one_time',
    active: true,
  },
  {
    name: '3 Automatizaciones Puntuales',
    category: 'Automatización',
    description: 'Paquete de 3 automatizaciones de procesos comerciales u operativos integrados.',
    standard_setup_price: 1000000,
    standard_recurring_price: 0,
    billing_type: 'one_time',
    billing_frequency: 'one_time',
    active: true,
  },
  {
    name: 'Marketing / Campaña',
    category: 'Growth',
    description: 'Estrategia, creación y optimización continua de campañas de adquisición pagada (Meta / Google Ads).',
    standard_setup_price: 0,
    standard_recurring_price: 250000,
    billing_type: 'hybrid',
    billing_frequency: 'monthly',
    active: true,
  },
  {
    name: 'Desarrollo de Producto / Web App',
    category: 'Desarrollo',
    description: 'Desarrollo a medida de aplicaciones web, portales de clientes o software especializado.',
    standard_setup_price: 500000,
    standard_recurring_price: 0,
    billing_type: 'one_time',
    billing_frequency: 'one_time',
    active: true,
  },
];

async function seedServices() {
  console.log('🌱 Poblador de Catálogo de Servicios Oficial...');

  // 1. Check existing
  const { data: existing, error: errFetch } = await supabase.from('services').select('id, name');
  if (errFetch) {
    console.error('Error al consultar servicios:', errFetch);
    return;
  }

  console.log(`Encontrados ${existing?.length || 0} servicios previos.`);

  // 2. Clear old demo services if any
  if (existing && existing.length > 0) {
    const { error: delErr } = await supabase.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delErr) {
      console.warn('Nota al limpiar servicios anteriores (posible FK referenciada):', delErr.message);
    } else {
      console.log('✅ Servicios demo anteriores eliminados.');
    }
  }

  // 3. Insert new official catalog
  const { data: inserted, error: insErr } = await supabase.from('services').insert(realServices).select();
  if (insErr) {
    console.error('❌ Error al insertar servicios:', insErr);
    return;
  }

  console.log(`\n🎉 ¡${inserted?.length} servicios oficiales insertados exitosamente!\n`);
  inserted?.forEach((s, idx) => {
    console.log(`${idx + 1}. [${s.category}] ${s.name} | Setup: $${s.standard_setup_price.toLocaleString('es-CL')} | MRR: $${s.standard_recurring_price.toLocaleString('es-CL')} | Tipo: ${s.billing_type}`);
  });
}

seedServices();
