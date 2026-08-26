// ============================================================================
// MCP Streamable HTTP Server — 100% Stateless (Best for Claude Cowork / Remote)
// Each request creates a fresh McpServer+Transport pair. No sessions to expire.
// ============================================================================

import express from 'express';
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerTools } from './tools.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

// Full CORS for Claude Cowork
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: [
    'Content-Type', 'Authorization', 'x-session-id',
    'mcp-session-id', 'Accept', 'mcp-protocol-version'
  ]
}));

// Logger
app.use((req, _res, next) => {
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

const PORT = process.env.MCP_PORT || 3002;

// Fully stateless handler: new McpServer + Transport per request
// No session state stored → no "session expired" errors ever
const handleMcp = async (req: express.Request, res: express.Response) => {
  // Normalize Accept header
  const accept = req.headers.accept || '';
  if (!accept.includes('application/json') || !accept.includes('text/event-stream')) {
    req.headers['accept'] = 'application/json, text/event-stream';
  }

  // Strip any stale session ID so the transport always starts fresh
  delete req.headers['mcp-session-id'];

  const srv = new McpServer({ name: 'crm-ai', version: '1.0.0' });
  registerTools(srv);

  // sessionIdGenerator: undefined → stateless (no Mcp-Session-Id returned, no validation)
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await srv.connect(transport);

  try {
    await transport.handleRequest(req, res, req.body);
  } catch (err: any) {
    console.error('❌ Error handling MCP request:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  } finally {
    // Cleanup transport after response so there are no memory leaks
    try { await transport.close(); } catch { /* already closed */ }
  }
};

// Endpoints for Claude Cowork
app.all('/mcp', handleMcp);
app.all('/sse', handleMcp);
app.all('/', (req, res) => {
  if (req.method === 'POST' || (req.headers.accept && req.headers.accept.includes('text/event-stream'))) {
    return handleMcp(req, res);
  }
  res.json({
    status: 'ok',
    name: 'crm-ai-mcp',
    transport: 'streamable-http-stateless',
    endpoints: ['/mcp', '/sse'],
    tools_count: 27,
  });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'CRM AI MCP Server (Stateless)',
    tools_count: 27,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   🌐 CRM MCP Stateless Server — Claude Cowork Ready  ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  MCP URL:   http://localhost:${PORT}/mcp               ║`);
  console.log(`║  SSE URL:   http://localhost:${PORT}/sse               ║`);
  console.log(`║  Health:    http://localhost:${PORT}/health            ║`);
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('  ✅ 100% Stateless — sessions never expire');
  console.log('');
});
