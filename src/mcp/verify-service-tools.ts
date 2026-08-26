// Verifica en vivo qué herramientas expone el servidor
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

  // 2. List tools
  const toolsRes = await fetch(BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })
  });
  const toolsData = await toolsRes.json();
  const tools = toolsData.result?.tools || [];
  
  console.log(`\n✅ Total tools expuestas: ${tools.length}\n`);
  
  const serviceTools = tools.filter((t: any) => t.name.includes('servicio'));
  console.log('--- Herramientas de servicios encontradas: ---');
  serviceTools.forEach((t: any) => {
    console.log(`• ${t.name}: ${t.description}`);
  });
}

verifyTools().catch(console.error);
