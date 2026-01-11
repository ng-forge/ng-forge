/**
 * Validate Form Config Tool
 *
 * MCP tool wrapper for form config validation.
 * The core validation logic is in ../core/validate-form-config.ts
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { validateFormConfig } from '../core/validate-form-config.js';
import type { FormConfig } from '../core/types.js';

export function registerValidateFormConfigTool(server: McpServer): void {
  server.tool(
    'validate_form_config',
    'Validates a FormConfig object and reports errors, warnings, and suggestions',
    {
      config: z.object({}).passthrough().describe('The FormConfig object to validate'),
    },
    async ({ config }) => {
      const result = validateFormConfig(config as FormConfig);

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
