/**
 * The field type names the error formatter reports must match the names the
 * schema actually accepts.
 *
 * A hand-written list drifted from the schemas and produced a flatly false
 * diagnostic: `insert-array-item` is accepted, but omitting its required
 * `index` was reported as `Unknown field type "insert-array-item"` alongside a
 * list of valid types that did not include it. These lock the two together.
 */

import { describe, it, expect } from 'vitest';
import { MatFieldSchema, MatFieldTypes } from '../../../material/src';
import { BsFieldSchema } from '../../../bootstrap/src';
import { PrimeFieldSchema } from '../../../primeng/src';
import { IonicFieldSchema } from '../../../ionic/src';
import { validateFormConfig } from '../../../validate/src';
import { collectFieldTypeNames } from './field-type-names';
import type { UiIntegration } from '../../../validate/src';

const ADAPTERS = [
  ['material', MatFieldSchema],
  ['bootstrap', BsFieldSchema],
  ['primeng', PrimeFieldSchema],
  ['ionic', IonicFieldSchema],
] as const;

describe('collectFieldTypeNames', () => {
  it.each(ADAPTERS)('finds the container and leaf types for %s', (_name, schema) => {
    const names = collectFieldTypeNames(schema);

    for (const container of ['page', 'row', 'group', 'array']) {
      expect(names, `missing container ${container}`).toContain(container);
    }
    for (const leaf of ['input', 'select', 'hidden', 'text', 'submit']) {
      expect(names, `missing leaf ${leaf}`).toContain(leaf);
    }
  });

  it.each(ADAPTERS)('finds the array-action types for %s, which the old list omitted', (_name, schema) => {
    const names = collectFieldTypeNames(schema);

    for (const action of [
      'add-array-item',
      'prepend-array-item',
      'insert-array-item',
      'remove-array-item',
      'pop-array-item',
      'shift-array-item',
    ]) {
      expect(names, `missing ${action}`).toContain(action);
    }
  });

  it('agrees with the list Material declares by hand', () => {
    // MatFieldTypes is a separate hand-maintained list. While it exists, it has
    // to agree with the schema, or it is the next thing to drift.
    expect(collectFieldTypeNames(MatFieldSchema).sort()).toEqual([...MatFieldTypes].sort());
  });

  it.each(ADAPTERS)('returns no duplicates for %s', (_name, schema) => {
    const names = collectFieldTypeNames(schema);
    expect(new Set(names).size).toBe(names.length);
  });

  it('accepts every name it reports', () => {
    // The real contract: anything listed as valid must actually parse as a type.
    // A name that cannot be used would send an agent chasing a phantom.
    for (const [ui, schema] of ADAPTERS) {
      for (const type of collectFieldTypeNames(schema)) {
        const result = validateFormConfig(ui as UiIntegration, { fields: [{ key: 'probe', type }] });
        const unknownType = (result.errors ?? []).some((e) => e.message.includes('Unknown field type'));

        expect(unknownType, `${ui} lists "${type}" but rejects it as unknown`).toBe(false);
      }
    }
  });
});

describe('unknown field type reporting', () => {
  it('does not call a known type unknown when its properties are wrong', () => {
    // insert-array-item requires `index`. Omitting it is a property error.
    const result = validateFormConfig('material', {
      fields: [{ key: 'a', type: 'insert-array-item' }],
    });

    expect(result.valid).toBe(false);
    const messages = (result.errors ?? []).map((e) => e.message).join('\n');
    expect(messages, 'a known type was reported as unknown').not.toContain('Unknown field type');
  });

  it('still reports a genuinely unknown type as unknown', () => {
    const result = validateFormConfig('material', {
      fields: [{ key: 'a', type: 'acme-currency', label: 'Amount' }],
    });

    expect(result.valid).toBe(false);
    const messages = (result.errors ?? []).map((e) => e.message).join('\n');
    expect(messages).toContain('Unknown field type "acme-currency"');
  });

  it('lists the type it just rejected among neither the valid types nor nothing at all', () => {
    const result = validateFormConfig('material', {
      fields: [{ key: 'a', type: 'acme-currency', label: 'Amount' }],
    });

    const message = (result.errors ?? []).map((e) => e.message).find((m) => m.includes('Unknown field type')) ?? '';

    // The list has to be present, has to be complete, and must not name the
    // rejected type. The old message failed the completeness half.
    expect(message).toContain('insert-array-item');
    expect(message).toContain('input');
    expect(message.replace('Unknown field type "acme-currency".', '')).not.toContain('acme-currency');
  });
});
