import { supabase } from '../db/connection.js';

async function seedStrategy() {
  console.log('🚀 Iniciando carga de semilla de la Capa Estratégica...');

  // 1. AGENCY PROFILE
  console.log('1. Creando/verificando Agency Profile activo...');
  const { data: existingAgency } = await supabase
    .from('agency_profiles')
    .select('id')
    .eq('status', 'active')
    .maybeSingle();

  let agencyId = existingAgency?.id;
  if (!agencyId) {
    const { data: newAgency, error: agErr } = await supabase
      .from('agency_profiles')
      .insert({
        name: 'Estrategia Comercial Q4 / 2026',
        agency_name: 'Método AI',
        description: 'Agencia especializada en sistemas comerciales con IA, automatización operativa y adquisición digital para escalar servicios y B2B.',
        niche: 'Empresas de servicios, consultoras, agencias y clínicas en crecimiento',
        positioning: 'El socio estratégico en infraestructura de ventas e inteligencia artificial aplicada al negocio.',
        super_promise: 'Convertimos procesos manuales y fuga de leads en un sistema comercial predecible que multiplica tu capacidad de venta sin inflar tus costos operativos.',
        core_problem: 'Leads perdidos por falta de seguimiento rápido, cotizaciones desordenadas y procesos comerciales que dependen 100% del tiempo de los socios.',
        desired_transformation: 'Un flujo continuo de prospectos calificados con seguimiento automático, control financiero transparente y cierre de ventas sistemático.',
        unique_mechanism: 'Método Comercial IA 360°: Adquisición Multicanal + CRM Inteligente + Automatización de Operaciones y Cobranza.',
        differentiators: [
          'Especialistas en IA generativa e integraciones avanzadas',
          'Alineación total entre Marketing, Ventas y Finanzas',
          'Implementación llave en mano con adopción de equipo garantizada'
        ],
        values: ['Excelencia técnica', 'Transparencia comercial', 'Velocidad de ejecución'],
        tone_of_voice: 'Profesional, resolutivo, innovador y orientado a números/ROI',
        brand_keywords: ['Automatización', 'Inteligencia Artificial', 'Conversión', 'Pipeline', 'Eficiencia'],
        avoid_language: ['Magia', 'Respuestas automáticas genéricas', 'Complicado'],
        sales_philosophy: 'Venta consultiva basada en diagnóstico profundo, anclaje de valor en ROI y erradicación del trabajo manual repetitivo.',
        version: 1,
        status: 'active',
      })
      .select('id')
      .single();

    if (agErr) {
      console.error('❌ Error creando agency profile:', agErr.message);
    } else {
      agencyId = newAgency.id;
      console.log('✅ Agency Profile creado:', agencyId);
    }
  } else {
    console.log('✅ Agency Profile ya existente:', agencyId);
  }

  // 2. CUSTOMER PROFILES (Avatares / ICPs)
  console.log('2. Creando Customer Profiles (Avatares / ICPs)...');
  const avatars = [
    {
      name: 'Dueños de Agencias y Empresas de Servicios B2B',
      description: 'Fundadores y directores de agencias de marketing, consultoras y empresas de servicios B2B con 5 a 30 colaboradores.',
      industry: 'Servicios Profesionales / Agencias',
      company_size: '5 - 30 empleados',
      revenue_range: '$10M - $100M CLP/mes',
      geography: 'Chile / LATAM',
      decision_maker: 'Fundador / Socio Director / CEO',
      job_titles: ['CEO', 'Fundador', 'Director Comercial', 'Gerente General'],
      main_problems: [
        'Pérdida de leads por respuestas tardías',
        'Falta de visibilidad de los estados de cotizaciones y cobros',
        'Carga operativa excesiva en tareas manuales'
      ],
      desired_outcomes: [
        'Pipeline ordenado con recordatorios automáticos',
        'Tiempos de respuesta menores a 5 minutos',
        'Mayor conversión y cobro puntual'
      ],
      buying_triggers: ['Contratación de nuevos ejecutivos', 'Pérdida de un cliente importante', 'Cuello de botella en ventas'],
      common_objections: ['Falta de tiempo para implementar', 'Miedo a que el equipo no use la herramienta'],
      awareness_level: 'problem_aware',
      urgency_level: 'high',
      budget_profile: 'premium_service',
      status: 'active',
    },
    {
      name: 'Clínicas y Centros de Salud / Estética',
      description: 'Centros médicos, clínicas dentales y centros de estética con múltiples profesionales y alta afluencia de consultas.',
      industry: 'Salud y Bienestar',
      company_size: '10 - 50 colaboradores',
      revenue_range: '$20M - $150M CLP/mes',
      geography: 'Chile / Región Metropolitana',
      decision_maker: 'Director Médico / Gerente de Operaciones',
      job_titles: ['Director Médico', 'Gerente de Administración', 'Directora Comercial'],
      main_problems: [
        'Alto volumen de WhatsApps sin respuesta oportuna',
        'Inasistencias a citas (No-Show)',
        'Sin trazabilidad de campañas publicitarias a pacientes atendidos'
      ],
      desired_outcomes: [
        'Agendamiento 24/7 automático',
        'Reducción de No-Shows con confirmación automatizada',
        'Cálculo exacto del ROAS por especialista'
      ],
      buying_triggers: ['Apertura de nueva sucursal', 'Baja en ocupación de sillones/horas médicas'],
      common_objections: ['Privacidad de datos de pacientes', 'Curva de aprendizaje del personal de recepción'],
      awareness_level: 'solution_aware',
      urgency_level: 'medium',
      budget_profile: 'mid_high',
      status: 'active',
    }
  ];

  const createdAvatars: any[] = [];
  for (const av of avatars) {
    const { data: existing } = await supabase.from('customer_profiles').select('id').eq('name', av.name).maybeSingle();
    if (existing) {
      createdAvatars.push(existing);
    } else {
      const { data: newCp, error: cpErr } = await supabase.from('customer_profiles').insert(av).select().single();
      if (!cpErr) createdAvatars.push(newCp);
    }
  }
  console.log(`✅ Avatares listos: ${createdAvatars.length}`);

  // 3. ENTRY OFFERS (Puertas de Entrada Comerciales)
  console.log('3. Creando Entry Offers (Marketing y Automatización)...');
  const offers = [
    {
      name: 'Automatización & CRM Inteligente',
      slug: 'automatizacion',
      description: 'Implementación llave en mano de CRM centralizado, flujos de seguimiento automatizados y paneles de control.',
      primary_customer_profile_id: createdAvatars[0]?.id || null,
      primary_problem: 'Seguimiento manual caótico y leads que se enfrían sin cerrar.',
      desired_outcome: 'Un sistema comercial automatizado que clasifica, contacta y hace seguimiento 24/7.',
      value_proposition: 'Multiplica por 3 la velocidad y conversión de tu equipo comercial sin contratar más personal.',
      super_promise: null, // Test fallback to agency_profiles.super_promise
      unique_mechanism: 'Pipeline IA Autónomo: Calificación instantánea + Nutrición WhatsApp/Email + Alertas de Cierre.',
      primary_cta: 'Agendar Sesión de Diagnóstico Comercial',
      qualification_message: 'Para empresas con al menos 1 persona en ventas y más de 30 prospectos mensuales.',
      priority: 1,
      status: 'active',
    },
    {
      name: 'Marketing de Adquisición Digital',
      slug: 'marketing',
      description: 'Estrategia integral de tráfico pagado (Meta/Google Ads), ganchos publicitarios y landing pages de alta conversión.',
      primary_customer_profile_id: createdAvatars[1]?.id || null,
      primary_problem: 'Falta de prospectos calificados y gasto en publicidad sin retorno medible.',
      desired_outcome: 'Flujo constante de pacientes y clientes calificados directo a tu equipo de ventas.',
      value_proposition: 'Atrae prospectos listos para comprar con campañas optimizadas por valor y atribución real.',
      super_promise: 'Generamos oportunidades comerciales calificadas con atribución peso a peso desde el anuncio hasta el cobro.',
      unique_mechanism: 'Adquisición Basada en Datos: Creatividades con Ganchos Psicológicos + Embudos Segmentados.',
      primary_cta: 'Ver Demo de Adquisición en Vivo',
      priority: 2,
      status: 'active',
    }
  ];

  const createdOffers: any[] = [];
  for (const off of offers) {
    const { data: existing } = await supabase.from('entry_offers').select('id').eq('slug', off.slug).maybeSingle();
    if (existing) {
      createdOffers.push(existing);
    } else {
      const { data: newOff, error: offErr } = await supabase.from('entry_offers').insert(off).select().single();
      if (!offErr) createdOffers.push(newOff);
    }
  }
  console.log(`✅ Entry Offers listas: ${createdOffers.length}`);

  // 4. VALUE MATRIX (Entry Offer + Services)
  console.log('4. Creando Matriz de Valor...');
  const { data: services } = await supabase.from('services').select('id, name, category');
  if (services && services.length > 0 && createdOffers.length > 0) {
    const autoOffer = createdOffers.find((o: any) => o.slug === 'automatizacion') || createdOffers[0];
    const crmService = services.find((s: any) => s.name.toLowerCase().includes('crm') || s.name.toLowerCase().includes('automatiz')) || services[0];

    const { data: existingMatrix } = await supabase
      .from('entry_offer_services')
      .select('id')
      .eq('entry_offer_id', autoOffer.id)
      .eq('service_id', crmService.id)
      .maybeSingle();

    if (!existingMatrix) {
      await supabase.from('entry_offer_services').insert({
        entry_offer_id: autoOffer.id,
        service_id: crmService.id,
        role: 'Core Entry Service',
        positioning: 'La columna vertebral operativa que habilita todo el crecimiento posterior.',
        deliverable: 'CRM completo configurado + embudo de ventas + automatizaciones de seguimiento WhatsApp/Email + capacitación.',
        problem_solved: 'Leads sin seguimiento, cotizaciones olvidadas y pérdida de trazabilidad de negocios.',
        real_value: 'Mayor conversión comercial y recuperación inmediata de horas semanales del equipo.',
        analogy: 'Un asistente comercial digital que nunca duerme, nunca olvida un lead y registra todo automáticamente.',
        value_anchor_min: 3.0,
        value_anchor_max: 10.0,
        value_justification: 'Un solo cliente adicional recuperado al mes o 20 horas de trabajo ahorradas pagan el sistema con creces.',
        typical_outcome: 'Aumento de 30% a 50% en tasa de contacto efectivo dentro de los primeros 14 días.',
        sales_notes: 'Enfatizar que no vendemos software, sino el proceso comercial llave en mano ya integrado.',
        active: true,
      });
      console.log('✅ Matriz de valor configurada para:', autoOffer.name, '+', crmService.name);
    }
  }

  // 5. MESSAGING FRAMEWORKS
  console.log('5. Creando Messaging Frameworks...');
  const { data: existingMf } = await supabase.from('messaging_frameworks').select('id').eq('name', 'Framework Adquisición & Automatización v1').maybeSingle();
  if (!existingMf && createdOffers[0]) {
    await supabase.from('messaging_frameworks').insert({
      name: 'Framework Adquisición & Automatización v1',
      entry_offer_id: createdOffers[0].id,
      main_message: 'Deja de perder clientes por falta de seguimiento. Convierte tu CRM en una máquina de ventas con IA.',
      problem_statement: 'El 70% de las ventas se pierden porque el primer contacto tarda más de una hora y no hay seguimiento sistemático.',
      desired_state: 'Cada prospecto es respondido en segundos, calificado automáticamente y asignado al ejecutivo correcto con recordatorios de cierre.',
      mechanism_message: 'Combinamos modelos de lenguaje para clasificar la intención de compra con flujos automáticos en Supabase.',
      credibility_message: 'Probado en más de 20 empresas de servicios con incrementos medibles en tasa de cierre.',
      risk_reversal: 'Garantía de puesta en marcha completa y capacitación sin interrumpir tus operaciones diarias.',
      urgency_message: 'Cada día sin automatización son oportunidades que tu competencia está cerrando.',
      hook_themes: ['Velocidad de respuesta', 'Costo de oportunidad', 'Eliminación del trabajo manual'],
      words_to_use: ['Sistema', 'Predictibilidad', 'Trazabilidad', 'Conversión', 'Tiempo de respuesta'],
      words_to_avoid: ['Complicado', 'Plataforma genérica', 'Magia'],
      version: 1,
      status: 'active',
    });
    console.log('✅ Messaging Framework creado.');
  }

  // 6. SALES PLAYBOOK & STEPS
  console.log('6. Creando Sales Playbook y Pasos...');
  const { data: existingPlaybook } = await supabase.from('sales_playbooks').select('id').eq('name', 'Playbook Comercial Canónico Método AI').maybeSingle();
  let playbookId = existingPlaybook?.id;
  if (!playbookId) {
    const { data: pb } = await supabase.from('sales_playbooks').insert({
      name: 'Playbook Comercial Canónico Método AI',
      description: 'Guía paso a paso para reuniones de diagnóstico comercial y cierre consultivo.',
      objective: 'Llevar al prospecto desde el diagnóstico de su dolor hasta el acuerdo de solución y valor.',
      version: 1,
      status: 'active',
    }).select('id').single();
    if (pb) playbookId = pb.id;
  }

  if (playbookId) {
    const steps = [
      {
        playbook_id: playbookId,
        step_order: 1,
        name: '1. Confianza',
        objective: 'Romper el hielo, alinear la agenda de la llamada y establecer el rol de consultor experto.',
        description: 'Breve introducción, validación del tiempo disponible y planteamiento del objetivo de la sesión.',
        questions: ['¿Qué te motivó a coordinar esta conversación hoy?', 'Para asegurar que aprovechemos el tiempo, ¿cuentas con 30 minutos?'],
        signals_to_detect: ['Tono receptivo', 'Interés en resolver un dolor puntual'],
        mistakes_to_avoid: ['Hablar de la agencia antes de escuchar al cliente', 'Hacer pitch en los primeros 5 minutos'],
      },
      {
        playbook_id: playbookId,
        step_order: 2,
        name: '2. Necesidades',
        objective: 'Descubrir el problema raíz, cuantificar el impacto económico y el costo de no resolverlo.',
        description: 'Preguntas abiertas sobre el proceso comercial actual, tiempos de respuesta y volumen de leads.',
        questions: [
          '¿Cuántos leads o cotizaciones reciben al mes aproximadamente?',
          '¿Qué pasa hoy cuando entra una solicitud fuera de horario o en fin de semana?',
          '¿Cuánto estimas que les cuesta en ventas no tener ese seguimiento al día?'
        ],
        signals_to_detect: ['Frustración con tareas manuales', 'Conciencia de pérdida de dinero'],
        mistakes_to_avoid: ['Asumir el problema sin dejar que el cliente lo exprese'],
      },
      {
        playbook_id: playbookId,
        step_order: 3,
        name: '3. Oferta',
        objective: 'Presentar la solución anclada exactamente en los dolores identificados en el paso 2.',
        description: 'Demostración enfocada únicamente en el mecanismo que resuelve su cuello de botella principal.',
        questions: ['¿Cómo cambiaría la operación si este flujo funcionara 100% automático desde la próxima semana?'],
        signals_to_detect: ['Preguntas sobre tiempos de implementación', 'Validación del entregable'],
        mistakes_to_avoid: ['Mostrar funciones técnicas irrelevantes para su caso'],
      },
      {
        playbook_id: playbookId,
        step_order: 4,
        name: '4. Cierre',
        objective: 'Presentar la estructura de inversión, validar ROI y acordar fecha de inicio.',
        description: 'Anclar la inversión contra el valor de 1 o 2 clientes adicionales y solicitar la decisión.',
        questions: ['En base a lo que vimos, ¿este enfoque resuelve lo que necesitas para comenzar?'],
        signals_to_detect: ['Preguntas sobre formas de pago o facturación'],
        mistakes_to_avoid: ['Titubear al decir el precio', 'Descontar sin justificación'],
      },
      {
        playbook_id: playbookId,
        step_order: 5,
        name: '5. Objeciones',
        objective: 'Aislar y resolver preocupaciones de precio, tiempo o adopción con empatía y evidencia.',
        description: 'Consultar la biblioteca de objeciones y responder utilizando costo de oportunidad y garantías.',
        questions: ['Además del presupuesto, ¿hay algún otro aspecto que te impida avanzar?'],
        signals_to_detect: ['Objeciones reales vs excusas de postergación'],
        mistakes_to_avoid: ['Ponerse a la defensiva', 'Discutir con el cliente'],
      },
      {
        playbook_id: playbookId,
        step_order: 6,
        name: '6. Seguimiento',
        objective: 'Definir el siguiente paso con fecha y hora exacta en el calendario.',
        description: 'Enviar minuta ejecutiva con dolor detectado, solución acordada y enlace de formalización.',
        questions: ['Quedamos entonces fijados para el viernes a las 11:00 hrs para revisar la orden de inicio, ¿correcto?'],
        signals_to_detect: ['Compromiso con fecha concreta'],
        mistakes_to_avoid: ['Dejar el siguiente paso abierto ("lo hablamos luego")'],
      }
    ];

    for (const st of steps) {
      const { data: existingStep } = await supabase
        .from('sales_playbook_steps')
        .select('id')
        .eq('playbook_id', playbookId)
        .eq('step_order', st.step_order)
        .maybeSingle();

      if (!existingStep) {
        await supabase.from('sales_playbook_steps').insert(st);
      }
    }
    console.log('✅ 6 Pasos del Playbook registrados.');
  }

  // 7. SALES OBJECTIONS LIBRARY
  console.log('7. Creando Biblioteca Estratégica de Objeciones...');
  const objections = [
    {
      name: 'Precio / Presupuesto elevado',
      category: 'price',
      objection_text: 'El servicio se sale de nuestro presupuesto actual o es más alto de lo esperado.',
      underlying_concern: 'El prospecto duda si recuperará la inversión rápidamente o compara con una herramienta de software simple.',
      recommended_response: 'Entiendo perfectamente. Miremos el costo de oportunidad: si hoy pierden 20 leads al mes y cerramos solo 2 adicionales con este sistema, el retorno mensual supera el costo total del servicio.',
      questions_to_ask: [
        '¿Cuánto vale para ustedes un cliente promedio en su ciclo de vida (LTV)?',
        '¿Cuántas ventas adicionales necesitarían para que esta inversión se pague sola?'
      ],
      responses_to_avoid: ['Bajar el precio de inmediato sin reducir alcance', 'Decir que somos los más baratos'],
      priority: 1,
      active: true,
    },
    {
      name: 'Falta de tiempo / Estamos muy ocupados',
      category: 'timing',
      objection_text: 'Nos interesa mucho pero ahora estamos con mucha carga y no tenemos tiempo para implementar.',
      underlying_concern: 'Miedo a que el proyecto demande muchas horas de su equipo y aumente su estrés actual.',
      recommended_response: 'Precisamente porque están saturados de trabajo es prioritario: nuestra implementación es llave en mano y solo requerimos 2 sesiones de 45 minutos. A partir de ahí, el sistema les devuelve 15 a 20 horas de trabajo a la semana.',
      questions_to_ask: ['¿Cuánto tiempo más pueden permitirse operar con esa sobrecarga antes de que afecte a sus clientes actuales?'],
      responses_to_avoid: ['Presionar sin empatizar con su carga actual'],
      priority: 2,
      active: true,
    },
    {
      name: 'Miedo a la adopción del equipo',
      category: 'implementation',
      objection_text: 'Hemos probado otros CRMs antes y la gente no los usa.',
      underlying_concern: 'Experiencias pasadas fallidas con herramientas complejas o falta de capacitación.',
      recommended_response: 'Es el error más común cuando se compra solo software. Nuestro enfoque incluye flujos intuitivos automatizados donde el equipo no tiene que llenar 50 campos manuales, además de capacitación guiada y soporte.',
      questions_to_ask: ['¿Por qué fallaron las herramientas anteriores? ¿Eran muy manuales o faltó acompañamiento?'],
      responses_to_avoid: ['Culpar al personal del cliente'],
      priority: 3,
      active: true,
    }
  ];

  for (const obj of objections) {
    const { data: existingObj } = await supabase.from('sales_objections').select('id').eq('name', obj.name).maybeSingle();
    if (!existingObj) {
      await supabase.from('sales_objections').insert(obj);
    }
  }
  console.log('✅ Biblioteca de objeciones lista.');

  console.log('\n🎉 Semilla de la Capa Estratégica completada con éxito.');
}

seedStrategy().catch(console.error);
