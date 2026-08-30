/**
 * `allowedIn` is prose an agent reads before placing a field.
 *
 * It is checked in one direction only. Everything it *promises* must really
 * validate: an agent that follows it and then gets a validation error has been
 * actively misled. The other direction is deliberately left open, because the
 * lists are also guidance about where a field makes sense — the validator
 * accepts `add-array-item` at the top level, but recommending that would be
 * bad advice, so `allowedIn` is allowed to be the more conservative of the two.
 */

import { describe, it, expect } from 'vitest';
import { validateFormConfig } from '@ng-forge/dynamic-forms-validation';
import { FIELD_TYPES } from './field-types';
import type { FieldTypeInfo } from './index';

/** Every place a field can sit. `top-level` is the config's own `fields`. */
const HOSTS = ['top-level', 'page', 'row', 'group', 'array', 'container'] as const;

/**
 * A valid, minimal instance of the field type, so a failure here can only mean
 * the host rejected it.
 *
 * The registry's own `minimalExample` is the sample. A hand-kept table beside it
 * was a second thing to drift, and it hid the containers' ellipses instead of
 * fixing them. `illustrative` is the one opt-out, and it is read rather than
 * inferred: catching the throw skipped a broken example as quietly as an
 * intentionally elided one.
 */
function sampleFor(fieldType: FieldTypeInfo): Record<string, unknown> | undefined {
  if (fieldType.illustrative?.minimalExample || fieldType.minimalExample === undefined) return undefined;

  return new Function(`return (${fieldType.minimalExample});`)() as Record<string, unknown>;
}

/** Build a config with the field sitting in the named host. */
function nest(field: Record<string, unknown>, host: string): unknown {
  if (host === 'top-level') return { fields: [field] };
  if (host === 'page') return { fields: [{ key: 'p', type: 'page', fields: [field] }] };
  if (host === 'container') {
    return { fields: [{ key: 'host', type: 'container', wrappers: [], fields: [field] }] };
  }

  return { fields: [{ key: 'host', type: host, fields: [field] }] };
}

/**
 * `allowedIn` is written for people (`page.fields`, `top-level (single-page
 * forms only)`), so read the host it names rather than the literal string.
 */
function hostsNamedBy(allowedIn: readonly string[]): string[] {
  return [...new Set(allowedIn.map((entry) => entry.replace(/\..*$| \(.*$/g, '').trim()))];
}

describe('every host allowedIn promises really accepts the field', () => {
  for (const fieldType of FIELD_TYPES) {
    const sample = sampleFor(fieldType);

    it.skipIf(sample === undefined)(`${fieldType.type}`, () => {
      const rejected = hostsNamedBy(fieldType.allowedIn).filter(
        (host) => !validateFormConfig('material', nest(sample as Record<string, unknown>, host) as never).valid,
      );

      expect(rejected, `${fieldType.type} is documented as allowed in these, but the validator rejects it`).toEqual([]);
    });
  }
});

describe('every host notAllowedIn forbids really is rejected', () => {
  // The mirror claim. A field listed as forbidden that the validator happily
  // accepts is a rule that exists only in the prose, and agents route around
  // it for no reason.
  for (const fieldType of FIELD_TYPES) {
    const sample = sampleFor(fieldType);
    const hosts = hostsNamedBy(fieldType.notAllowedIn ?? []).filter((host) => (HOSTS as readonly string[]).includes(host));

    it.skipIf(sample === undefined || hosts.length === 0)(`${fieldType.type}`, () => {
      const accepted = hosts.filter((host) => validateFormConfig('material', nest(sample as Record<string, unknown>, host) as never).valid);

      expect(accepted, `${fieldType.type} is documented as forbidden in these, but the validator accepts it`).toEqual([]);
    });
  }
});
