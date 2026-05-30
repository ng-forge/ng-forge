import { describe, it, expect, vi } from 'vitest';
import { signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldTypeDefinition } from '../../models/field-type';
import { ResolvedValueExclusionConfig, ValueExclusionConfig } from '../../models/value-exclusion-config';
import { resolveExclusionConfig, filterFormValue } from './value-filter';

// ─────────────────────────────────────────────────────────────────────────────
// Test Helpers
// ─────────────────────────────────────────────────────────────────────────────

const ALL_ENABLED: ResolvedValueExclusionConfig = {
  excludeValueIfHidden: true,
  excludeValueIfDisabled: true,
  excludeValueIfReadonly: true,
};

const ALL_DISABLED: ResolvedValueExclusionConfig = {
  excludeValueIfHidden: false,
  excludeValueIfDisabled: false,
  excludeValueIfReadonly: false,
};

function createFieldState(opts: { hidden?: boolean; disabled?: boolean; readonly?: boolean } = {}): FieldTree<unknown> {
  const state = {
    hidden: signal(opts.hidden ?? false),
    disabled: signal(opts.disabled ?? false),
    readonly: signal(opts.readonly ?? false),
    value: signal(undefined),
    valid: signal(true),
    invalid: signal(false),
    dirty: signal(false),
    touched: signal(false),
    errors: signal([]),
  };

  // FieldTree is a callable that returns the state object
  const fn = (() => state) as unknown as FieldTree<unknown>;
  return fn;
}

function createRegistry(...entries: [string, Partial<FieldTypeDefinition>][]): Map<string, FieldTypeDefinition> {
  const map = new Map<string, FieldTypeDefinition>();
  for (const [name, def] of entries) {
    map.set(name, { name, ...def } as FieldTypeDefinition);
  }
  return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// resolveExclusionConfig
// ─────────────────────────────────────────────────────────────────────────────

describe('resolveExclusionConfig', () => {
  it('should return global defaults when form and field are undefined', () => {
    const result = resolveExclusionConfig(ALL_ENABLED, undefined, undefined);
    expect(result).toEqual(ALL_ENABLED);
  });

  it('should return global defaults when form and field have no overrides', () => {
    const result = resolveExclusionConfig(ALL_ENABLED, {}, {});
    expect(result).toEqual(ALL_ENABLED);
  });

  it('should allow form to override global for excludeValueIfHidden', () => {
    const result = resolveExclusionConfig(ALL_ENABLED, { excludeValueIfHidden: false }, undefined);
    expect(result.excludeValueIfHidden).toBe(false);
    expect(result.excludeValueIfDisabled).toBe(true);
    expect(result.excludeValueIfReadonly).toBe(true);
  });

  it('should allow form to override global for excludeValueIfDisabled', () => {
    const result = resolveExclusionConfig(ALL_ENABLED, { excludeValueIfDisabled: false }, undefined);
    expect(result.excludeValueIfHidden).toBe(true);
    expect(result.excludeValueIfDisabled).toBe(false);
    expect(result.excludeValueIfReadonly).toBe(true);
  });

  it('should allow form to override global for excludeValueIfReadonly', () => {
    const result = resolveExclusionConfig(ALL_ENABLED, { excludeValueIfReadonly: false }, undefined);
    expect(result.excludeValueIfHidden).toBe(true);
    expect(result.excludeValueIfDisabled).toBe(true);
    expect(result.excludeValueIfReadonly).toBe(false);
  });

  it('should allow field to override form', () => {
    const result = resolveExclusionConfig(ALL_ENABLED, { excludeValueIfHidden: false }, { excludeValueIfHidden: true });
    expect(result.excludeValueIfHidden).toBe(true);
  });

  it('should allow field to override global', () => {
    const result = resolveExclusionConfig(ALL_ENABLED, undefined, { excludeValueIfDisabled: false });
    expect(result.excludeValueIfDisabled).toBe(false);
  });

  it('should mix different tiers for different properties', () => {
    const result = resolveExclusionConfig(ALL_ENABLED, { excludeValueIfHidden: false }, { excludeValueIfReadonly: false });
    expect(result.excludeValueIfHidden).toBe(false); // form override
    expect(result.excludeValueIfDisabled).toBe(true); // global default
    expect(result.excludeValueIfReadonly).toBe(false); // field override
  });

  it('should handle all disabled global with form enabling', () => {
    const result = resolveExclusionConfig(ALL_DISABLED, { excludeValueIfHidden: true }, undefined);
    expect(result.excludeValueIfHidden).toBe(true);
    expect(result.excludeValueIfDisabled).toBe(false);
    expect(result.excludeValueIfReadonly).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// filterFormValue
// ─────────────────────────────────────────────────────────────────────────────

describe('filterFormValue', () => {
  const registry = createRegistry(
    ['input', { valueHandling: 'include' }],
    ['select', { valueHandling: 'include' }],
    ['hidden', { valueHandling: 'include' }],
    ['button', { valueHandling: 'exclude' }],
    ['group', { valueHandling: 'include' }],
    ['array', { valueHandling: 'include' }],
    ['row', { valueHandling: 'flatten' }],
    ['page', { valueHandling: 'flatten' }],
  );

  describe('basic filtering', () => {
    it('should pass all values through when all exclusion is disabled', () => {
      const rawValue = { name: 'John', email: 'john@test.com' };
      const fields: FieldDef<unknown>[] = [
        { key: 'name', type: 'input' },
        { key: 'email', type: 'input' },
      ];
      const formTree = {
        name: createFieldState(),
        email: createFieldState(),
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_DISABLED, undefined);

      expect(result).toEqual({ name: 'John', email: 'john@test.com' });
    });

    it('should exclude hidden field values when excludeValueIfHidden is enabled', () => {
      const rawValue = { name: 'John', email: 'john@test.com' };
      const fields: FieldDef<unknown>[] = [
        { key: 'name', type: 'input' },
        { key: 'email', type: 'input' },
      ];
      const formTree = {
        name: createFieldState({ hidden: true }),
        email: createFieldState(),
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_ENABLED, undefined);

      expect(result).toEqual({ email: 'john@test.com' });
    });

    it('should exclude disabled field values when excludeValueIfDisabled is enabled', () => {
      const rawValue = { name: 'John', email: 'john@test.com' };
      const fields: FieldDef<unknown>[] = [
        { key: 'name', type: 'input' },
        { key: 'email', type: 'input' },
      ];
      const formTree = {
        name: createFieldState({ disabled: true }),
        email: createFieldState(),
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_ENABLED, undefined);

      expect(result).toEqual({ email: 'john@test.com' });
    });

    it('should exclude readonly field values when excludeValueIfReadonly is enabled', () => {
      const rawValue = { name: 'John', email: 'john@test.com' };
      const fields: FieldDef<unknown>[] = [
        { key: 'name', type: 'input' },
        { key: 'email', type: 'input' },
      ];
      const formTree = {
        name: createFieldState({ readonly: true }),
        email: createFieldState(),
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_ENABLED, undefined);

      expect(result).toEqual({ email: 'john@test.com' });
    });

    it('should only exclude matching states', () => {
      const rawValue = { a: 1, b: 2, c: 3 };
      const fields: FieldDef<unknown>[] = [
        { key: 'a', type: 'input' },
        { key: 'b', type: 'input' },
        { key: 'c', type: 'input' },
      ];
      const formTree = {
        a: createFieldState({ hidden: true }),
        b: createFieldState({ disabled: true }),
        c: createFieldState(),
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(
        rawValue,
        fields,
        formTree,
        registry,
        { excludeValueIfHidden: true, excludeValueIfDisabled: false, excludeValueIfReadonly: false },
        undefined,
      );

      // Only 'a' is hidden and excludeValueIfHidden is enabled
      expect(result).toEqual({ b: 2, c: 3 });
    });
  });

  describe('fields without form tree state', () => {
    it('should include values for componentless fields (no FieldTree entry)', () => {
      const rawValue = { id: 'abc123', name: 'John' };
      const fields: FieldDef<unknown>[] = [
        { key: 'id', type: 'hidden' },
        { key: 'name', type: 'input' },
      ];
      // Hidden field has no entry in formTree
      const formTree = {
        name: createFieldState(),
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_ENABLED, undefined);

      expect(result).toEqual({ id: 'abc123', name: 'John' });
    });
  });

  describe('value handling modes', () => {
    it('should skip fields with exclude valueHandling', () => {
      const rawValue = { name: 'John', submit: undefined };
      const fields: FieldDef<unknown>[] = [
        { key: 'name', type: 'input' },
        { key: 'submit', type: 'button' },
      ];
      const formTree = {
        name: createFieldState(),
        submit: createFieldState(),
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_DISABLED, undefined);

      expect(result).toEqual({ name: 'John' });
    });

    it('should skip fields with flatten valueHandling', () => {
      const rawValue = { name: 'John' };
      const fields: FieldDef<unknown>[] = [
        { key: 'name', type: 'input' },
        { key: 'row1', type: 'row' },
      ];
      const formTree = {
        name: createFieldState(),
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_DISABLED, undefined);

      expect(result).toEqual({ name: 'John' });
    });
  });

  describe('group fields', () => {
    it('should exclude entire group when group is hidden', () => {
      const rawValue = { address: { street: '123 Main', city: 'Springfield' } };
      const fields: FieldDef<unknown>[] = [
        {
          key: 'address',
          type: 'group',
          fields: [
            { key: 'street', type: 'input' },
            { key: 'city', type: 'input' },
          ],
        } as FieldDef<unknown>,
      ];
      const formTree = {
        address: createFieldState({ hidden: true }),
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_ENABLED, undefined);

      expect(result).toEqual({});
    });

    it('should recurse into group and filter child fields', () => {
      const rawValue = { address: { street: '123 Main', city: 'Springfield' } };
      const streetState = createFieldState({ hidden: true });
      const cityState = createFieldState();
      const groupState = (() => ({
        hidden: signal(false),
        disabled: signal(false),
        readonly: signal(false),
        value: signal({ street: '123 Main', city: 'Springfield' }),
        valid: signal(true),
        invalid: signal(false),
        dirty: signal(false),
        touched: signal(false),
        errors: signal([]),
      })) as unknown as FieldTree<unknown>;
      // Attach child field trees to the group state function
      (groupState as Record<string, unknown>)['street'] = streetState;
      (groupState as Record<string, unknown>)['city'] = cityState;

      const fields: FieldDef<unknown>[] = [
        {
          key: 'address',
          type: 'group',
          fields: [
            { key: 'street', type: 'input' },
            { key: 'city', type: 'input' },
          ],
        } as FieldDef<unknown>,
      ];

      const formTree = {
        address: groupState,
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_ENABLED, undefined);

      expect(result).toEqual({ address: { city: 'Springfield' } });
    });
  });

  describe('array fields', () => {
    it('should exclude entire array when array field is hidden', () => {
      const rawValue = { items: [{ name: 'A' }, { name: 'B' }] };
      const fields: FieldDef<unknown>[] = [
        { key: 'items', type: 'array', fields: [[{ key: 'name', type: 'input' }]] } as FieldDef<unknown>,
      ];
      const formTree = {
        items: createFieldState({ hidden: true }),
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_ENABLED, undefined);

      expect(result).toEqual({});
    });

    it('should include array value when array field is visible', () => {
      const rawValue = { items: [{ name: 'A' }, { name: 'B' }] };
      const fields: FieldDef<unknown>[] = [
        { key: 'items', type: 'array', fields: [[{ key: 'name', type: 'input' }]] } as FieldDef<unknown>,
      ];
      const formTree = {
        items: createFieldState(),
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_ENABLED, undefined);

      expect(result).toEqual({ items: [{ name: 'A' }, { name: 'B' }] });
    });
  });

  describe('per-field overrides', () => {
    it('should include hidden field when per-field excludeValueIfHidden is false', () => {
      const rawValue = { name: 'John', email: 'john@test.com' };
      const fields: FieldDef<unknown>[] = [
        { key: 'name', type: 'input', excludeValueIfHidden: false } as FieldDef<unknown>,
        { key: 'email', type: 'input' },
      ];
      const formTree = {
        name: createFieldState({ hidden: true }),
        email: createFieldState(),
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_ENABLED, undefined);

      // name has per-field override: excludeValueIfHidden = false → included despite being hidden
      expect(result).toEqual({ name: 'John', email: 'john@test.com' });
    });

    it('should exclude field when per-field override enables exclusion that global disables', () => {
      const rawValue = { name: 'John', email: 'john@test.com' };
      const fields: FieldDef<unknown>[] = [
        { key: 'name', type: 'input', excludeValueIfHidden: true } as FieldDef<unknown>,
        { key: 'email', type: 'input' },
      ];
      const formTree = {
        name: createFieldState({ hidden: true }),
        email: createFieldState(),
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_DISABLED, undefined);

      expect(result).toEqual({ email: 'john@test.com' });
    });
  });

  describe('form-level overrides', () => {
    it('should use form-level override when field has no override', () => {
      const rawValue = { name: 'John' };
      const fields: FieldDef<unknown>[] = [{ key: 'name', type: 'input' }];
      const formTree = {
        name: createFieldState({ hidden: true }),
      } as unknown as Record<string, FieldTree<unknown>>;

      const formOptions: ValueExclusionConfig = { excludeValueIfHidden: false };

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_ENABLED, formOptions);

      // Form-level says don't exclude hidden → included despite global default
      expect(result).toEqual({ name: 'John' });
    });
  });

  describe('fields without keys', () => {
    it('should skip fields without a key', () => {
      const rawValue = { name: 'John' };
      const fields: FieldDef<unknown>[] = [
        { key: 'name', type: 'input' },
        { key: '', type: 'button' },
      ];
      const formTree = {
        name: createFieldState(),
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_DISABLED, undefined);

      expect(result).toEqual({ name: 'John' });
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // Regression / characterization: value-exclusion on hidden CONTAINER fields
  // ───────────────────────────────────────────────────────────────────────
  describe('hidden container fields (exclusion)', () => {
    it('should omit the whole group value when group is hidden + excludeValueIfHidden', () => {
      const rawValue = { profile: { firstName: 'Jane', lastName: 'Doe' } };
      const fields: FieldDef<unknown>[] = [
        {
          key: 'profile',
          type: 'group',
          fields: [
            { key: 'firstName', type: 'input' },
            { key: 'lastName', type: 'input' },
          ],
        } as FieldDef<unknown>,
      ];
      const formTree = {
        profile: createFieldState({ hidden: true }),
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_ENABLED, undefined);

      expect(result).toEqual({});
    });

    it('should omit the whole array value when array is hidden + excludeValueIfHidden', () => {
      const rawValue = { contacts: [{ name: 'A' }, { name: 'B' }] };
      const fields: FieldDef<unknown>[] = [
        { key: 'contacts', type: 'array', fields: [[{ key: 'name', type: 'input' }]] } as FieldDef<unknown>,
      ];
      const formTree = {
        contacts: createFieldState({ hidden: true }),
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_ENABLED, undefined);

      expect(result).toEqual({});
    });

    it('should NOT filter per-item: a hidden child field inside a visible array keeps the array whole (v1: no per-item filtering)', () => {
      // The array item template declares a 'secret' child marked hidden + excludeValueIfHidden.
      // Documented v1 behavior: arrays are included wholesale when the array itself is not excluded.
      const rawValue = {
        contacts: [
          { name: 'A', secret: 's1' },
          { name: 'B', secret: 's2' },
        ],
      };
      const fields: FieldDef<unknown>[] = [
        {
          key: 'contacts',
          type: 'array',
          fields: [
            [
              { key: 'name', type: 'input' },
              { key: 'secret', type: 'input', hidden: true, excludeValueIfHidden: true },
            ],
          ],
        } as FieldDef<unknown>,
      ];
      const formTree = {
        contacts: createFieldState(),
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_ENABLED, undefined);

      // Whole array (including per-item 'secret') survives — per-item filtering is not implemented.
      expect(result).toEqual({
        contacts: [
          { name: 'A', secret: 's1' },
          { name: 'B', secret: 's2' },
        ],
      });
    });

    // Page-level excludeValueIfHidden drops the hoisted child's value.
    //
    // Pages have valueHandling 'flatten'. flattenFields discards the page wrapper and hoists its
    // children to the top level of `schemaFields`, propagating the page's exclusion-relevant state
    // onto each hoisted child via `inheritedExclusionState` (mirroring how a hidden group drops its
    // preserved subtree). value-filter then reads that inherited state, so hiding a page drops its
    // hoisted child values even though the child is not individually hidden.
    it('should drop the subtree when a page is hidden + excludeValueIfHidden', () => {
      // Post-flatten schemaFields: the page wrapper is gone, its child is hoisted to top level and
      // carries the page's inherited hidden state.
      const rawValue = { step1Field: 'value-from-hidden-page', visibleField: 'keep' };
      const fields: FieldDef<unknown>[] = [
        { key: 'step1Field', type: 'input', inheritedExclusionState: { hidden: true } } as FieldDef<unknown>,
        { key: 'visibleField', type: 'input' },
      ];
      // The hoisted child is NOT itself hidden — only the (now-discarded) page was hidden.
      const formTree = {
        step1Field: createFieldState(),
        visibleField: createFieldState(),
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_ENABLED, undefined);

      // CORRECT behavior: the hidden page's hoisted child value should be dropped.
      expect(result).toEqual({ visibleField: 'keep' });
    });
  });

  describe('missing raw values', () => {
    it('should skip fields whose key is not in rawValue', () => {
      const rawValue = { name: 'John' };
      const fields: FieldDef<unknown>[] = [
        { key: 'name', type: 'input' },
        { key: 'missing', type: 'input' },
      ];
      const formTree = {
        name: createFieldState(),
        missing: createFieldState(),
      } as unknown as Record<string, FieldTree<unknown>>;

      const result = filterFormValue(rawValue, fields, formTree, registry, ALL_DISABLED, undefined);

      expect(result).toEqual({ name: 'John' });
    });
  });
});
