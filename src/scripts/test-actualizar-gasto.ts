import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTools } from '../mcp/tools.js';
import { ExpenseService } from '../services/index.js';
import { ExpenseRepository } from '../repositories/index.js';
import { supabase } from '../db/connection.js';

async function runTests() {
  console.log('🧪 Iniciando pruebas de seguridad para actualizar_gasto...\n');

  // 1. Instanciar McpServer y verificar registro
  const server = new McpServer({ name: 'crm-ai-test', version: '1.0.0' });
  registerTools(server);

  // Comprobar que actualizar_gasto está registrado en el servidor MCP
  const registeredTools = (server as any)._registeredTools;
  if (!registeredTools || !registeredTools['actualizar_gasto']) {
    throw new Error('❌ La herramienta actualizar_gasto no se encuentra registrada en el McpServer');
  }
  console.log('✅ 1. Herramienta "actualizar_gasto" registrada correctamente en McpServer.');

  // Obtener handler de la herramienta
  const toolEntry = registeredTools['actualizar_gasto'];
  const executeTool = async (params: any) => {
    return await toolEntry.handler(params, {});
  };

  // 2. Probar filtro por ID en ExpenseRepository.findAll
  const repo = new ExpenseRepository();
  console.log('🔍 2. Verificando filtro por ID en ExpenseRepository.findAll...');

  // 3. Crear gasto de prueba exclusivo
  console.log('\n📝 Creando gasto de prueba seguro...');
  const testExpense = await ExpenseService.create({
    category: 'software',
    description: 'Test Gasto Inicial - MCP Verification',
    amount: 15500,
    date: '2026-10-18',
    vendor_name: 'Vendor Temporal Test',
    status: 'paid',
    payment_account: 'transferencia',
  }, 'mcp');

  console.log(`✅ Gasto de prueba creado con ID: ${testExpense.id}`);

  // Verificar que findAll({ id: testExpense.id }) filtra estrictamente
  const filteredById = await repo.findAll({ id: testExpense.id });
  if (filteredById.length !== 1 || filteredById[0].id !== testExpense.id) {
    throw new Error(`❌ Error en filtro por ID: se esperaban 1 resultado con ID ${testExpense.id}, se obtuvieron ${filteredById.length}`);
  }
  console.log('✅ Filtro WHERE id = :id en repositorio validado exitosamente.');

  try {
    // --- CASO 1: Actualizar categoría ---
    console.log('\n--- CASO 1: Actualizar categoría (con normalización "taxes" -> "Impuestos") ---');
    const res1 = await executeTool({
      id: testExpense.id,
      category: 'taxes',
    });
    const text1 = res1.content?.[0]?.text || '';
    console.log('Respuesta MCP Caso 1:\n', text1);

    if (!text1.includes('✅') || !text1.includes('Impuestos') || !text1.includes('Cambios realizados')) {
      throw new Error('❌ Caso 1 falló: no devolvió éxito o no normalizó a Impuestos');
    }
    // Verificar en BD
    const verify1 = await ExpenseService.getById(testExpense.id);
    if (verify1.category !== 'Impuestos') {
      throw new Error(`❌ Caso 1 falló en BD: categoría actual es ${verify1.category}, se esperaba Impuestos`);
    }
    console.log('✅ Caso 1 superado: categoría normalizada a "Impuestos" y persistida.');

    // --- CASO 2: Actualizar descripción ---
    console.log('\n--- CASO 2: Actualizar descripción ---');
    const newDesc = 'Descripción corregida de prueba por Claude Cowork';
    const res2 = await executeTool({
      id: testExpense.id,
      description: newDesc,
    });
    const text2 = res2.content?.[0]?.text || '';
    console.log('Respuesta MCP Caso 2:\n', text2);

    if (!text2.includes('✅') || !text2.includes(newDesc)) {
      throw new Error('❌ Caso 2 falló: no devolvió la descripción actualizada');
    }
    // Verificar en BD que los demás campos quedaron intactos
    const verify2 = await ExpenseService.getById(testExpense.id);
    if (verify2.description !== newDesc) {
      throw new Error(`❌ Caso 2 falló en BD: descripción no coincide`);
    }
    if (verify2.category !== 'Impuestos') {
      throw new Error(`❌ Caso 2 falló: campo previo (categoría Impuestos) fue alterado indebidamente`);
    }
    console.log('✅ Caso 2 superado: descripción actualizada y campos no modificados permanecieron intactos.');

    // --- CASO 3: ID inexistente ---
    console.log('\n--- CASO 3: ID inexistente ---');
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res3 = await executeTool({
      id: fakeId,
      category: 'Impuestos',
    });
    const text3 = res3.content?.[0]?.text || '';
    console.log('Respuesta MCP Caso 3:\n', text3);

    if (!text3.includes('❌') || !text3.includes('No se encontró')) {
      throw new Error('❌ Caso 3 falló: no devolvió error ante ID inexistente');
    }
    console.log('✅ Caso 3 superado: rechazo inmediato sin escritura ante ID inexistente.');

    // --- CASO 4: Sin campos a actualizar ---
    console.log('\n--- CASO 4: Sin campos a actualizar ---');
    const res4 = await executeTool({
      id: testExpense.id,
    });
    const text4 = res4.content?.[0]?.text || '';
    console.log('Respuesta MCP Caso 4:\n', text4);

    if (!text4.includes('❌') || !text4.includes('al menos un campo')) {
      throw new Error('❌ Caso 4 falló: no validó ausencia de campos');
    }
    console.log('✅ Caso 4 superado: rechazo ante ausencia de campos.');

  } finally {
    // Limpieza segura únicamente del gasto de prueba creado
    console.log('\n🧹 Limpiando gasto de prueba...');
    await supabase.from('expenses').delete().eq('id', testExpense.id);
    await supabase.from('audit_logs').delete().eq('entity_id', testExpense.id);
    if (testExpense.vendor_id) {
      await supabase.from('vendors').delete().eq('id', testExpense.vendor_id);
    }
    console.log('✅ Gasto de prueba eliminado.');
  }

  console.log('\n🎉 ¡TODAS LAS PRUEBAS DE SEGURIDAD PASARON EXITOSAMENTE!');
}

runTests().catch((err) => {
  console.error('\n❌ Error durante las pruebas:', err);
  process.exit(1);
});
