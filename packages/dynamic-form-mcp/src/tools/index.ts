/**
 * MCP Tools Registration
 *
 * Registers all available tools with the MCP server.
 *
 * 4 tools with zero overlap, each serving a single clear purpose:
 *
 * | Tool              | Purpose        | One-liner               |
 * |-------------------|----------------|-------------------------|
 * | ngforge_lookup    | Documentation  | "Tell me about X"       |
 * | ngforge_examples  | Working code   | "Show me how to do X"   |
 * | ngforge_validate  | Verification   | "Is my config correct?" |
 * | ngforge_scaffold  | Generation     | "Generate a skeleton"   |
 *
 * RECOMMENDED WORKFLOW:
 * 1. ngforge_lookup topic="workflow" - See tool usage guide
 * 2. ngforge_lookup topic="golden-path" - Get form structure templates
 * 3. ngforge_lookup topic="<field-type>" - Get syntax for specific fields
 * 4. ngforge_validate - Validate your config (catches all errors)
 *
 * For working code examples:
 * - ngforge_examples pattern="complete" - Full multi-page form
 * - ngforge_examples pattern="minimal-conditional" - Minimal conditional example
 *
 * For generating skeletons:
 * - ngforge_scaffold pages=2 arrays=["contacts"] groups=["address"]
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerLookupTool } from './lookup.tool.js';
import { registerExamplesTool } from './examples.tool.js';
import { registerValidateTool } from './validate.tool.js';
import { registerScaffoldTool } from './scaffold.tool.js';

/**
 * Register all MCP tools (4 total)
 */
export function registerTools(server: McpServer): void {
  // 1. Lookup - unified documentation ("Tell me about X")
  registerLookupTool(server);

  // 2. Examples - working code patterns ("Show me how to do X")
  registerExamplesTool(server);

  // 3. Validate - unified validation ("Is my config correct?")
  registerValidateTool(server);

  // 4. Scaffold - skeleton generator ("Generate a skeleton for X")
  registerScaffoldTool(server);
}
