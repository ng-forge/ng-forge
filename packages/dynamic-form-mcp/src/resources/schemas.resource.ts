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

## Tools (4 total - consolidated)

**1. START HERE - One-shot reference:**
\`ngforge_get_cheatsheet(uiIntegration?)\`
- Property placement rules, condition syntax, copy-paste patterns, common errors
- Component API (template binding, event names)
- **Use this first** - it has 90% of what you need in one call

**2. Validation:**
\`ngforge_validate_form_config(uiIntegration, config)\`
- Validates config against actual TypeScript types
- Catches errors before runtime

**3. Field info + schema:**
\`ngforge_get_field_info(fieldType?, uiIntegration?, includeSchema?)\`
- Properties, validators, and examples for a specific field type
- Set includeSchema=true for JSON Schema (machine-readable)

**4. Examples + deep explanations:**
\`ngforge_get_example(pattern?, depth?)\`
- Patterns: complete, derivation, conditional, multi-page, validation
- depth="example" (default) = working code
- depth="deep" = conceptual explanation + code + edge cases
`,
        },
      ],
    };
  });
}
