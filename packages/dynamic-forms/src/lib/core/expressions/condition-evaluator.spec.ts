import { vi } from 'vitest';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { EvaluationContext } from '../../models/expressions/evaluation-context';
import { evaluateCondition } from './condition-evaluator';
import { createMockLogger, MockLogger } from '../../../../testing/src/mock-logger';

describe('condition-evaluator', () => {
  let mockContext: EvaluationContext;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockContext = {
      fieldValue: 'test',
      formValue: {
        name: 'John',
        age: 25,
        email: 'john@example.com',
        address: {
          street: '123 Main St',
          city: 'Anytown',
        },
        preferences: {
          notifications: true,
          theme: 'dark',
        },
      },
      fieldPath: 'name',
      customFunctions: {},
      logger: mockLogger,
    };
  });

  describe('evaluateCondition', () => {
    describe('fieldValue type', () => {
      it('should evaluate fieldValue conditions correctly', () => {
        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'name',
          operator: 'equals',
          value: 'John',
        };

        const result = evaluateCondition(expression, mockContext);
        expect(result).toBe(true);
      });

      it('should return false for missing fieldPath', () => {
        const expression: ConditionalExpression = {
          type: 'fieldValue',
          operator: 'equals',
          value: 'John',
        };

        const result = evaluateCondition(expression, mockContext);
        expect(result).toBe(false);
      });

      it('should return false for missing operator', () => {
        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'name',
          value: 'John',
        };

        const result = evaluateCondition(expression, mockContext);
        expect(result).toBe(false);
      });

      it('should handle nested field paths', () => {
        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'address.city',
          operator: 'equals',
          value: 'Anytown',
        };

        const result = evaluateCondition(expression, mockContext);
        expect(result).toBe(true);
      });

      it('should handle deeply nested field paths', () => {
        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'preferences.theme',
          operator: 'equals',
          value: 'dark',
        };

        const result = evaluateCondition(expression, mockContext);
        expect(result).toBe(true);
      });

      it('should return false for non-existent nested paths', () => {
        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'address.nonexistent',
          operator: 'equals',
          value: 'test',
        };

        const result = evaluateCondition(expression, mockContext);
        expect(result).toBe(false);
      });

      it('should handle all comparison operators', () => {
        const testCases = [
          { operator: 'equals', fieldPath: 'name', value: 'John', expected: true },
          { operator: 'notEquals', fieldPath: 'name', value: 'Jane', expected: true },
          { operator: 'greater', fieldPath: 'age', value: 20, expected: true },
          { operator: 'less', fieldPath: 'age', value: 30, expected: true },
          { operator: 'greaterOrEqual', fieldPath: 'age', value: 25, expected: true },
          { operator: 'lessOrEqual', fieldPath: 'age', value: 25, expected: true },
          { operator: 'contains', fieldPath: 'email', value: '@example', expected: true },
          { operator: 'startsWith', fieldPath: 'email', value: 'john', expected: true },
          { operator: 'endsWith', fieldPath: 'email', value: '.com', expected: true },
          { operator: 'matches', fieldPath: 'email', value: '\\w+@\\w+\\.\\w+', expected: true },
        ];

        testCases.forEach(({ operator, fieldPath, value, expected }) => {
          const expression: ConditionalExpression = {
            type: 'fieldValue',
            fieldPath,
            operator: operator as any,
            value,
          };

          const result = evaluateCondition(expression, mockContext);
          expect(result).toBe(expected);
        });
      });
    });

    describe('formValue type', () => {
      it('should evaluate formValue conditions correctly', () => {
        const expression: ConditionalExpression = {
          type: 'formValue',
          operator: 'equals',
          value: mockContext.formValue,
        };

        const result = evaluateCondition(expression, mockContext);
        expect(result).toBe(true);
      });

      it('should return false for missing operator', () => {
        const expression: ConditionalExpression = {
          type: 'formValue',
          value: mockContext.formValue,
        };

        const result = evaluateCondition(expression, mockContext);
        expect(result).toBe(false);
      });

      it('should handle different operators with form value', () => {
        const testCases = [
          { operator: 'equals', value: mockContext.formValue, expected: true },
          { operator: 'notEquals', value: { different: 'object' }, expected: true },
        ];

        testCases.forEach(({ operator, value, expected }) => {
          const expression: ConditionalExpression = {
            type: 'formValue',
            operator: operator as any,
            value,
          };

          const result = evaluateCondition(expression, mockContext);
          expect(result).toBe(expected);
        });
      });
    });

    describe('javascript type', () => {
      it('should evaluate simple JavaScript expressions', () => {
        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: 'formValue.age > 18',
        };

        const result = evaluateCondition(expression, mockContext);
        expect(result).toBe(true);
      });

      it('should evaluate complex JavaScript expressions', () => {
        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: 'formValue.age > 18 && formValue.name.length > 2 && formValue.email.includes("@")',
        };

        const result = evaluateCondition(expression, mockContext);
        expect(result).toBe(true);
      });

      it('should have access to context properties', () => {
        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: 'fieldValue === "test" && formValue.name === "John"',
        };

        const result = evaluateCondition(expression, mockContext);
        expect(result).toBe(true);
      });

      it('should convert result to boolean', () => {
        const testCases = [
          { expression: '1', expected: true },
          { expression: '0', expected: false },
          { expression: '"string"', expected: true },
          { expression: '""', expected: false },
          { expression: 'null', expected: false },
          { expression: 'undefined', expected: false },
          { expression: '[]', expected: true },
          // Note: Object literals ({}) are not supported by the secure parser for security reasons
        ];

        testCases.forEach(({ expression, expected }) => {
          const expr: ConditionalExpression = {
            type: 'javascript',
            expression,
          };

          const result = evaluateCondition(expr, mockContext);
          expect(result).toBe(expected);
        });
      });

      it('should return false for missing expression', () => {
        const expression: ConditionalExpression = {
          type: 'javascript',
        };

        const result = evaluateCondition(expression, mockContext);
        expect(result).toBe(false);
      });

      it('should handle JavaScript errors gracefully', () => {
        // Test with an expression that causes a parsing error
        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: 'invalid @@ syntax',
        };

        const result = evaluateCondition(expression, mockContext);

        expect(result).toBe(false);
        expect(mockLogger.error).toHaveBeenCalledWith('Error evaluating JavaScript expression:', 'invalid @@ syntax', expect.any(Error));
      });

      it('should handle syntax errors gracefully', () => {
        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: 'invalid syntax }{',
        };

        const result = evaluateCondition(expression, mockContext);

        expect(result).toBe(false);
        expect(mockLogger.error).toHaveBeenCalled();
      });

      it('should handle expressions that access nested properties', () => {
        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: 'formValue.address.city === "Anytown" && formValue.preferences.notifications === true',
        };

        const result = evaluateCondition(expression, mockContext);
        expect(result).toBe(true);
      });

      it('should handle mathematical expressions', () => {
        // Note: Math.sqrt and other Math functions are not supported for security reasons
        // Test basic arithmetic operators instead
        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: 'formValue.age * 2 > 40 && formValue.age / 5 > 4',
        };

        const result = evaluateCondition(expression, mockContext);
        expect(result).toBe(true);
      });
    });

    describe('custom type', () => {
      it('should evaluate custom functions correctly', () => {
        const mockCustomFunction = vi.fn().mockReturnValue(true);
        const contextWithCustomFn: EvaluationContext = {
          ...mockContext,
          customFunctions: {
            testFunction: mockCustomFunction,
          },
        };

        const expression: ConditionalExpression = {
          type: 'custom',
          expression: 'testFunction',
        };

        const result = evaluateCondition(expression, contextWithCustomFn);

        expect(result).toBe(true);
        expect(mockCustomFunction).toHaveBeenCalledWith(contextWithCustomFn);
      });

      it('should convert custom function result to boolean', () => {
        const testCases = [
          { returnValue: true, expected: true },
          { returnValue: false, expected: false },
          { returnValue: 1, expected: true },
          { returnValue: 0, expected: false },
          { returnValue: 'string', expected: true },
          { returnValue: '', expected: false },
          { returnValue: null, expected: false },
          { returnValue: undefined, expected: false },
          { returnValue: [], expected: true },
          { returnValue: {}, expected: true },
        ];

        testCases.forEach(({ returnValue, expected }) => {
          const mockCustomFunction = vi.fn().mockReturnValue(returnValue);
          const contextWithCustomFn: EvaluationContext = {
            ...mockContext,
            customFunctions: {
              testFunction: mockCustomFunction,
            },
          };

          const expression: ConditionalExpression = {
            type: 'custom',
            expression: 'testFunction',
          };

          const result = evaluateCondition(expression, contextWithCustomFn);
          expect(result).toBe(expected);
        });
      });

      it('should return false for missing expression', () => {
        const expression: ConditionalExpression = {
          type: 'custom',
        };

        const result = evaluateCondition(expression, mockContext);
        expect(result).toBe(false);
      });

      it('should handle missing custom functions', () => {
        const expression: ConditionalExpression = {
          type: 'custom',
          expression: 'nonExistentFunction',
        };

        const result = evaluateCondition(expression, mockContext);

        expect(result).toBe(false);
        expect(mockLogger.error).toHaveBeenCalledWith('Custom function not found:', 'nonExistentFunction');
      });

      it('should handle custom function execution errors', () => {
        const throwingFunction = vi.fn(() => {
          throw new Error('Custom function error');
        });

        const contextWithThrowingFn: EvaluationContext = {
          ...mockContext,
          customFunctions: {
            throwingFunction,
          },
        };

        const expression: ConditionalExpression = {
          type: 'custom',
          expression: 'throwingFunction',
        };

        const result = evaluateCondition(expression, contextWithThrowingFn);

        expect(result).toBe(false);
        expect(mockLogger.error).toHaveBeenCalledWith('Error executing custom function:', 'throwingFunction', expect.any(Error));
      });

      it('should handle context without custom functions', () => {
        const contextWithoutCustomFn: EvaluationContext = {
          ...mockContext,
          customFunctions: undefined,
        };

        const expression: ConditionalExpression = {
          type: 'custom',
          expression: 'testFunction',
        };

        const result = evaluateCondition(expression, contextWithoutCustomFn);

        expect(result).toBe(false);
        expect(mockLogger.error).toHaveBeenCalledWith('Custom function not found:', 'testFunction');
      });

      it('should pass correct context to custom functions', () => {
        const contextChecker = vi.fn((context: EvaluationContext) => {
          expect(context.fieldValue).toBe('test');
          expect(context.formValue.name).toBe('John');
          expect(context.fieldPath).toBe('name');
          return true;
        });

        const contextWithChecker: EvaluationContext = {
          ...mockContext,
          customFunctions: {
            contextChecker,
          },
        };

        const expression: ConditionalExpression = {
          type: 'custom',
          expression: 'contextChecker',
        };

        const result = evaluateCondition(expression, contextWithChecker);

        expect(result).toBe(true);
        expect(contextChecker).toHaveBeenCalledWith(contextWithChecker);
      });
    });

    describe('fieldValue with array-scoped context', () => {
      it('should resolve field from scoped formValue (sibling field in array item)', () => {
        const arrayContext: EvaluationContext = {
          ...mockContext,
          formValue: { street: '123 Main St', hasApartment: true },
          rootFormValue: { addresses: [{ street: '123 Main St', hasApartment: true }] },
          arrayIndex: 0,
          arrayPath: 'addresses',
        };

        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'hasApartment',
          operator: 'equals',
          value: true,
        };

        expect(evaluateCondition(expression, arrayContext)).toBe(true);
      });

      it('should fall back to rootFormValue for fields outside the array', () => {
        const arrayContext: EvaluationContext = {
          ...mockContext,
          formValue: { name: 'John', role: 'admin' },
          rootFormValue: { subscriptionType: 'pro', teamMembers: [{ name: 'John', role: 'admin' }] },
          arrayIndex: 0,
          arrayPath: 'teamMembers',
        };

        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'subscriptionType',
          operator: 'equals',
          value: 'pro',
        };

        expect(evaluateCondition(expression, arrayContext)).toBe(true);
      });

      it('should not fall back when field exists in scoped formValue', () => {
        const arrayContext: EvaluationContext = {
          ...mockContext,
          formValue: { status: 'active' },
          rootFormValue: { status: 'inactive', items: [{ status: 'active' }] },
          arrayIndex: 0,
          arrayPath: 'items',
        };

        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'status',
          operator: 'equals',
          value: 'active',
        };

        // Should use scoped formValue ('active'), not rootFormValue ('inactive')
        expect(evaluateCondition(expression, arrayContext)).toBe(true);
      });

      it('should not fall back when scoped field exists with value undefined', () => {
        const arrayContext: EvaluationContext = {
          ...mockContext,
          formValue: { optionalField: undefined },
          rootFormValue: { optionalField: 'root-value', items: [{ optionalField: undefined }] },
          arrayIndex: 0,
          arrayPath: 'items',
        };

        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'optionalField',
          operator: 'equals',
          value: undefined,
        };

        // Should match scoped undefined, NOT fall back to root 'root-value'
        expect(evaluateCondition(expression, arrayContext)).toBe(true);
      });

      it('should not fall back when rootFormValue is not set', () => {
        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'nonexistent',
          operator: 'equals',
          value: 'test',
        };

        // mockContext has no rootFormValue
        expect(evaluateCondition(expression, mockContext)).toBe(false);
      });
    });

    describe('invalid type', () => {
      it('should return false for unknown expression types', () => {
        const expression: ConditionalExpression = {
          type: 'unknownType' as any,
        };

        const result = evaluateCondition(expression, mockContext);
        expect(result).toBe(false);
      });
    });

    describe('externalData in JavaScript expressions', () => {
      it('should access externalData properties in JavaScript expressions', () => {
        const contextWithExternalData: EvaluationContext = {
          ...mockContext,
          externalData: {
            userRole: 'admin',
            permissions: ['read', 'write', 'delete'],
          },
        };

        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: "externalData.userRole === 'admin'",
        };

        const result = evaluateCondition(expression, contextWithExternalData);
        expect(result).toBe(true);
      });

      it('should access nested externalData properties', () => {
        const contextWithExternalData: EvaluationContext = {
          ...mockContext,
          externalData: {
            user: {
              settings: {
                theme: 'dark',
                notifications: true,
              },
            },
          },
        };

        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: "externalData.user.settings.theme === 'dark'",
        };

        const result = evaluateCondition(expression, contextWithExternalData);
        expect(result).toBe(true);
      });

      it('should combine externalData with formValue in conditions', () => {
        const contextWithExternalData: EvaluationContext = {
          ...mockContext,
          externalData: {
            minimumAge: 21,
          },
        };

        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: 'formValue.age >= externalData.minimumAge',
        };

        const result = evaluateCondition(expression, contextWithExternalData);
        expect(result).toBe(true); // age is 25, minimumAge is 21
      });

      it('should handle array methods on externalData arrays', () => {
        const contextWithExternalData: EvaluationContext = {
          ...mockContext,
          externalData: {
            allowedCountries: ['USA', 'Canada', 'UK'],
          },
        };

        const contextWithCountry: EvaluationContext = {
          ...contextWithExternalData,
          formValue: {
            ...mockContext.formValue,
            country: 'USA',
          },
        };

        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: 'externalData.allowedCountries.includes(formValue.country)',
        };

        const result = evaluateCondition(expression, contextWithCountry);
        expect(result).toBe(true);
      });

      it('should return false when externalData is undefined', () => {
        const contextWithoutExternalData: EvaluationContext = {
          ...mockContext,
          externalData: undefined,
        };

        // When externalData is undefined, accessing .userRole returns undefined
        // and undefined === 'admin' is false
        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: "externalData.userRole === 'admin'",
        };

        // The expression parser returns false when accessing property on undefined
        const result = evaluateCondition(expression, contextWithoutExternalData);
        expect(result).toBe(false);
      });

      it('should return false when externalData property is undefined', () => {
        const contextWithExternalData: EvaluationContext = {
          ...mockContext,
          externalData: {
            someOtherProperty: 'value',
          },
        };

        // When userRole doesn't exist, the comparison returns false
        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: "externalData.userRole === 'admin'",
        };

        const result = evaluateCondition(expression, contextWithExternalData);
        expect(result).toBe(false);
      });

      it('should handle boolean externalData properties', () => {
        const contextWithExternalData: EvaluationContext = {
          ...mockContext,
          externalData: {
            featureFlags: {
              advancedMode: true,
              betaFeatures: false,
            },
          },
        };

        const expressionTrue: ConditionalExpression = {
          type: 'javascript',
          expression: 'externalData.featureFlags.advancedMode === true',
        };

        const expressionFalse: ConditionalExpression = {
          type: 'javascript',
          expression: 'externalData.featureFlags.betaFeatures === true',
        };

        expect(evaluateCondition(expressionTrue, contextWithExternalData)).toBe(true);
        expect(evaluateCondition(expressionFalse, contextWithExternalData)).toBe(false);
      });

      it('should work with custom functions that access externalData', () => {
        const hasPermission = vi.fn((context: EvaluationContext) => {
          const permissions = context.externalData?.permissions as string[] | undefined;
          return permissions?.includes('admin') ?? false;
        });

        const contextWithExternalData: EvaluationContext = {
          ...mockContext,
          externalData: {
            permissions: ['read', 'write', 'admin'],
          },
          customFunctions: {
            hasPermission,
          },
        };

        const expression: ConditionalExpression = {
          type: 'custom',
          expression: 'hasPermission',
        };

        const result = evaluateCondition(expression, contextWithExternalData);
        expect(result).toBe(true);
        expect(hasPermission).toHaveBeenCalledWith(contextWithExternalData);
      });
    });

    describe('edge cases and error handling', () => {
      it('should handle null context values gracefully', () => {
        const nullContext: EvaluationContext = {
          fieldValue: null,
          formValue: { field: null },
          fieldPath: 'field',
          logger: mockLogger,
        };

        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'field',
          operator: 'equals',
          value: null,
        };

        const result = evaluateCondition(expression, nullContext);
        expect(result).toBe(true);
      });

      it('should handle undefined context values gracefully', () => {
        const undefinedContext: EvaluationContext = {
          fieldValue: undefined,
          formValue: { field: undefined },
          fieldPath: 'field',
          logger: mockLogger,
        };

        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'field',
          operator: 'equals',
          value: undefined,
        };

        const result = evaluateCondition(expression, undefinedContext);
        expect(result).toBe(true);
      });

      it('should handle circular references in form values', () => {
        const circularForm: Record<string, unknown> = { name: 'test' };
        circularForm['self'] = circularForm;

        const circularContext: EvaluationContext = {
          fieldValue: 'test',
          formValue: circularForm,
          fieldPath: 'name',
          logger: mockLogger,
        };

        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'name',
          operator: 'equals',
          value: 'test',
        };

        expect(() => evaluateCondition(expression, circularContext)).not.toThrow();
        const result = evaluateCondition(expression, circularContext);
        expect(result).toBe(true);
      });

      it('should handle empty form values', () => {
        const emptyContext: EvaluationContext = {
          fieldValue: '',
          formValue: {},
          fieldPath: 'nonexistent',
          logger: mockLogger,
        };

        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'nonexistent',
          operator: 'equals',
          value: undefined,
        };

        const result = evaluateCondition(expression, emptyContext);
        expect(result).toBe(true);
      });

      it('should handle very deeply nested paths', () => {
        let deepForm: Record<string, unknown> = { value: 'found' };
        for (let i = 0; i < 20; i++) {
          deepForm = { level: deepForm };
        }

        const deepContext: EvaluationContext = {
          fieldValue: 'test',
          formValue: deepForm,
          fieldPath: 'test',
          logger: mockLogger,
        };

        const deepPath = Array(20).fill('level').join('.') + '.value';
        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: deepPath,
          operator: 'equals',
          value: 'found',
        };

        const result = evaluateCondition(expression, deepContext);
        expect(result).toBe(true);
      });
    });

    describe('performance considerations', () => {
      it('should handle large form objects efficiently', () => {
        const largeForm: Record<string, string> = {};
        for (let i = 0; i < 1000; i++) {
          largeForm[`field${i}`] = `value${i}`;
        }

        const largeContext: EvaluationContext = {
          fieldValue: 'value500',
          formValue: largeForm,
          fieldPath: 'field500',
          logger: mockLogger,
        };

        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'field500',
          operator: 'equals',
          value: 'value500',
        };

        const startTime = performance.now();
        const result = evaluateCondition(expression, largeContext);
        const endTime = performance.now();

        expect(result).toBe(true);
        expect(endTime - startTime).toBeLessThan(10); // Should be fast
      });

      it('should handle complex JavaScript expressions efficiently', () => {
        const expression: ConditionalExpression = {
          type: 'javascript',
          expression:
            'formValue.age > 10 && formValue.age < 100 && formValue.name.length > 0 && formValue.email.includes("@") && formValue.address.city.length > 0',
        };

        const startTime = performance.now();
        const result = evaluateCondition(expression, mockContext);
        const endTime = performance.now();

        expect(result).toBe(true);
        expect(endTime - startTime).toBeLessThan(5); // Should be very fast
      });
    });
  });
});
