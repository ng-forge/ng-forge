import { describe, expect, it } from 'vitest';
import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { AddonTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { FieldTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { validateFieldAddons, walkAndValidateAddons } from './validate-field-addons';

const TEST_TYPES: ReadonlyArray<AddonTypeDefinition> = [
  { type: 'text', loadComponent: () => Promise.resolve(class {}) },
  {
    type: 'prime-icon',
    loadComponent: () => Promise.resolve(class {}),
    validate: (a) => {
      const icon = (a as { icon?: unknown }).icon;
      if (typeof icon !== 'string' || icon.length === 0) throw new Error("'icon' must be a non-empty string");
    },
  },
  { type: 'component', jsonSafe: false, loadComponent: () => Promise.resolve(class {}) },
];

const TEST_FIELDS: ReadonlyArray<FieldTypeDefinition> = [
  { name: 'prime-input', addons: { slots: ['prefix', 'suffix'], allowedTypes: ['prime-icon', 'text'] } },
  { name: 'prime-toggle' /* no addons → Tier 3 */ },
  { name: 'unrestricted-input', addons: { slots: ['prefix', 'suffix'] /* no allowedTypes whitelist */ } },
];

const fieldRegistry = new Map(TEST_FIELDS.map((f) => [f.name, f]));
const typeRegistry = new Map(TEST_TYPES.map((k) => [k.type, k]));

describe('validateFieldAddons', () => {
  it('returns empty + no warnings when field has no addons', () => {
    const field: FieldDef<unknown> = { key: 'q', type: 'prime-input' };
    const result = validateFieldAddons(field, fieldRegistry, typeRegistry, 'inline');
    expect(result.addons).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('drops all addons + warns when field type is unknown', () => {
    const field = {
      key: 'q',
      type: 'mystery-field',
      addons: [{ slot: 'prefix', type: 'text', text: 'x' }],
    } as FieldDef<unknown>;
    const result = validateFieldAddons(field, fieldRegistry, typeRegistry, 'inline');
    expect(result.addons).toEqual([]);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatchObject({ type: 'unknown-field-type', fieldKey: 'q', fieldType: 'mystery-field' });
  });

  it('drops all addons + warns when field type does not declare addon support (Tier 3)', () => {
    const field = {
      key: 'agree',
      type: 'prime-toggle',
      addons: [{ slot: 'prefix', type: 'text', text: 'x' }],
    } as FieldDef<unknown>;
    const result = validateFieldAddons(field, fieldRegistry, typeRegistry, 'inline');
    expect(result.addons).toEqual([]);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatchObject({ type: 'field-type-no-addon-support', fieldKey: 'agree', fieldType: 'prime-toggle' });
  });

  it('drops addons whose slot is not supported, keeps the rest', () => {
    const field = {
      key: 'q',
      type: 'prime-input',
      addons: [
        { slot: 'badSlot' as const, type: 'text', text: 'a' },
        { slot: 'prefix', type: 'text', text: 'b' },
      ],
    } as unknown as FieldDef<unknown>;
    const result = validateFieldAddons(field, fieldRegistry, typeRegistry, 'inline');
    expect(result.addons).toHaveLength(1);
    expect((result.addons[0] as { text: string }).text).toBe('b');
    expect(result.warnings[0]).toMatchObject({ type: 'unknown-slot', slot: 'badSlot' });
  });

  it('drops addons with unregistered types and enumerates registered types in the warning', () => {
    const field = {
      key: 'q',
      type: 'prime-input',
      addons: [{ slot: 'prefix', type: 'rating' as const, value: 5 }],
    } as unknown as FieldDef<unknown>;
    const result = validateFieldAddons(field, fieldRegistry, typeRegistry, 'inline');
    expect(result.addons).toEqual([]);
    expect(result.warnings[0]).toMatchObject({ type: 'unknown-type', addonType: 'rating' });
    if (result.warnings[0].type === 'unknown-type') {
      expect(result.warnings[0].registeredTypes).toContain('text');
      expect(result.warnings[0].registeredTypes).toContain('prime-icon');
    }
  });

  it('drops addons whose type is not in the per-field allowedTypes whitelist', () => {
    // 'component' is registered globally but prime-input restricts to prime-icon + text.
    const field = {
      key: 'q',
      type: 'prime-input',
      addons: [{ slot: 'prefix', type: 'component', component: () => Promise.resolve(class {}) }],
    } as unknown as FieldDef<unknown>;
    const result = validateFieldAddons(field, fieldRegistry, typeRegistry, 'inline');
    expect(result.addons).toEqual([]);
    expect(result.warnings[0]).toMatchObject({ type: 'type-not-allowed', addonType: 'component' });
  });

  it('drops addons that fail per-type shape validation', () => {
    const field = {
      key: 'q',
      type: 'prime-input',
      addons: [{ slot: 'prefix', type: 'prime-icon', icon: '' /* empty — fails */ }],
    } as unknown as FieldDef<unknown>;
    const result = validateFieldAddons(field, fieldRegistry, typeRegistry, 'inline');
    expect(result.addons).toEqual([]);
    expect(result.warnings[0]).toMatchObject({ type: 'shape-violation', addonType: 'prime-icon' });
  });

  it('keeps `type: component` in inline mode but drops in JSON mode', () => {
    // Use unrestricted-input (no allowedTypes whitelist) so the component type
    // is gated only by the JSON-source check.
    const make = (): FieldDef<unknown> =>
      ({
        key: 'q',
        type: 'unrestricted-input',
        addons: [{ slot: 'prefix', type: 'component', component: () => Promise.resolve(class {}) }],
      }) as unknown as FieldDef<unknown>;

    expect(validateFieldAddons(make(), fieldRegistry, typeRegistry, 'inline').addons).toHaveLength(1);

    const jsonResult = validateFieldAddons(make(), fieldRegistry, typeRegistry, 'json');
    expect(jsonResult.addons).toEqual([]);
    expect(jsonResult.warnings[0]).toMatchObject({ type: 'code-only-type-in-json', addonType: 'component' });
  });

  it('strips inline `action` function in JSON mode but keeps the rest of the addon', () => {
    const field = {
      key: 'q',
      type: 'unrestricted-input',
      addons: [
        {
          slot: 'suffix',
          type: 'text',
          text: 'hello',
          // function on a type that doesn't normally have one — exercises the
          // generic JSON-source action stripper, not a type-specific check.
          action: () => undefined,
        },
      ],
    } as unknown as FieldDef<unknown>;
    const result = validateFieldAddons(field, fieldRegistry, typeRegistry, 'json');
    expect(result.addons).toHaveLength(1);
    expect((result.addons[0] as { action?: unknown }).action).toBeUndefined();
    expect(result.warnings[0]).toMatchObject({ type: 'code-only-action-in-json' });
  });

  it('strips inline `hidden`/`disabled`/`loading` functions in JSON mode but keeps the rest', () => {
    const field = {
      key: 'q',
      type: 'unrestricted-input',
      addons: [
        {
          slot: 'suffix',
          type: 'text',
          text: 'hello',
          hidden: () => false,
          disabled: () => true,
          loading: () => false,
        },
      ],
    } as unknown as FieldDef<unknown>;
    const result = validateFieldAddons(field, fieldRegistry, typeRegistry, 'json');
    expect(result.addons).toHaveLength(1);
    const addon = result.addons[0] as { hidden?: unknown; disabled?: unknown; loading?: unknown; text?: string };
    expect(addon.hidden).toBeUndefined();
    expect(addon.disabled).toBeUndefined();
    expect(addon.loading).toBeUndefined();
    expect(addon.text).toBe('hello');
    // One warning per stripped function (hidden, disabled, loading).
    const fnWarnings = result.warnings.filter((w) => w.type === 'code-only-action-in-json');
    expect(fnWarnings).toHaveLength(3);
  });

  it('keeps inline `hidden`/`disabled`/`loading` functions in inline mode', () => {
    const field = {
      key: 'q',
      type: 'unrestricted-input',
      addons: [
        {
          slot: 'suffix',
          type: 'text',
          text: 'hello',
          hidden: () => false,
          disabled: () => true,
          loading: () => false,
        },
      ],
    } as unknown as FieldDef<unknown>;
    const result = validateFieldAddons(field, fieldRegistry, typeRegistry, 'inline');
    const addon = result.addons[0] as { hidden?: unknown; disabled?: unknown; loading?: unknown };
    expect(typeof addon.hidden).toBe('function');
    expect(typeof addon.disabled).toBe('function');
    expect(typeof addon.loading).toBe('function');
    expect(result.warnings).toEqual([]);
  });

  it('multi-set XOR — keeps preset and warns when preset + actionRef + action are all set (inline)', () => {
    const field = {
      key: 'q',
      type: 'unrestricted-input',
      addons: [
        {
          slot: 'suffix',
          type: 'text',
          text: 'go',
          preset: 'clear',
          actionRef: 'submit',
          action: () => undefined,
        },
      ],
    } as unknown as FieldDef<unknown>;
    const result = validateFieldAddons(field, fieldRegistry, typeRegistry, 'inline');
    const addon = result.addons[0] as { preset?: string; actionRef?: string; action?: unknown };
    expect(addon.preset).toBe('clear');
    expect(addon.actionRef).toBeUndefined();
    expect(addon.action).toBeUndefined();
    const warning = result.warnings.find((w) => String(w.reason).includes('multiple click variants'));
    expect(warning).toBeDefined();
    expect(String(warning?.reason)).toContain('preset, actionRef, action');
  });

  it('multi-set XOR — keeps actionRef and drops action when only those two are set', () => {
    const field = {
      key: 'q',
      type: 'unrestricted-input',
      addons: [
        {
          slot: 'suffix',
          type: 'text',
          text: 'go',
          actionRef: 'submit',
          action: () => undefined,
        },
      ],
    } as unknown as FieldDef<unknown>;
    const result = validateFieldAddons(field, fieldRegistry, typeRegistry, 'inline');
    const addon = result.addons[0] as { actionRef?: string; action?: unknown };
    expect(addon.actionRef).toBe('submit');
    expect(addon.action).toBeUndefined();
  });
});

describe('walkAndValidateAddons', () => {
  it('recurses into container fields and validates each field independently', () => {
    const tree = [
      {
        key: 'group',
        type: 'group',
        // group is NOT in fieldRegistry → its own addons (if any) are dropped, but
        // its `fields` array still recurses.
        fields: [
          { key: 'q', type: 'prime-input', addons: [{ slot: 'prefix', type: 'text', text: 'ok' }] },
          { key: 'agree', type: 'prime-toggle', addons: [{ slot: 'prefix', type: 'text', text: 'no' }] },
        ],
      },
    ] as unknown as ReadonlyArray<FieldDef<unknown>>;

    const result = walkAndValidateAddons(tree, fieldRegistry, typeRegistry, 'inline');
    const groupOut = result.fields[0] as { fields: ReadonlyArray<FieldDef<unknown>> };
    expect((groupOut.fields[0].addons ?? []).length).toBe(1); // q kept
    expect((groupOut.fields[1].addons ?? []).length).toBe(0); // agree dropped
    expect(result.warnings.some((w) => w.type === 'field-type-no-addon-support')).toBe(true);
  });

  it('returns the original input shape when nothing is dropped', () => {
    const tree = [{ key: 'q', type: 'prime-input', addons: [{ slot: 'prefix', type: 'text', text: 'ok' }] }] as unknown as ReadonlyArray<
      FieldDef<unknown>
    >;
    const result = walkAndValidateAddons(tree, fieldRegistry, typeRegistry, 'inline');
    expect(result.warnings).toEqual([]);
    expect(result.fields[0].addons).toHaveLength(1);
  });
});
