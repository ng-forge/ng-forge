/**
 * Validate Form Config Tool Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerValidateFormConfigTool } from './validate-form-config.tool.js';

describe('Validate Form Config Tool', () => {
  let server: McpServer;
  let registeredTool: { name: string; handler: (args: Record<string, unknown>) => Promise<unknown> };

  beforeEach(() => {
    server = {
      tool: vi.fn((name, _description, _schema, handler) => {
        registeredTool = { name, handler };
      }),
    } as unknown as McpServer;

    registerValidateFormConfigTool(server);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('valid configs', () => {
    it('validates a minimal valid config', async () => {
      const result = await registeredTool.handler({
        config: {
          fields: [
            { key: 'name', type: 'input', label: 'Name' },
            { key: 'submit', type: 'submit', label: 'Submit' },
          ],
        },
      });
      const content = JSON.parse((result as { content: [{ text: string }] }).content[0].text);

      expect(content.valid).toBe(true);
      expect(content.errorCount).toBe(0);
    });

    it('validates config with all field types', async () => {
      const result = await registeredTool.handler({
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
      const content = JSON.parse((result as { content: [{ text: string }] }).content[0].text);

      expect(content.valid).toBe(true);
    });
  });

  describe('missing required properties', () => {
    it('reports error for missing fields array', async () => {
      const result = await registeredTool.handler({
        config: {},
      });
      const content = JSON.parse((result as { content: [{ text: string }] }).content[0].text);

      expect(content.valid).toBe(false);
      expect(content.errors[0].message).toContain('must have a "fields" array');
    });

    it('reports error for field missing key', async () => {
      const result = await registeredTool.handler({
        config: {
          fields: [{ type: 'input', label: 'Name' }],
        },
      });
      const content = JSON.parse((result as { content: [{ text: string }] }).content[0].text);

      expect(content.valid).toBe(false);
      expect(content.errors.some((e: { message: string }) => e.message.includes('missing required "key"'))).toBe(true);
    });

    it('reports error for field missing type', async () => {
      const result = await registeredTool.handler({
        config: {
          fields: [{ key: 'name', label: 'Name' }],
        },
      });
      const content = JSON.parse((result as { content: [{ text: string }] }).content[0].text);

      expect(content.valid).toBe(false);
      expect(content.errors.some((e: { message: string }) => e.message.includes('missing required "type"'))).toBe(true);
    });
  });

  describe('invalid values', () => {
    it('reports error for unknown field type', async () => {
      const result = await registeredTool.handler({
        config: {
          fields: [{ key: 'name', type: 'unknown-type', label: 'Name' }],
        },
      });
      const content = JSON.parse((result as { content: [{ text: string }] }).content[0].text);

      expect(content.valid).toBe(false);
      expect(content.errors[0].message).toContain('Unknown field type "unknown-type"');
    });

    it('reports error for min > max', async () => {
      const result = await registeredTool.handler({
        config: {
          fields: [{ key: 'age', type: 'input', label: 'Age', min: 100, max: 18 }],
        },
      });
      const content = JSON.parse((result as { content: [{ text: string }] }).content[0].text);

      expect(content.valid).toBe(false);
      expect(content.errors[0].message).toContain('min (100) greater than max (18)');
    });

    it('reports error for minLength > maxLength', async () => {
      const result = await registeredTool.handler({
        config: {
          fields: [{ key: 'name', type: 'input', label: 'Name', minLength: 50, maxLength: 10 }],
        },
      });
      const content = JSON.parse((result as { content: [{ text: string }] }).content[0].text);

      expect(content.valid).toBe(false);
      expect(content.errors[0].message).toContain('minLength (50) greater than maxLength (10)');
    });

    it('reports error for invalid regex pattern', async () => {
      const result = await registeredTool.handler({
        config: {
          fields: [{ key: 'code', type: 'input', label: 'Code', pattern: '[invalid(' }],
        },
      });
      const content = JSON.parse((result as { content: [{ text: string }] }).content[0].text);

      expect(content.valid).toBe(false);
      expect(content.errors[0].message).toContain('invalid regex pattern');
    });
  });

  describe('select/radio fields', () => {
    it('reports error for select without options', async () => {
      const result = await registeredTool.handler({
        config: {
          fields: [{ key: 'country', type: 'select', label: 'Country' }],
        },
      });
      const content = JSON.parse((result as { content: [{ text: string }] }).content[0].text);

      expect(content.valid).toBe(false);
      expect(content.errors[0].message).toContain('requires "options" array');
    });

    it('allows select with dynamic options expression', async () => {
      const result = await registeredTool.handler({
        config: {
          fields: [
            {
              key: 'city',
              type: 'select',
              label: 'City',
              expressions: { 'props.options': 'context.getCities(formValue.country)' },
            },
          ],
        },
      });
      const content = JSON.parse((result as { content: [{ text: string }] }).content[0].text);

      expect(content.errors.some((e: { message: string }) => e.message.includes('requires "options"'))).toBe(false);
    });
  });

  describe('container fields', () => {
    it('reports error for group without fields', async () => {
      const result = await registeredTool.handler({
        config: {
          fields: [{ key: 'address', type: 'group', label: 'Address' }],
        },
      });
      const content = JSON.parse((result as { content: [{ text: string }] }).content[0].text);

      expect(content.valid).toBe(false);
      expect(content.errors[0].message).toContain('requires a "fields" array');
    });

    it('reports error for array without template', async () => {
      const result = await registeredTool.handler({
        config: {
          fields: [{ key: 'items', type: 'array', label: 'Items' }],
        },
      });
      const content = JSON.parse((result as { content: [{ text: string }] }).content[0].text);

      expect(content.valid).toBe(false);
      expect(content.errors[0].message).toContain('requires a "template" property');
    });

    it('validates nested fields in group', async () => {
      const result = await registeredTool.handler({
        config: {
          fields: [
            {
              key: 'address',
              type: 'group',
              label: 'Address',
              fields: [{ key: 'street', type: 'invalid-type', label: 'Street' }],
            },
          ],
        },
      });
      const content = JSON.parse((result as { content: [{ text: string }] }).content[0].text);

      expect(content.valid).toBe(false);
      expect(content.errors[0].path).toContain('fields[0].fields[0]');
    });
  });

  describe('duplicate keys', () => {
    it('reports error for duplicate field keys', async () => {
      const result = await registeredTool.handler({
        config: {
          fields: [
            { key: 'name', type: 'input', label: 'Name' },
            { key: 'name', type: 'input', label: 'Name Again' },
          ],
        },
      });
      const content = JSON.parse((result as { content: [{ text: string }] }).content[0].text);

      expect(content.valid).toBe(false);
      expect(content.errors[0].message).toContain('Duplicate field key "name"');
    });
  });

  describe('warnings', () => {
    it('warns about missing label on value fields', async () => {
      const result = await registeredTool.handler({
        config: {
          fields: [{ key: 'name', type: 'input' }],
        },
      });
      const content = JSON.parse((result as { content: [{ text: string }] }).content[0].text);

      expect(content.valid).toBe(true); // Still valid, just a warning
      expect(content.warningCount).toBeGreaterThan(0);
      expect(content.warnings[0].message).toContain('missing a label');
    });

    it('warns about empty fields array', async () => {
      const result = await registeredTool.handler({
        config: {
          fields: [],
        },
      });
      const content = JSON.parse((result as { content: [{ text: string }] }).content[0].text);

      expect(content.warningCount).toBeGreaterThan(0);
      expect(content.warnings[0].message).toContain('empty fields array');
    });
  });
});
