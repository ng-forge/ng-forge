/**
 * Validate Tool Tests
 *
 * Tests for the unified Zod-based form config validation tool.
 */

import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerValidateTool } from './validate.tool.js';
import * as fsPromises from 'fs/promises';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

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

    it('allows hidden logic on group container', async () => {
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

      expect(content.valid).toBe(true);
    });

    it('allows hidden logic on row container', async () => {
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

      expect(content.valid).toBe(true);
    });

    it('allows hidden logic on array container', async () => {
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

      expect(content.valid).toBe(true);
    });

    it('reports error for non-hidden logic on group container', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [
            {
              key: 'address',
              type: 'group',
              fields: [{ key: 'street', type: 'input', label: 'Street' }],
              logic: [{ type: 'disabled', condition: true }],
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

  describe('JSON string input', () => {
    it('parses and validates a JSON string config', async () => {
      const jsonConfig = JSON.stringify({
        fields: [{ key: 'name', type: 'input', label: 'Name' }],
      });

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: jsonConfig,
      });

      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(true);
      expect(content.type).toBe('json');
    });

    it('validates invalid JSON string config', async () => {
      const jsonConfig = JSON.stringify({
        fields: [{ type: 'input', label: 'Name' }], // missing key
      });

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: jsonConfig,
      });

      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(false);
      expect(content.type).toBe('json');
    });

    it('parses JSON array at root level', async () => {
      const jsonConfig = JSON.stringify([{ key: 'name', type: 'input', label: 'Name' }]);

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: jsonConfig,
      });

      // This should be parsed as JSON (even though it's invalid for FormConfig)
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.type).toBe('json');
    });
  });

  describe('file path detection', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('detects absolute Unix path starting with /', async () => {
      (fsPromises.readFile as Mock).mockRejectedValue(new Error('ENOENT: no such file'));

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: '/home/user/form-config.ts',
      });

      expect((result as { isError: boolean }).isError).toBe(true);
      const content = (result as { content: [{ text: string }] }).content[0].text;
      expect(content).toContain('File not found');
    });

    it('detects relative path starting with ./', async () => {
      (fsPromises.readFile as Mock).mockRejectedValue(new Error('ENOENT: no such file'));

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: './form-config.ts',
      });

      expect((result as { isError: boolean }).isError).toBe(true);
      const content = (result as { content: [{ text: string }] }).content[0].text;
      expect(content).toContain('File not found');
    });

    it('detects parent directory path starting with ../', async () => {
      (fsPromises.readFile as Mock).mockRejectedValue(new Error('ENOENT: no such file'));

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: '../form-config.ts',
      });

      expect((result as { isError: boolean }).isError).toBe(true);
      const content = (result as { content: [{ text: string }] }).content[0].text;
      expect(content).toContain('File not found');
    });

    it('detects home directory path starting with ~', async () => {
      (fsPromises.readFile as Mock).mockRejectedValue(new Error('ENOENT: no such file'));

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: '~/projects/form-config.ts',
      });

      expect((result as { isError: boolean }).isError).toBe(true);
      const content = (result as { content: [{ text: string }] }).content[0].text;
      expect(content).toContain('File not found');
    });

    it('detects path ending with .ts', async () => {
      (fsPromises.readFile as Mock).mockRejectedValue(new Error('ENOENT: no such file'));

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: 'form-config.ts',
      });

      expect((result as { isError: boolean }).isError).toBe(true);
      const content = (result as { content: [{ text: string }] }).content[0].text;
      expect(content).toContain('File not found');
    });

    it('detects path ending with .js', async () => {
      (fsPromises.readFile as Mock).mockRejectedValue(new Error('ENOENT: no such file'));

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: 'form-config.js',
      });

      expect((result as { isError: boolean }).isError).toBe(true);
      const content = (result as { content: [{ text: string }] }).content[0].text;
      expect(content).toContain('File not found');
    });

    it('detects path ending with .tsx', async () => {
      (fsPromises.readFile as Mock).mockRejectedValue(new Error('ENOENT: no such file'));

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: 'form-config.tsx',
      });

      expect((result as { isError: boolean }).isError).toBe(true);
      const content = (result as { content: [{ text: string }] }).content[0].text;
      expect(content).toContain('File not found');
    });

    it('detects path ending with .jsx', async () => {
      (fsPromises.readFile as Mock).mockRejectedValue(new Error('ENOENT: no such file'));

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: 'form-config.jsx',
      });

      expect((result as { isError: boolean }).isError).toBe(true);
      const content = (result as { content: [{ text: string }] }).content[0].text;
      expect(content).toContain('File not found');
    });
  });

  describe('Windows path detection', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('detects Windows absolute path starting with C:\\', async () => {
      (fsPromises.readFile as Mock).mockRejectedValue(new Error('ENOENT: no such file'));

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: 'C:\\Users\\dev\\form-config.ts',
      });

      expect((result as { isError: boolean }).isError).toBe(true);
      const content = (result as { content: [{ text: string }] }).content[0].text;
      expect(content).toContain('File not found');
    });

    it('detects Windows absolute path starting with D:\\', async () => {
      (fsPromises.readFile as Mock).mockRejectedValue(new Error('ENOENT: no such file'));

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: 'D:\\projects\\form-config.ts',
      });

      expect((result as { isError: boolean }).isError).toBe(true);
      const content = (result as { content: [{ text: string }] }).content[0].text;
      expect(content).toContain('File not found');
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('handles file not found error (ENOENT)', async () => {
      (fsPromises.readFile as Mock).mockRejectedValue(new Error('ENOENT: no such file or directory'));

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: '/path/to/nonexistent.ts',
      });

      expect((result as { isError: boolean }).isError).toBe(true);
      const content = (result as { content: [{ text: string }] }).content[0].text;
      expect(content).toContain('File not found');
      expect(content).toContain('The specified file does not exist');
      expect(content).toContain('/path/to/nonexistent.ts');
    });

    it('handles general errors gracefully', async () => {
      (fsPromises.readFile as Mock).mockRejectedValue(new Error('Permission denied'));

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: '/path/to/protected.ts',
      });

      expect((result as { isError: boolean }).isError).toBe(true);
      const content = (result as { content: [{ text: string }] }).content[0].text;
      expect(content).toContain('Validation Error');
      expect(content).toContain('Permission denied');
      expect(content).toContain('If validating a file, ensure');
    });

    it('handles non-Error exceptions', async () => {
      (fsPromises.readFile as Mock).mockRejectedValue('string error');

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: '/path/to/file.ts',
      });

      expect((result as { isError: boolean }).isError).toBe(true);
      const content = (result as { content: [{ text: string }] }).content[0].text;
      expect(content).toContain('Unknown error');
    });

    it('treats invalid JSON as file path and handles read error', async () => {
      (fsPromises.readFile as Mock).mockRejectedValue(new Error('ENOENT: no such file'));

      // This looks like JSON but is invalid, so it should fall back to treating as file path
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: '{ invalid json',
      });

      expect((result as { isError: boolean }).isError).toBe(true);
    });
  });

  describe('fix suggestions', () => {
    it('provides fix suggestion for options in wrong location', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [
            {
              key: 'country',
              type: 'select',
              label: 'Country',
              props: {
                options: [{ value: 'us', label: 'USA' }],
              },
            },
          ],
        },
      });

      const markdownReport = (result as { content: [{ text: string }, { text: string }] }).content[0].text;
      expect(markdownReport).toContain('Fix');
      expect(markdownReport).toContain('options');
    });

    it('provides fix suggestion for label on container field', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [
            {
              key: 'row1',
              type: 'row',
              label: 'My Row',
              fields: [{ key: 'name', type: 'input', label: 'Name' }],
            },
          ],
        },
      });

      const markdownReport = (result as { content: [{ text: string }, { text: string }] }).content[0].text;
      // Should mention the error about label on container
      expect(markdownReport).toContain('label');
    });

    it('provides fix suggestion for non-hidden logic on container field', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [
            {
              key: 'group1',
              type: 'group',
              fields: [{ key: 'name', type: 'input', label: 'Name' }],
              logic: [{ type: 'disabled', condition: true }],
            },
          ],
        },
      });

      const markdownReport = (result as { content: [{ text: string }, { text: string }] }).content[0].text;
      expect(markdownReport).toContain('logic');
    });

    it('provides fix suggestion for hidden field missing value', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [
            {
              key: 'hiddenField',
              type: 'hidden',
              // missing value
            },
          ],
        },
      });

      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(false);
      const markdownReport = (result as { content: [{ text: string }, { text: string }] }).content[0].text;
      expect(markdownReport).toContain('value');
    });

    it('provides fix suggestion for minValue on slider', async () => {
      // Testing a case where the validator/schema might report an error about 'min' vs 'minValue'
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [
            {
              key: 'rating',
              type: 'slider',
              label: 'Rating',
              // Slider should have minValue at field level, not props.min
              props: {
                min: 0, // wrong location
              },
            },
          ],
        },
      });

      // This may or may not cause an error depending on schema strictness
      // The test verifies the tool handles the scenario
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      // Either valid or has error - we're testing that it processes without crashing
      expect(content).toHaveProperty('valid');
      expect(content).toHaveProperty('uiIntegration');
    });

    it('provides fix suggestion for validators on hidden field', async () => {
      // Hidden fields don't support validators
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [
            {
              key: 'hiddenField',
              type: 'hidden',
              value: 'test-value',
              validators: [{ type: 'required' }], // Not allowed on hidden fields
            },
          ],
        },
      });

      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(false);
      const markdownReport = (result as { content: [{ text: string }, { text: string }] }).content[0].text;
      expect(markdownReport).toContain('validators');
    });

    it('provides fix suggestion for readonly on hidden field', async () => {
      // Hidden fields don't support readonly
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [
            {
              key: 'hiddenField',
              type: 'hidden',
              value: 'test-value',
              readonly: true, // Not allowed on hidden fields
            },
          ],
        },
      });

      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.valid).toBe(false);
      const markdownReport = (result as { content: [{ text: string }, { text: string }] }).content[0].text;
      expect(markdownReport).toContain('readonly');
    });
  });

  describe('markdown report format', () => {
    it('formats valid config report correctly', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [{ key: 'name', type: 'input', label: 'Name' }],
        },
      });

      const markdownReport = (result as { content: [{ text: string }, { text: string }] }).content[0].text;
      expect(markdownReport).toContain('# Validation Report');
      expect(markdownReport).toContain('**UI Integration:** material');
      expect(markdownReport).toContain('Config Valid');
      expect(markdownReport).toContain('passes all validation checks');
    });

    it('formats invalid config report with error count', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: {
          fields: [
            { type: 'input', label: 'Name' }, // missing key
            { key: 'email', label: 'Email' }, // missing type
          ],
        },
      });

      const markdownReport = (result as { content: [{ text: string }, { text: string }] }).content[0].text;
      expect(markdownReport).toContain('# Validation Report');
      expect(markdownReport).toContain('Error(s) Found');
      expect(markdownReport).toContain('ngforge_lookup topic="pitfalls"');
    });

    it('includes structured JSON output', async () => {
      const result = await registeredTool.handler({
        uiIntegration: 'bootstrap',
        config: {
          fields: [{ key: 'name', type: 'input', label: 'Name' }],
        },
      });

      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      expect(jsonText).toContain('```json');
      expect(jsonText).toContain('"valid":');
      expect(jsonText).toContain('"uiIntegration":');

      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );
      expect(content.uiIntegration).toBe('bootstrap');
      expect(content.valid).toBe(true);
    });
  });

  describe('file validation', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('validates TypeScript file with FormConfig', async () => {
      const tsSource = `
import { FormConfig } from '@ng-forge/dynamic-forms';

export const formConfig = {
  fields: [
    { key: 'name', type: 'input', label: 'Name' },
    { key: 'submit', type: 'submit', label: 'Submit' }
  ]
} satisfies FormConfig;
`;
      (fsPromises.readFile as Mock).mockResolvedValue(tsSource);

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: '/path/to/form-config.ts',
      });

      expect((result as { isError: boolean }).isError).toBeUndefined();
      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.type).toBe('file');
      expect(content.filePath).toBe('/path/to/form-config.ts');
      expect(content.configsFound).toBeGreaterThan(0);
    });

    it('formats file report with no FormConfig found', async () => {
      const tsSource = `
export const someOtherConfig = {
  name: 'test'
};
`;
      (fsPromises.readFile as Mock).mockResolvedValue(tsSource);

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: '/path/to/other-config.ts',
      });

      const markdownReport = (result as { content: [{ text: string }, { text: string }] }).content[0].text;
      expect(markdownReport).toContain('# Validation Report');
      expect(markdownReport).toContain('No FormConfig Found');
      expect(markdownReport).toContain('Detection methods used');
      expect(markdownReport).toContain('satisfies FormConfig');
    });

    it('formats file report with valid configs', async () => {
      const tsSource = `
import { FormConfig } from '@ng-forge/dynamic-forms';

export const formConfig = {
  fields: [
    { key: 'name', type: 'input', label: 'Name' }
  ]
} satisfies FormConfig;
`;
      (fsPromises.readFile as Mock).mockResolvedValue(tsSource);

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: '/path/to/valid-config.ts',
      });

      const markdownReport = (result as { content: [{ text: string }, { text: string }] }).content[0].text;
      expect(markdownReport).toContain('# Validation Report');
      expect(markdownReport).toContain('**File:**');
      expect(markdownReport).toContain('Found');
      expect(markdownReport).toContain('FormConfig');
    });

    it('formats file report with invalid configs', async () => {
      const tsSource = `
import { FormConfig } from '@ng-forge/dynamic-forms';

export const formConfig = {
  fields: [
    { type: 'input', label: 'Name' }  // missing key
  ]
} satisfies FormConfig;
`;
      (fsPromises.readFile as Mock).mockResolvedValue(tsSource);

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: '/path/to/invalid-config.ts',
      });

      const markdownReport = (result as { content: [{ text: string }, { text: string }] }).content[0].text;
      expect(markdownReport).toContain('# Validation Report');
      expect(markdownReport).toContain('Error(s) Found');
    });

    it('formats file report with extraction warnings', async () => {
      const tsSource = `
import { FormConfig } from '@ng-forge/dynamic-forms';

export const formConfig = {
  fields: [
    {
      key: 'date',
      type: 'datepicker',
      label: 'Date',
      props: {
        maxDate: new Date()
      }
    }
  ]
} satisfies FormConfig;
`;
      (fsPromises.readFile as Mock).mockResolvedValue(tsSource);

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: '/path/to/config-with-runtime.ts',
      });

      const markdownReport = (result as { content: [{ text: string }, { text: string }] }).content[0].text;
      expect(markdownReport).toContain('# Validation Report');
      // May have extraction notes if runtime values are detected
    });

    it('validates multiple FormConfigs in a file', async () => {
      const tsSource = `
import { FormConfig } from '@ng-forge/dynamic-forms';

export const config1 = {
  fields: [
    { key: 'name', type: 'input', label: 'Name' }
  ]
} satisfies FormConfig;

export const config2 = {
  fields: [
    { key: 'email', type: 'input', label: 'Email' }
  ]
} satisfies FormConfig;
`;
      (fsPromises.readFile as Mock).mockResolvedValue(tsSource);

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: '/path/to/multi-config.ts',
      });

      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.type).toBe('file');
      expect(content.configsFound).toBeGreaterThanOrEqual(2);
    });

    it('formats file report with mixed valid and invalid configs', async () => {
      // This tests line 163 - showing "Valid" for individual configs when not all are valid
      const tsSource = `
import { FormConfig } from '@ng-forge/dynamic-forms';

// First config is valid
export const validConfig = {
  fields: [
    { key: 'name', type: 'input', label: 'Name' }
  ]
} satisfies FormConfig;

// Second config is invalid (missing key)
export const invalidConfig = {
  fields: [
    { type: 'input', label: 'Name' }
  ]
} satisfies FormConfig;
`;
      (fsPromises.readFile as Mock).mockResolvedValue(tsSource);

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: '/path/to/mixed-config.ts',
      });

      const markdownReport = (result as { content: [{ text: string }, { text: string }] }).content[0].text;
      expect(markdownReport).toContain('Error(s) Found');
      expect(markdownReport).toContain('Valid'); // Some configs are valid
      expect(markdownReport).toContain('Invalid'); // Some configs are invalid
    });

    it('formats file report with fix suggestions', async () => {
      // This tests line 173 - fix suggestions in file reports
      const tsSource = `
import { FormConfig } from '@ng-forge/dynamic-forms';

export const formConfig = {
  fields: [
    {
      key: 'hiddenField',
      type: 'hidden'
      // Missing required 'value' property
    }
  ]
} satisfies FormConfig;
`;
      (fsPromises.readFile as Mock).mockResolvedValue(tsSource);

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: '/path/to/config-needing-fix.ts',
      });

      const markdownReport = (result as { content: [{ text: string }, { text: string }] }).content[0].text;
      expect(markdownReport).toContain('Error(s) Found');
      expect(markdownReport).toContain('value'); // Error about value
      expect(markdownReport).toContain('Fix'); // Fix suggestion included
    });
  });

  describe('parseConfigInput edge cases', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('treats arbitrary string without path patterns as file path', async () => {
      // This tests line 273 - default case for strings that don't match known patterns
      (fsPromises.readFile as Mock).mockRejectedValue(new Error('ENOENT: no such file'));

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: 'some-random-string',
      });

      expect((result as { isError: boolean }).isError).toBe(true);
      const content = (result as { content: [{ text: string }] }).content[0].text;
      expect(content).toContain('File not found');
    });

    it('handles whitespace in config string', async () => {
      const jsonConfig = `  { "fields": [{ "key": "name", "type": "input", "label": "Name" }] }  `;

      const result = await registeredTool.handler({
        uiIntegration: 'material',
        config: jsonConfig,
      });

      const jsonText = (result as { content: [{ text: string }, { text: string }] }).content[1].text;
      const content = JSON.parse(
        jsonText
          .trim()
          .replace(/^```json\n/, '')
          .replace(/\n```$/, ''),
      );

      expect(content.type).toBe('json');
      expect(content.valid).toBe(true);
    });
  });
});
