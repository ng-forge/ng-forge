/** MCP Tools Registration */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerLookupTool } from './lookup.tool.js';
import { registerExamplesTool } from './examples.tool.js';
import { registerValidateTool } from './validate.tool.js';
import { registerScaffoldTool } from './scaffold.tool.js';
import { registerSearchTool } from './search.tool.js';

/** Register all MCP tools (5 total) */
export function registerTools(server: McpServer): void {
  // 1. Lookup - unified documentation ("Tell me about X")
  registerLookupTool(server);

  // 2. Examples - working code patterns ("Show me how to do X")
  registerExamplesTool(server);

  // 3. Validate - unified validation ("Is my config correct?")
  registerValidateTool(server);

  // 4. Scaffold - skeleton generator ("Generate a skeleton for X")
  registerScaffoldTool(server);

  // 5. Search - keyword discovery ("Find topics about X")
  registerSearchTool(server);
}
