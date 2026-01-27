/**
 * MCP Tools Registration
 *
 * Registers all available tools with the MCP server.
 *
 * 8 tools organized by workflow:
 *
 * RECOMMENDED WORKFLOW:
 * 1. ngforge_quick_lookup topic="workflow" - See tool usage guide
 * 2. ngforge_quick_lookup topic="golden-path" - Get form structure templates
 * 3. ngforge_quick_lookup topic="<field-type>" - Get syntax for specific fields
 * 4. ngforge_validate_file - Validate your config (catches all errors)
 *
 * LEARN:
 * - ngforge_quick_lookup - RECOMMENDED: Focused lookup for specific topics
 * - ngforge_get_cheatsheet - Full reference (large response)
 * - ngforge_get_field_info - Deep dive into field types + placement rules
 * - ngforge_get_example - Working examples (use "complete" or "mega")
 * - ngforge_get_api_reference - Compact API reference (LLM-optimized)
 *
 * VALIDATE:
 * - ngforge_validate_file - Validate .ts files (RECOMMENDED)
 * - ngforge_validate_form_config - Validate JSON config
 * - ngforge_validate_field - Validate individual fields incrementally
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerValidateFormConfigTool } from './validate-form-config.tool.js';
import { registerValidateFileTool } from './validate-file.tool.js';
import { registerValidateFieldTool } from './validate-field.tool.js';
import { registerGetFieldInfoTool } from './get-field-info.tool.js';
import { registerGetExampleTool } from './get-example.tool.js';
import { registerGetCheatsheetTool } from './get-cheatsheet.tool.js';
import { registerQuickLookupTool } from './quick-lookup.tool.js';
import { registerGetApiReferenceTool } from './get-api-reference.tool.js';

/**
 * Register all MCP tools (8 total)
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

  // 5. API Reference - compact reference optimized for LLM parsing
  registerGetApiReferenceTool(server);

  // === VALIDATE ===

  // 6. Validate config - JSON config validation
  registerValidateFormConfigTool(server);

  // 7. Validate file - read and validate actual .ts files
  registerValidateFileTool(server);

  // 8. Validate field - incremental single-field validation
  registerValidateFieldTool(server);
}
