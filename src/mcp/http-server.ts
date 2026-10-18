// ============================================================================
// MCP Streamable HTTP Server — 100% Stateless (Best for Claude Cowork / Remote)
// Each request creates a fresh McpServer+Transport pair. No sessions to expire.
// ============================================================================

import express from 'express';
import cors from 'cors';
import { handleMcp } from './handler.js';
import { app as apiRouter } from '../api/server.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

// Mount REST API endpoints (/api/*, including /api/client-panel)
app.use(apiRouter);

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
