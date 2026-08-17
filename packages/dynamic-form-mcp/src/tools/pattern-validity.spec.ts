/**
 * Every shipped example pattern must actually validate.
 *
 * These patterns are handed to models verbatim, through the MCP `ngforge_examples`
 * tool and through the generated `skills/dynamic-forms/references/patterns.md`.
 * An invalid example teaches the mistake instead of the fix, so it is worth a gate.
 */

import { describe, it, expect } from 'vitest';
import { validateSource } from '@ng-forge/dynamic-forms-cli';
import { PATTERNS } from './examples.tool.js';

const DEPTHS = ['minimal', 'brief', 'full'] as const;

/**
 * Patterns that currently ship with no content at any depth. `ngforge_examples`
 * returns an empty string for these, despite the tool description naming
 * `complete` as the recommended starting point. Tracked here so the gap is
 * visible rather than silently skipped; shorten this list when they are filled in.
 */
const KNOWN_EMPTY_PATTERNS = ['complete', 'mega'];

/** Pull fenced TypeScript blocks out of markdown-shaped pattern content. */
function extractTypeScriptBlocks(content: string): string[] {
  const blocks: string[] = [];
  const regex = /```typescript\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

/** The sources worth validating inside one pattern/depth pair. */
function candidateSources(content: string): string[] {
  if (content.trim().length === 0) {
    return [];
  }
  const fenced = extractTypeScriptBlocks(content);
  return fenced.length > 0 ? fenced : [content];
}

describe('example pattern validity', () => {
  const names = Object.keys(PATTERNS);
  let configsChecked = 0;

  it('ships at least one pattern', () => {
    expect(names.length).toBeGreaterThan(0);
  });

  it('documents every empty pattern', () => {
    const empty = names.filter((name) => DEPTHS.every((depth) => PATTERNS[name][depth].trim().length === 0));
    expect(empty.sort()).toEqual([...KNOWN_EMPTY_PATTERNS].sort());
  });

  for (const name of names) {
    if (KNOWN_EMPTY_PATTERNS.includes(name)) {
      continue;
    }

    for (const depth of DEPTHS) {
      const sources = candidateSources(PATTERNS[name][depth]);

      if (sources.length === 0) {
        continue;
      }

      it(`${name} (${depth}) validates`, () => {
        const failures: string[] = [];
        let found = 0;

        for (const [index, source] of sources.entries()) {
          const result = validateSource(source, `${name}.${depth}.${index}.ts`, 'material');

          // Snippets that are field fragments rather than whole configs carry no
          // `fields` array, so there is nothing to validate against the schema.
          if (result.noConfigsFound) {
            continue;
          }

          found += result.results.length;
          failures.push(
            ...result.results
              .filter((r) => !r.validation.valid)
              .flatMap((r) => (r.validation.errors ?? []).map((e) => `${r.name}: ${e.path} - ${e.message}`)),
          );
        }

        configsChecked += found;
        expect(failures).toEqual([]);
      });
    }
  }

  it('actually validated a meaningful number of configs', () => {
    // Guards against the extraction above silently degrading to a no-op.
    expect(configsChecked).toBeGreaterThan(10);
  });
});
