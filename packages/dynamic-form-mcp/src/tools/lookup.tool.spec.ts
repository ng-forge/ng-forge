/**
 * Lookup Tool Tests
 *
 * Tests for the unified documentation lookup tool.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerLookupTool } from './lookup.tool.js';

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
      expect(content).toContain('NO LOGIC');
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
  });
});
