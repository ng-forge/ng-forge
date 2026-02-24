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
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow(
        DynamicFormError,
      );
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow("'name'");
    });

    it('should list all duplicates when multiple keys conflict', () => {
      const fields: FieldDef<unknown>[] = [
        { key: 'a', type: 'input' },
        { key: 'b', type: 'input' },
        { key: 'a', type: 'input' },
        { key: 'b', type: 'input' },
      ];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow(
        /Duplicate field keys detected.*'a'.*'b'/s,
      );
    });

    it('should detect duplicates in nested containers', () => {
      const fields: FieldDef<unknown>[] = [
        { key: 'name', type: 'input' },
        {
          key: 'address',
          type: 'group',
          fields: [{ key: 'name', type: 'input' }],
        },
      ];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow(
        DynamicFormError,
      );
    });

    it('should not flag array item template keys as duplicates', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'contacts',
          type: 'array',
          fields: [
            [{ key: 'name', type: 'input' }, { key: 'email', type: 'input' }],
            [{ key: 'name', type: 'input' }, { key: 'email', type: 'input' }],
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
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow(
        DynamicFormError,
      );
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
      const fields: FieldDef<unknown>[] = [
        { key: 'phone', type: 'input', pattern: '^[0-9]+$' } as FieldDef<unknown>,
      ];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).not.toThrow();
    });

    it('should throw for invalid regex in shorthand pattern', () => {
      const fields: FieldDef<unknown>[] = [
        { key: 'phone', type: 'input', pattern: '[invalid' } as FieldDef<unknown>,
      ];
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow(
        DynamicFormError,
      );
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
      expect(() => validateFormConfig(fields, emptyRegistry(), mockLogger())).toThrow(
        DynamicFormError,
      );
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
      const fields: FieldDef<unknown>[] = [
        { key: 'phone', type: 'input', pattern: /^[0-9]+$/ } as FieldDef<unknown>,
      ];
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
});
