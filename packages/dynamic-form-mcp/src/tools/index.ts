/**
 * MCP Tools Registration
 *
 * Registers all available tools with the MCP server.
 *
 * Consolidated to 4 tools:
 * 1. ngforge_get_cheatsheet - One-shot reference (start here)
 * 2. ngforge_validate_form_config - Validation against actual TypeScript types
 * 3. ngforge_get_field_info - Field details + optional JSON schema
 * 4. ngforge_get_example - Working examples + deep explanations
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerValidateFormConfigTool } from './validate-form-config.tool.js';
import { registerGetFieldInfoTool } from './get-field-info.tool.js';
import { registerGetExampleTool } from './get-example.tool.js';
import { registerGetCheatsheetTool } from './get-cheatsheet.tool.js';

/**
 * Register all MCP tools (4 total - consolidated for clarity)
 */
export function registerTools(server: McpServer): void {
  // 1. Cheatsheet - the recommended starting point (90% of what you need)
  registerGetCheatsheetTool(server);

  // 2. Validation - catches errors before runtime
  registerValidateFormConfigTool(server);

  // 3. Field info - deep dive into specific field types (includes optional JSON schema)
  registerGetFieldInfoTool(server);

  // 4. Examples - working code with optional deep explanations
  registerGetExampleTool(server);
}
