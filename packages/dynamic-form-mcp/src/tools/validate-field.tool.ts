/**
 * Validate Field Tool
 *
 * Validates a single field configuration.
 * Useful for incremental validation as you build forms.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { validateFormConfig, type UiIntegration } from '@ng-forge/dynamic-forms-zod/mcp';

const UI_INTEGRATIONS = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

export function registerValidateFieldTool(server: McpServer): void {
  server.tool(
    'ngforge_validate_field',
    'Validates a single field configuration. Useful for checking individual fields as you build them, without validating the entire form. Wraps the field in a minimal FormConfig for validation.',
    {
      uiIntegration: z.enum(UI_INTEGRATIONS).describe('UI library to validate against (material, bootstrap, primeng, ionic)'),
      field: z.object({}).passthrough().describe('The field configuration object to validate'),
    },
    async ({ uiIntegration, field }) => {
      // Wrap the field in a minimal FormConfig for validation
      const config = { fields: [field] };

      const result = validateFormConfig(uiIntegration as UiIntegration, config);

      // Extract field-specific errors (remove the "fields.0." prefix)
      const fieldErrors =
        result.errors?.map((error) => ({
          ...error,
          path: error.path.replace(/^fields\.0\.?/, '') || 'root',
        })) || [];

      const fieldKey = (field as Record<string, unknown>).key || 'unknown';
      const fieldType = (field as Record<string, unknown>).type || 'unknown';

      const lines: string[] = [];

      if (result.valid) {
        lines.push(`✅ **VALID** - Field "${fieldKey}" (type: ${fieldType})`);
        lines.push('');
        lines.push('This field configuration is valid and will compile correctly.');
      } else {
        lines.push(`❌ **INVALID** - Field "${fieldKey}" (type: ${fieldType})`);
        lines.push('');
        lines.push(`**Errors (${fieldErrors.length}):**`);
        lines.push('');

        for (const error of fieldErrors) {
          const pathDisplay = error.path === 'root' ? '(field root)' : error.path;
          lines.push(`- **${pathDisplay}:** ${error.message}`);
        }

        lines.push('');
        lines.push('**Tip:** Use `ngforge_quick_lookup` with the field type for syntax reference.');
      }

      return {
        content: [
          { type: 'text' as const, text: lines.join('\n') },
          {
            type: 'text' as const,
            text:
              '\n\n```json\n' +
              JSON.stringify(
                {
                  valid: result.valid,
                  fieldKey,
                  fieldType,
                  errors: fieldErrors,
                },
                null,
                2,
              ) +
              '\n```',
          },
        ],
      };
    },
  );
}
