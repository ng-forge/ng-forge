import { describe, it, expect } from 'vitest';
import { validateFormConfig } from '@ng-forge/dynamic-forms-zod/mcp';

/**
 * Parity guard between the dynamic-forms library and the MCP/zod validation
 * surface for array-action button field types.
 *
 * Regression context: the zod schemas previously only modelled 2 of the 6
 * array-action button types (addArrayItem/removeArrayItem) in camelCase, so the
 * MCP `validate` tool falsely rejected the other four AND, after the 1.0
 * kebab-case migration, falsely rejected the new canonical spellings. This test
 * asserts that every array-action type validates in BOTH the canonical kebab
 * form and the deprecated camelCase alias (normalized at the validate entry),
 * across all four adapters. If a new array-action type is added to the library,
 * add it here and to the adapter zod schemas together.
 */
const ADAPTERS = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

// [canonical kebab, deprecated camelCase alias]
const ARRAY_ACTION_TYPES: ReadonlyArray<readonly [string, string]> = [
  ['add-array-item', 'addArrayItem'],
  ['prepend-array-item', 'prependArrayItem'],
  ['insert-array-item', 'insertArrayItem'],
  ['remove-array-item', 'removeArrayItem'],
  ['pop-array-item', 'popArrayItem'],
  ['shift-array-item', 'shiftArrayItem'],
];

function configWith(type: string): unknown {
  return { fields: [{ key: 'btn', type, label: 'Test', arrayKey: 'items', index: 0 }] };
}

describe('array-action field-type parity (library <-> zod/MCP)', () => {
  for (const adapter of ADAPTERS) {
    describe(adapter, () => {
      for (const [kebab, camel] of ARRAY_ACTION_TYPES) {
        it(`accepts canonical '${kebab}'`, () => {
          const result = validateFormConfig(adapter, configWith(kebab));
          expect(result.valid).toBe(true);
        });

        it(`accepts legacy alias '${camel}' (normalized to '${kebab}')`, () => {
          const result = validateFormConfig(adapter, configWith(camel));
          expect(result.valid).toBe(true);
        });
      }
    });
  }

  it('still rejects an unknown array-action spelling (normalizer scope is bounded)', () => {
    const result = validateFormConfig('material', configWith('addItem'));
    expect(result.valid).toBe(false);
  });
});
