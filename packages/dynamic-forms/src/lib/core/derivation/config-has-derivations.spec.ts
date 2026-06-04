import { describe, expect, it } from 'vitest';
import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { TextFieldDef } from '../../definitions/text/text-field-def';
import { NumberFieldDef } from '../../definitions/number/number-field-def';
import { GroupFieldDef } from '../../definitions/group/group-field-def';
import { ArrayFieldDef } from '../../definitions/array/array-field-def';
import { configHasDerivations } from './config-has-derivations';

describe('configHasDerivations', () => {
  it('is true for a shorthand `derivation` property', () => {
    const fields: FieldDef<unknown>[] = [
      { key: 'a', type: 'number' } as NumberFieldDef,
      { key: 'total', type: 'number', derivation: 'formValue.a * 2' } as NumberFieldDef,
    ];
    expect(configHasDerivations(fields)).toBe(true);
  });

  it('is true for a value `logic[]` derivation (no targetProperty)', () => {
    const fields: FieldDef<unknown>[] = [
      { key: 'prefix', type: 'text', logic: [{ type: 'derivation', expression: '"+1"' }] } as TextFieldDef,
    ];
    expect(configHasDerivations(fields)).toBe(true);
  });

  it('is true for a property `logic[]` derivation (with targetProperty)', () => {
    const fields: FieldDef<unknown>[] = [
      {
        key: 'dest',
        type: 'text',
        logic: [{ type: 'derivation', targetProperty: 'label', expression: 'formValue.src' }],
      } as unknown as TextFieldDef,
    ];
    expect(configHasDerivations(fields)).toBe(true);
  });

  it('is true for a derivation nested in a group', () => {
    const fields: FieldDef<unknown>[] = [
      {
        key: 'address',
        type: 'group',
        fields: [
          { key: 'street', type: 'text' } as TextFieldDef,
          { key: 'full', type: 'text', derivation: 'formValue.address.street' } as TextFieldDef,
        ],
      } as GroupFieldDef,
    ];
    expect(configHasDerivations(fields)).toBe(true);
  });

  it('is true for a derivation nested in an array item template', () => {
    const fields: FieldDef<unknown>[] = [
      {
        key: 'items',
        type: 'array',
        fields: [{ key: 'computed', type: 'number', derivation: 'formValue.x' } as NumberFieldDef],
      } as ArrayFieldDef,
    ];
    expect(configHasDerivations(fields)).toBe(true);
  });

  it('is false for a config with no derivations', () => {
    const fields: FieldDef<unknown>[] = [
      { key: 'name', type: 'text', validators: [{ type: 'required' }] } as unknown as TextFieldDef,
      {
        key: 'address',
        type: 'group',
        fields: [{ key: 'city', type: 'text' } as TextFieldDef],
      } as GroupFieldDef,
    ];
    expect(configHasDerivations(fields)).toBe(false);
  });

  it('is false for non-derivation `logic[]` entries (e.g. a hidden condition)', () => {
    const fields: FieldDef<unknown>[] = [
      {
        key: 'extra',
        type: 'text',
        logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'show', operator: 'equals', value: false } }],
      } as unknown as TextFieldDef,
    ];
    expect(configHasDerivations(fields)).toBe(false);
  });

  it('is false for a keyless field carrying a derivation (matches the collector guard)', () => {
    const fields: FieldDef<unknown>[] = [{ type: 'text', derivation: 'formValue.a' } as unknown as TextFieldDef];
    expect(configHasDerivations(fields)).toBe(false);
  });
});
