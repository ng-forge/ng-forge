/**
 * Search Tool Tests
 *
 * Tests for the unified keyword search tool.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSearchTool } from './search.tool.js';

describe('Search Tool', () => {
  let server: McpServer;
  let registeredTool: { name: string; handler: (args: Record<string, unknown>) => Promise<unknown> };

  beforeEach(() => {
    server = {
      tool: vi.fn((name, _description, _schema, handler) => {
        registeredTool = { name, handler };
      }),
    } as unknown as McpServer;

    registerSearchTool(server);
  });

  function getResultText(result: unknown): string {
    return (result as { content: [{ text: string }] }).content[0].text;
  }

  it('registers tool with correct name', () => {
    expect(registeredTool.name).toBe('ngforge_search');
  });

  describe('basic search', () => {
    it('returns results for known topic keyword', async () => {
      const text = getResultText(await registeredTool.handler({ query: 'input' }));

      expect(text).toContain('# Search Results');
      expect(text).toContain('input');
      expect(text).toContain('ngforge_lookup topic="input"');
    });

    it('returns results for alias keyword', async () => {
      const text = getResultText(await registeredTool.handler({ query: 'dropdown' }));

      expect(text).toContain('# Search Results');
      expect(text).toContain('select');
    });

    it('returns results for pattern keyword', async () => {
      const text = getResultText(await registeredTool.handler({ query: 'wizard' }));

      expect(text).toContain('# Search Results');
      // 'wizard' is an alias for 'page' topic, and 'minimal-multipage' pattern description mentions 'wizard'
      expect(text).toContain('ngforge_');
    });

    it('returns results matching descriptions', async () => {
      const text = getResultText(await registeredTool.handler({ query: 'password' }));

      expect(text).toContain('# Search Results');
    });

    it('returns no-results message for gibberish', async () => {
      const text = getResultText(await registeredTool.handler({ query: 'xyzzyplugh123' }));

      expect(text).toContain('# No Results Found');
      expect(text).toContain('ngforge_lookup topic="list"');
      expect(text).toContain('ngforge_examples pattern="list"');
    });

    it('returns no-results message for empty tokens', async () => {
      const text = getResultText(await registeredTool.handler({ query: '   ' }));

      expect(text).toContain('# No Results Found');
    });
  });

  describe('scoring and ranking', () => {
    it('exact topic ID match ranks higher than partial match', async () => {
      const text = getResultText(await registeredTool.handler({ query: 'input' }));

      const lines = text.split('\n');
      const firstResult = lines.find((l) => l.startsWith('1.'));
      expect(firstResult).toContain('**input**');
    });

    it('alias matches appear in results', async () => {
      const text = getResultText(await registeredTool.handler({ query: 'repeater' }));

      expect(text).toContain('# Search Results');
      expect(text).toContain('array');
    });

    it('results are capped at 10', async () => {
      // 'a' is a very broad token that matches many entries
      const text = getResultText(await registeredTool.handler({ query: 'a' }));

      const resultLines = text.split('\n').filter((l) => /^\d+\./.test(l));
      expect(resultLines.length).toBeLessThanOrEqual(10);
    });
  });

  describe('output format', () => {
    it('results include tool call strings', async () => {
      const text = getResultText(await registeredTool.handler({ query: 'conditional' }));

      expect(text).toMatch(/ngforge_lookup topic=".+"/);
    });

    it('results include category labels', async () => {
      const text = getResultText(await registeredTool.handler({ query: 'input' }));

      expect(text).toContain('Topic · Field Type');
    });

    it('results include workflow tip at bottom', async () => {
      const text = getResultText(await registeredTool.handler({ query: 'input' }));

      expect(text).toContain('**Tip:**');
      expect(text).toContain('ngforge_lookup topic="workflow"');
    });

    it('no-results includes suggestions for list commands', async () => {
      const text = getResultText(await registeredTool.handler({ query: 'nonexistent999' }));

      expect(text).toContain('ngforge_lookup topic="list"');
      expect(text).toContain('ngforge_examples pattern="list"');
      expect(text).toContain('Common searches');
    });
  });

  describe('cross-tool search', () => {
    it('finds both topics and patterns for overlapping keywords', async () => {
      const text = getResultText(await registeredTool.handler({ query: 'conditional' }));

      // Should find the 'conditional' topic and potentially 'minimal-conditional' pattern
      expect(text).toContain('Topic');
      expect(text).toContain('ngforge_');
    });

    it('multi-word queries score across multiple dimensions', async () => {
      const text = getResultText(await registeredTool.handler({ query: 'array template' }));

      expect(text).toContain('# Search Results');
      // Should find array-related entries
      expect(text).toContain('ngforge_');
    });
  });
});
