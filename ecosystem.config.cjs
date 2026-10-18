module.exports = {
  apps: [
    {
      name: 'crm',
      script: 'npx',
      args: 'tsx src/index.ts',
      env: {
        NODE_ENV: 'production',
        PORT: 3005,
        API_PORT: 3005
      }
    },
    {
      name: 'crm-mcp',
      script: 'npx',
      args: 'tsx src/mcp/http-server.ts',
      env: {
        NODE_ENV: 'production',
        MCP_PORT: 3002
      }
    }
  ]
};
