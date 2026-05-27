/** Unified Lookup Tool */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  getAddonKind,
  getAddonKinds,
  getFieldType,
  getFieldTypes,
  getUIAdapter,
  getWrapper,
  getWrappers,
  type AddonKindInfo,
  type FieldTypeInfo,
  type UIAdapterFieldType,
  type WrapperInfo,
} from '../registry/index.js';
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

/** Get all available topics grouped by category. */
function formatTopicItem(key: string): string {
  const desc = TOPIC_DESCRIPTIONS[key];
  return desc ? `- **${key}**: ${desc}` : `- **${key}**`;
}

function getTopicList(): string {
  const fieldTypes = ['input', 'select', 'slider', 'radio', 'checkbox', 'textarea', 'datepicker', 'toggle', 'text', 'hidden'];
  const containers = ['group', 'row', 'array', 'simplified-array', 'page'];
  const wrappers = ['wrappers', ...getWrappers().map((w) => w.type)];
  const addons = ['addons', ...getAddonKinds().map((k) => k.kind)];
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

## Wrappers
${wrappers.map(formatTopicItem).join('\n')}

## Addons
${addons.map(formatTopicItem).join('\n')}

## Concepts
${concepts.map(formatTopicItem).join('\n')}

## Patterns & Rules
${patterns.map(formatTopicItem).join('\n')}

**Usage:** \`ngforge_lookup topic="<topic>" depth="brief|full|schema"\`

**Search:** \`ngforge_search query="your question"\` — find topics by keyword`;
}

/** Format field info with placement rules (from get-field-info.tool.ts). */
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

/** Format a single wrapper registry entry. */
function formatWrapperInfo(wrapper: WrapperInfo): string {
  const lines: string[] = [];
  lines.push(`# ${wrapper.type} wrapper`);
  lines.push('');
  lines.push(`**Category:** ${wrapper.category}`);
  lines.push(`**Availability:** ${wrapper.availability}`);
  lines.push(`**Package:** \`${wrapper.package}\``);
  lines.push(`**Component:** \`${wrapper.componentName}\``);
  lines.push(`**Description:** ${wrapper.description}`);

  if (wrapper.availability === 'demo-only') {
    lines.push('');
    lines.push(
      '> **Note:** This is a demo wrapper that ships with the docs sandbox, not a library primitive. Use it as a pattern/template and author your own wrapper (or copy the component out of `internal/examples-shared-ui/src/lib/demo-wrappers/`) when adopting the idea in production.',
    );
  }

  if (wrapper.autoAppliesTo.length > 0) {
    lines.push('');
    lines.push(`**Auto-applies to:** ${wrapper.autoAppliesTo.join(', ')}`);
    lines.push(
      '_(Injected automatically into these field types. Can be overridden via `FormConfig.defaultWrappers` or per-field `wrappers: [...]`; clear entirely with `wrappers: null`.)_',
    );
  } else {
    lines.push('');
    lines.push("**Auto-applies to:** _(none — opt-in via the field's `wrappers` array)_");
  }

  if (Object.keys(wrapper.props).length > 0) {
    lines.push('');
    lines.push('### Config Props');
    for (const prop of Object.values(wrapper.props)) {
      const req = prop.required ? ' **(required)**' : '';
      const def = prop.default !== undefined ? ` (default: ${JSON.stringify(prop.default)})` : '';
      lines.push(`- \`${prop.name}\`: ${prop.type}${req}${def} — ${prop.description}`);
    }
  } else {
    lines.push('');
    lines.push('### Config Props');
    lines.push('_(none — no configurable inputs on this wrapper)_');
  }

  if (wrapper.minimalExample) {
    lines.push('');
    lines.push('### Minimal Config');
    lines.push('```typescript');
    lines.push(wrapper.minimalExample);
    lines.push('```');
  }

  lines.push('');
  lines.push('### Full Example');
  lines.push('```typescript');
  lines.push(wrapper.example);
  lines.push('```');

  lines.push('');
  lines.push('### Authoring Contract');
  lines.push(wrapper.contract);

  return lines.join('\n');
}

/**
 * Format a combined overview of all registered wrappers.
 * Used when the lookup topic is "wrappers" (plural / meta-topic).
 */
function formatWrappersOverview(): string {
  const wrappers = getWrappers();
  const lines: string[] = [];

  lines.push('# Wrappers');
  lines.push('');
  lines.push(
    'Wrappers decorate the rendered output of a field (or container) without changing the form data structure. They are composed as a chain: each wrapper exposes a `#fieldComponent` `ViewContainerRef` slot where the next wrapper — or the field itself — is rendered.',
  );
  lines.push('');
  lines.push('## Applying a wrapper');
  lines.push('');
  lines.push('```typescript');
  lines.push(`// Per-field wrapper chain (outer-most first)
{
  key: 'email',
  type: 'input',
  label: 'Email',
  wrappers: [
    { type: 'section', title: 'Account' }, // outer
    { type: 'css', cssClasses: 'pad-lg' }   // inner
  ]
}

// Form-level defaults applied to every field
const config = {
  defaultWrappers: [{ type: 'css', cssClasses: 'field-default' }],
  fields: [...]
} as const satisfies FormConfig;

// Clear all wrappers on a specific field (overrides defaults + auto)
{ key: 'id', type: 'hidden', value: 'abc', wrappers: null }`);
  lines.push('```');
  lines.push('');
  lines.push('## Registered Wrappers');
  lines.push('');

  for (const w of wrappers) {
    const flag = w.availability === 'demo-only' ? ' _(demo-only)_' : '';
    lines.push(`- **${w.type}** (${w.category}, \`${w.package}\`)${flag} — ${w.description.split('.')[0]}.`);
  }

  lines.push('');
  lines.push('Use `ngforge_lookup topic="<name>"` for full details on any individual wrapper.');

  lines.push('');
  lines.push('## Authoring Contract');
  lines.push('');
  lines.push(wrappers[0]?.contract ?? '');

  return lines.join('\n');
}

/** Format a single addon-kind registry entry. */
function formatAddonInfo(addon: AddonKindInfo, depth: 'brief' | 'full' | 'schema'): string {
  if (depth === 'brief') {
    return [
      `# ${addon.kind} addon`,
      '',
      `${addon.description.split('.')[0]}.`,
      '',
      '```typescript',
      addon.minimalExample,
      '```',
      addon.jsonSafe ? '' : '**Code-only** — dropped by the lenient validator when the config came from JSON.',
    ]
      .filter(Boolean)
      .join('\n');
  }

  const lines: string[] = [];
  lines.push(`# ${addon.kind} addon`);
  lines.push('');
  lines.push(`**Category:** ${addon.category}`);
  lines.push(`**Package:** \`${addon.package}\``);
  if (addon.adapter) lines.push(`**Adapter:** ${addon.adapter}`);
  lines.push(`**JSON-safe:** ${addon.jsonSafe ? 'Yes' : 'No (code-only)'}`);
  lines.push(`**Description:** ${addon.description}`);

  if (Object.keys(addon.props).length > 0) {
    lines.push('');
    lines.push('## Config Props');
    for (const prop of Object.values(addon.props)) {
      const req = prop.required ? ' **(required)**' : '';
      lines.push(`- \`${prop.name}\`: ${prop.type}${req} — ${prop.description}`);
    }
  }

  lines.push('');
  lines.push('## Minimal Example');
  lines.push('```typescript');
  lines.push(addon.minimalExample);
  lines.push('```');

  lines.push('');
  lines.push('## Full Example');
  lines.push('```typescript');
  lines.push(addon.example);
  lines.push('```');

  return lines.join('\n');
}

/** List every registered addon kind grouped by core vs adapter. */
function formatAddonsOverview(): string {
  const kinds = getAddonKinds();
  const lines: string[] = [];

  lines.push('# Addons');
  lines.push('');
  lines.push(
    'Addons render inside a field slot — icons, buttons, inline text, custom templates, or custom components. Multiple addons in the same slot render left-to-right (mirrored in RTL). `hidden` and `disabled` are reactive (signals, observables, or `FormStateCondition`).',
  );
  lines.push('');
  lines.push('## Applying an addon');
  lines.push('');
  lines.push('```typescript');
  lines.push(`{
  key: 'q',
  type: 'input',
  label: 'Search',
  addons: [
    { slot: 'prefix', kind: 'mat-icon', icon: 'search', ariaLabel: 'Search' },
    { slot: 'suffix', kind: 'mat-button', icon: 'close', ariaLabel: 'Clear', preset: 'clear' },
  ],
}`);
  lines.push('```');
  lines.push('');
  lines.push('## Registered Kinds');
  lines.push('');

  const core = kinds.filter((k) => k.category === 'core');
  const adapter = kinds.filter((k) => k.category === 'adapter');

  if (core.length > 0) {
    lines.push('### Core (universal — ship from `@ng-forge/dynamic-forms`)');
    for (const k of core) {
      const json = k.jsonSafe ? '' : ' _(code-only)_';
      lines.push(`- **${k.kind}**${json} — ${k.description.split('.')[0]}.`);
    }
    lines.push('');
  }

  if (adapter.length > 0) {
    lines.push('### Adapter (provided by UI integration packages)');
    for (const k of adapter) {
      lines.push(`- **${k.kind}** (${k.adapter}, \`${k.package}\`) — ${k.description.split('.')[0]}.`);
    }
    lines.push('');
  }

  lines.push('Use `ngforge_lookup topic="<kind>"` (e.g., `mat-button`, `pi-icon`) for full details on any individual addon kind.');

  lines.push('');
  lines.push('## Click variants (mutually exclusive on button-like addons)');
  lines.push('');
  lines.push('- `preset`: built-in semantics — `clear` / `reset` / `paste` / `copy` / `toggle-password-visibility`.');
  lines.push('- `actionRef`: named handler resolved via `provideAddonActions({ ... })`.');
  lines.push('- `action`: inline function (code-only, dropped by JSON validator).');
  lines.push('');
  lines.push('Setting more than one logs a warning and applies the first (precedence: `preset` > `actionRef` > `action`).');

  return lines.join('\n');
}

/** Try to fetch live documentation for a topic, falling back to hardcoded content. */
async function resolveTopicContent(
  resolvedTopic: string,
  depth: 'brief' | 'full' | 'schema',
  uiIntegration?: (typeof UI_INTEGRATIONS)[number],
): Promise<string | null> {
  // Addon meta-topic: list every registered addon kind
  if (resolvedTopic === 'addons' || resolvedTopic === 'addon' || resolvedTopic === 'addon-kinds') {
    if (depth === 'brief') {
      const kinds = getAddonKinds();
      return [
        '**Addons** render inside a field slot (prefix / suffix / adapter-specific): icons, buttons, inline text, templates, components.',
        '',
        'Registered kinds:',
        ...kinds.map((k) => `- \`${k.kind}\` (${k.category}${k.adapter ? `, ${k.adapter}` : ''})${k.jsonSafe ? '' : ' — code-only'}`),
        '',
        'Use `addons: [{ slot: "suffix", kind: "<kind>", ... }]` on an addon-supporting field. See `ngforge_lookup topic="addons"` for full docs.',
      ].join('\n');
    }
    return formatAddonsOverview();
  }

  // Addon-specific kind lookup (e.g., `mat-button`, `bs-icon`, `pi-button`, `ion-button`).
  // Skipped when the kind name collides with a higher-priority topic (text, template,
  // component are also field-type/wrapper concepts elsewhere — addon kind lookup falls
  // through to those existing handlers).
  const addonInfo = getAddonKind(resolvedTopic);
  const collidesWithFieldOrWrapper = resolvedTopic === 'text' || !!getWrapper(resolvedTopic);
  if (addonInfo && !collidesWithFieldOrWrapper) {
    return formatAddonInfo(addonInfo, depth);
  }

  // Wrapper meta-topic: list every registered wrapper
  if (resolvedTopic === 'wrappers' || resolvedTopic === 'wrapper') {
    if (depth === 'brief') {
      const wrappers = getWrappers();
      return [
        "**Wrappers** decorate a field's rendered output without changing form data.",
        '',
        'Registered:',
        ...wrappers.map((w) => `- \`${w.type}\` (${w.category}${w.availability === 'demo-only' ? ', demo-only' : ''})`),
        '',
        'Use `wrappers: [{ type: "css", cssClasses: "..." }]` on any field. See `ngforge_lookup topic="wrappers"` for the full overview.',
      ].join('\n');
    }
    return formatWrappersOverview();
  }

  // Wrapper-specific topic (e.g., "css", "arraySection", "section")
  const wrapperInfo = getWrapper(resolvedTopic);
  if (wrapperInfo) {
    const formatted = formatWrapperInfo(wrapperInfo);
    if (depth === 'brief') {
      // Brief: just the header + description + minimal example
      const lines = [
        `# ${wrapperInfo.type} wrapper`,
        '',
        `${wrapperInfo.description.split('.')[0]}.`,
        '',
        '```typescript',
        wrapperInfo.minimalExample ?? `{ type: '${wrapperInfo.type}' }`,
        '```',
      ];
      if (wrapperInfo.availability === 'demo-only') {
        lines.push('');
        lines.push(`**Demo-only** — ships from \`${wrapperInfo.package}\`, not \`@ng-forge/dynamic-forms\`.`);
      }
      return lines.join('\n');
    }
    return formatted;
  }

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
  // Wrappers
  wrappers:
    '**Next:** `ngforge_lookup topic="css"` for the shipping CSS wrapper · `ngforge_lookup topic="section"` or `ngforge_lookup topic="arraySection"` for demo wrappers · `ngforge_examples pattern="wrapper-array-actions"` for a working array-section example',
  css: '**Next:** `ngforge_lookup topic="wrappers"` for the full wrapper overview · `ngforge_lookup topic="field-placement"` for where wrappers can apply',
  arraySection:
    '**Next:** `ngforge_lookup topic="wrappers"` for the wrapper overview · `ngforge_lookup topic="array"` for array field docs · `ngforge_lookup topic="array-buttons"` for the button-field alternative',
  section:
    '**Next:** `ngforge_lookup topic="wrappers"` for the wrapper overview · `ngforge_lookup topic="css"` for the shipping CSS wrapper',
};

/** Get next-steps hint for a topic, if available. */
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

Wrappers: wrappers (overview), css (shipping), section, arraySection (demo-only)

Addons: addons (overview), text, template, component (core), mat-icon, mat-button, bs-icon, bs-button, pi-icon, pi-button, ion-icon, ion-button

Concepts: validation, conditional, derivation, property-derivation, options-format, expression-variables, async-validators

Patterns: field-placement, logic-matrix, context-api, containers, multi-page-gotchas

Use topic="list" to see all available topics with descriptions.
Use ngforge_search query="your question" to find topics by keyword.`,
    {
      topic: z
        .string()
        .describe(
          'Topic to look up: field types (input, select, hidden, group, row, array, page), wrappers (wrappers, css, section, arraySection), concepts (validation, conditional, derivation, property-derivation, options-format), patterns (golden-path, pitfalls, multi-page-gotchas), or "list" to see all topics',
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
