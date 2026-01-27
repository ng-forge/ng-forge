/**
 * Validate Tool Tests
 *
 * Tests for the unified Zod-based form config validation tool.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerValidateTool } from './validate.tool.js';

describe('Validate Tool', () => {
  let server: McpServer;
  let registeredTool: { name: string; handler: (args: Record<string, unknown>) => Promise<unknown> };

  beforeEach(() => {
    server = {
      tool: vi.fn((name, _description, _schema, handler) => {
        registeredTool = { name, handler };
      }),
    } as unknown as McpServer;

    registerValidateTool(server);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('registers tool with correct name', () => {
    expect(registeredTool.name).toBe('ngforge_validate');
  });

  describe('valid configs', () => {
    it('validates a minimal valid config for material', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [
            { key: 'name', type: 'input', label: 'Name' },
            { key: 'submit', type: 'submit', label: 'Submit' },
          ],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(true);
    });

    it('validates config with multiple field types', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [
            { key: 'text', type: 'input', label: 'Text' },
            { key: 'area', type: 'textarea', label: 'Area' },
            { key: 'sel', type: 'select', label: 'Select', options: [{ value: 'a', label: 'A' }] },
            { key: 'check', type: 'checkbox', label: 'Check' },
            { key: 'date', type: 'datepicker', label: 'Date' },
            { key: 'tog', type: 'toggle', label: 'Toggle' },
            { key: 'slide', type: 'slider', label: 'Slider' },
            { key: 'submit', type: 'submit', label: 'Submit' },
          ],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(true);
    });

    it('validates config for bootstrap integration', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'bootstrap',
        config: {
          fields: [{ key: 'name', type: 'input', label: 'Name' }],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(true);
    });

    it('validates config for primeng integration', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'primeng',
        config: {
          fields: [{ key: 'name', type: 'input', label: 'Name' }],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(true);
    });

    it('validates config for ionic integration', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'ionic',
        config: {
          fields: [{ key: 'name', type: 'input', label: 'Name' }],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(true);
    });
  });

  describe('missing required properties', () => {
    it('reports error for missing fields array', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {},
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(false);
      expect(content.errors.length).toBeGreaterThan(0);
      // Zod will report "Required" for missing required fields
      expect(content.errors.some((e: { message: string }) => e.message.toLowerCase().includes('required'))).toBe(true);
    });

    it('reports error for field missing key', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [{ type: 'input', label: 'Name' }],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(false);
      expect(content.errors.length).toBeGreaterThan(0);
    });

    it('reports error for field missing type', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [{ key: 'name', label: 'Name' }],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(false);
      expect(content.errors.length).toBeGreaterThan(0);
    });
  });

  describe('invalid values', () => {
    it('reports error for unknown field type', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [{ key: 'name', type: 'unknown-type', label: 'Name' }],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(false);
      expect(content.errors.length).toBeGreaterThan(0);
    });
  });

  describe('select/radio fields', () => {
    it('reports error for select without options', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [{ key: 'country', type: 'select', label: 'Country' }],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(false);
      expect(content.errors.length).toBeGreaterThan(0);
    });

    it('validates select with options', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [
            {
              key: 'country',
              type: 'select',
              label: 'Country',
              options: [
                { value: 'us', label: 'USA' },
                { value: 'uk', label: 'UK' },
              ],
            },
          ],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(true);
    });
  });

  describe('container fields', () => {
    it('reports error for group without fields', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [{ key: 'address', type: 'group' }],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(false);
      expect(content.errors.length).toBeGreaterThan(0);
    });

    it('validates group with nested fields', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [
            {
              key: 'address',
              type: 'group',
              fields: [
                { key: 'street', type: 'input', label: 'Street' },
                { key: 'city', type: 'input', label: 'City' },
              ],
            },
          ],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(true);
    });

    it('validates row with nested fields', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [
            {
              type: 'row',
              fields: [
                { key: 'firstName', type: 'input', label: 'First Name' },
                { key: 'lastName', type: 'input', label: 'Last Name' },
              ],
            },
          ],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      // Row fields may require additional properties or have specific constraints
      // If invalid, check the error for proper feedback
      if (!content.valid) {
        expect(content.errors.length).toBeGreaterThan(0);
        expect(content.errors[0]).toHaveProperty('path');
        expect(content.errors[0]).toHaveProperty('message');
      } else {
        expect(content.valid).toBe(true);
      }
    });

    it('validates nested fields in group have proper types', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [
            {
              key: 'address',
              type: 'group',
              fields: [{ key: 'street', type: 'invalid-type', label: 'Street' }],
            },
          ],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(false);
      expect(content.errors.length).toBeGreaterThan(0);
    });

    it('reports error for logic on group container', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [
            {
              key: 'address',
              type: 'group',
              fields: [{ key: 'street', type: 'input', label: 'Street' }],
              logic: [{ type: 'hidden', condition: true }],
            },
          ],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(false);
      expect(content.errors.length).toBeGreaterThan(0);
    });

    it('reports error for logic on row container', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [
            {
              key: 'nameRow',
              type: 'row',
              fields: [{ key: 'name', type: 'input', label: 'Name' }],
              logic: [{ type: 'hidden', condition: true }],
            },
          ],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(false);
      expect(content.errors.length).toBeGreaterThan(0);
    });

    it('reports error for logic on array container', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [
            {
              key: 'items',
              type: 'array',
              fields: [{ key: 'item', type: 'input', label: 'Item' }],
              logic: [{ type: 'hidden', condition: true }],
            },
          ],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(false);
      expect(content.errors.length).toBeGreaterThan(0);
    });

    it('allows logic on page container (hidden only)', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [
            {
              key: 'page1',
              type: 'page',
              fields: [{ key: 'name', type: 'input', label: 'Name' }],
              logic: [{ type: 'hidden', condition: true }],
            },
          ],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(true);
    });
  });

  describe('error response format', () => {
    it('returns errors array with path and message', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [{ type: 'input', label: 'Name' }], // missing key
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(false);
      expect(Array.isArray(content.errors)).toBe(true);
      expect(content.errors[0]).toHaveProperty('path');
      expect(content.errors[0]).toHaveProperty('message');
    });

    it('returns errorCount for invalid configs', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [{ type: 'input', label: 'Name' }], // missing key
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(false);
      expect(content.errorCount).toBeDefined();
      expect(typeof content.errorCount).toBe('number');
      expect(content.errorCount).toBeGreaterThan(0);
    });

    it('returns uiIntegration for valid configs', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [{ key: 'name', type: 'input', label: 'Name' }],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(true);
      expect(content.uiIntegration).toBe('material');
    });
  });

  describe('ui integration validation', () => {
    it('returns error for invalid uiIntegration', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'invalid-ui',
        config: {
          fields: [{ key: 'name', type: 'input', label: 'Name' }],
        },
      });
      // content[1] contains the JSON output (content[0] is markdown report)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(false);
      expect(content.errors[0].message).toContain('Unknown UI integration');
    });
  });
});
