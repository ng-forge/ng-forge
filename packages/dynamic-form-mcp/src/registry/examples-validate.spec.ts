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

const SLOTS = ['minimalExample', 'example'] as const;

describe.each(SLOTS)('%s', (slot) => {
  for (const fieldType of FIELD_TYPES) {
    // The skip is read off the registry, never off the throw. Deriving it from
    // whether evaluation fails is the same signal a genuinely broken example
    // gives, so a newly-broken one would join the skip list rather than fail
    // the suite that exists to catch exactly that.
    if (fieldType.illustrative?.[slot]) continue;

    it(`${fieldType.type} validates`, () => {
      const source = fieldType[slot];
      if (source === undefined) throw new Error(`${fieldType.type} ships no ${slot}`);

      expect(messagesFor(parseExample(source), fieldType.type)).toBe('');
    });
  }
});

describe('an example marked illustrative really cannot be evaluated', () => {
  // The mirror claim, so the opt-out cannot outlive its reason. An example that
  // has since been rewritten into a single expression should lose the flag and
  // start being validated, rather than keep a permanent exemption.
  for (const fieldType of FIELD_TYPES) {
    for (const slot of SLOTS) {
      const reason = fieldType.illustrative?.[slot];
      if (!reason) continue;

      it(`${fieldType.type} ${slot}: ${reason}`, () => {
        const source = fieldType[slot];
        if (source === undefined) throw new Error(`${fieldType.type} marks ${slot} illustrative but ships none`);

        expect(() => parseExample(source), `${fieldType.type} ${slot} now evaluates; drop its illustrative entry`).toThrow();
      });
    }
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
