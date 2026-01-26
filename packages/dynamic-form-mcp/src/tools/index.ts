/**
 * MCP Tools Registration
 *
 * Registers all available tools with the MCP server.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerValidateFormConfigTool } from './validate-form-config.tool.js';
import { registerGetFieldSchemaTool } from './get-field-schema.tool.js';

/**
 * Register all MCP tools
 */
export function registerTools(server: McpServer): void {
  registerValidateFormConfigTool(server);
  registerGetFieldSchemaTool(server);
}
