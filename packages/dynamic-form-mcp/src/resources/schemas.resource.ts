/** Schemas Resource */

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

## Tools (5 total - consolidated)

**1. START HERE - Documentation lookup:**
\`ngforge_lookup(topic, depth?, uiIntegration?)\`
- topic="workflow" for the recommended tool-usage guide
- Property placement rules, condition syntax, copy-paste patterns, common errors
- depth="brief|full|schema" (default full); uiIntegration filters schema output

**2. Search:**
\`ngforge_search(query)\`
- Free-text keyword search across all topics and examples
- Use when you don't know the exact topic name

**3. Validation:**
\`ngforge_validate(config, uiIntegration?)\`
- Validates config against actual TypeScript types
- Catches errors before runtime

**4. Examples:**
\`ngforge_examples(pattern, depth?)\`
- Patterns: complete, derivation, conditional, multi-page, validation
- depth controls how much detail (working code vs. deep explanation)

**5. Scaffold:**
\`ngforge_scaffold(fields?, pages?, arrays?, groups?, hidden?, uiIntegration?)\`
- Generates a compilable FormConfig skeleton
`,
        },
      ],
    };
  });
}
