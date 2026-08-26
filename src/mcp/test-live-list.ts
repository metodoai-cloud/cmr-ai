async function listServicesLive() {
  const BASE = 'https://karma-psychiatry-fur-venice.trycloudflare.com/mcp';
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream'
  };

  const res = await fetch(BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'tools/call',
      params: { name: 'listar_servicios', arguments: {} }
    })
  });
  const data = await res.json();
  console.log(data.result?.content?.[0]?.text);
}

listServicesLive().catch(console.error);
