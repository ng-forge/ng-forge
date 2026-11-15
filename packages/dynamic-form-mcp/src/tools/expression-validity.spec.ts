/**
 * Every expression the MCP hands to models must run under the real parser.
 *
 * The examples and instructions also feed the generated skill, so an expression the
 * parser rejects (a direct call like `parseInt(x)`, a global like `Math`) would teach
 * syntax that fails at runtime. This runs them through the same parse and static check
 * the library applies in dev mode at startup.
 */

import { describe, it, expect } from 'vitest';
// eslint-disable-next-line @nx/enforce-module-boundaries -- test-only: the parser is plain TypeScript and the MCP has no runtime dependency on the library.
import { ExpressionParser } from '../../../dynamic-forms/internal/src/lib/core/expressions/parser/expression-parser.js';
// eslint-disable-next-line @nx/enforce-module-boundaries -- see above.
import {
  CONDITION_SCOPE_VARIABLES,
  findStaticExpressionProblems,
} from '../../../dynamic-forms/internal/src/lib/core/expressions/parser/static-check.js';
import { PATTERNS } from './examples.tool.js';
import { INSTRUCTIONS } from '../registry/instructions.js';

/** Placeholders the prose uses to stand for "an expression goes here". */
const PLACEHOLDERS = new Set(['', '...', 'expr']);

function extractExpressions(text: string): string[] {
  const found: string[] = [];
  const regex = /\b(?:derivation|expression)\s*:\s*(?:'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)")/g;
  for (const match of text.matchAll(regex)) {
    const expression = (match[1] ?? match[2]).replace(/\\(.)/g, '$1');
    if (!PLACEHOLDERS.has(expression)) found.push(expression);
  }
  return found;
}

function problemsIn(expression: string): string[] {
  try {
    return findStaticExpressionProblems(ExpressionParser.parse(expression), CONDITION_SCOPE_VARIABLES);
  } catch (e) {
    return [e instanceof Error ? e.message : String(e)];
  }
}

const sources: [string, string][] = [
  ...Object.entries(PATTERNS).flatMap(([name, depths]) =>
    Object.entries(depths).map(([depth, content]): [string, string] => [`${name}/${depth}`, content]),
  ),
  ['instructions', INSTRUCTIONS],
];

describe('shipped expression validity', () => {
  it('finds expressions to check', () => {
    expect(sources.flatMap(([, text]) => extractExpressions(text)).length).toBeGreaterThan(20);
  });

  it.each(sources)('%s: every expression parses and passes the startup check', (_, text) => {
    const failures = extractExpressions(text)
      .map((expression) => ({ expression, problems: problemsIn(expression) }))
      .filter(({ problems }) => problems.length > 0);
    expect(failures).toEqual([]);
  });
});
