import { describe, it, expect } from 'vitest';
import { FormModeValidator, isValidFormConfiguration } from './form-mode-validator';

describe('form-mode-validator', () => {
  describe('FormModeValidator.validateFormConfiguration', () => {
    describe('non-paged forms', () => {
      it('should validate simple non-paged form as valid', () => {
        const fields = [
          { type: 'input', key: 'name' },
          { type: 'input', key: 'email' },
        ];

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.isValid).toBe(true);
        expect(result.mode).toBe('non-paged');
        expect(result.errors).toEqual([]);
      });

      it('should include warnings in result', () => {
        const fields = [{ type: 'input', key: 'test' }];

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result).toHaveProperty('warnings');
        expect(Array.isArray(result.warnings)).toBe(true);
      });

      it('should validate form with multiple field types', () => {
        const fields = [
          { type: 'input', key: 'name' },
          { type: 'checkbox', key: 'agree' },
          { type: 'select', key: 'country' },
        ];

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.isValid).toBe(true);
        expect(result.mode).toBe('non-paged');
      });

      it('should validate form with nested groups', () => {
        const fields = [
          {
            type: 'group',
            key: 'address',
            fields: [
              { type: 'input', key: 'street' },
              { type: 'input', key: 'city' },
            ],
          },
        ];

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.isValid).toBe(true);
        expect(result.mode).toBe('non-paged');
      });

      it('should validate form with array fields', () => {
        const fields = [
          {
            type: 'array',
            key: 'items',
            items: { type: 'input', key: 'item' },
          },
        ];

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.isValid).toBe(true);
        expect(result.mode).toBe('non-paged');
      });
    });

    describe('paged forms', () => {
      it('should validate paged form as valid', () => {
        const fields = [
          { type: 'page', key: 'page1', fields: [{ type: 'input', key: 'name' }] },
          { type: 'page', key: 'page2', fields: [{ type: 'input', key: 'email' }] },
        ];

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.isValid).toBe(true);
        expect(result.mode).toBe('paged');
        expect(result.errors).toEqual([]);
      });

      it('should validate paged form with multiple pages', () => {
        const fields = [
          { type: 'page', key: 'personal', fields: [{ type: 'input', key: 'name' }] },
          { type: 'page', key: 'contact', fields: [{ type: 'input', key: 'email' }] },
          { type: 'page', key: 'address', fields: [{ type: 'input', key: 'street' }] },
        ];

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.isValid).toBe(true);
        expect(result.mode).toBe('paged');
      });

      it('should validate paged form with empty pages', () => {
        const fields = [
          { type: 'page', key: 'page1', fields: [] },
          { type: 'page', key: 'page2', fields: [] },
        ];

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.isValid).toBe(true);
        expect(result.mode).toBe('paged');
      });

      it('should validate paged form with complex page content', () => {
        const fields = [
          {
            type: 'page',
            key: 'page1',
            fields: [
              { type: 'input', key: 'name' },
              { type: 'checkbox', key: 'agree' },
              {
                type: 'group',
                key: 'contact',
                fields: [
                  { type: 'input', key: 'email' },
                  { type: 'input', key: 'phone' },
                ],
              },
            ],
          },
          { type: 'page', key: 'page2', fields: [{ type: 'input', key: 'notes' }] },
        ];

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.isValid).toBe(true);
        expect(result.mode).toBe('paged');
      });

      it('should detect nested page errors', () => {
        const fields = [
          {
            type: 'page',
            key: 'page1',
            fields: [{ type: 'page', key: 'nested', fields: [] }],
          },
        ];

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    // Mixed mode no longer exists in current codebase

    describe('edge cases', () => {
      it('should handle empty fields array', () => {
        const fields: any[] = [];

        const result = FormModeValidator.validateFormConfiguration(fields);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should handle undefined fields', () => {
        const result = FormModeValidator.validateFormConfiguration(undefined as any);

        expect(result).toBeDefined();
        expect(result.isValid).toBeDefined();
      });

      it('should handle single page form', () => {
        const fields = [{ type: 'page', key: 'only-page', fields: [{ type: 'input', key: 'name' }] }];

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.isValid).toBe(true);
        expect(result.mode).toBe('paged');
      });

      it('should handle single field form', () => {
        const fields = [{ type: 'input', key: 'name' }];

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.isValid).toBe(true);
        expect(result.mode).toBe('non-paged');
      });
    });

    describe('validation messages', () => {
      it('should include error messages for invalid configurations', () => {
        const fields = [
          { type: 'page', key: 'page1', fields: [] },
          { type: 'input', key: 'name' },
        ];

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.errors).toBeDefined();
        expect(result.errors.length).toBeGreaterThan(0);
        result.errors.forEach((error) => {
          expect(typeof error).toBe('string');
          expect(error.length).toBeGreaterThan(0);
        });
      });

      it('should provide clear error messages', () => {
        const fields = [
          { type: 'input', key: 'name' },
          { type: 'page', key: 'page1', fields: [] },
        ];

        const result = FormModeValidator.validateFormConfiguration(fields as any);

        expect(result.errors.some((e) => e.includes('mixed') || e.includes('page'))).toBe(true);
      });
    });
  });

  describe('isValidFormConfiguration', () => {
    it('should return true for valid non-paged form', () => {
      const fields = [
        { type: 'input', key: 'name' },
        { type: 'input', key: 'email' },
      ];

      expect(isValidFormConfiguration(fields as any)).toBe(true);
    });

    it('should return true for valid paged form', () => {
      const fields = [
        { type: 'page', key: 'page1', fields: [] },
        { type: 'page', key: 'page2', fields: [] },
      ];

      expect(isValidFormConfiguration(fields as any)).toBe(true);
    });

    it('should return false for invalid mixed form', () => {
      const fields = [
        { type: 'page', key: 'page1', fields: [] },
        { type: 'input', key: 'name' },
      ];

      expect(isValidFormConfiguration(fields as any)).toBe(false);
    });

    it('should return false for nested pages', () => {
      const fields = [
        {
          type: 'page',
          key: 'page1',
          fields: [{ type: 'page', key: 'nested', fields: [] }],
        },
      ];

      expect(isValidFormConfiguration(fields as any)).toBe(false);
    });

    it('should return true for empty form', () => {
      const fields: any[] = [];

      expect(isValidFormConfiguration(fields)).toBe(true);
    });
  });

  describe('form mode detection', () => {
    it('should correctly identify non-paged forms', () => {
      const testCases = [
        [{ type: 'input', key: 'a' }],
        [
          { type: 'input', key: 'a' },
          { type: 'input', key: 'b' },
        ],
        [{ type: 'group', key: 'g', fields: [{ type: 'input', key: 'a' }] }],
        [{ type: 'array', key: 'arr', items: { type: 'input', key: 'item' } }],
      ];

      testCases.forEach((fields) => {
        const result = FormModeValidator.validateFormConfiguration(fields as any);
        expect(result.mode).toBe('non-paged');
      });
    });

    it('should correctly identify paged forms', () => {
      const testCases = [
        [{ type: 'page', key: 'p1', fields: [] }],
        [
          { type: 'page', key: 'p1', fields: [] },
          { type: 'page', key: 'p2', fields: [] },
        ],
        [
          { type: 'page', key: 'p1', fields: [{ type: 'input', key: 'a' }] },
          { type: 'page', key: 'p2', fields: [{ type: 'input', key: 'b' }] },
        ],
      ];

      testCases.forEach((fields) => {
        const result = FormModeValidator.validateFormConfiguration(fields as any);
        expect(result.mode).toBe('paged');
      });
    });
  });
});
