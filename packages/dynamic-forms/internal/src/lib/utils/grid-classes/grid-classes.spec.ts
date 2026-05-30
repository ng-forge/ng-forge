import { describe, it, expect } from 'vitest';
import { getGridClassString } from './grid-classes';
import { FieldDef } from '../../definitions';

describe('getGridClassString', () => {
  it('should return class for valid column value', () => {
    const field: FieldDef<any> = { key: 'name', type: 'input', col: 6 };
    const result = getGridClassString(field);

    expect(result).toBe('df-col-6');
  });

  it('should return class for full width', () => {
    const field: FieldDef<any> = { key: 'description', type: 'textarea', col: 12 };
    const result = getGridClassString(field);

    expect(result).toBe('df-col-12');
  });

  it('should return class for minimum column', () => {
    const field: FieldDef<any> = { key: 'icon', type: 'input', col: 1 };
    const result = getGridClassString(field);

    expect(result).toBe('df-col-1');
  });

  it('should return empty string for zero column', () => {
    const field: FieldDef<any> = { key: 'hidden', type: 'input', col: 0 };
    const result = getGridClassString(field);

    expect(result).toBe('');
  });

  it('should return empty string for negative column', () => {
    const field: FieldDef<any> = { key: 'invalid', type: 'input', col: -1 };
    const result = getGridClassString(field);

    expect(result).toBe('');
  });

  it('should return empty string for column > 12', () => {
    const field: FieldDef<any> = { key: 'invalid', type: 'input', col: 13 };
    const result = getGridClassString(field);

    expect(result).toBe('');
  });

  it('should return empty string when col is undefined', () => {
    const field: FieldDef<any> = { key: 'name', type: 'input' };
    const result = getGridClassString(field);

    expect(result).toBe('');
  });

  it('should return empty string when col is not a number', () => {
    const field: FieldDef<any> = { key: 'name', type: 'input', col: '6' as any };
    const result = getGridClassString(field);

    expect(result).toBe('');
  });

  it('should handle mid-range column values', () => {
    const field8: FieldDef<any> = { key: 'field1', type: 'input', col: 8 };
    const field4: FieldDef<any> = { key: 'field2', type: 'input', col: 4 };
    const field3: FieldDef<any> = { key: 'field3', type: 'input', col: 3 };

    expect(getGridClassString(field8)).toBe('df-col-8');
    expect(getGridClassString(field4)).toBe('df-col-4');
    expect(getGridClassString(field3)).toBe('df-col-3');
  });

  it('should work with different field types', () => {
    const inputField: FieldDef<any> = { key: 'name', type: 'input', col: 6 };
    const selectField: FieldDef<any> = { key: 'country', type: 'select', col: 6 };
    const checkboxField: FieldDef<any> = { key: 'agree', type: 'checkbox', col: 12 };

    expect(getGridClassString(inputField)).toBe('df-col-6');
    expect(getGridClassString(selectField)).toBe('df-col-6');
    expect(getGridClassString(checkboxField)).toBe('df-col-12');
  });

  it('should handle all valid column values 1-12', () => {
    for (let col = 1; col <= 12; col++) {
      const field: FieldDef<any> = { key: 'test', type: 'input', col };
      expect(getGridClassString(field)).toBe(`df-col-${col}`);
    }
  });

  it('should return empty string for decimal numbers', () => {
    const field: FieldDef<unknown> = { key: 'test', type: 'input', col: 6.5 };
    const result = getGridClassString(field);

    // Decimal values are rejected to ensure valid CSS class names
    expect(result).toBe('');
  });

  it('should return empty string for NaN', () => {
    const field: FieldDef<any> = { key: 'test', type: 'input', col: NaN };
    const result = getGridClassString(field);

    expect(result).toBe('');
  });

  it('should return empty string for Infinity', () => {
    const field: FieldDef<any> = { key: 'test', type: 'input', col: Infinity };
    const result = getGridClassString(field);

    expect(result).toBe('');
  });

  it('should work with field definitions containing other properties', () => {
    const field: FieldDef<any> = {
      key: 'email',
      type: 'input',
      label: 'Email Address',
      placeholder: 'Enter email',
      required: true,
      col: 6,
    };
    const result = getGridClassString(field);

    expect(result).toBe('df-col-6');
  });
});
