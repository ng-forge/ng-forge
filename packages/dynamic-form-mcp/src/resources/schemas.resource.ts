/**
 * Schemas Resource
 *
 * Provides a lightweight index pointing to tools for schema access.
 * Actual schemas are accessed via tools to control context size.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getSupportedFieldTypes } from '@ng-forge/dynamic-forms-zod/mcp';

const UI_INTEGRATIONS = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

export function registerSchemasResource(server: McpServer): void {
  // Single lightweight resource pointing to tools
  server.resource('ng-forge Schemas', 'ng-forge://schemas', async () => {
    const fieldTypes = getSupportedFieldTypes();

    return {
      contents: [
        {
          uri: 'ng-forge://schemas',
          mimeType: 'text/markdown',
          text: `# ng-forge Dynamic Forms Schema Reference

## UI Integrations
${UI_INTEGRATIONS.map((ui) => `- ${ui}`).join('\n')}

## Field Types
${fieldTypes.map((ft) => `- ${ft}`).join('\n')}

## Tools (Use These Instead of Resources)

**For human-readable field info:**
\`ngforge_get_field_info(fieldType?, uiIntegration?)\`
- Returns properties, validators, and examples (~600 tokens)

**For JSON Schema (when needed):**
\`ngforge_get_field_schema(uiIntegration, fieldType?)\`
- Returns machine-precise schema (~6,400 tokens per field type)

**For examples:**
\`ngforge_get_example(pattern?)\`
- Patterns: derivation, conditional, multi-page, validation, dynamic-options, nested-groups

**For feature explanations:**
\`ngforge_explain_feature(feature?)\`
- Features: derivation, hideWhen, showWhen, validation, logic, pages

**For validation:**
\`ngforge_validate_form_config(uiIntegration, config)\`
- Validates config against actual TypeScript types
`,
        },
      ],
    };
  });
}
