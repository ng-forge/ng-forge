import { describe, it, expect } from 'vitest';
import { DEFAULT_FIELD_CHOICES } from './defaults.js';

describe('DEFAULT_FIELD_CHOICES', () => {
  it('should have a default for text-input scope', () => {
    expect(DEFAULT_FIELD_CHOICES['text-input']).toBe('input');
  });

  it('should have a default for single-select scope', () => {
    expect(DEFAULT_FIELD_CHOICES['single-select']).toBe('select');
  });

  it('should have a default for numeric scope', () => {
    expect(DEFAULT_FIELD_CHOICES['numeric']).toBe('input');
  });

  it('should have a default for boolean scope', () => {
    expect(DEFAULT_FIELD_CHOICES['boolean']).toBe('checkbox');
  });

  it('should cover all four ambiguous scopes', () => {
    const scopes = Object.keys(DEFAULT_FIELD_CHOICES);
    expect(scopes).toHaveLength(4);
    expect(scopes).toEqual(expect.arrayContaining(['text-input', 'single-select', 'numeric', 'boolean']));
  });
});
