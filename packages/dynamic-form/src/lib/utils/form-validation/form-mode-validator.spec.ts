import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FormModeValidator, isValidFormConfiguration } from './form-mode-validator';
import * as formMode from '../../models/types/form-mode';
import * as pageField from '../../definitions/default/page-field';

describe('form-mode-validator', () => {
  describe('FormModeValidator.validateFormConfiguration', () => {
    describe('non-paged forms', () => {
      it('should validate simple non-paged form as valid', () => {
        const fields = [
          { type: 'input', key: 'name' },
          { type: 'input', key: 'email' },
        ];

        vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
          mode: 'non-paged',
          isValid: true,
          errors: [],
        });

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.isValid).toBe(true);
        expect(result.mode).toBe('non-paged');
        expect(result.errors).toEqual([]);
      });

      it('should include warnings in result', () => {
        const fields = [{ type: 'input', key: 'test' }];

        vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
          mode: 'non-paged',
          isValid: true,
          errors: [],
        });

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result).toHaveProperty('warnings');
        expect(Array.isArray(result.warnings)).toBe(true);
      });
    });

    describe('paged forms', () => {
      it('should validate paged form as valid', () => {
        const fields = [
          { type: 'page', key: 'page1', fields: [{ type: 'input', key: 'name' }] },
          { type: 'page', key: 'page2', fields: [{ type: 'input', key: 'email' }] },
        ];

        vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
          mode: 'paged',
          isValid: true,
          errors: [],
        });

        vi.spyOn(pageField, 'validatePageNesting').mockReturnValue(true);

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.isValid).toBe(true);
        expect(result.mode).toBe('paged');
        expect(result.errors).toEqual([]);
      });

      it('should call validatePageNesting for each page field', () => {
        const fields = [
          { type: 'page', key: 'page1', fields: [] },
          { type: 'page', key: 'page2', fields: [] },
        ];

        vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
          mode: 'paged',
          isValid: true,
          errors: [],
        });

        const validatePageNestingSpy = vi.spyOn(pageField, 'validatePageNesting').mockReturnValue(true);

        FormModeValidator.validateFormConfiguration(fields as any);

        expect(validatePageNestingSpy).toHaveBeenCalledTimes(2);
        expect(validatePageNestingSpy).toHaveBeenCalledWith(fields[0]);
        expect(validatePageNestingSpy).toHaveBeenCalledWith(fields[1]);
      });

      it('should detect nested page errors', () => {
        const fields = [{ type: 'page', key: 'page1', fields: [{ type: 'page', key: 'nested' }] }];

        vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
          mode: 'paged',
          isValid: true,
          errors: [],
        });

        vi.spyOn(pageField, 'validatePageNesting').mockReturnValue(false);

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('nested page fields');
      });

      it('should include field index and key in nested page error', () => {
        const fields = [
          { type: 'page', key: 'valid', fields: [] },
          { type: 'page', key: 'invalid', fields: [{ type: 'page' }] },
        ];

        vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
          mode: 'paged',
          isValid: true,
          errors: [],
        });

        vi.spyOn(pageField, 'validatePageNesting')
          .mockReturnValueOnce(true) // first page valid
          .mockReturnValueOnce(false); // second page invalid

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.errors[0]).toContain('index 1');
        expect(result.errors[0]).toContain('key: "invalid"');
      });

      it('should handle page without key in error message', () => {
        const fields = [{ type: 'page', fields: [{ type: 'page' }] }];

        vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
          mode: 'paged',
          isValid: true,
          errors: [],
        });

        vi.spyOn(pageField, 'validatePageNesting').mockReturnValue(false);

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.errors[0]).toContain('key: "unknown"');
      });
    });

    describe('invalid forms', () => {
      it('should propagate errors from mode detection', () => {
        const fields = [
          { type: 'page', key: 'page1' },
          { type: 'input', key: 'name' }, // Mixed page/non-page
        ];

        vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
          mode: 'invalid',
          isValid: false,
          errors: ['Cannot mix page and non-page fields at root level'],
        });

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Cannot mix page and non-page fields at root level');
      });

      it('should combine mode detection errors with page nesting errors', () => {
        const fields = [{ type: 'page', key: 'page1', fields: [{ type: 'page' }] }];

        vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
          mode: 'paged',
          isValid: true,
          errors: ['Mode detection warning'],
        });

        vi.spyOn(pageField, 'validatePageNesting').mockReturnValue(false);

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThanOrEqual(2);
        expect(result.errors).toContain('Mode detection warning');
      });
    });

    describe('warnings', () => {
      it('should warn about single page forms', () => {
        const fields = [{ type: 'page', key: 'only-page', fields: [{ type: 'input', key: 'test' }] }];

        vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
          mode: 'paged',
          isValid: true,
          errors: [],
        });

        vi.spyOn(pageField, 'validatePageNesting').mockReturnValue(true);

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]).toContain('Single page form');
        expect(result.warnings[0]).toContain('better performance');
      });

      it('should not warn about single page in non-paged mode', () => {
        const fields = [{ type: 'input', key: 'test' }];

        vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
          mode: 'non-paged',
          isValid: true,
          errors: [],
        });

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.warnings).toEqual([]);
      });

      it('should warn about empty pages', () => {
        const fields = [
          { type: 'page', key: 'page1', fields: [] },
          { type: 'page', key: 'page2', fields: [{ type: 'input', key: 'test' }] },
        ];

        vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
          mode: 'paged',
          isValid: true,
          errors: [],
        });

        vi.spyOn(pageField, 'validatePageNesting').mockReturnValue(true);

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.warnings.length).toBeGreaterThanOrEqual(1);
        expect(result.warnings.some((w) => w.includes('contains no fields'))).toBe(true);
      });

      it('should include page index and key in empty page warning', () => {
        const fields = [
          { type: 'page', key: 'valid', fields: [{ type: 'input', key: 'test' }] },
          { type: 'page', key: 'empty', fields: [] },
        ];

        vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
          mode: 'paged',
          isValid: true,
          errors: [],
        });

        vi.spyOn(pageField, 'validatePageNesting').mockReturnValue(true);

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        const emptyWarning = result.warnings.find((w) => w.includes('contains no fields'));
        expect(emptyWarning).toContain('index 1');
        expect(emptyWarning).toContain('key: "empty"');
      });

      it('should handle page without fields property', () => {
        const fields = [{ type: 'page', key: 'page1' }];

        vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
          mode: 'paged',
          isValid: true,
          errors: [],
        });

        vi.spyOn(pageField, 'validatePageNesting').mockReturnValue(true);

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.warnings.some((w) => w.includes('contains no fields'))).toBe(true);
      });
    });
  });

  describe('FormModeValidator.validateFormConfigurationOrThrow', () => {
    it('should not throw for valid configuration', () => {
      const fields = [{ type: 'input', key: 'test' }];

      vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
        mode: 'non-paged',
        isValid: true,
        errors: [],
      });

      expect(() => {
        FormModeValidator.validateFormConfigurationOrThrow(fields as any);
      }).not.toThrow();
    });

    it('should throw for invalid configuration', () => {
      const fields = [
        { type: 'page', key: 'page1' },
        { type: 'input', key: 'name' },
      ];

      vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
        mode: 'invalid',
        isValid: false,
        errors: ['Cannot mix page and non-page fields'],
      });

      expect(() => {
        FormModeValidator.validateFormConfigurationOrThrow(fields as any);
      }).toThrow();
    });

    it('should include mode in error message', () => {
      const fields = [{ type: 'input', key: 'test' }];

      vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
        mode: 'non-paged',
        isValid: false,
        errors: ['Some error'],
      });

      expect(() => {
        FormModeValidator.validateFormConfigurationOrThrow(fields as any);
      }).toThrow(/non-paged mode/);
    });

    it('should include all errors in error message', () => {
      const fields = [{ type: 'page', key: 'page1' }];

      vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
        mode: 'paged',
        isValid: false,
        errors: ['Error 1', 'Error 2'],
      });

      expect(() => {
        FormModeValidator.validateFormConfigurationOrThrow(fields as any);
      }).toThrow(/Error 1.*Error 2/s);
    });

    it('should format error message with bullets', () => {
      const fields = [{ type: 'page', key: 'page1' }];

      vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
        mode: 'paged',
        isValid: false,
        errors: ['Test error'],
      });

      try {
        FormModeValidator.validateFormConfigurationOrThrow(fields as any);
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('  - Test error');
      }
    });
  });

  describe('isValidFormConfiguration', () => {
    it('should return true for valid configuration', () => {
      const fields = [{ type: 'input', key: 'test' }];

      vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
        mode: 'non-paged',
        isValid: true,
        errors: [],
      });

      const result = isValidFormConfiguration(fields as any);

      expect(result).toBe(true);
    });

    it('should return false for invalid configuration', () => {
      const fields = [
        { type: 'page', key: 'page1' },
        { type: 'input', key: 'name' },
      ];

      vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
        mode: 'invalid',
        isValid: false,
        errors: ['Cannot mix'],
      });

      const result = isValidFormConfiguration(fields as any);

      expect(result).toBe(false);
    });

    it('should return false when page nesting validation fails', () => {
      const fields = [{ type: 'page', key: 'page1', fields: [{ type: 'page' }] }];

      vi.spyOn(formMode, 'detectFormMode').mockReturnValue({
        mode: 'paged',
        isValid: true,
        errors: [],
      });

      vi.spyOn(pageField, 'validatePageNesting').mockReturnValue(false);

      const result = isValidFormConfiguration(fields as any);

      expect(result).toBe(false);
    });
  });
});
