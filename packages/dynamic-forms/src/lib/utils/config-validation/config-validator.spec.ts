import { describe, expect, it, vi } from 'vitest';
import { validateFormConfig } from './config-validator';
import { DynamicFormError } from '../../errors/dynamic-form-error';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldTypeDefinition } from '../../models/field-type';
import { Logger } from '../../providers/features/logger/logger.interface';

function mockLogger(): Logger {
  return { log: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
}

function emptyRegistry(): Map<string, FieldTypeDefinition> {
  return new Map();
}

function registryWith(...types: string[]): Map<string, FieldTypeDefinition> {
  const map = new Map<string, FieldTypeDefinition>();
  for (const type of types) {
    map.set(type, {} as FieldTypeDefinition);
  }
  return map;
}

describe('validateFormConfig', () => {
  describe('duplicate key detection', () => {
    it('should not throw when all keys are unique', () => {
      const fields: FieldDef<unknown>[] = [
        { key: 'name', type: 'input' },
        { key: 'email', type: 'input' },
      ];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).not.toThrow();
    });

    it('should throw DynamicFormError listing duplicate keys', () => {
      const fields: FieldDef<unknown>[] = [
        { key: 'name', type: 'input' },
        { key: 'name', type: 'input' },
      ];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow(DynamicFormError);
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow("'name'");
    });

    it('should list all duplicates when multiple keys conflict', () => {
      const fields: FieldDef<unknown>[] = [
        { key: 'a', type: 'input' },
        { key: 'b', type: 'input' },
        { key: 'a', type: 'input' },
        { key: 'b', type: 'input' },
      ];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow(/Duplicate field keys detected.*'a'.*'b'/s);
    });

    it('should not flag the same key in different group scopes', () => {
      // Same leaf key inside two different groups produces distinct scoped paths
      // (createADto.name vs createBDto.name) — no conflict at the form-value level.
      const fields: FieldDef<unknown>[] = [
        {
          key: 'createADto',
          type: 'group',
          fields: [{ key: 'name', type: 'input' }],
        },
        {
          key: 'createBDto',
          type: 'group',
          fields: [{ key: 'name', type: 'input' }],
        },
      ];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).not.toThrow();
    });

    it('should still flag duplicates within the same group scope', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'address',
          type: 'group',
          fields: [
            { key: 'street', type: 'input' },
            { key: 'street', type: 'input' },
          ],
        },
      ];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow(DynamicFormError);
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow("'address.street'");
    });

    it('should not flag a leaf key shadowed by a same-named group child', () => {
      // Top-level 'name' (path: name) and 'address.name' (path: address.name) — distinct scopes.
      const fields: FieldDef<unknown>[] = [
        { key: 'name', type: 'input' },
        {
          key: 'address',
          type: 'group',
          fields: [{ key: 'name', type: 'input' }],
        },
      ];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).not.toThrow();
    });

    it('should not flag array item template keys as duplicates', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'contacts',
          type: 'array',
          fields: [
            [
              { key: 'name', type: 'input' },
              { key: 'email', type: 'input' },
            ],
            [
              { key: 'name', type: 'input' },
              { key: 'email', type: 'input' },
            ],
          ],
        },
      ];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).not.toThrow();
    });

    it('should not flag keys inside nested arrays as duplicates of each other', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'items',
          type: 'array',
          fields: [
            { key: 'value', type: 'input' },
            { key: 'value', type: 'input' },
          ],
        },
      ];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).not.toThrow();
    });

    it('should still flag duplicates between container key and sibling leaf key', () => {
      const fields: FieldDef<unknown>[] = [
        { key: 'address', type: 'input' },
        { key: 'address', type: 'group', fields: [{ key: 'city', type: 'input' }] },
      ];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow(DynamicFormError);
    });

    it('should flag two sibling groups sharing the same key', () => {
      // The groups themselves collide at the form-value root regardless of children.
      const fields: FieldDef<unknown>[] = [
        { key: 'address', type: 'group', fields: [{ key: 'street', type: 'input' }] },
        { key: 'address', type: 'group', fields: [{ key: 'city', type: 'input' }] },
      ];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow(DynamicFormError);
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow("'address'");
    });

    it('should flag DOM id collision between top-level key and group/leaf pair', () => {
      // DOM ids are underscore-projected: top-level `'foo_bar'` collides with leaf
      // `'bar'` inside group `'foo'` — both render as id='foo_bar' even though their
      // form-value paths ('foo_bar' vs 'foo.bar') are distinct.
      const fields: FieldDef<unknown>[] = [
        { key: 'foo_bar', type: 'input' },
        { key: 'foo', type: 'group', fields: [{ key: 'bar', type: 'input' }] },
      ];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow(DynamicFormError);
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow(/DOM id collision/);
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow("'foo_bar'");
    });

    it('should validate deeply nested groups with non-colliding overlapping keys', () => {
      // `user.address.name` and `user.contact.name` — same leaf 'name' under
      // different grandchild scopes. Distinct form-value paths AND distinct DOM ids.
      const fields: FieldDef<unknown>[] = [
        {
          key: 'user',
          type: 'group',
          fields: [
            { key: 'address', type: 'group', fields: [{ key: 'name', type: 'input' }] },
            { key: 'contact', type: 'group', fields: [{ key: 'name', type: 'input' }] },
          ],
        },
      ];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).not.toThrow();
    });

    it('should not flag duplicate button keys across pages (excluded from value)', () => {
      // Buttons have valueHandling: 'exclude' — they don't bind to a form-value path,
      // so the same `previous`/`submit` keys can repeat on every page (issue #401).
      const registry = new Map<string, FieldTypeDefinition>([
        ['page', { valueHandling: 'flatten' } as FieldTypeDefinition],
        ['row', { valueHandling: 'flatten' } as FieldTypeDefinition],
        ['group', { valueHandling: 'include' } as FieldTypeDefinition],
        ['input', { valueHandling: 'include' } as FieldTypeDefinition],
        ['previous', { valueHandling: 'exclude' } as FieldTypeDefinition],
        ['submit', { valueHandling: 'exclude' } as FieldTypeDefinition],
      ]);
      const fields: FieldDef<unknown>[] = [
        {
          key: 'aPage',
          type: 'page',
          fields: [
            { key: 'createADto', type: 'group', fields: [{ key: 'name', type: 'input' }] },
            {
              key: 'aButtons',
              type: 'row',
              fields: [
                { key: 'previous', type: 'previous' },
                { key: 'submit', type: 'submit' },
              ],
            },
          ],
        },
        {
          key: 'bPage',
          type: 'page',
          fields: [
            { key: 'createBDto', type: 'group', fields: [{ key: 'name', type: 'input' }] },
            {
              key: 'bButtons',
              type: 'row',
              fields: [
                { key: 'previous', type: 'previous' },
                { key: 'submit', type: 'submit' },
              ],
            },
          ],
        },
      ];
      expect(() => validateFormConfig(fields, registry, mockLogger())).not.toThrow();
    });
  });

  describe('unregistered field type warnings', () => {
    it('should not warn when registry is empty (no adapter registered)', () => {
      const logger = mockLogger();
      const fields: FieldDef<unknown>[] = [{ key: 'name', type: 'input' }];
      validateFormConfig(fields, emptyRegistry(), logger);
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should not warn when all types are registered', () => {
      const logger = mockLogger();
      const fields: FieldDef<unknown>[] = [{ key: 'name', type: 'input' }];
      validateFormConfig(fields, registryWith('input'), logger);
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should warn for unregistered field types', () => {
      const logger = mockLogger();
      const fields: FieldDef<unknown>[] = [{ key: 'name', type: 'typo-input' }];
      validateFormConfig(fields, registryWith('input'), logger);
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("'typo-input'"));
    });

    it('should list all unregistered types in one warning', () => {
      const logger = mockLogger();
      const fields: FieldDef<unknown>[] = [
        { key: 'a', type: 'unknown-a' },
        { key: 'b', type: 'unknown-b' },
      ];
      validateFormConfig(fields, registryWith('input'), logger);
      expect(logger.warn).toHaveBeenCalledTimes(1);
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("'unknown-a'"));
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("'unknown-b'"));
    });
  });

  describe('invalid regex pattern detection', () => {
    it('should not throw for valid regex in shorthand pattern', () => {
      const fields: FieldDef<unknown>[] = [{ key: 'phone', type: 'input', pattern: '^[0-9]+$' } as FieldDef<unknown>];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).not.toThrow();
    });

    it('should throw for invalid regex in shorthand pattern', () => {
      const fields: FieldDef<unknown>[] = [{ key: 'phone', type: 'input', pattern: '[invalid' } as FieldDef<unknown>];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow(DynamicFormError);
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow("'phone'");
    });

    it('should throw for invalid regex in validators array', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'code',
          type: 'input',
          validators: [{ type: 'pattern', value: '[bad' }],
        } as FieldDef<unknown>,
      ];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow(DynamicFormError);
    });

    it('should report all invalid patterns when multiple exist', () => {
      const fields: FieldDef<unknown>[] = [
        { key: 'a', type: 'input', pattern: '[bad1' } as FieldDef<unknown>,
        { key: 'b', type: 'input', pattern: '[bad2' } as FieldDef<unknown>,
      ];
      let message = '';
      try {
        validateFormConfig(fields, emptyRegistry(), mockLogger());
      } catch (e) {
        message = (e as Error).message;
      }
      expect(message).toContain("'a'");
      expect(message).toContain("'b'");
    });

    it('should not throw when pattern is a RegExp object (not a string)', () => {
      const fields: FieldDef<unknown>[] = [{ key: 'phone', type: 'input', pattern: /^[0-9]+$/ } as FieldDef<unknown>];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).not.toThrow();
    });
  });

  describe('valid config passes cleanly', () => {
    it('should not throw or warn for an empty field list', () => {
      const logger = mockLogger();
      expect(() => validateFormConfig([], registryWith('input'), logger)).not.toThrow();
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should handle deeply nested valid config', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'page1',
          type: 'page',
          fields: [
            {
              key: 'section',
              type: 'group',
              fields: [
                { key: 'firstName', type: 'input' },
                { key: 'lastName', type: 'input' },
              ],
            },
          ],
        },
      ];
      expect(() => validateFormConfig(fields, registryWith('page', 'group', 'input'), mockLogger())).not.toThrow();
    });
  });

  // Nesting is expressed structurally via `group` fields, never via a dotted key.
  // A leaf field keyed `'address.city'` does a literal `pathRecord['address.city']`
  // lookup (undefined), so it silently mis-binds rather than nesting. Reject it at
  // bootstrap so a Formly-style dotted-key config fails loudly instead.
  describe('dotted field keys', () => {
    it('throws when a value-bearing leaf field key contains a dot', () => {
      const fields: FieldDef<unknown>[] = [{ key: 'address.city', type: 'input' }];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow(DynamicFormError);
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow('address.city');
    });

    it('throws when a group field key contains a dot', () => {
      const fields = [{ key: 'a.b', type: 'group', fields: [{ key: 'x', type: 'input' }] }] as unknown as FieldDef<unknown>[];
      expect(() => validateFormConfig(fields, registryWith('group', 'input'), mockLogger())).toThrow(DynamicFormError);
    });

    it('does not throw for the same structure expressed via nested group fields', () => {
      const fields = [{ key: 'address', type: 'group', fields: [{ key: 'city', type: 'input' }] }] as unknown as FieldDef<unknown>[];
      expect(() => validateFormConfig(fields, registryWith('group', 'input'), mockLogger())).not.toThrow();
    });
  });
});
