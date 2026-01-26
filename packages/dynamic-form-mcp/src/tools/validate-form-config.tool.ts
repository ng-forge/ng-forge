/**
 * Validate Form Config Tool
 *
 * MCP tool wrapper for form config validation using Zod schemas.
 * Delegates to @ng-forge/dynamic-forms-zod/mcp for actual validation.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { validateFormConfig, type UiIntegration } from '@ng-forge/dynamic-forms-zod/mcp';

const UI_INTEGRATIONS = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

export function registerValidateFormConfigTool(server: McpServer): void {
  server.tool(
    'ngforge_validate_form_config',
    'Validates a FormConfig against the actual TypeScript types for a specific UI library. Returns detailed error messages when validation fails, showing exactly which properties are invalid and what values are supported.',
    {
      uiIntegration: z.enum(UI_INTEGRATIONS).describe('UI library to validate against (material, bootstrap, primeng, ionic)'),
      config: z.object({}).passthrough().describe('The FormConfig object to validate'),
    },
    async ({ uiIntegration, config }) => {
      const result = validateFormConfig(uiIntegration as UiIntegration, config);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );
}
