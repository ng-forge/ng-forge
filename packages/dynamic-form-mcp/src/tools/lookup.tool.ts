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
import { TOPICS, TOPIC_ALIASES, TOPIC_DESCRIPTIONS } from './data/lookup-topics.js';
import { fetchDocSection } from '../services/doc-fetcher.js';
import { getTopicSections } from '../services/topic-mapper.js';

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
function formatTopicItem(key: string): string {
  const desc = TOPIC_DESCRIPTIONS[key];
  return desc ? `- **${key}**: ${desc}` : `- **${key}**`;
}

function getTopicList(): string {
  const fieldTypes = ['input', 'select', 'slider', 'radio', 'checkbox', 'textarea', 'datepicker', 'toggle', 'text', 'hidden'];
  const containers = ['group', 'row', 'array', 'simplified-array', 'page'];
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
    'external-data',
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
${fieldTypes.map(formatTopicItem).join('\n')}

## Containers
${containers.map(formatTopicItem).join('\n')}

## Concepts
${concepts.map(formatTopicItem).join('\n')}

## Patterns & Rules
${patterns.map(formatTopicItem).join('\n')}

**Usage:** \`ngforge_lookup topic="<topic>" depth="brief|full|schema"\`

**Search:** \`ngforge_search query="your question"\` — find topics by keyword`;
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

/**
 * Try to fetch live documentation for a topic, falling back to hardcoded content.
 *
 * Resolution order:
 * 1. Map topic → section path(s) via topic-mapper
 * 2. If mapped, fetch live content from llms-full.txt
 * 3. If fetch fails or topic is MCP-only, use hardcoded TOPICS content
 * 4. If not in TOPICS, try field type registry
 */
async function resolveTopicContent(
  resolvedTopic: string,
  depth: 'brief' | 'full' | 'schema',
  uiIntegration?: (typeof UI_INTEGRATIONS)[number],
): Promise<string | null> {
  // For brief depth, always use hardcoded content (it's curated for brevity)
  if (depth === 'brief') {
    const topicContent = TOPICS[resolvedTopic];
    if (topicContent) {
      return topicContent.brief;
    }
  }

  // Try live documentation for full/schema depth
  if (depth !== 'brief') {
    const sectionPaths = getTopicSections(resolvedTopic);

    // sectionPaths is null for MCP-only topics, undefined for unknown topics
    if (sectionPaths && sectionPaths.length > 0) {
      const liveSections: string[] = [];

      for (const path of sectionPaths) {
        const section = await fetchDocSection(path);
        if (section) {
          liveSections.push(section);
        }
      }

      if (liveSections.length > 0) {
        let content = liveSections.join('\n\n---\n\n');
        content = appendJsonSchema(content, resolvedTopic, depth, uiIntegration);
        return content;
      }
    }
  }

  // Fall back to hardcoded TOPICS content
  const topicContent = TOPICS[resolvedTopic];
  if (topicContent) {
    let content = depth === 'brief' ? topicContent.brief : topicContent.full;
    content = appendJsonSchema(content, resolvedTopic, depth, uiIntegration);
    return content;
  }

  // Try field type registry as last resort
  const fieldInfo = getFieldType(resolvedTopic);
  if (fieldInfo) {
    let uiFieldType: UIAdapterFieldType | undefined;
    if (uiIntegration) {
      const adapter = getUIAdapter(uiIntegration);
      uiFieldType = adapter?.fieldTypes.find((ft) => ft.type === resolvedTopic);
    }

    let content = formatFieldInfoFull(fieldInfo, uiFieldType);
    content = appendJsonSchema(content, resolvedTopic, depth, uiIntegration);
    return content;
  }

  return null;
}

function appendJsonSchema(content: string, resolvedTopic: string, depth: string, uiIntegration?: string): string {
  if (depth === 'schema' && uiIntegration) {
    const fieldType = resolvedTopic as FieldType;
    if (SCHEMA_SUPPORTED_FIELD_TYPES.includes(fieldType as (typeof SCHEMA_SUPPORTED_FIELD_TYPES)[number])) {
      const schema = getFieldTypeJsonSchema(uiIntegration as UiIntegration, fieldType);
      content += `\n\n### JSON Schema\n\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\``;
    }
  }
  return content;
}

/**
 * Next-steps hints for topics.
 * Appended after content for full/schema depth to guide users to related tools and topics.
 */
const NEXT_STEPS: Record<string, string> = {
  // Field types → validate + related topics
  input:
    '**Next:** `ngforge_validate` to check your config · `ngforge_lookup topic="validation"` for validators · `ngforge_lookup topic="options-format"` if using select/radio',
  select:
    '**Next:** `ngforge_validate` to check your config · `ngforge_lookup topic="options-format"` for option syntax · `ngforge_lookup topic="property-derivation"` for dynamic options',
  slider: '**Next:** `ngforge_validate` to check your config · `ngforge_lookup topic="derivation"` for computed values',
  radio: '**Next:** `ngforge_validate` to check your config · `ngforge_lookup topic="options-format"` for option syntax',
  checkbox: '**Next:** `ngforge_validate` to check your config · `ngforge_lookup topic="validation"` for required checkbox',
  datepicker: '**Next:** `ngforge_validate` to check your config · `ngforge_lookup topic="property-derivation"` for dynamic min/max dates',
  hidden:
    '**Next:** `ngforge_lookup topic="multi-page-gotchas"` for hidden field placement · `ngforge_examples pattern="minimal-hidden"` for working example',
  // Containers
  group:
    '**Next:** `ngforge_lookup topic="field-placement"` for nesting rules · `ngforge_lookup topic="containers"` for all container types',
  row: '**Next:** `ngforge_lookup topic="field-placement"` for nesting rules · `ngforge_lookup topic="containers"` for all container types',
  array:
    '**Next:** `ngforge_lookup topic="simplified-array"` for the simpler API · `ngforge_lookup topic="array-buttons"` for button config · `ngforge_examples pattern="minimal-array"` for working example',
  'simplified-array':
    '**Next:** `ngforge_examples pattern="minimal-simplified-array"` for working example · `ngforge_lookup topic="array-buttons"` for button config',
  page: '**Next:** `ngforge_lookup topic="multi-page-gotchas"` for common pitfalls · `ngforge_examples pattern="minimal-multipage"` for working example',
  // Concepts
  validation:
    '**Next:** `ngforge_lookup topic="custom-validators"` for custom functions · `ngforge_lookup topic="validation-messages"` for error messages · `ngforge_lookup topic="async-validators"` for HTTP validators',
  'validation-messages':
    '**Next:** `ngforge_lookup topic="validation"` for validator types · `ngforge_lookup topic="custom-validators"` for custom validators',
  conditional:
    '**Next:** `ngforge_lookup topic="conditions"` for operator reference · `ngforge_lookup topic="logic-matrix"` for supported logic types · `ngforge_examples pattern="minimal-conditional"` for working example',
  derivation:
    '**Next:** `ngforge_lookup topic="expression-variables"` for available variables · `ngforge_lookup topic="common-expressions"` for expression recipes · `ngforge_examples pattern="derivation"` for working example',
  'property-derivation':
    '**Next:** `ngforge_lookup topic="derivation"` for value derivations · `ngforge_examples pattern="property-derivation"` for working example',
  'options-format': '**Next:** `ngforge_lookup topic="select"` or `ngforge_lookup topic="radio"` for field types that use options',
  'async-validators':
    '**Next:** `ngforge_lookup topic="validation"` for sync validators · `ngforge_lookup topic="custom-validators"` for custom functions',
  // Patterns
  'golden-path':
    '**Next:** `ngforge_examples pattern="complete"` for full working example · `ngforge_lookup topic="pitfalls"` for what to avoid',
  pitfalls: '**Next:** `ngforge_lookup topic="golden-path"` for recommended structures · `ngforge_validate` to check your config',
  'logic-matrix':
    '**Next:** `ngforge_lookup topic="conditional"` for condition syntax · `ngforge_lookup topic="derivation"` for derivation syntax',
  'field-placement': '**Next:** `ngforge_lookup topic="containers"` for container overview',
  conditions:
    '**Next:** `ngforge_lookup topic="conditional"` for full conditional logic docs · `ngforge_examples pattern="minimal-conditional"` for working example',
  workflow:
    '**Next:** `ngforge_lookup topic="golden-path"` for form structure templates · `ngforge_examples pattern="complete"` for a full working example',
};

/**
 * Get next-steps hint for a topic, if available.
 */
function getNextSteps(topic: string): string | undefined {
  return NEXT_STEPS[topic];
}

export function registerLookupTool(server: McpServer): void {
  server.tool(
    'ngforge_lookup',
    `DOCUMENTATION: Look up ng-forge Dynamic Forms topics - "Tell me about X"

⭐ START HERE: ngforge_lookup topic="workflow" — tool usage guide and recommended flow

Recommended starting topics:
- workflow: Tool usage guide (START HERE for new sessions)
- golden-path: Recommended form structures
- pitfalls: Common mistakes and solutions

Field types: input, select, slider, radio, checkbox, textarea, datepicker, toggle, text, hidden

Containers: group, row, array, simplified-array, page

Concepts: validation, conditional, derivation, property-derivation, options-format, expression-variables, async-validators

Patterns: field-placement, logic-matrix, context-api, containers, multi-page-gotchas

Use topic="list" to see all available topics with descriptions.
Use ngforge_search query="your question" to find topics by keyword.`,
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

      // Try live documentation first, then fall back to hardcoded content
      let content = await resolveTopicContent(resolvedTopic, depth, uiIntegration);
      if (content) {
        // Append next-steps hints for full/schema depth
        if (depth !== 'brief') {
          const nextSteps = getNextSteps(resolvedTopic);
          if (nextSteps) {
            content += `\n\n---\n\n${nextSteps}`;
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
