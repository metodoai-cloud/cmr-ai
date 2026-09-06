// ============================================================================
// MCP Server — Model Context Protocol for Claude Integration (Stdio & Export)
// Exposes CRM & Strategic tools via unified tools registry
// ============================================================================

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from './tools.js';
import dotenv from 'dotenv';
dotenv.config();

export const server = new McpServer({
  name: 'crm-ai',
  version: '1.0.0',
});

// Register all CRM and Strategy Layer tools
registerTools(server);

// ============================================================================
// START SERVER (Stdio for local Claude Desktop)
// ============================================================================
import { fileURLToPath } from 'url';

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🤖 CRM MCP Server running on stdio');
}
