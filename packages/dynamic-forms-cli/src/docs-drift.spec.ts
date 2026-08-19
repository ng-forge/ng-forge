/**
 * The skill is generated, so it cannot drift. The CLI's README and the docs
 * page are hand-written, and their flag and exit-code tables are exactly the
 * kind of thing that goes stale the first time someone adds an option.
 *
 * These derive the truth from the commander definition and the exported exit
 * codes, then assert the prose agrees.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProgram } from './cli.js';
import { EXIT_OK, EXIT_INVALID_CONFIG, EXIT_USAGE } from './run-validate.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const README = join(HERE, '..', 'README.md');
const DOCS_PAGE = join(HERE, '..', '..', '..', 'apps', 'docs', 'public', 'content', 'ai-integration', 'skills.md');

let readme: string;
let docsPage: string;

beforeAll(async () => {
  readme = await readFile(README, 'utf-8');
  docsPage = await readFile(DOCS_PAGE, 'utf-8');
});

/** The tables write short and long together (`-q, --quiet`), so accept either form. */
function documents(source: string, flag: string): boolean {
  return source.includes(`\`${flag}`) || source.includes(`, ${flag}`);
}

/** Long flags the CLI actually accepts. */
function definedFlags(): string[] {
  return createProgram()
    .options.map((o) => o.long)
    .filter((long): long is string => Boolean(long))
    .sort();
}

describe('flag documentation', () => {
  it('documents every flag the CLI defines, in the README', () => {
    for (const flag of definedFlags()) {
      expect(documents(readme, flag), `README does not document ${flag}`).toBe(true);
    }
  });

  it('documents every flag the CLI defines, on the docs page', () => {
    for (const flag of definedFlags()) {
      expect(documents(docsPage, flag), `docs page does not document ${flag}`).toBe(true);
    }
  });

  it('does not document flags the CLI does not define', () => {
    const defined = new Set(definedFlags());
    // Only inspect the options table, so prose mentioning other tools is ignored.
    const documented = [...readme.matchAll(/^\| `(--[a-z-]+)[^|]*\|/gm)].map((m) => m[1]);

    expect(documented.length).toBeGreaterThan(0);
    for (const flag of documented) {
      expect(defined.has(flag), `README documents ${flag}, which the CLI does not define`).toBe(true);
    }
  });
});

describe('exit code documentation', () => {
  it('uses the codes the CLI actually returns', () => {
    // Guards against the table drifting from the constants, which is what
    // happened when commander's own exit 1 contradicted the documented 2.
    expect(EXIT_OK).toBe(0);
    expect(EXIT_INVALID_CONFIG).toBe(1);
    expect(EXIT_USAGE).toBe(2);
  });

  it('documents all three codes in both places', () => {
    for (const [label, source] of [
      ['README', () => readme],
      ['docs page', () => docsPage],
    ] as const) {
      for (const code of [EXIT_OK, EXIT_INVALID_CONFIG, EXIT_USAGE]) {
        expect(source(), `${label} does not document exit code ${code}`).toContain(`| \`${code}\``);
      }
    }
  });
});

describe('documented commands', () => {
  it('uses non-interactive npx everywhere it shows the command', () => {
    // A bare `npx <pkg>` prompts before its first install, and an agent has no
    // way to answer.
    for (const [label, source] of [
      ['README', () => readme],
      ['docs page', () => docsPage],
    ] as const) {
      const invocations = [...source().matchAll(/npx (?:--yes )?@ng-forge\/dynamic-forms-cli/g)].map((m) => m[0]);
      expect(invocations.length, `${label} shows no invocation`).toBeGreaterThan(0);

      for (const invocation of invocations) {
        expect(invocation, `${label} has an interactive npx invocation`).toContain('--yes');
      }
    }
  });

  it('states the Node requirement wherever the command is shown', () => {
    expect(readme).toMatch(/Node 24/);
    expect(docsPage).toMatch(/Node 24/);
  });
});
