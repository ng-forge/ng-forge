/**
 * Lookup Tool Tests
 *
 * Tests for the unified documentation lookup tool.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerLookupTool } from './lookup.tool.js';
import * as registry from '../registry/index.js';

describe('Lookup Tool', () => {
  let server: McpServer;
  let registeredTool: { name: string; handler: (args: Record<string, unknown>) => Promise<unknown> };

  beforeEach(() => {
    server = {
      tool: vi.fn((name, _description, _schema, handler) => {
        registeredTool = { name, handler };
      }),
    } as unknown as McpServer;

    registerLookupTool(server);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('registers tool with correct name', () => {
    expect(registeredTool.name).toBe('ngforge_lookup');
  });

  describe('topic list', () => {
    it('returns list of all topics when topic is "list"', async () => {
      const result = await registeredTool.handler({ topic: 'list' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Available Topics');
      expect(content).toContain('## Field Types');
      expect(content).toContain('## Containers');
      expect(content).toContain('## Concepts');
      expect(content).toContain('## Patterns');
    });
  });

  describe('field type topics', () => {
    it('returns brief input documentation', async () => {
      const result = await registeredTool.handler({ topic: 'input', depth: 'brief' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('input');
      expect(content).toContain('type:');
    });

    it('returns full input documentation', async () => {
      const result = await registeredTool.handler({ topic: 'input', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Input Field');
      expect(content).toContain('Validation shorthand');
      expect(content).toContain('Value Type');
    });

    it('returns select documentation with options warning', async () => {
      const result = await registeredTool.handler({ topic: 'select', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Select Field');
      expect(content).toContain('options');
      expect(content).toContain('AT FIELD LEVEL');
    });

    it('returns hidden field documentation', async () => {
      const result = await registeredTool.handler({ topic: 'hidden', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Hidden Field');
      expect(content).toContain('REQUIRED');
      expect(content).toContain('value');
      expect(content).toContain('FORBIDDEN');
    });

    it('returns slider documentation', async () => {
      const result = await registeredTool.handler({ topic: 'slider', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Slider Field');
      expect(content).toContain('minValue');
      expect(content).toContain('maxValue');
    });
  });

  describe('container topics', () => {
    it('returns group documentation', async () => {
      const result = await registeredTool.handler({ topic: 'group', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Group Container');
      expect(content).toContain('NO LABEL');
      expect(content).toContain('hidden');
    });

    it('returns row documentation', async () => {
      const result = await registeredTool.handler({ topic: 'row', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Row Container');
      expect(content).toContain('col');
    });

    it('returns array documentation', async () => {
      const result = await registeredTool.handler({ topic: 'array', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Array Container');
      expect(content).toContain('fields');
    });

    it('returns page documentation', async () => {
      const result = await registeredTool.handler({ topic: 'page', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Page Container');
      expect(content).toContain('next');
      expect(content).toContain('previous');
    });
  });

  describe('concept topics', () => {
    it('returns validation documentation', async () => {
      const result = await registeredTool.handler({ topic: 'validation', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Validation');
      expect(content).toContain('required');
      expect(content).toContain('validators');
    });

    it('returns conditional documentation', async () => {
      const result = await registeredTool.handler({ topic: 'conditional', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Conditional Visibility');
      expect(content).toContain('logic');
      expect(content).toContain('hidden');
    });

    it('returns derivation documentation', async () => {
      const result = await registeredTool.handler({ topic: 'derivation', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Value Derivation');
      expect(content).toContain('derivation:'); // Shorthand syntax
      expect(content).toContain('expression');
    });

    it('returns options-format documentation', async () => {
      const result = await registeredTool.handler({ topic: 'options-format', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Options Format');
      expect(content).toContain('label');
      expect(content).toContain('value');
    });
  });

  describe('pattern topics', () => {
    it('returns golden-path documentation', async () => {
      const result = await registeredTool.handler({ topic: 'golden-path', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Recommended Form Structures');
      expect(content).toContain('as const satisfies FormConfig');
    });

    it('returns pitfalls documentation', async () => {
      const result = await registeredTool.handler({ topic: 'pitfalls', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Common Pitfalls');
      expect(content).toContain('WRONG');
      expect(content).toContain('CORRECT');
    });

    it('returns multi-page-gotchas documentation', async () => {
      const result = await registeredTool.handler({ topic: 'multi-page-gotchas', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Multi-Page Form Gotchas');
      expect(content).toContain('Hidden Fields');
    });

    it('returns workflow documentation', async () => {
      const result = await registeredTool.handler({ topic: 'workflow', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Recommended MCP Workflow');
      expect(content).toContain('ngforge_lookup');
      expect(content).toContain('ngforge_validate');
    });
  });

  describe('topic aliases', () => {
    it('resolves textfield alias to input', async () => {
      const result = await registeredTool.handler({ topic: 'textfield', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Input Field');
    });

    it('resolves dropdown alias to select', async () => {
      const result = await registeredTool.handler({ topic: 'dropdown', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Select Field');
    });

    it('resolves wizard alias to page', async () => {
      const result = await registeredTool.handler({ topic: 'wizard', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Page Container');
    });

    it('resolves mistakes alias to pitfalls', async () => {
      const result = await registeredTool.handler({ topic: 'mistakes', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Common Pitfalls');
    });
  });

  describe('unknown topic', () => {
    it('returns error for unknown topic', async () => {
      const result = await registeredTool.handler({ topic: 'unknown-topic-xyz' });

      expect((result as { isError: boolean }).isError).toBe(true);
      const content = (result as { content: [{ text: string }] }).content[0].text;
      expect(content).toContain('not found');
      expect(content).toContain('Available topics');
    });
  });

  describe('case insensitivity', () => {
    it('handles uppercase topic', async () => {
      const result = await registeredTool.handler({ topic: 'INPUT', depth: 'brief' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('input');
    });

    it('handles mixed case topic', async () => {
      const result = await registeredTool.handler({ topic: 'Validation', depth: 'brief' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('required');
    });
  });

  describe('depth parameter', () => {
    it('returns brief content for depth=brief', async () => {
      const result = await registeredTool.handler({ topic: 'input', depth: 'brief' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      // Brief should be shorter
      expect(content.length).toBeLessThan(1000);
    });

    it('returns full content for depth=full', async () => {
      const result = await registeredTool.handler({ topic: 'input', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      // Full should be longer
      expect(content.length).toBeGreaterThan(500);
      expect(content).toContain('# Input Field');
    });

    it('defaults to full depth', async () => {
      const result = await registeredTool.handler({ topic: 'input' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Input Field');
    });

    it('returns JSON schema for depth=schema with uiIntegration for TOPICS field types', async () => {
      const result = await registeredTool.handler({ topic: 'input', depth: 'schema', uiIntegration: 'material' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      // Should contain full content plus JSON schema
      expect(content).toContain('# Input Field');
      expect(content).toContain('### JSON Schema');
      expect(content).toContain('"type"');
    });

    it('returns JSON schema for depth=schema with uiIntegration for select', async () => {
      const result = await registeredTool.handler({ topic: 'select', depth: 'schema', uiIntegration: 'bootstrap' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Select Field');
      expect(content).toContain('### JSON Schema');
    });

    it('returns JSON schema for slider with depth=schema', async () => {
      const result = await registeredTool.handler({ topic: 'slider', depth: 'schema', uiIntegration: 'primeng' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Slider Field');
      expect(content).toContain('### JSON Schema');
    });

    it('does not add JSON schema for non-supported field types', async () => {
      const result = await registeredTool.handler({ topic: 'validation', depth: 'schema', uiIntegration: 'material' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Validation');
      expect(content).not.toContain('### JSON Schema');
    });

    it('does not add JSON schema for schema depth without uiIntegration', async () => {
      const result = await registeredTool.handler({ topic: 'input', depth: 'schema' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Input Field');
      expect(content).not.toContain('### JSON Schema');
    });
  });

  describe('registry fallback for field types not in TOPICS', () => {
    it('returns field info from registry for multi-checkbox', async () => {
      const result = await registeredTool.handler({ topic: 'multi-checkbox', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('## multi-checkbox field');
      expect(content).toContain('**Category:** value');
      expect(content).toContain('**Validation Supported:**');
      expect(content).toContain('### Placement Rules');
      expect(content).toContain('### Full Example');
    });

    it('formats multi-checkbox with value type', async () => {
      const result = await registeredTool.handler({ topic: 'multi-checkbox', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('**Value Type:**');
      expect(content).toContain('T[]');
    });

    it('formats multi-checkbox with minimal example', async () => {
      const result = await registeredTool.handler({ topic: 'multi-checkbox', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('### Minimal Valid Example');
      expect(content).toContain('```typescript');
    });

    it('formats multi-checkbox with allowed placement rules', async () => {
      const result = await registeredTool.handler({ topic: 'multi-checkbox', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('**✅ Allowed in:**');
    });

    it('adds JSON schema for multi-checkbox with depth=schema and uiIntegration', async () => {
      const result = await registeredTool.handler({ topic: 'multi-checkbox', depth: 'schema', uiIntegration: 'material' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      // multi-checkbox goes through registry fallback, and depth=schema should add JSON schema
      expect(content).toContain('## multi-checkbox field');
      expect(content).toContain('### JSON Schema');
    });

    it('returns buttons topic for submit alias', async () => {
      // 'submit' is aliased to 'buttons' topic in TOPIC_ALIASES
      const result = await registeredTool.handler({ topic: 'submit', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Buttons');
    });

    it('returns buttons topic for next alias', async () => {
      // 'next' is aliased to 'buttons' topic in TOPIC_ALIASES
      const result = await registeredTool.handler({ topic: 'next', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Buttons');
    });

    it('returns array-buttons topic for addArrayItem alias', async () => {
      // 'addarrayitem' is aliased to 'array-buttons' topic
      const result = await registeredTool.handler({ topic: 'addArrayItem', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Array Buttons');
    });
  });

  describe('formatFieldInfoFull formatting', () => {
    it('formats field info with placement rules', async () => {
      // multi-checkbox is the only field type that goes through registry fallback
      const result = await registeredTool.handler({ topic: 'multi-checkbox', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('### Placement Rules');
      expect(content).toContain('**✅ Allowed in:**');
    });

    it('formats field info with minimal example when available', async () => {
      const result = await registeredTool.handler({ topic: 'multi-checkbox', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('### Minimal Valid Example');
      expect(content).toContain('```typescript');
    });

    it('formats field info with value type when available', async () => {
      const result = await registeredTool.handler({ topic: 'multi-checkbox', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('**Value Type:**');
    });

    it('formats field info with full example', async () => {
      const result = await registeredTool.handler({ topic: 'multi-checkbox', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('### Full Example');
      expect(content).toContain('```typescript');
      expect(content).toContain('interests');
    });

    it('does not include UI-specific properties when field has no adapter props', async () => {
      // multi-checkbox is in registry but doesn't have UI adapter-specific properties
      const result = await registeredTool.handler({ topic: 'multi-checkbox', depth: 'full', uiIntegration: 'material' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('## multi-checkbox field');
      expect(content).not.toContain('### UI-Specific Properties');
    });

    it('adds JSON schema for registry field types with depth=schema and uiIntegration', async () => {
      const result = await registeredTool.handler({ topic: 'toggle', depth: 'schema', uiIntegration: 'ionic' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      // toggle is in TOPICS, so it uses the TOPICS path which adds schema
      expect(content).toContain('# Toggle Field');
      expect(content).toContain('### JSON Schema');
    });

    it('formats multi-checkbox with description', async () => {
      const result = await registeredTool.handler({ topic: 'multi-checkbox', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('**Description:**');
      expect(content).toContain('Multiple checkbox group');
    });

    it('formats multi-checkbox with validation supported info', async () => {
      const result = await registeredTool.handler({ topic: 'multi-checkbox', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('**Validation Supported:** Yes');
    });
  });

  describe('registry field types with UI adapter info', () => {
    it('formats datepicker from registry with material UI properties', async () => {
      // datepicker is in TOPICS, so this will use the TOPICS path
      // Let's test that schema depth adds JSON schema for datepicker
      const result = await registeredTool.handler({ topic: 'datepicker', depth: 'schema', uiIntegration: 'material' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Datepicker Field');
      expect(content).toContain('### JSON Schema');
    });

    it('formats toggle from registry with ionic UI properties', async () => {
      const result = await registeredTool.handler({ topic: 'toggle', depth: 'schema', uiIntegration: 'ionic' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Toggle Field');
      expect(content).toContain('### JSON Schema');
    });

    it('formats checkbox from registry with material UI properties', async () => {
      const result = await registeredTool.handler({ topic: 'checkbox', depth: 'schema', uiIntegration: 'material' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Checkbox Field');
      expect(content).toContain('### JSON Schema');
    });
  });
});

describe('Lookup Tool with mocked registry', () => {
  let server: McpServer;
  let registeredTool: { name: string; handler: (args: Record<string, unknown>) => Promise<unknown> };

  beforeEach(() => {
    server = {
      tool: vi.fn((name, _description, _schema, handler) => {
        registeredTool = { name, handler };
      }),
    } as unknown as McpServer;

    registerLookupTool(server);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('formatFieldInfoFull edge cases', () => {
    it('formats container field (row type) with label note', async () => {
      // Mock getFieldType to return a row type container - isContainer check uses exact type match
      vi.spyOn(registry, 'getFieldType').mockReturnValue({
        type: 'row',
        category: 'container',
        description: 'Row container',
        props: {},
        validationSupported: false,
        source: 'core',
        example: '{ key: "row1", type: "row", fields: [] }',
      });

      const result = await registeredTool.handler({ topic: 'unknown-row-topic', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('## row field');
      expect(content).toContain('**⚠️ Note:** row fields do NOT have a `label` property.');
    });

    it('formats hidden field with important note', async () => {
      // Mock getFieldType to return a hidden field type
      vi.spyOn(registry, 'getFieldType').mockReturnValue({
        type: 'hidden',
        category: 'value',
        description: 'Hidden field',
        props: {},
        validationSupported: false,
        source: 'core',
        example: '{ key: "id", type: "hidden", value: "abc" }',
      });

      const result = await registeredTool.handler({ topic: 'unknown-hidden-topic', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('## hidden field');
      expect(content).toContain('**⚠️ IMPORTANT:** Hidden fields ONLY support:');
    });

    it('formats field with notAllowedIn placement rules', async () => {
      vi.spyOn(registry, 'getFieldType').mockReturnValue({
        type: 'test-field',
        category: 'value',
        description: 'Test field',
        props: {},
        validationSupported: true,
        source: 'core',
        allowedIn: ['top-level', 'page'],
        notAllowedIn: ['row', 'array'],
        example: '{ key: "test", type: "test-field" }',
      });

      const result = await registeredTool.handler({ topic: 'test-field-xyz', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('**❌ NOT allowed in:** row, array');
    });

    it('formats container field with canContain rules', async () => {
      vi.spyOn(registry, 'getFieldType').mockReturnValue({
        type: 'test-container',
        category: 'container',
        description: 'Test container',
        props: {},
        validationSupported: false,
        source: 'core',
        canContain: ['input', 'select', 'checkbox'],
        example: '{ key: "container", type: "test-container", fields: [] }',
      });

      const result = await registeredTool.handler({ topic: 'test-container-abc', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('**Can contain:** input, select, checkbox');
    });

    it('formats container field with cannotContain rules', async () => {
      vi.spyOn(registry, 'getFieldType').mockReturnValue({
        type: 'test-container',
        category: 'container',
        description: 'Test container',
        props: {},
        validationSupported: false,
        source: 'core',
        cannotContain: ['page', 'hidden'],
        example: '{ key: "container", type: "test-container", fields: [] }',
      });

      const result = await registeredTool.handler({ topic: 'test-container-def', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('**Cannot contain:** page, hidden');
    });

    it('formats field with UI-specific properties', async () => {
      // The UI adapter field type lookup uses resolvedTopic to find the matching field
      // So the adapter fieldTypes must have a type matching the topic we're looking up
      const testTopic = 'custom-ui-field';

      vi.spyOn(registry, 'getFieldType').mockReturnValue({
        type: testTopic,
        category: 'value',
        description: 'Custom input field',
        props: {},
        validationSupported: true,
        source: 'adapter',
        example: '{ key: "email", type: "custom-ui-field" }',
      });

      vi.spyOn(registry, 'getUIAdapter').mockReturnValue({
        library: 'material',
        package: '@ng-forge/dynamic-forms-material',
        providerFunction: 'withMaterialFields()',
        fieldTypes: [
          {
            type: testTopic, // Must match the topic being looked up
            componentName: 'CustomInputComponent',
            additionalProps: {
              appearance: {
                name: 'appearance',
                type: "'fill' | 'outline'",
                description: 'Material form field appearance',
                required: false,
                default: 'outline',
              },
              hint: {
                name: 'hint',
                type: 'string',
                description: 'Hint text below the field',
                required: false,
              },
            },
          },
        ],
      });

      const result = await registeredTool.handler({
        topic: testTopic,
        depth: 'full',
        uiIntegration: 'material',
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('### UI-Specific Properties');
      expect(content).toContain("`appearance`: 'fill' | 'outline' - Material form field appearance");
      expect(content).toContain('(default: "outline")');
      expect(content).toContain('`hint`: string - Hint text below the field');
    });

    it('formats group container field with all placement rule types', async () => {
      // Use 'group' type to trigger the container note (isContainer check)
      vi.spyOn(registry, 'getFieldType').mockReturnValue({
        type: 'group',
        category: 'container',
        description: 'Field with all placement rules',
        props: {},
        validationSupported: false,
        source: 'core',
        allowedIn: ['top-level', 'page', 'row'],
        notAllowedIn: ['group', 'array'],
        canContain: ['input', 'select'],
        cannotContain: ['page', 'group'],
        minimalExample: '{ key: "test", type: "group", fields: [] }',
        example: '{ key: "test", type: "group", fields: [{ key: "a", type: "input" }] }',
      });

      const result = await registeredTool.handler({ topic: 'unknown-group-topic', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('**✅ Allowed in:** top-level, page, row');
      expect(content).toContain('**❌ NOT allowed in:** group, array');
      expect(content).toContain('**Can contain:** input, select');
      expect(content).toContain('**Cannot contain:** page, group');
      expect(content).toContain('### Minimal Valid Example');
      expect(content).toContain('**⚠️ Note:** group fields do NOT have a `label` property.');
    });

    it('does not add JSON schema for unsupported registry field types with depth=schema', async () => {
      // Test the branch where depth=schema and uiIntegration is provided,
      // but the field type is NOT in SCHEMA_SUPPORTED_FIELD_TYPES
      vi.spyOn(registry, 'getFieldType').mockReturnValue({
        type: 'custom-unsupported',
        category: 'display',
        description: 'A field type not in schema supported list',
        props: {},
        validationSupported: false,
        source: 'core',
        example: '{ key: "test", type: "custom-unsupported" }',
      });

      const result = await registeredTool.handler({
        topic: 'custom-unsupported',
        depth: 'schema',
        uiIntegration: 'material',
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('## custom-unsupported field');
      expect(content).not.toContain('### JSON Schema');
    });
  });
});
