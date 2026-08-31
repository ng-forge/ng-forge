/**
 * The recursive field schema is discriminated on `type`, and must stay that way.
 *
 * A plain `z.union` picks an option by trying each in turn, and a `z.object`
 * option does not stop at a failed `type` literal: it goes on to parse `fields`,
 * recursing through the entire subtree before reporting the failure it already
 * knew about. Each nesting level then re-parses its subtree once per preceding
 * option, so cost grows exponentially with depth rather than linearly.
 *
 * These tests pin the two things that keep it linear: the dispatch itself, and
 * the single-schema array that a discriminated union requires (two options
 * cannot share one `type` value).
 */

import { describe, it, expect } from 'vitest';
import { getFormConfigJsonSchema, validateFormConfig, type UiIntegration } from '../../../../validate/src';

const ADAPTERS: UiIntegration[] = ['material', 'bootstrap', 'primeng', 'ionic'];
const leaf = { key: 'email', type: 'input', label: 'Email' };

function check(config: unknown, ui: UiIntegration = 'material') {
  const result = validateFormConfig(ui, config);
  return { valid: result.valid, text: (result.errors ?? []).map((e) => `${e.path}: ${e.message}`).join('\n') };
}

/** Alternating group/row, which is legal at any depth. */
function nest(depth: number): unknown {
  let node: unknown = leaf;
  for (let i = 0; i < depth; i++) {
    node = { key: `n${i}`, type: i % 2 === 0 ? 'group' : 'row', fields: [node] };
  }
  return { fields: [node] };
}

describe('nesting cost stays linear', () => {
  // Deliberately a wall-clock assertion with an enormous margin. Under the old
  // plain union this depth did not complete in ten minutes; discriminated it is
  // a fraction of a millisecond. Any budget in between catches a regression to
  // `z.union` without being sensitive to machine speed.
  it('validates deeply nested containers without exponential blowup', () => {
    const start = performance.now();
    const result = check(nest(40));
    const elapsed = performance.now() - start;

    expect(result.valid, result.text).toBe(true);
    expect(elapsed, `40 levels took ${elapsed.toFixed(0)}ms; the union is no longer discriminating on type`).toBeLessThan(2000);
  });

  it('stays linear as depth grows, rather than multiplying per level', () => {
    const time = (depth: number) => {
      check(nest(depth)); // warm
      const start = performance.now();
      for (let i = 0; i < 5; i++) check(nest(depth));
      return (performance.now() - start) / 5;
    };

    const shallow = Math.max(time(4), 0.01);
    const deep = time(32);

    // Linear would be ~8x. Exponential was ~3x PER LEVEL. 100x leaves room for
    // noise on a loaded CI box while still failing loudly on a regression.
    expect(deep / shallow, `depth 32 cost ${(deep / shallow).toFixed(1)}x depth 4`).toBeLessThan(100);
  });
});

describe('field dispatch reports the actual mistake', () => {
  it.each(ADAPTERS)('names an unknown type and lists the valid ones (%s)', (ui) => {
    const result = check({ fields: [{ key: 'a', type: 'acme-currency', label: 'A' }] }, ui);

    expect(result.valid).toBe(false);
    expect(result.text).toContain('Unknown field type "acme-currency"');
    // The list is read off the schema, so an accepted-but-unlisted type cannot happen.
    expect(result.text).toContain('insert-array-item');
  });

  it('points at the offending property when the type is known', () => {
    // Dispatching on `type` means a known type is parsed against exactly one
    // schema, so the error is about the property rather than "nothing matched".
    const result = check({ fields: [{ key: 'a', type: 'select', label: 'A' }] });

    expect(result.valid).toBe(false);
    expect(result.text).toContain('options');
  });

  it.each(ADAPTERS)('still accepts every container type (%s)', (ui) => {
    const config = {
      fields: [
        {
          key: 'page',
          type: 'page',
          fields: [
            { key: 'r', type: 'row', fields: [{ key: 'g', type: 'group', fields: [leaf] }] },
            { key: 'arr', type: 'array', fields: [leaf] },
          ],
        },
      ],
    };

    expect(check(config, ui).valid, check(config, ui).text).toBe(true);
  });
});

describe('array keeps both APIs under one schema', () => {
  // A discriminated union cannot hold two options with type: 'array', so the
  // full and simplified APIs are one schema plus a refinement.
  it('accepts the full API', () => {
    expect(check({ fields: [{ key: 'a', type: 'array', fields: [leaf] }] }).valid).toBe(true);
  });

  it('accepts the simplified API', () => {
    expect(check({ fields: [{ key: 'a', type: 'array', template: leaf, value: [] }] }).valid).toBe(true);
  });

  it('rejects both at once, and says so', () => {
    const result = check({ fields: [{ key: 'a', type: 'array', fields: [leaf], template: leaf }] });

    expect(result.valid).toBe(false);
    expect(result.text).toContain('mutually exclusive');
  });

  it('rejects neither, and says so', () => {
    const result = check({ fields: [{ key: 'a', type: 'array' }] });

    expect(result.valid).toBe(false);
    expect(result.text).toMatch(/MISSING both|MISSING/);
  });

  it('rejects minItems on both APIs, not just the simplified one', () => {
    // minItems/maxItems are the common wrong spelling of minLength/maxLength.
    // The full API used to strip them silently; one schema means one rule.
    const full = check({ fields: [{ key: 'a', type: 'array', fields: [leaf], minItems: 2 }] });
    const simplified = check({ fields: [{ key: 'a', type: 'array', template: leaf, minItems: 2 }] });

    expect(full.valid, 'full API should reject minItems').toBe(false);
    expect(simplified.valid, 'simplified API should reject minItems').toBe(false);
  });

  // Not asserted here: minLength/maxLength on an array. The schema accepts them,
  // but pre-validation still forbids them on every container including `array`,
  // which is a separate pre-existing bug being fixed elsewhere. Asserting either
  // verdict here would collide with that fix.

  it('publishes the fields/template rule in the generated JSON Schema', () => {
    // The refinement is runtime-only and invisible to JSON Schema generation.
    // That schema is authoring guidance for a model, so the constraint has to be
    // restated there or the published contract is looser than the validator.
    const schema = getFormConfigJsonSchema('material');
    const arrays: Record<string, unknown>[] = [];

    const walk = (node: unknown, depth = 0): void => {
      if (depth > 14 || !node || typeof node !== 'object') return;
      if (Array.isArray(node)) return node.forEach((n) => walk(n, depth + 1));
      const o = node as Record<string, unknown>;
      const typeProp = (o['properties'] as Record<string, unknown> | undefined)?.['type'] as Record<string, unknown> | undefined;
      if (typeProp?.['const'] === 'array') arrays.push(o);
      Object.values(o).forEach((v) => walk(v, depth + 1));
    };
    walk(schema);

    expect(arrays.length, 'expected an array field schema in the output').toBeGreaterThan(0);
    for (const node of arrays) {
      expect(node['oneOf'], 'array schema must state that fields and template are exclusive').toEqual([
        { required: ['fields'], not: { required: ['template'] } },
        { required: ['template'], not: { required: ['fields'] } },
      ]);
    }
  });

  it('rejects a page inside an array template', () => {
    const result = check({ fields: [{ key: 'a', type: 'array', template: { key: 'p', type: 'page', fields: [] } }] });

    expect(result.valid).toBe(false);
  });
});
