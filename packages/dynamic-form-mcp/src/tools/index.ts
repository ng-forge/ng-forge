/**
 * MCP Tools Registration
 *
 * Registers all available tools with the MCP server.
 *
 * 7 tools organized by workflow:
 *
 * LEARN:
 * 1. ngforge_get_cheatsheet - Full reference (start here for overview)
 * 2. ngforge_quick_lookup - Focused lookup for specific topics
 * 3. ngforge_get_field_info - Deep dive into field types + optional JSON schema
 * 4. ngforge_get_example - Working examples + deep explanations
 *
 * VALIDATE:
 * 5. ngforge_validate_form_config - Validate JSON config
 * 6. ngforge_validate_file - Validate actual .ts files directly
 * 7. ngforge_validate_field - Validate individual fields incrementally
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerValidateFormConfigTool } from './validate-form-config.tool.js';
import { registerValidateFileTool } from './validate-file.tool.js';
import { registerValidateFieldTool } from './validate-field.tool.js';
import { registerGetFieldInfoTool } from './get-field-info.tool.js';
import { registerGetExampleTool } from './get-example.tool.js';
import { registerGetCheatsheetTool } from './get-cheatsheet.tool.js';
import { registerQuickLookupTool } from './quick-lookup.tool.js';

/**
 * Register all MCP tools (7 total)
 */
export function registerTools(server: McpServer): void {
  // === LEARN ===

  // 1. Cheatsheet - the recommended starting point (comprehensive reference)
  registerGetCheatsheetTool(server);

  // 2. Quick Lookup - focused topic lookup (avoids wall of text)
  registerQuickLookupTool(server);

  // 3. Field info - deep dive into specific field types (includes optional JSON schema)
  registerGetFieldInfoTool(server);

  // 4. Examples - working code with optional deep explanations
  registerGetExampleTool(server);

  // === VALIDATE ===

  // 5. Validate config - JSON config validation
  registerValidateFormConfigTool(server);

  // 6. Validate file - read and validate actual .ts files
  registerValidateFileTool(server);

  // 7. Validate field - incremental single-field validation
  registerValidateFieldTool(server);
}
