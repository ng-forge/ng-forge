import { describe, it, expect, vi } from 'vitest';
import { createFormLevelSchema } from './form-schema-merger';
import { standardSchema, isStandardSchemaMarker } from '@ng-forge/dynamic-forms/schema';
import type { AngularSchemaCallback } from '@ng-forge/dynamic-forms/schema';
import type { StandardSchemaV1 } from '@standard-schema/spec';

// Helper to create a mock Standard Schema
function createMockStandardSchema<T>(): StandardSchemaV1<T> {
  return {
    '~standard': {
      version: 1,
      vendor: 'test',
      validate: vi.fn(),
    },
  } as unknown as StandardSchemaV1<T>;
}

describe('form-schema-merger', () => {
  // Note: applyFormLevelSchema is tested indirectly through integration tests
  // Direct unit testing requires complex Angular forms context mocking

  describe('createFormLevelSchema()', () => {
    it('should create a schema from Standard Schema marker', () => {
      const mockSchema = createMockStandardSchema<{ password: string }>();
      const formLevelSchema = standardSchema(mockSchema);

      const result = createFormLevelSchema(formLevelSchema);

      expect(result).toBeDefined();
    });

    it('should handle complex form value types', () => {
      interface PasswordForm {
        password: string;
        confirmPassword: string;
      }

      const mockSchema = createMockStandardSchema<PasswordForm>();
      const formLevelSchema = standardSchema(mockSchema);

      const result = createFormLevelSchema(formLevelSchema);

      expect(result).toBeDefined();
    });
  });

  describe('StandardSchemaMarker type guard', () => {
    it('should identify valid StandardSchemaMarker instances', () => {
      const mockSchema = createMockStandardSchema<{ test: string }>();
      const marker = standardSchema(mockSchema);

      expect(marker.ɵkind).toBe('standardSchema');
      expect(marker.schema).toBe(mockSchema);
    });

    it('should preserve schema reference in marker', () => {
      const mockSchema = createMockStandardSchema<{ value: number }>();
      const marker = standardSchema(mockSchema);

      expect(marker.schema).toBe(mockSchema);
    });

    it('should correctly identify StandardSchemaMarker with isStandardSchemaMarker', () => {
      const mockSchema = createMockStandardSchema<{ test: string }>();
      const marker = standardSchema(mockSchema);

      expect(isStandardSchemaMarker(marker)).toBe(true);
      expect(isStandardSchemaMarker({})).toBe(false);
      expect(isStandardSchemaMarker(null)).toBe(false);
      expect(isStandardSchemaMarker(undefined)).toBe(false);
    });
  });

  describe('Angular schema callbacks', () => {
    it('should create a schema from Angular schema callback function', () => {
      const callback: AngularSchemaCallback<{ password: string }> = vi.fn();

      const result = createFormLevelSchema(callback);

      expect(result).toBeDefined();
    });

    it('should not treat StandardSchemaMarker as a function', () => {
      const mockSchema = createMockStandardSchema<{ test: string }>();
      const marker = standardSchema(mockSchema);

      expect(typeof marker === 'function').toBe(false);
      expect(isStandardSchemaMarker(marker)).toBe(true);
    });

    it('should correctly identify callback as a function', () => {
      const callback: AngularSchemaCallback<{ value: number }> = vi.fn();

      expect(typeof callback === 'function').toBe(true);
      expect(isStandardSchemaMarker(callback)).toBe(false);
    });

    it('should handle complex form value types with Angular callback', () => {
      interface PasswordForm {
        password: string;
        confirmPassword: string;
      }

      const callback: AngularSchemaCallback<PasswordForm> = vi.fn();

      const result = createFormLevelSchema(callback);

      expect(result).toBeDefined();
    });
  });

  describe('Integration scenarios', () => {
    it('should support Zod-like schema validation patterns', () => {
      // Simulate a Zod-like schema with refine for cross-field validation
      interface PasswordChangeForm {
        password: string;
        confirmPassword: string;
      }

      const mockZodSchema: StandardSchemaV1<PasswordChangeForm> = {
        '~standard': {
          version: 1,
          vendor: 'zod',
          validate: (value: unknown) => {
            const data = value as PasswordChangeForm;
            if (data.password !== data.confirmPassword) {
              return {
                issues: [
                  {
                    message: 'Passwords must match',
                    path: ['confirmPassword'],
                  },
                ],
              };
            }
            return { value: data };
          },
        },
      };

      const formLevelSchema = standardSchema(mockZodSchema);
      const result = createFormLevelSchema(formLevelSchema);

      expect(result).toBeDefined();
    });

    it('should support form-only validation without field-level schema', () => {
      interface LoginForm {
        email: string;
        password: string;
      }

      const mockSchema: StandardSchemaV1<LoginForm> = {
        '~standard': {
          version: 1,
          vendor: 'valibot',
          validate: vi.fn(),
        },
      };

      const formLevelSchema = standardSchema(mockSchema);
      const result = createFormLevelSchema(formLevelSchema);

      expect(result).toBeDefined();
    });
  });
});
