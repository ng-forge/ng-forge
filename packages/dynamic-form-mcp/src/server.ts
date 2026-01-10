/**
 * MCP Server for ng-forge dynamic forms
 *
 * Provides AI assistants with tools and resources for:
 * - Field type discovery
 * - Form schema generation
 * - Validation configuration
 * - Expression building
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerResources } from './resources/index.js';
import { registerTools } from './tools/index.js';

const SERVER_NAME = 'ng-forge-mcp';
const SERVER_VERSION = '0.2.0';

/**
 * Create and configure the MCP server
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Register all resources
  registerResources(server);

  // Register all tools
  registerTools(server);

  return server;
}

/**
 * Run the MCP server with stdio transport
 */
export async function runStdioServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

export { SERVER_NAME, SERVER_VERSION };
