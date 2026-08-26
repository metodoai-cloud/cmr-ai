import { registerTools } from './tools.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import dotenv from 'dotenv';
dotenv.config();

async function testAllTools() {
  console.log('Testing tool registration...');
  const srv = new McpServer({ name: 'test', version: '1.0' });
  registerTools(srv);
  console.log('Registered tools successfully.');
}

testAllTools();
