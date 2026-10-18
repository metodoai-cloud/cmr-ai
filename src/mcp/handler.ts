import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerTools } from './tools.js';

// Fully stateless handler: new McpServer + Transport per request
// No session state stored → no "session expired" errors ever
export const handleMcp = async (req: express.Request, res: express.Response) => {
  // Normalize Accept header
  const accept = req.headers.accept || '';
  if (!accept.includes('application/json') || !accept.includes('text/event-stream')) {
    req.headers['accept'] = 'application/json, text/event-stream';
  }

  // Strip any stale session ID so the transport always starts fresh
  delete req.headers['mcp-session-id'];

  let transport: StreamableHTTPServerTransport | null = null;
  try {
    const srv = new McpServer({ name: 'crm-ai', version: '1.0.0' });
    registerTools(srv);

    // sessionIdGenerator: undefined → stateless (no Mcp-Session-Id returned, no validation)
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    await srv.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err: any) {
    console.error('❌ Error handling MCP request:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  } finally {
    // Cleanup transport after response so there are no memory leaks
    if (transport) {
      try { await transport.close(); } catch { /* already closed */ }
    }
  }
};
