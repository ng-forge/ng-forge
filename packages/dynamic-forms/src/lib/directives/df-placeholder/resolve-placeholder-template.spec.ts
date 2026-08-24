import { describe, it, expect } from 'vitest';
import type { TemplateRef } from '@angular/core';
import { resolvePlaceholderTemplate } from './resolve-placeholder-template';
import type { FieldPlaceholderContext, ResolvedPlaceholders } from './df-placeholder.directive';

// Distinct sentinel templates — we only compare identity, never render them.
const tpl = (name: string) => ({ __name: name }) as unknown as TemplateRef<FieldPlaceholderContext>;

describe('resolvePlaceholderTemplate', () => {
  const keyTpl = tpl('key');
  const typeTpl = tpl('type');
  const defaultTpl = tpl('default');

  const full: ResolvedPlaceholders = {
    byKey: new Map([['username', keyTpl]]),
    byType: new Map([['textarea', typeTpl]]),
    default: defaultTpl,
  };

  it('prefers a key match over type and default', () => {
    expect(resolvePlaceholderTemplate(full, { key: 'username', type: 'textarea' })).toBe(keyTpl);
  });

  it('falls back to a type match when no key matches', () => {
    expect(resolvePlaceholderTemplate(full, { key: 'bio', type: 'textarea' })).toBe(typeTpl);
  });

  it('falls back to the default template when neither key nor type matches', () => {
    expect(resolvePlaceholderTemplate(full, { key: 'bio', type: 'input' })).toBe(defaultTpl);
  });

  it('returns null when nothing matches and there is no default (built-in bare div)', () => {
    const noDefault: ResolvedPlaceholders = { byKey: new Map(), byType: new Map() };
    expect(resolvePlaceholderTemplate(noDefault, { key: 'bio', type: 'input' })).toBeNull();
  });

  it('keeps key and type namespaces separate (a key equal to a type name does not cross-match)', () => {
    const placeholders: ResolvedPlaceholders = {
      byKey: new Map(),
      byType: new Map([['input', typeTpl]]),
    };
    // A field whose KEY is 'input' must not pick up the 'input' TYPE template via the key bucket.
    expect(resolvePlaceholderTemplate(placeholders, { key: 'input', type: 'select' })).toBeNull();
    expect(resolvePlaceholderTemplate(placeholders, { key: 'anything', type: 'input' })).toBe(typeTpl);
  });
});
