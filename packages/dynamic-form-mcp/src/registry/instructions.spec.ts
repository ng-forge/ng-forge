/**
 * Instruction / Resource Tool-Name Regression Tests
 *
 * Guards against re-introducing dead tool names in AI-facing text. Every
 * `ngforge_*` token referenced in the instructions and the schemas resource
 * must match one of the actually-registered MCP tools.
 */

import { describe, it, expect, vi } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { INSTRUCTIONS } from './instructions.js';
import { registerSchemasResource } from '../resources/schemas.resource.js';

/** Tool names actually registered via `server.tool(...)`. */
const REGISTERED_TOOLS = new Set(['ngforge_search', 'ngforge_lookup', 'ngforge_examples', 'ngforge_scaffold', 'ngforge_validate']);

/** Extract every `ngforge_<name>` token from a string. */
function extractToolNames(text: string): string[] {
  return text.match(/ngforge_[a-z_]+/g) ?? [];
}

/** Render the schemas resource text by invoking its registered handler. */
async function getSchemasResourceText(): Promise<string> {
  let handler: (() => Promise<{ contents: Array<{ text: string }> }>) | undefined;

  const server = {
    resource: vi.fn((_name: string, _uri: string, fn: typeof handler) => {
      handler = fn;
    }),
  } as unknown as McpServer;

  registerSchemasResource(server);

  if (!handler) {
    throw new Error('registerSchemasResource did not register a handler');
  }

  const result = await handler();
  return result.contents[0].text;
}

describe('AI-facing tool-name references', () => {
  it('INSTRUCTIONS references only registered tools', () => {
    const names = extractToolNames(INSTRUCTIONS);

    // Sanity: the text should actually mention some tools.
    expect(names.length).toBeGreaterThan(0);

    for (const name of names) {
      expect(REGISTERED_TOOLS, `INSTRUCTIONS references unknown tool "${name}"`).toContain(name);
    }
  });

  it('schemas resource references only registered tools', async () => {
    const text = await getSchemasResourceText();
    const names = extractToolNames(text);

    expect(names.length).toBeGreaterThan(0);

    for (const name of names) {
      expect(REGISTERED_TOOLS, `schemas resource references unknown tool "${name}"`).toContain(name);
    }
  });
});
