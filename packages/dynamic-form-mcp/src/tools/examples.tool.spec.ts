/**
 * Examples Tool Tests
 *
 * Tests for the unified working code examples tool.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerExamplesTool } from './examples.tool.js';

describe('Examples Tool', () => {
  let server: McpServer;
  let registeredTool: { name: string; handler: (args: Record<string, unknown>) => Promise<unknown> };

  beforeEach(() => {
    server = {
      tool: vi.fn((name, _description, _schema, handler) => {
        registeredTool = { name, handler };
      }),
    } as unknown as McpServer;

    registerExamplesTool(server);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('registers tool with correct name', () => {
    expect(registeredTool.name).toBe('ngforge_examples');
  });

  describe('pattern list', () => {
    it('returns list of patterns when no pattern specified', async () => {
      const result = await registeredTool.handler({});
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Available Patterns');
      expect(content).toContain('Getting Started');
      expect(content).toContain('Minimal Patterns');
    });

    it('returns list of patterns when pattern is "list"', async () => {
      const result = await registeredTool.handler({ pattern: 'list' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Available Patterns');
    });
  });

  describe('minimal patterns', () => {
    it('returns minimal-multipage example', async () => {
      const result = await registeredTool.handler({ pattern: 'minimal-multipage', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('Multi-Page');
      expect(content).toContain("type: 'page'");
      expect(content).toContain("type: 'next'");
      expect(content).toContain("type: 'previous'");
    });

    it('returns minimal-array example', async () => {
      const result = await registeredTool.handler({ pattern: 'minimal-array', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('Array');
      expect(content).toContain("type: 'array'");
      expect(content).toContain('addArrayItem');
      expect(content).toContain('arrayKey');
    });

    it('returns minimal-conditional example', async () => {
      const result = await registeredTool.handler({ pattern: 'minimal-conditional', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('Conditional');
      expect(content).toContain('logic');
      expect(content).toContain("type: 'hidden'");
      expect(content).toContain('condition');
    });

    it('returns minimal-validation example', async () => {
      const result = await registeredTool.handler({ pattern: 'minimal-validation', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('Validation');
      expect(content).toContain('validators');
      expect(content).toContain('validationMessages');
      expect(content).toContain('password');
    });

    it('returns minimal-hidden example', async () => {
      const result = await registeredTool.handler({ pattern: 'minimal-hidden', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('Hidden');
      expect(content).toContain("type: 'hidden'");
      expect(content).toContain('value');
    });
  });

  describe('standard patterns', () => {
    it('returns derivation example', async () => {
      const result = await registeredTool.handler({ pattern: 'derivation', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('Derivation');
      expect(content).toContain('derivation:'); // Shorthand syntax
      expect(content).toContain('expression');
    });

    it('returns multi-page example (alias)', async () => {
      const result = await registeredTool.handler({ pattern: 'multi-page', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("type: 'page'");
    });

    it('returns conditional example (alias)', async () => {
      const result = await registeredTool.handler({ pattern: 'conditional', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('logic');
    });

    it('returns validation example (alias)', async () => {
      const result = await registeredTool.handler({ pattern: 'validation', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('validators');
    });
  });

  describe('complete and mega patterns', () => {
    it('returns complete example', async () => {
      const result = await registeredTool.handler({ pattern: 'complete', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('Complete Multi-Page Form');
      expect(content).toContain("type: 'page'");
      expect(content).toContain("type: 'group'");
      expect(content).toContain('derivation');
      expect(content).toContain('logic');
    });

    it('returns mega example', async () => {
      const result = await registeredTool.handler({ pattern: 'mega', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('Kitchen Sink');
      expect(content).toContain("type: 'input'");
      expect(content).toContain("type: 'select'");
      expect(content).toContain("type: 'radio'");
      expect(content).toContain("type: 'checkbox'");
      expect(content).toContain("type: 'array'");
    });
  });

  describe('depth parameter', () => {
    it('returns minimal content (code only) for depth=minimal', async () => {
      const result = await registeredTool.handler({ pattern: 'minimal-multipage', depth: 'minimal' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      // Minimal should be just code - no markdown headers
      expect(content).not.toContain('# Minimal');
      expect(content).toContain('import { FormConfig }');
      expect(content).toContain("type: 'page'");
    });

    it('returns brief content for depth=brief', async () => {
      const result = await registeredTool.handler({ pattern: 'minimal-multipage', depth: 'brief' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain("type: 'page'");
      expect(content).toContain('Key points');
    });

    it('returns full content for depth=full', async () => {
      const result = await registeredTool.handler({ pattern: 'minimal-multipage', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Minimal Multi-Page');
      expect(content).toContain('```typescript');
    });

    it('returns explained content for depth=explained', async () => {
      const result = await registeredTool.handler({ pattern: 'minimal-multipage', depth: 'explained' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('Complete Explanation');
      expect(content).toContain('How Multi-Page Works');
    });

    it('defaults to full depth', async () => {
      const result = await registeredTool.handler({ pattern: 'minimal-multipage' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('# Minimal Multi-Page');
    });
  });

  describe('unknown pattern', () => {
    it('returns error for unknown pattern', async () => {
      const result = await registeredTool.handler({ pattern: 'unknown-pattern-xyz' });

      expect((result as { isError: boolean }).isError).toBe(true);
      const content = (result as { content: [{ text: string }] }).content[0].text;
      expect(content).toContain('not found');
      expect(content).toContain('Available patterns');
    });
  });

  describe('case insensitivity', () => {
    it('handles uppercase pattern', async () => {
      const result = await registeredTool.handler({ pattern: 'COMPLETE', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('Complete Multi-Page');
    });

    it('handles mixed case pattern', async () => {
      const result = await registeredTool.handler({ pattern: 'Minimal-MultiPage', depth: 'full' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('Multi-Page');
    });
  });

  describe('code extraction', () => {
    it('extracts only code for complete example with minimal depth', async () => {
      const result = await registeredTool.handler({ pattern: 'complete', depth: 'minimal' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      // Should be pure TypeScript code
      expect(content).toContain('import { FormConfig }');
      expect(content).toContain('const formConfig');
      // Should not have markdown headers
      expect(content).not.toContain('# Complete');
    });

    it('extracts only code for mega example with minimal depth', async () => {
      const result = await registeredTool.handler({ pattern: 'mega', depth: 'minimal' });
      const content = (result as { content: [{ text: string }] }).content[0].text;

      expect(content).toContain('import { FormConfig }');
      expect(content).not.toContain('# Kitchen Sink');
    });
  });
});
