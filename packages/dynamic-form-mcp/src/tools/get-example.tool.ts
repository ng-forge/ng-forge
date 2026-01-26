/**
 * Get Example Tool
 *
 * Returns example form configurations for common patterns.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getDoc, getDocsByCategory, type DocTopic } from '../registry/index.js';

const PATTERN_MAPPINGS: Record<string, string[]> = {
  derivation: ['dynamic-behavior-value-derivation-basics', 'value-derivation'],
  conditional: ['dynamic-behavior-conditional-logic-overview', 'age-conditional-form'],
  'multi-page': ['paginated-form'],
  validation: ['user-registration'],
  'dynamic-options': ['contact-dynamic-fields'],
  'nested-groups': ['shipping-billing-address', 'business-account-form'],
  i18n: ['dynamic-behavior-i18n'],
  submission: ['dynamic-behavior-submission'],
};

const PATTERNS = Object.keys(PATTERN_MAPPINGS) as Array<keyof typeof PATTERN_MAPPINGS>;

function formatDocTopic(doc: DocTopic): string {
  return `# ${doc.title}\n\n${doc.content}`;
}

export function registerGetExampleTool(server: McpServer): void {
  server.tool(
    'ngforge_get_example',
    'Returns example form configurations for common patterns like derivation, conditional visibility, multi-page forms, validation, etc. Use this to see working examples of specific features.',
    {
      pattern: z
        .enum(PATTERNS as unknown as [string, ...string[]])
        .optional()
        .describe(
          'Pattern to get examples for: derivation, conditional, multi-page, validation, dynamic-options, nested-groups, i18n, submission. If omitted, lists available patterns.',
        ),
    },
    async ({ pattern }) => {
      // If no pattern specified, list available patterns
      if (!pattern) {
        const lines: string[] = [
          '# Available Example Patterns',
          '',
          '## derivation',
          'Automatically compute field values based on other fields (calculated fields, auto-fill)',
          '',
          '## conditional',
          'Show/hide fields based on conditions (hideWhen, showWhen)',
          '',
          '## multi-page',
          'Wizard-style multi-step forms with page navigation',
          '',
          '## validation',
          'Form validation patterns including custom validators',
          '',
          '## dynamic-options',
          'Dynamically populate select/radio options',
          '',
          '## nested-groups',
          'Nested form groups for complex data structures',
          '',
          '## i18n',
          'Internationalization and translation support',
          '',
          '## submission',
          'Form submission handling and events',
          '',
          'Use `ngforge_get_example` with a specific pattern for detailed examples.',
        ];

        return {
          content: [{ type: 'text' as const, text: lines.join('\n') }],
        };
      }

      // Get docs for the pattern
      const docIds = PATTERN_MAPPINGS[pattern];

      if (!docIds || docIds.length === 0) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `No examples found for pattern: "${pattern}". Available patterns: ${PATTERNS.join(', ')}`,
            },
          ],
          isError: true,
        };
      }

      // Fetch and combine relevant docs
      const docs: DocTopic[] = [];
      for (const id of docIds) {
        const doc = getDoc(id);
        if (doc) {
          docs.push(doc);
        }
      }

      if (docs.length === 0) {
        // Fall back to category search
        const categoryDocs = getDocsByCategory('examples');
        const matchingDocs = categoryDocs.filter(
          (d) => d.title.toLowerCase().includes(pattern.toLowerCase()) || d.content.toLowerCase().includes(pattern.toLowerCase()),
        );

        if (matchingDocs.length > 0) {
          docs.push(...matchingDocs.slice(0, 2));
        }
      }

      if (docs.length === 0) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Documentation for "${pattern}" not found. This pattern may not have examples yet.`,
            },
          ],
          isError: true,
        };
      }

      // Return the first (most relevant) doc
      const content = docs.map(formatDocTopic).join('\n\n---\n\n');

      return {
        content: [{ type: 'text' as const, text: content }],
      };
    },
  );
}
