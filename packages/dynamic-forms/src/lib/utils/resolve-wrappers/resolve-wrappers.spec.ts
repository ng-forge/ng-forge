import { describe, it, expect } from 'vitest';
import { isSameWrapperChain, resolveWrappers } from './resolve-wrappers';
import { WrapperConfig } from '@ng-forge/dynamic-forms/internal';
import { FieldDef } from '@ng-forge/dynamic-forms/internal';

import { WrapperTypeDefinition } from '@ng-forge/dynamic-forms/internal';

type TestField = Pick<FieldDef<unknown>, 'type' | 'wrappers' | 'skipAutoWrappers' | 'skipDefaultWrappers'> & {
  validators?: readonly unknown[];
};

const EMPTY_REGISTRY = new Map<string, WrapperTypeDefinition>();

/** A registry where `custom-errors` declares it renders the field's errors, `plain` does not. */
const REGISTRY = new Map<string, WrapperTypeDefinition>([
  ['custom-errors', { wrapperName: 'custom-errors', loadComponent: async () => ({}) as never, rendersFieldErrors: true }],
  ['plain', { wrapperName: 'plain', loadComponent: async () => ({}) as never }],
]);

/** A container declaring validators, which is what triggers the error wrapper. */
const VALIDATORS = [{ type: 'custom', functionName: 'dateOrder' }] as const;

const typesOf = (chain: readonly WrapperConfig[]) => chain.map((w) => w.type);

/**
 * Shorthand: build an auto-association map from `{ fieldType: [wrapperNames] }`.
 * Mirrors what the WRAPPER_AUTO_ASSOCIATIONS provider constructs at registration.
 */
function autoAssoc(entries: Record<string, readonly string[]>): Map<string, WrapperConfig[]> {
  const map = new Map<string, WrapperConfig[]>();
  for (const [fieldType, wrapperNames] of Object.entries(entries)) {
    map.set(
      fieldType,
      wrapperNames.map((name) => ({ type: name }) as WrapperConfig),
    );
  }
  return map;
}

describe('resolveWrappers', () => {
  it('returns an empty chain for a bare field with no defaults and no auto-associations', () => {
    const field: TestField = { type: 'input' };

    expect(resolveWrappers(field, undefined, autoAssoc({}, EMPTY_REGISTRY))).toEqual([]);
  });

  it('returns the field-level wrappers unchanged when no defaults and no auto', () => {
    const fieldWrappers: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'a' } as WrapperConfig];
    const field: TestField = { type: 'input', wrappers: fieldWrappers };

    const result = resolveWrappers(field, undefined, autoAssoc({}, EMPTY_REGISTRY), EMPTY_REGISTRY);

    expect(result).toEqual(fieldWrappers);
  });

  it('returns an empty chain when field.wrappers === null (explicit opt-out)', () => {
    const field: TestField = { type: 'input', wrappers: null };
    const defaults: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'should-not-apply' } as WrapperConfig];

    const result = resolveWrappers(field, defaults, autoAssoc({ input: ['row'] }, EMPTY_REGISTRY), EMPTY_REGISTRY);

    expect(result).toEqual([]);
  });

  it('field.wrappers === [] does NOT opt out — defaults + auto still apply', () => {
    const field: TestField = { type: 'input', wrappers: [] };
    const defaults: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'default' } as WrapperConfig];

    const result = resolveWrappers(field, defaults, autoAssoc({ input: ['auto-input'] }, EMPTY_REGISTRY), EMPTY_REGISTRY);

    expect(result).toEqual([{ type: 'auto-input' }, { type: 'css', cssClasses: 'default' }]);
  });

  it('applies defaultWrappers when field.wrappers is undefined', () => {
    const defaults: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'default' } as WrapperConfig];
    const field: TestField = { type: 'input' };

    const result = resolveWrappers(field, defaults, autoAssoc({}, EMPTY_REGISTRY), EMPTY_REGISTRY);

    expect(result).toEqual(defaults);
  });

  it('merges auto-associations (outermost), defaults, then field-level wrappers (innermost)', () => {
    const defaults: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'default' } as WrapperConfig];
    const fieldWrappers: readonly WrapperConfig[] = [{ type: 'css', cssClasses: 'field-specific' } as WrapperConfig];
    const field: TestField = { type: 'input', wrappers: fieldWrappers };

    const result = resolveWrappers(
      field,
      defaults,
      autoAssoc({ input: ['auto-input'], select: ['auto-select'] }, EMPTY_REGISTRY),
      EMPTY_REGISTRY,
    );

    expect(result).toEqual([{ type: 'auto-input' }, { type: 'css', cssClasses: 'default' }, { type: 'css', cssClasses: 'field-specific' }]);
  });

  it('skips auto-associations that do not target the field type', () => {
    const field: TestField = { type: 'input' };

    const result = resolveWrappers(
      field,
      undefined,
      autoAssoc({ input: ['matches'], checkbox: ['does-not-match'] }, EMPTY_REGISTRY),
      EMPTY_REGISTRY,
    );

    expect(result).toEqual([{ type: 'matches' }]);
  });

  it('returns the same reference for every empty-chain call (for ref-stable memoization)', () => {
    const first = resolveWrappers({ type: 'input' }, undefined, autoAssoc({}, EMPTY_REGISTRY));
    const second = resolveWrappers({ type: 'input', wrappers: null }, undefined, autoAssoc({ input: ['ignored'] }, EMPTY_REGISTRY));

    expect(first).toBe(second);
    expect(first).toEqual([]);
  });

  it('skipAutoWrappers drops the auto layer but keeps defaults + field-level', () => {
    const defaults: readonly WrapperConfig[] = [{ type: 'card' } as WrapperConfig];
    const field: TestField = {
      type: 'input',
      skipAutoWrappers: true,
      wrappers: [{ type: 'field-specific' } as WrapperConfig],
    };

    const result = resolveWrappers(field, defaults, autoAssoc({ input: ['validation'] }, EMPTY_REGISTRY), EMPTY_REGISTRY);

    expect(result).toEqual([{ type: 'card' }, { type: 'field-specific' }]);
  });

  it('skipDefaultWrappers drops the defaults layer but keeps auto + field-level', () => {
    const defaults: readonly WrapperConfig[] = [{ type: 'card' } as WrapperConfig];
    const field: TestField = {
      type: 'input',
      skipDefaultWrappers: true,
      wrappers: [{ type: 'field-specific' } as WrapperConfig],
    };

    const result = resolveWrappers(field, defaults, autoAssoc({ input: ['validation'] }, EMPTY_REGISTRY), EMPTY_REGISTRY);

    expect(result).toEqual([{ type: 'validation' }, { type: 'field-specific' }]);
  });

  it('both skip flags together with no field wrappers produces an empty chain', () => {
    const defaults: readonly WrapperConfig[] = [{ type: 'card' } as WrapperConfig];
    const field: TestField = {
      type: 'input',
      skipAutoWrappers: true,
      skipDefaultWrappers: true,
    };

    expect(resolveWrappers(field, defaults, autoAssoc({ input: ['validation'] }, EMPTY_REGISTRY))).toEqual([]);
  });

  it('wrappers: null beats the skip flags — bare is bare', () => {
    const field: TestField = {
      type: 'input',
      wrappers: null,
      skipAutoWrappers: false,
      skipDefaultWrappers: false,
    };

    expect(resolveWrappers(field, [{ type: 'card' } as WrapperConfig], autoAssoc({ input: ['validation'] }, EMPTY_REGISTRY))).toEqual([]);
  });
});

describe('isSameWrapperChain', () => {
  it('is true when both chains are empty', () => {
    expect(isSameWrapperChain([], [])).toBe(true);
  });

  it('is true when chains share references element-wise', () => {
    const w: WrapperConfig = { type: 'css', cssClasses: 'a' } as WrapperConfig;
    expect(isSameWrapperChain([w], [w])).toBe(true);
  });

  it('is false when lengths differ', () => {
    const w: WrapperConfig = { type: 'css' } as WrapperConfig;
    expect(isSameWrapperChain([w], [w, w])).toBe(false);
  });

  it('is false when any element differs by reference (even if structurally equal)', () => {
    const a: WrapperConfig = { type: 'css', cssClasses: 'x' } as WrapperConfig;
    const b: WrapperConfig = { type: 'css', cssClasses: 'x' } as WrapperConfig;
    expect(isSameWrapperChain([a], [b])).toBe(false);
  });

  describe('container error wrapper (#568)', () => {
    it('appends field-errors when a container declares validators', () => {
      const field: TestField = { type: 'group', validators: VALIDATORS };

      expect(typesOf(resolveWrappers(field, undefined, autoAssoc({}), REGISTRY))).toEqual(['field-errors']);
    });

    it('leaves a container without validators untouched', () => {
      const field: TestField = { type: 'group' };

      expect(typesOf(resolveWrappers(field, undefined, autoAssoc({}), REGISTRY))).toEqual([]);
    });

    it('appends field-errors innermost, after every other layer', () => {
      const field: TestField = { type: 'group', validators: VALIDATORS, wrappers: [{ type: 'plain' } as WrapperConfig] };

      const result = resolveWrappers(field, [{ type: 'css' } as WrapperConfig], autoAssoc({ group: ['row'] }), REGISTRY);

      expect(typesOf(result)).toEqual(['row', 'css', 'plain', 'field-errors']);
    });

    it('skips the default when a field-level wrapper declares rendersFieldErrors', () => {
      const field: TestField = { type: 'group', validators: VALIDATORS, wrappers: [{ type: 'custom-errors' } as WrapperConfig] };

      expect(typesOf(resolveWrappers(field, undefined, autoAssoc({}), REGISTRY))).toEqual(['custom-errors']);
    });

    it('skips the default when the declaring wrapper arrives via defaultWrappers', () => {
      const field: TestField = { type: 'group', validators: VALIDATORS };

      const result = resolveWrappers(field, [{ type: 'custom-errors' } as WrapperConfig], autoAssoc({}), REGISTRY);

      expect(typesOf(result)).toEqual(['custom-errors']);
    });

    it('skips the default when the declaring wrapper arrives via auto-association', () => {
      const field: TestField = { type: 'group', validators: VALIDATORS };

      const result = resolveWrappers(field, undefined, autoAssoc({ group: ['custom-errors'] }), REGISTRY);

      expect(typesOf(result)).toEqual(['custom-errors']);
    });

    it('still appends the default alongside a wrapper that does not declare the capability', () => {
      const field: TestField = { type: 'group', validators: VALIDATORS, wrappers: [{ type: 'plain' } as WrapperConfig] };

      expect(typesOf(resolveWrappers(field, undefined, autoAssoc({}), REGISTRY))).toEqual(['plain', 'field-errors']);
    });

    it('does not append twice when field-errors is already declared explicitly', () => {
      const field: TestField = { type: 'group', validators: VALIDATORS, wrappers: [{ type: 'field-errors' } as WrapperConfig] };

      expect(typesOf(resolveWrappers(field, undefined, autoAssoc({}), REGISTRY))).toEqual(['field-errors']);
    });

    it('renders no chain at all under wrappers: null, even with validators', () => {
      const field: TestField = { type: 'group', validators: VALIDATORS, wrappers: null };

      expect(typesOf(resolveWrappers(field, [{ type: 'css' } as WrapperConfig], autoAssoc({ group: ['row'] }), REGISTRY))).toEqual([]);
    });

    it('leaves a leaf field with validators alone, since it renders its own errors', () => {
      const field: TestField = { type: 'input', validators: VALIDATORS };

      expect(typesOf(resolveWrappers(field, undefined, autoAssoc({}), REGISTRY))).toEqual([]);
    });

    it('appends to an array container the same way as a group', () => {
      const field: TestField = { type: 'array', validators: VALIDATORS };

      expect(typesOf(resolveWrappers(field, undefined, autoAssoc({}), REGISTRY))).toEqual(['field-errors']);
    });

    it('keeps the appended entry identical across calls so the chain memoises', () => {
      const field: TestField = { type: 'group', validators: VALIDATORS };

      const first = resolveWrappers(field, undefined, autoAssoc({}), REGISTRY);
      const second = resolveWrappers(field, undefined, autoAssoc({}), REGISTRY);

      expect(isSameWrapperChain(first, second)).toBe(true);
    });
  });
});
