/**
 * Scaffold Tool Tests
 *
 * Tests for the FormConfig skeleton generator tool.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerScaffoldTool } from './scaffold.tool.js';

describe('Scaffold Tool', () => {
  let server: McpServer;
  let registeredTool: { name: string; handler: (args: Record<string, unknown>) => Promise<unknown> };

  beforeEach(() => {
    server = {
      tool: vi.fn((name, _description, _schema, handler) => {
        registeredTool = { name, handler };
      }),
    } as unknown as McpServer;

    registerScaffoldTool(server);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('registers tool with correct name', () => {
    expect(registeredTool.name).toBe('ngforge_scaffold');
  });

  describe('single-page forms', () => {
    it('generates basic single-page form', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        fields: ['name:input', 'email:input'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('Single-page form');
      expect(content).toContain('import { FormConfig }');
      expect(content).toContain("key: 'name'");
      expect(content).toContain("type: 'input'");
      expect(content).toContain("key: 'email'");
      expect(content).toContain("type: 'submit'");
      expect(content).toContain('as const satisfies FormConfig');
    });

    it('generates form with select field', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        fields: ['country:select'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("key: 'country'");
      expect(content).toContain("type: 'select'");
      expect(content).toContain('options');
      expect(content).toContain("{ label: 'Option 1', value: 'opt1' }");
    });

    it('generates form with radio field', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        fields: ['agree:radio'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("key: 'agree'");
      expect(content).toContain("type: 'radio'");
      expect(content).toContain('options');
    });

    it('generates form with checkbox field', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        fields: ['subscribe:checkbox'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("key: 'subscribe'");
      expect(content).toContain("type: 'checkbox'");
    });

    it('generates form with textarea field', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        fields: ['bio:textarea'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("key: 'bio'");
      expect(content).toContain("type: 'textarea'");
      expect(content).toContain('rows: 4');
    });

    it('generates form with datepicker field', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        fields: ['birthday:datepicker'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("key: 'birthday'");
      expect(content).toContain("type: 'datepicker'");
    });

    it('generates form with slider field', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        fields: ['rating:slider'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("key: 'rating'");
      expect(content).toContain("type: 'slider'");
      expect(content).toContain('minValue: 0');
      expect(content).toContain('maxValue: 100');
    });

    it('generates form with toggle field', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        fields: ['darkMode:toggle'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("key: 'darkMode'");
      expect(content).toContain("type: 'toggle'");
    });
  });

  describe('multi-page forms', () => {
    it('generates 2-page wizard', async () => {
      const result = await registeredTool.handler({
        pages: 2,
        fields: ['name:input', 'email:input'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('2-page wizard');
      expect(content).toContain("key: 'page1'");
      expect(content).toContain("type: 'page'");
      expect(content).toContain("key: 'page2'");
      expect(content).toContain("type: 'next'");
      expect(content).toContain("type: 'previous'");
      expect(content).toContain("type: 'submit'");
    });

    it('generates 3-page wizard', async () => {
      const result = await registeredTool.handler({
        pages: 3,
        fields: ['name:input', 'email:input', 'message:textarea'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('3-page wizard');
      expect(content).toContain("key: 'page1'");
      expect(content).toContain("key: 'page2'");
      expect(content).toContain("key: 'page3'");
    });

    it('includes page headers', async () => {
      const result = await registeredTool.handler({
        pages: 2,
        fields: [],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("type: 'text'");
      expect(content).toContain('Step 1 of 2');
      expect(content).toContain('Step 2 of 2');
      expect(content).toContain("elementType: 'h2'");
    });

    it('includes navigation row with back and next buttons', async () => {
      const result = await registeredTool.handler({
        pages: 3,
        fields: [],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("type: 'row'");
      expect(content).toContain('col: 6');
    });
  });

  describe('groups', () => {
    it('generates form with group', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        groups: ['address'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("key: 'address'");
      expect(content).toContain("type: 'group'");
      expect(content).toContain("key: 'addressField1'");
      expect(content).toContain("key: 'addressField2'");
    });

    it('generates form with multiple groups', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        groups: ['billing', 'shipping'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("key: 'billing'");
      expect(content).toContain("key: 'shipping'");
    });
  });

  describe('arrays', () => {
    it('generates form with array', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        arrays: ['contacts'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("key: 'contacts'");
      expect(content).toContain("type: 'array'");
      expect(content).toContain("key: 'contactsItem'");
      expect(content).toContain("type: 'addArrayItem'");
      expect(content).toContain("arrayKey: 'contacts'");
    });

    it('generates form with multiple arrays', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        arrays: ['contacts', 'addresses'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("key: 'contacts'");
      expect(content).toContain("key: 'addresses'");
      expect(content).toContain("arrayKey: 'contacts'");
      expect(content).toContain("arrayKey: 'addresses'");
    });
  });

  describe('hidden fields', () => {
    it('generates form with string hidden field', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        hidden: ['userId:abc123'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("key: 'userId'");
      expect(content).toContain("type: 'hidden'");
      expect(content).toContain("value: 'abc123'");
    });

    it('generates form with numeric hidden field', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        hidden: ['version:42'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("key: 'version'");
      expect(content).toContain("type: 'hidden'");
      expect(content).toContain('value: 42'); // Not quoted
    });

    it('generates form with boolean hidden field', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        hidden: ['isActive:true'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("key: 'isActive'");
      expect(content).toContain('value: true'); // Not quoted
    });

    it('places hidden fields inside first page in multi-page forms', async () => {
      const result = await registeredTool.handler({
        pages: 2,
        hidden: ['trackingId:xyz'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      // Hidden field should be inside page1
      const page1Index = content.indexOf("key: 'page1'");
      const hiddenIndex = content.indexOf("key: 'trackingId'");
      const page2Index = content.indexOf("key: 'page2'");

      expect(page1Index).toBeLessThan(hiddenIndex);
      expect(hiddenIndex).toBeLessThan(page2Index);
    });
  });

  describe('output shape', () => {
    it('includes output shape comment', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        fields: ['name:input', 'age:slider'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('// Form output shape:');
      expect(content).toContain('name: string');
      expect(content).toContain('age: number');
    });

    it('includes group in output shape', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        groups: ['address'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('address: {');
      expect(content).toContain('addressField1: string');
    });

    it('includes array in output shape', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        arrays: ['items'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('items: Array<{');
      expect(content).toContain('itemName: string');
    });

    it('includes hidden field in output shape', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        hidden: ['userId:abc'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('userId: string; // hidden');
    });
  });

  describe('summary', () => {
    it('includes summary of generated structure', async () => {
      const result = await registeredTool.handler({
        pages: 2,
        fields: ['name:input', 'email:input'],
        groups: ['address'],
        arrays: ['contacts'],
        hidden: ['userId:abc'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Generated FormConfig Scaffold');
      expect(content).toContain('2-page wizard');
      expect(content).toContain('2 basic field(s)');
      expect(content).toContain('1 nested group(s)');
      expect(content).toContain('1 dynamic array(s)');
      expect(content).toContain('1 hidden field(s)');
    });
  });

  describe('empty inputs', () => {
    it('handles empty fields array', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        fields: [],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("type: 'submit'");
      expect(content).toContain('as const satisfies FormConfig');
    });

    it('handles all empty arrays', async () => {
      const result = await registeredTool.handler({
        pages: 0,
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("type: 'submit'");
      expect(content).toContain('as const satisfies FormConfig');
    });
  });

  describe('field type parsing', () => {
    it('defaults to input for unrecognized type', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        fields: ['custom:unknown-type'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("key: 'custom'");
      expect(content).toContain("type: 'input'");
    });

    it('handles field without type', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        fields: ['name'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("key: 'name'");
      expect(content).toContain("type: 'input'"); // Default
    });
  });

  describe('label generation', () => {
    it('capitalizes single word field names', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        fields: ['name:input'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("label: 'Name'");
    });

    it('converts camelCase to spaced words', async () => {
      const result = await registeredTool.handler({
        pages: 0,
        fields: ['firstName:input'],
      });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("label: 'First Name'");
    });
  });
});
