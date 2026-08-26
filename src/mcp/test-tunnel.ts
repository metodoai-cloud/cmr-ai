async function testTunnel() {
  console.log('Testing public tunnel URL...');
  const res = await fetch('https://karma-psychiatry-fur-venice.trycloudflare.com/mcp', {
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
  const data = await res.text();
  console.log('Tunnel Response:', data);
}

testTunnel().catch(console.error);
