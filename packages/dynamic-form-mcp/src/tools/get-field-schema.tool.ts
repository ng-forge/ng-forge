/**
 * Get Field Schema Tool
 *
 * MCP tool that returns the JSON Schema for leaf fields,
 * showing all supported properties per field type for a UI library.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getLeafFieldJsonSchema, type UiIntegration } from '@ng-forge/dynamic-forms-zod/mcp';

const UI_INTEGRATIONS = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

export function registerGetFieldSchemaTool(server: McpServer): void {
  server.tool(
    'ngforge_get_field_schema',
    'Returns the JSON Schema for leaf fields, showing all supported properties per field type. Use this to understand exactly what properties are available for input, select, checkbox, and other field types in a specific UI library.',
    {
      uiIntegration: z.enum(UI_INTEGRATIONS).describe('UI library to get schema for (material, bootstrap, primeng, ionic)'),
    },
    async ({ uiIntegration }) => {
      const schema = getLeafFieldJsonSchema(uiIntegration as UiIntegration);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(schema, null, 2),
          },
        ],
      };
    },
  );
}
