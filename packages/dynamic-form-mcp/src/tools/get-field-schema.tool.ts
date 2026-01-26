/**
 * Get Field Schema Tool
 *
 * MCP tool that returns the JSON Schema for field types.
 * Supports fetching schema for a specific field type (~25KB) or listing available types.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getFieldTypeJsonSchema, getSupportedFieldTypes, type UiIntegration, type FieldType } from '@ng-forge/dynamic-forms-zod/mcp';

const UI_INTEGRATIONS = ['material', 'bootstrap', 'primeng', 'ionic'] as const;
const FIELD_TYPES = [
  'input',
  'textarea',
  'select',
  'checkbox',
  'radio',
  'multi-checkbox',
  'toggle',
  'slider',
  'datepicker',
  'button',
  'submit',
  'next',
  'previous',
] as const;

export function registerGetFieldSchemaTool(server: McpServer): void {
  server.tool(
    'ngforge_get_field_schema',
    'Returns the JSON Schema for a specific field type, showing all supported properties. Use this to understand exactly what properties are available for input, select, checkbox, and other field types in a specific UI library. If fieldType is omitted, returns a list of available field types.',
    {
      uiIntegration: z.enum(UI_INTEGRATIONS).describe('UI library to get schema for (material, bootstrap, primeng, ionic)'),
      fieldType: z
        .enum(FIELD_TYPES)
        .optional()
        .describe('Specific field type to get schema for (e.g., input, select, checkbox). If omitted, returns list of available types.'),
    },
    async ({ uiIntegration, fieldType }) => {
      // If no fieldType specified, return list of available types
      if (!fieldType) {
        const types = getSupportedFieldTypes();
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  uiIntegration,
                  availableFieldTypes: types,
                  usage: 'Call this tool again with a specific fieldType to get its schema',
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      // Return schema for specific field type
      const schema = getFieldTypeJsonSchema(uiIntegration as UiIntegration, fieldType as FieldType);

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
