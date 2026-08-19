/**
 * Regression tests for config discovery.
 *
 * Every case here was a silent false pass: the extractor reported "no config
 * found", the CLI exited 0, and a broken config shipped. That failure mode is
 * worse than a wrong verdict, because a clean run and an unchecked run look
 * identical. These assert the config is *found*, then that it is judged.
 */

import { describe, it, expect } from 'vitest';
import { validateSource } from './validate-file';

const header = `import { FormConfig } from '@ng-forge/dynamic-forms';\n\n`;

/** Names of every config discovered in a source. */
function found(source: string) {
  return validateSource(header + source, '/tmp/probe.ts', 'material');
}

describe('type evidence is sufficient on its own', () => {
  it('finds an explicitly typed config whose fields are not an array', () => {
    const result = found(`const broken: FormConfig = { fields: 'nonsense' as any };`);

    expect(result.noConfigsFound, 'a typed config must never be skipped').toBe(false);
    expect(result.valid).toBe(false);
  });

  it('finds an explicitly typed config with no fields property at all', () => {
    const result = found(`const broken: FormConfig = { nope: true } as any;`);

    expect(result.noConfigsFound).toBe(false);
    expect(result.valid).toBe(false);
  });

  it('finds a satisfies config whose fields are malformed', () => {
    const result = found(`const broken = { fields: 42 } as unknown as FormConfig;`);

    expect(result.noConfigsFound).toBe(false);
    expect(result.valid).toBe(false);
  });

  it('finds an as-cast config whose fields are malformed', () => {
    const result = found(`const broken = { fields: {} } as FormConfig;`);

    expect(result.noConfigsFound).toBe(false);
    expect(result.valid).toBe(false);
  });

  it('still reports a well-formed typed config as valid', () => {
    const result = found(`const ok: FormConfig = { fields: [{ key: 'a', type: 'input', label: 'A' }] };`);

    expect(result.noConfigsFound).toBe(false);
    expect(result.valid).toBe(true);
  });
});

describe('declaration shapes', () => {
  it('finds a config declared as a class property', () => {
    const result = found(`class C {\n  readonly config: FormConfig = { fields: [{ key: 't', type: 'hidden' }] };\n}`);

    expect(result.results.map((r) => r.name)).toContain('config');
    expect(result.valid).toBe(false);
  });

  it('finds a default-exported config', () => {
    const result = found(`export default { fields: [{ key: 't', type: 'hidden' }] } as const satisfies FormConfig;`);

    expect(result.results.map((r) => r.name)).toContain('default');
    expect(result.valid).toBe(false);
  });

  it('finds an untyped config by shape alone', () => {
    const result = found(`const cfg = { fields: [{ key: 'a', type: 'input', label: 'A' }] };`);

    expect(result.noConfigsFound).toBe(false);
    expect(result.results[0].matchReason).toBe('structural');
  });

  it('does not mistake an unrelated object for a config', () => {
    const result = found(`const notAConfig = { title: 'x', items: [1, 2, 3] };`);

    expect(result.noConfigsFound).toBe(true);
  });
});

describe('multiple configs in one file', () => {
  it('finds same-named configs declared in separate scopes', () => {
    const result = found(
      `function a() {\n` +
        `  const form = { fields: [{ key: 'x', type: 'input', label: 'X' }] } as const satisfies FormConfig;\n` +
        `  return form;\n` +
        `}\n` +
        `function b() {\n` +
        `  const form = { fields: [{ key: 'y', type: 'hidden' }] } as const satisfies FormConfig;\n` +
        `  return form;\n` +
        `}`,
    );

    // Deduplicating by variable name dropped the second one entirely, so a
    // broken config sitting behind a same-named sibling was never checked.
    expect(result.results).toHaveLength(2);
    expect(result.valid).toBe(false);
  });

  it('reports each config separately with its own line', () => {
    const result = found(
      `const first = { fields: [{ key: 'a', type: 'input', label: 'A' }] } as const satisfies FormConfig;\n` +
        `const second = { fields: [{ key: 'b', type: 'hidden' }] } as const satisfies FormConfig;`,
    );

    expect(result.results.map((r) => r.name)).toEqual(['first', 'second']);
    expect(result.results[0].line).toBeLessThan(result.results[1].line);
    expect(result.results[0].validation.valid).toBe(true);
    expect(result.results[1].validation.valid).toBe(false);
  });

  it('counts a config once even when several strategies could match it', () => {
    const result = found(`const cfg: FormConfig = { fields: [{ key: 'a', type: 'input', label: 'A' }] } as const satisfies FormConfig;`);

    expect(result.results).toHaveLength(1);
  });
});
