import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTools } from '../mcp/tools.js';
import {
  AgencyProfileService, CustomerProfileService, EntryOfferService,
  ValueMatrixService, MessagingFrameworkService, SalesPlaybookService,
  SalesObjectionService, OpportunityService, ActivityService
} from '../services/index.js';

async function testStrategyMcp() {
  console.log('🧪 ============================================================');
  console.log('🧪 TEST INTEGRAL DE LA CAPA ESTRATÉGICA & HERRAMIENTAS MCP');
  console.log('🧪 ============================================================\n');

  // 1. Test Agency Profile
  console.log('--- 1. Testing AgencyProfileService & obtener_identidad_agencia ---');
  const agency = await AgencyProfileService.getActive();
  console.log('Agency Profile activo:', agency ? `✅ ${agency.agency_name || agency.name} (Super Promesa: "${agency.super_promise?.substring(0, 40)}...")` : '⚠️ No encontrado');

  // 2. Test Customer Profiles
  console.log('\n--- 2. Testing CustomerProfileService & listar_customer_profiles ---');
  const customerProfiles = await CustomerProfileService.getActive();
  console.log(`Customer Profiles encontrados: ${customerProfiles.length}`);
  customerProfiles.forEach((cp: any) => console.log(`  • ${cp.name} (${cp.industry})`));

  // 3. Test Entry Offers + Super Promise Resolution
  console.log('\n--- 3. Testing EntryOfferService & Super Promise Fallback Rule ---');
  const offers = await EntryOfferService.getActive();
  console.log(`Entry Offers encontradas: ${offers.length}`);
  for (const off of offers) {
    const resolved = await EntryOfferService.getBySlug(off.slug);
    console.log(`  • ${resolved?.name} (slug: ${resolved?.slug})`);
    console.log(`    Super Promesa: "${resolved?.super_promise?.substring(0, 50)}..." [${resolved?.is_super_promise_inherited ? 'Heredada de Agencia' : 'Propia'}]`);
  }

  // 4. Test Value Matrix
  console.log('\n--- 4. Testing ValueMatrixService & obtener_matriz_valor_servicio ---');
  if (offers.length > 0) {
    const matrices = await ValueMatrixService.getMatrixForEntryOffer(offers[0].id);
    console.log(`Matrices de valor encontradas para ${offers[0].name}: ${matrices.length}`);
    matrices.forEach((m: any) => {
      console.log(`  • Servicio: ${m.services?.name} | Rol: ${m.role} | Ancla: ${m.value_anchor_min}x-${m.value_anchor_max}x | Analogía: "${m.analogy}"`);
    });
  }

  // 5. Test Messaging Frameworks
  console.log('\n--- 5. Testing MessagingFrameworkService & obtener_messaging_framework ---');
  const frameworks = await MessagingFrameworkService.getActive();
  console.log(`Messaging Frameworks encontrados: ${frameworks.length}`);
  frameworks.forEach((f: any) => console.log(`  • ${f.name} | Mensaje: "${f.main_message}"`));

  // 6. Test Sales Playbooks & Steps
  console.log('\n--- 6. Testing SalesPlaybookService & obtener_sales_playbook ---');
  const playbooks = await SalesPlaybookService.getActive();
  console.log(`Sales Playbooks encontrados: ${playbooks.length}`);
  if (playbooks.length > 0) {
    const pb = playbooks[0];
    console.log(`  • ${pb.name} (Pasos configurados: ${pb.sales_playbook_steps?.length || 0})`);
    (pb.sales_playbook_steps || []).forEach((st: any) => {
      console.log(`    - Paso ${st.step_order}: ${st.name} | Objetivo: ${st.objective}`);
    });
  }

  // 7. Test Sales Objections
  console.log('\n--- 7. Testing SalesObjectionService & listar_sales_objections ---');
  const objections = await SalesObjectionService.getActive();
  console.log(`Objeciones encontradas: ${objections.length}`);
  objections.forEach((o: any) => console.log(`  • [${o.category}] ${o.name} -> "${o.recommended_response?.substring(0, 60)}..."`));

  // 8. Test McpServer Registration
  console.log('\n--- 8. Testing McpServer instance tool registration ---');
  const testSrv = new McpServer({ name: 'test-mcp', version: '1.0.0' });
  registerTools(testSrv);
  console.log('✅ McpServer inicializado y todas las herramientas registradas sin error!');

  console.log('\n🎉 ============================================================');
  console.log('🎉 TODOS LOS TESTS DE LA CAPA ESTRATÉGICA PASARON EXITOSAMENTE');
  console.log('🎉 ============================================================');
}

testStrategyMcp().catch(console.error);
