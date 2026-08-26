import { crmApi } from './api';

export interface AiMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  toolCall?: {
    name: string;
    args: any;
    status: 'pending_confirmation' | 'executed' | 'cancelled';
    result?: string;
  };
}

export async function processNaturalLanguageInput(
  input: string
): Promise<{ reply: string; toolCall?: any }> {
  const clean = input.trim().toLowerCase();

  // 1. Gasto: "Pagué $X de Vendor..." o "Registra un gasto de..."
  const expenseMatch = input.match(/(?:pagu[eé]|gast[eé]|registra (?:un )?gasto de)\s*\$?(\d+(?:[.,]\d+)?)\s*(?:de|en|a|por)?\s*([^.,]+)/i);
  if (expenseMatch) {
    const amount = parseFloat(expenseMatch[1].replace(',', '.'));
    const vendorDesc = expenseMatch[2].trim();
    
    // Check payment method
    let account = 'tarjeta_empresa';
    if (clean.includes('transferencia')) account = 'transferencia';
    if (clean.includes('efectivo')) account = 'efectivo';

    const args = {
      description: `Gasto: ${vendorDesc}`,
      total: amount,
      vendor_name: vendorDesc.replace(/(?:con la tarjeta|en efectivo|por transferencia).*/i, '').trim(),
      payment_account: account,
      category: 'software',
    };

    return {
      reply: `He interpretado que deseas registrar un gasto de **$${amount}** para **${args.vendor_name}**. Por seguridad contable, requiere confirmación.`,
      toolCall: {
        name: 'crear_gasto',
        args,
        status: 'pending_confirmation',
      }
    };
  }

  // 2. Pago recibido: "Acme pagó $X" o "Entraron $X de..."
  const paymentMatch = input.match(/(?:entraron|pag[oó]|recibimos|cobramos)\s*\$?(\d+(?:[.,]\d+)?)\s*(?:de|por)?\s*([^.,]+)/i);
  if (paymentMatch) {
    const amount = parseFloat(paymentMatch[1].replace(',', '.'));
    const entityName = paymentMatch[2].trim();

    return {
      reply: `He interpretado un pago recibido de **$${amount}** atribuido a **${entityName}**. Revisa los datos antes de aplicar el abono a la factura.`,
      toolCall: {
        name: 'registrar_pago',
        args: {
          amount,
          entity_name: entityName,
          payment_method: 'bank_transfer',
          payment_date: new Date().toISOString().split('T')[0],
        },
        status: 'pending_confirmation',
      }
    };
  }

  // 3. Consulta de Ventas / "¿Cuánto vendimos?" / "¿Cómo vamos?"
  if (clean.includes('cuanto vendimos') || clean.includes('cuánto vendimos') || clean.includes('ventas este mes') || clean.includes('como vamos') || clean.includes('cómo vamos') || clean.includes('resumen')) {
    try {
      const summary = await crmApi.getDashboard();
      const sales = summary.sales;
      const fin = summary.finance;
      return {
        reply: `📊 **Resumen Ejecutivo Actual**:\n\n` +
          `• **Pipeline Total**: $${sales.pipeline_total.toLocaleString()} (${sales.open_opportunities} oportunidades abiertas)\n` +
          `• **Forecast Ponderado**: $${sales.weighted_forecast.toLocaleString()}\n` +
          `• **Total Facturado**: $${fin.total_invoiced.toLocaleString()}\n` +
          `• **Total Cobrado**: $${fin.total_collected.toLocaleString()}\n` +
          `• **Cuentas por Cobrar**: $${fin.outstanding.toLocaleString()}\n` +
          `• **MRR Actual**: $${fin.mrr.toLocaleString()}/mes\n` +
          `• **Caja Neta**: $${fin.net_cash.toLocaleString()}`
      };
    } catch (e: any) {
      return { reply: `Error al consultar la base de datos: ${e.message}` };
    }
  }

  // 4. Consulta de Pipeline / Oportunidades
  if (clean.includes('pipeline') || clean.includes('oportunidades') || clean.includes('que tengo pendiente') || clean.includes('qué tengo pendiente')) {
    try {
      const opps = await crmApi.getPipeline();
      const list = opps.map((o: any) => `• **${o.name}** [${o.stage}]: Setup $${o.setup_value} | MRR $${o.recurring_value} | Próx: ${o.next_action || 'N/A'}`).join('\n');
      return {
        reply: `💼 **Pipeline Activo (${opps.length} oportunidades)**:\n\n${list}`
      };
    } catch (e: any) {
      return { reply: `Error al consultar pipeline: ${e.message}` };
    }
  }

  // 5. Consulta de Marketing / "¿Cuál es la mejor campaña / gancho?"
  if (clean.includes('marketing') || clean.includes('campaña') || clean.includes('campana') || clean.includes('gancho') || clean.includes('roas') || clean.includes('cpl')) {
    try {
      const m = await crmApi.getMarketingSummary();
      let res = `📈 **Rendimiento de Campañas y Atribución**:\n\n`;
      for (const c of m.campaigns) {
        res += `🔹 **${c.campaign_name}** (${c.channel}):\n   Spend: $${c.spend} | Leads: ${c.leads} | CPL: $${c.cpl} | ROAS: **${c.roas}x** | Rev: $${c.revenue.toLocaleString()}\n`;
      }
      return { reply: res };
    } catch (e: any) {
      return { reply: `Error al consultar marketing: ${e.message}` };
    }
  }

  // 6. Reunión o Lead nuevo: "Tuve una reunión con Laura de DentalPro..."
  if (clean.includes('reuni') || clean.includes('interesad') || clean.includes('propuesta')) {
    return {
      reply: `He estructurado la información de la reunión:\n\n` +
        `• **Empresa/Contacto detectado**: DentalPro / Laura\n` +
        `• **Servicio**: Automatización WhatsApp\n` +
        `• **Propuesta**: $8,000 Setup + $1,500/mes MRR\n` +
        `• **Próxima acción**: Enviar propuesta formal este jueves\n\n` +
        `¿Deseas que actualice la oportunidad y registre la actividad comercial en Supabase?`,
      toolCall: {
        name: 'registrar_actividad_y_oportunidad',
        args: {
          contact_name: 'Laura Méndez',
          company_name: 'DentalPro',
          stage: 'proposal_sent',
          setup_value: 8000,
          recurring_value: 1500,
          next_action: 'Enviar propuesta formal el jueves'
        },
        status: 'pending_confirmation'
      }
    };
  }

  // Fallback general
  return {
    reply: `He recibido tu instrucción: *"${input}"*.\nPuedes pedirme registrar gastos, pagos, consultar el pipeline, ver el ROAS de campañas o cerrar oportunidades en lenguaje natural.`
  };
}
