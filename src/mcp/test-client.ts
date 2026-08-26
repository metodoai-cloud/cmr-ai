async function test() {
  const res = await fetch('http://localhost:3002/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'claude-cowork', version: '1.0' }
      }
    })
  });

  console.log('Status:', res.status);
  console.log('Headers:', Object.fromEntries(res.headers.entries()));
  const data = await res.text();
  console.log('Response body:', data);
}

test().catch(console.error);
