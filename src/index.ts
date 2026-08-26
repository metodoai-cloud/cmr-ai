// ============================================================================
// Main Entry Point — Starts the REST API server
// ============================================================================

import dotenv from 'dotenv';
dotenv.config();

import { app } from './api/server.js';

const PORT = process.env.API_PORT || process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║          🚀 CRM Inteligente — Backend API           ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  REST API:  http://localhost:${PORT}/api              ║`);
  console.log(`║  Health:    http://localhost:${PORT}/api/health        ║`);
  console.log(`║  Dashboard: http://localhost:${PORT}/api/dashboard     ║`);
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log('║  MCP Server: npm run mcp                            ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
});
