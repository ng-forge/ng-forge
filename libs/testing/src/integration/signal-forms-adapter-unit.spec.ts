import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { evaluateCondition } from '../../core/expressions/condition-evaluator';
import { EvaluationContext } from '../../models/expressions/evaluation-context';
import { FunctionRegistryService } from '../../core/registry/function-registry.service';
import { SchemaDefinition } from '../../models/schemas/schema-definition';
import { SchemaRegistryService } from '../../core/registry/schema-registry.service';
import { createMockLogger, MockLogger } from '../mock-logger';

describe('SignalFormsAdapterService Unit Tests', () => {
  let schemaRegistry: SchemaRegistryService;
  let functionRegistry: FunctionRegistryService;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockLogger = createMockLogger();

    TestBed.configureTestingModule({
      providers: [SchemaRegistryService, FunctionRegistryService],
    });

    schemaRegistry = TestBed.inject(SchemaRegistryService);
    functionRegistry = TestBed.inject(FunctionRegistryService);
  });

  describe('Schema Management', () => {
    it('should register and retrieve schemas', () => {
      const schema: SchemaDefinition = {
        name: 'testSchema',
        description: 'Test schema',
        validators: [{ type: 'required' }],
      };

      schemaRegistry.registerSchema(schema);
      const retrieved = schemaRegistry.getSchema('testSchema');

      expect(retrieved).toEqual(schema);
    });

    it('should return undefined for non-existent schema', () => {
      const result = schemaRegistry.getSchema('nonExistent');
      expect(result).toBeUndefined();
    });
  });

  describe('Custom Functions', () => {
    it('should register and use custom functions', () => {
      const customFn = vi.fn().mockReturnValue(true);
      functionRegistry.registerCustomFunction('testFn', customFn);

      const expression: ConditionalExpression = {
        type: 'custom',
        expression: 'testFn',
      };

      const context: EvaluationContext = {
        fieldValue: 'test',
        formValue: {},
        fieldPath: 'test',
        customFunctions: functionRegistry.getCustomFunctions(),
        logger: mockLogger,
      };

      const result = evaluateCondition(expression, context);

      expect(result).toBe(true);
      expect(customFn).toHaveBeenCalledWith(context);
    });
  });

  describe('Conditional Expression Evaluation', () => {
    let context: EvaluationContext;

    beforeEach(() => {
      context = {
        fieldValue: 'John',
        formValue: { name: 'John', age: 25, email: 'john@test.com' },
        fieldPath: 'name',
        logger: mockLogger,
      };
    });

    describe('Field Value Conditions', () => {
      it('should evaluate equals condition correctly', () => {
        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'name',
          operator: 'equals',
          value: 'John',
        };

        const result = evaluateCondition(expression, context);
        expect(result).toBe(true);
      });

      it('should evaluate notEquals condition correctly', () => {
        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'name',
          operator: 'notEquals',
          value: 'Jane',
        };

        const result = evaluateCondition(expression, context);
        expect(result).toBe(true);
      });

      it('should evaluate numeric comparisons', () => {
        const greaterExpression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'age',
          operator: 'greater',
          value: 20,
        };

        const lessExpression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'age',
          operator: 'less',
          value: 30,
        };

        expect(evaluateCondition(greaterExpression, context)).toBe(true);
        expect(evaluateCondition(lessExpression, context)).toBe(true);
      });

      it('should evaluate string operations', () => {
        const containsExpression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'email',
          operator: 'contains',
          value: '@test',
        };

        const startsWithExpression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'email',
          operator: 'startsWith',
          value: 'john',
        };

        expect(evaluateCondition(containsExpression, context)).toBe(true);
        expect(evaluateCondition(startsWithExpression, context)).toBe(true);
      });

      it('should handle nested field paths', () => {
        const nestedContext: EvaluationContext = {
          fieldValue: 'test',
          formValue: {
            user: {
              profile: {
                name: 'John',
              },
            },
          },
          fieldPath: 'test',
          logger: mockLogger,
        };

        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'user.profile.name',
          operator: 'equals',
          value: 'John',
        };

        const result = evaluateCondition(expression, nestedContext);
        expect(result).toBe(true);
      });

      it('should handle missing field paths gracefully', () => {
        const missingFieldExpression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'nonexistent.deeply.nested.field',
          operator: 'equals',
          value: 'test',
        };

        const result = evaluateCondition(missingFieldExpression, context);
        expect(result).toBe(false); // undefined !== 'test'
      });
    });

    describe('JavaScript Expressions', () => {
      it('should evaluate simple JavaScript expressions', () => {
        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: 'formValue.age > 18 && formValue.name.length > 2',
        };

        const result = evaluateCondition(expression, context);
        expect(result).toBe(true);
      });

      it('should handle JavaScript expression errors gracefully', () => {
        // Test with an expression that causes a parsing error
        const expression: ConditionalExpression = {
          type: 'javascript',
          expression: 'invalid @@ syntax',
        };

        const result = evaluateCondition(expression, context);

        expect(result).toBe(false);
        expect(mockLogger.error).toHaveBeenCalled();
      });
    });

    describe('Form Value Conditions', () => {
      it('should evaluate form value conditions', () => {
        const expression: ConditionalExpression = {
          type: 'formValue',
          operator: 'equals',
          value: context.formValue,
        };

        const result = evaluateCondition(expression, context);
        expect(result).toBe(true);
      });
    });
  });

  describe('Operator Validation', () => {
    const testCases = [
      { operator: 'equals' as const, value1: 'test', value2: 'test', expected: true },
      { operator: 'notEquals' as const, value1: 'test', value2: 'other', expected: true },
      { operator: 'greater' as const, value1: 10, value2: 5, expected: true },
      { operator: 'less' as const, value1: 5, value2: 10, expected: true },
      { operator: 'greaterOrEqual' as const, value1: 10, value2: 10, expected: true },
      { operator: 'lessOrEqual' as const, value1: 5, value2: 5, expected: true },
      { operator: 'contains' as const, value1: 'hello world', value2: 'world', expected: true },
      { operator: 'startsWith' as const, value1: 'hello', value2: 'he', expected: true },
      { operator: 'endsWith' as const, value1: 'world', value2: 'ld', expected: true },
      { operator: 'matches' as const, value1: 'test123', value2: '\\d+', expected: true },
      { operator: 'invalidOperator' as any, value1: 'test', value2: 'test', expected: false },
    ];

    testCases.forEach(({ operator, value1, value2, expected }) => {
      it(`should handle ${operator} operator correctly`, () => {
        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'testField',
          operator,
          value: value2,
        };

        const context: EvaluationContext = {
          fieldValue: value1,
          formValue: { testField: value1 },
          fieldPath: 'testField',
          logger: mockLogger,
        };

        const result = evaluateCondition(expression, context);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing custom functions', () => {
      const missingFunctionExpression: ConditionalExpression = {
        type: 'custom',
        expression: 'nonExistentFunction',
      };

      const context: EvaluationContext = {
        fieldValue: 'test',
        formValue: {},
        fieldPath: 'test',
        logger: mockLogger,
      };

      const result = evaluateCondition(missingFunctionExpression, context);

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith('Custom function not found:', 'nonExistentFunction');
    });

    it('should handle custom function execution errors', () => {
      const throwingFunction = () => {
        throw new Error('Function error');
      };

      functionRegistry.registerCustomFunction('throwingFn', throwingFunction);

      const expression: ConditionalExpression = {
        type: 'custom',
        expression: 'throwingFn',
      };

      const context: EvaluationContext = {
        fieldValue: 'test',
        formValue: {},
        fieldPath: 'test',
        logger: mockLogger,
      };

      const result = evaluateCondition(expression, context);

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle missing expression properties', () => {
      const invalidExpressions: ConditionalExpression[] = [
        { type: 'fieldValue' } as ConditionalExpression, // Missing fieldPath
        { type: 'javascript' } as ConditionalExpression, // Missing expression
        { type: 'custom' } as ConditionalExpression, // Missing expression
        { type: 'formValue' } as ConditionalExpression, // Missing operator
      ];

      const context: EvaluationContext = {
        fieldValue: 'test',
        formValue: {},
        fieldPath: 'test',
        logger: mockLogger,
      };

      invalidExpressions.forEach((expr) => {
        const result = evaluateCondition(expr, context);
        expect(result).toBe(false);
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle deeply nested form values', () => {
      const deeplyNestedForm = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  deepValue: 'found',
                },
              },
            },
          },
        },
      };

      const deepExpression: ConditionalExpression = {
        type: 'fieldValue',
        fieldPath: 'level1.level2.level3.level4.level5.deepValue',
        operator: 'equals',
        value: 'found',
      };

      const context: EvaluationContext = {
        fieldValue: 'test',
        formValue: deeplyNestedForm,
        fieldPath: 'test',
        logger: mockLogger,
      };

      const result = evaluateCondition(deepExpression, context);
      expect(result).toBe(true);
    });

    it('should handle circular references safely', () => {
      const circularRef: Record<string, unknown> = { name: 'test' };
      circularRef['self'] = circularRef;

      const context: EvaluationContext = {
        fieldValue: 'test',
        formValue: circularRef,
        fieldPath: 'test',
        logger: mockLogger,
      };

      const expression: ConditionalExpression = {
        type: 'fieldValue',
        fieldPath: 'name',
        operator: 'equals',
        value: 'test',
      };

      // Should handle circular references without infinite loops
      expect(() => {
        evaluateCondition(expression, context);
      }).not.toThrow();
    });

    it('should handle various data types in comparisons', () => {
      const testCases = [
        { value: null, operator: 'equals' as const, expected: null, result: true },
        { value: undefined, operator: 'equals' as const, expected: undefined, result: true },
        { value: 0, operator: 'equals' as const, expected: 0, result: true },
        { value: false, operator: 'equals' as const, expected: false, result: true },
        { value: '', operator: 'equals' as const, expected: '', result: true },
        { value: [], operator: 'equals' as const, expected: [], result: false }, // Different array instances
        { value: {}, operator: 'equals' as const, expected: {}, result: false }, // Different object instances
      ];

      testCases.forEach(({ value, operator, expected, result }) => {
        const expression: ConditionalExpression = {
          type: 'fieldValue',
          fieldPath: 'testField',
          operator,
          value: expected,
        };

        const context: EvaluationContext = {
          fieldValue: value,
          formValue: { testField: value },
          fieldPath: 'testField',
          logger: mockLogger,
        };

        const actualResult = evaluateCondition(expression, context);
        expect(actualResult).toBe(result);
      });
    });
  });
});
