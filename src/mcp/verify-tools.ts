// Verifica en vivo qué herramientas expone el servidor y con qué esquema
async function verifyTools() {
  const BASE = 'https://karma-psychiatry-fur-venice.trycloudflare.com/mcp';
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream'
  };

  // 1. Initialize
  const initRes = await fetch(BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize',
      params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'verifier', version: '1.0' } }
    })
  });
  const sessionId = initRes.headers.get('mcp-session-id');
  console.log('Session ID:', sessionId);

  // 2. List tools
  const toolsRes = await fetch(BASE, {
    method: 'POST',
    headers: { ...headers, ...(sessionId ? { 'mcp-session-id': sessionId } : {}) },
    body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })
  });
  const toolsData = await toolsRes.json();
  const tools = toolsData.result?.tools || [];
  
  console.log(`\n✅ Total tools: ${tools.length}\n`);
  
  // Find actualizar_contacto and print its input schema
  const updateContact = tools.find((t: any) => t.name === 'actualizar_contacto');
  if (updateContact) {
    console.log('--- actualizar_contacto schema ---');
    console.log(JSON.stringify(updateContact.inputSchema?.properties, null, 2));
  }

  // Find registrar_actividad and print its schema
  const regActividad = tools.find((t: any) => t.name === 'registrar_actividad');
  if (regActividad) {
    console.log('\n--- registrar_actividad schema ---');
    console.log(JSON.stringify(regActividad.inputSchema?.properties, null, 2));
  }

  // Test registrar_actividad with minimal args
  console.log('\n--- Testing registrar_actividad ---');
  const testRes = await fetch(BASE, {
    method: 'POST',
    headers: { ...headers, ...(sessionId ? { 'mcp-session-id': sessionId } : {}) },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 3, method: 'tools/call',
      params: { name: 'registrar_actividad', arguments: { type: 'note', title: 'Prueba de actividad' } }
    })
  });
  const testData = await testRes.json();
  console.log('registrar_actividad result:', JSON.stringify(testData, null, 2));
}

verifyTools().catch(console.error);
