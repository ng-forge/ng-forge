/**
 * Unified Lookup Tool
 *
 * Consolidated documentation tool that absorbs:
 * - quick-lookup.tool.ts (primary content source)
 * - get-field-info.tool.ts (field documentation + placement rules)
 * - get-api-reference.tool.ts (logic-matrix, context-api content)
 * - get-cheatsheet.tool.ts (comprehensive reference)
 * - get-field-schema.tool.ts (JSON schema for depth=schema)
 *
 * Single tool for "Tell me about X"
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getFieldType, getFieldTypes, getUIAdapter, type FieldTypeInfo, type UIAdapterFieldType } from '../registry/index.js';
import { getFieldTypeJsonSchema, type UiIntegration, type FieldType } from '@ng-forge/dynamic-forms-zod/mcp';
import { TOPICS, TOPIC_ALIASES } from './data/lookup-topics.js';

const UI_INTEGRATIONS = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

// Field types that support JSON Schema generation
const SCHEMA_SUPPORTED_FIELD_TYPES = [
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

/**
 * Get all available topics grouped by category.
 */
function getTopicList(): string {
  const fieldTypes = ['input', 'select', 'slider', 'radio', 'checkbox', 'textarea', 'datepicker', 'toggle', 'text', 'hidden'];
  const containers = ['group', 'row', 'array', 'page'];
  const concepts = [
    'validation',
    'validation-messages',
    'conditional',
    'derivation',
    'property-derivation',
    'options-format',
    'expression-variables',
    'async-validators',
    'buttons',
  ];
  const patterns = [
    'golden-path',
    'multi-page-gotchas',
    'pitfalls',
    'field-placement',
    'logic-matrix',
    'context-api',
    'containers',
    'array-buttons',
    'custom-validators',
    'conditions',
    'common-expressions',
    'type-narrowing',
    'workflow',
  ];

  return `# Available Topics

## Field Types
${fieldTypes.join(', ')}

## Containers
${containers.join(', ')}

## Concepts
${concepts.join(', ')}

## Patterns & Rules
${patterns.join(', ')}

**Usage:** \`ngforge_lookup topic="<topic>" depth="brief|full|schema"\``;
}

/**
 * Format field info with placement rules (from get-field-info.tool.ts).
 */
function formatFieldInfoFull(field: FieldTypeInfo, uiFieldType?: UIAdapterFieldType): string {
  const lines: string[] = [];
  const isContainer = ['row', 'group', 'array', 'page'].includes(field.type);
  const isHidden = field.type === 'hidden';

  lines.push(`## ${field.type} field`);
  lines.push('');
  lines.push(`**Category:** ${field.category}`);
  lines.push(`**Description:** ${field.description}`);
  if (field.valueType) {
    lines.push(`**Value Type:** ${field.valueType}`);
  }
  lines.push(`**Validation Supported:** ${field.validationSupported ? 'Yes' : 'No'}`);

  // Placement rules
  lines.push('');
  lines.push('### Placement Rules');
  if (field.allowedIn && field.allowedIn.length > 0) {
    lines.push(`**✅ Allowed in:** ${field.allowedIn.join(', ')}`);
  }
  if (field.notAllowedIn && field.notAllowedIn.length > 0) {
    lines.push(`**❌ NOT allowed in:** ${field.notAllowedIn.join(', ')}`);
  }
  if (field.canContain && field.canContain.length > 0) {
    lines.push(`**Can contain:** ${field.canContain.join(', ')}`);
  }
  if (field.cannotContain && field.cannotContain.length > 0) {
    lines.push(`**Cannot contain:** ${field.cannotContain.join(', ')}`);
  }

  // Minimal example
  if (field.minimalExample) {
    lines.push('');
    lines.push('### Minimal Valid Example');
    lines.push('```typescript');
    lines.push(field.minimalExample);
    lines.push('```');
  }

  // Special notes
  if (isContainer) {
    lines.push('');
    lines.push(`**⚠️ Note:** ${field.type} fields do NOT have a \`label\` property.`);
  }
  if (isHidden) {
    lines.push('');
    lines.push('**⚠️ IMPORTANT:** Hidden fields ONLY support: `key`, `type`, `value`, `className`');
  }

  // UI-specific properties
  if (uiFieldType && Object.keys(uiFieldType.additionalProps).length > 0) {
    lines.push('');
    lines.push('### UI-Specific Properties');
    for (const prop of Object.values(uiFieldType.additionalProps)) {
      const defaultVal = prop.default !== undefined ? ` (default: ${JSON.stringify(prop.default)})` : '';
      lines.push(`- \`${prop.name}\`: ${prop.type} - ${prop.description}${defaultVal}`);
    }
  }

  // Example
  lines.push('');
  lines.push('### Full Example');
  lines.push('```typescript');
  lines.push(field.example);
  lines.push('```');

  return lines.join('\n');
}

export function registerLookupTool(server: McpServer): void {
  server.tool(
    'ngforge_lookup',
    `DOCUMENTATION: Look up ng-forge Dynamic Forms topics - "Tell me about X"

Recommended starting topics:
- workflow: Tool usage guide
- golden-path: Recommended form structures
- pitfalls: Common mistakes and solutions

Field types: input, select, slider, radio, checkbox, textarea, datepicker, toggle, text, hidden

Containers: group, row, array, page

Concepts: validation, conditional, derivation, property-derivation, options-format, expression-variables, async-validators

Patterns: field-placement, logic-matrix, context-api, containers, multi-page-gotchas

Use topic="list" to see all available topics.`,
    {
      topic: z
        .string()
        .describe(
          'Topic to look up: field types (input, select, hidden, group, row, array, page), concepts (validation, conditional, derivation, property-derivation, options-format), patterns (golden-path, pitfalls, multi-page-gotchas), or "list" to see all topics',
        ),
      depth: z
        .enum(['brief', 'full', 'schema'])
        .default('full')
        .describe('brief=quick syntax (~20 lines), full=complete docs with examples, schema=include JSON schema'),
      uiIntegration: z
        .enum(UI_INTEGRATIONS)
        .optional()
        .describe('Filter UI-specific info (only with depth=schema). material, bootstrap, primeng, ionic'),
    },
    async ({ topic, depth, uiIntegration }) => {
      const normalizedTopic = topic.toLowerCase().trim();

      // Special case: list all topics
      if (normalizedTopic === 'list') {
        return {
          content: [{ type: 'text' as const, text: getTopicList() }],
        };
      }

      // Check for alias
      const resolvedTopic = TOPIC_ALIASES[normalizedTopic] || normalizedTopic;

      // Check if it's a known topic
      const topicContent = TOPICS[resolvedTopic];

      if (topicContent) {
        let content = depth === 'brief' ? topicContent.brief : topicContent.full;

        // For schema depth, try to add JSON schema for field types
        if (depth === 'schema' && uiIntegration) {
          const fieldType = resolvedTopic as FieldType;
          if (SCHEMA_SUPPORTED_FIELD_TYPES.includes(fieldType as (typeof SCHEMA_SUPPORTED_FIELD_TYPES)[number])) {
            const schema = getFieldTypeJsonSchema(uiIntegration as UiIntegration, fieldType);
            content += `\n\n### JSON Schema\n\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\``;
          }
        }

        return {
          content: [{ type: 'text' as const, text: content }],
        };
      }

      // Try to find field type info from registry
      const fieldInfo = getFieldType(resolvedTopic);
      if (fieldInfo) {
        let uiFieldType: UIAdapterFieldType | undefined;
        if (uiIntegration) {
          const adapter = getUIAdapter(uiIntegration);
          uiFieldType = adapter?.fieldTypes.find((ft) => ft.type === resolvedTopic);
        }

        let content = formatFieldInfoFull(fieldInfo, uiFieldType);

        // Add JSON schema for schema depth
        if (depth === 'schema' && uiIntegration) {
          const fieldType = resolvedTopic as FieldType;
          if (SCHEMA_SUPPORTED_FIELD_TYPES.includes(fieldType as (typeof SCHEMA_SUPPORTED_FIELD_TYPES)[number])) {
            const schema = getFieldTypeJsonSchema(uiIntegration as UiIntegration, fieldType);
            content += `\n\n### JSON Schema\n\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\``;
          }
        }

        return {
          content: [{ type: 'text' as const, text: content }],
        };
      }

      // Topic not found
      const availableTopics = Object.keys(TOPICS).sort().join(', ');
      const fieldTypes = getFieldTypes()
        .map((t) => t.type)
        .join(', ');

      return {
        content: [
          {
            type: 'text' as const,
            text: `Topic "${topic}" not found.

**Available topics:** ${availableTopics}

**Field types:** ${fieldTypes}

**Tip:** Try "list" to see all topics grouped by category.`,
          },
        ],
        isError: true,
      };
    },
  );
}
