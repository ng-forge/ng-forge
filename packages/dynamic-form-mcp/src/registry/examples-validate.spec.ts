/**
 * Every example the registry ships has to survive the validator.
 *
 * These are the snippets an agent copies, so an invalid one is worse than a
 * missing one: it looks authoritative and does not compile. Two shipped without
 * their required `template` (`prepend-array-item`, `insert-array-item`) and
 * nothing noticed, because no test had ever run them.
 */

import { describe, it, expect } from 'vitest';
import { validateFormConfig } from '@ng-forge/dynamic-forms-validation';
import { FIELD_TYPES } from './field-types';

/**
 * Examples are TypeScript literals, not JSON: comments, trailing commas and
 * unquoted keys. Evaluating them is how you find out what they actually mean.
 */
function parseExample(source: string): Record<string, unknown> {
  return new Function(`return (${source});`)() as Record<string, unknown>;
}

/**
 * Some examples are illustrative rather than complete: they reference symbols
 * that only exist in a real app (`button` calls a handler), or elide children
 * behind an ellipsis. Those cannot be evaluated, and demanding otherwise would
 * make the examples worse.
 */
function isIllustrative(source: string): boolean {
  try {
    parseExample(source);
    return false;
  } catch {
    return true;
  }
}

/** The host each field type needs; array-item buttons must sit in an array. */
function asConfig(field: Record<string, unknown>, type: string): unknown {
  if (type === 'page') return { fields: [field] };

  if (type.endsWith('-array-item')) {
    return {
      fields: [{ key: 'items', type: 'array', fields: [{ key: 'tag', type: 'input', label: 'Tag' }] }, field],
    };
  }

  return { fields: [field] };
}

function messagesFor(field: Record<string, unknown>, type: string): string {
  const result = validateFormConfig('material', asConfig(field, type) as never);
  return (result.errors ?? []).map((e) => `${e.path}: ${e.message}`).join('\n');
}

describe('minimalExample', () => {
  for (const fieldType of FIELD_TYPES) {
    const source = fieldType.minimalExample;

    it.skipIf(isIllustrative(source))(`${fieldType.type} validates`, () => {
      const field = parseExample(source);
      expect(messagesFor(field, fieldType.type)).toBe('');
    });
  }
});

describe('example', () => {
  for (const fieldType of FIELD_TYPES) {
    const source = fieldType.example;

    it.skipIf(isIllustrative(source))(`${fieldType.type} validates`, () => {
      const field = parseExample(source);
      expect(messagesFor(field, fieldType.type)).toBe('');
    });
  }
});

describe('a required prop is present in the examples that declare it', () => {
  // The failure mode that got through: `template` documented as REQUIRED and
  // absent from the very snippet an agent would copy.
  for (const fieldType of FIELD_TYPES) {
    const required = Object.values(fieldType.props)
      .filter((prop) => prop.required)
      .map((prop) => prop.name);

    if (required.length === 0) continue;

    it(`${fieldType.type} shows ${required.join(', ')}`, () => {
      for (const name of required) {
        expect(fieldType.minimalExample, `minimalExample omits required "${name}"`).toContain(name);
        expect(fieldType.example, `example omits required "${name}"`).toContain(name);
      }
    });
  }
});
