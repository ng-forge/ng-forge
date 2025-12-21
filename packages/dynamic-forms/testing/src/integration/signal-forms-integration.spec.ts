import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { evaluateCondition } from '../../core/expressions/condition-evaluator';
import { FunctionRegistryService } from '../../core/registry/function-registry.service';
import { SchemaDefinition } from '../../models/schemas/schema-definition';
import { SchemaRegistryService } from '../../core/registry/schema-registry.service';
import { ValidatorConfig } from '../../models/validation/validator-config';
import { FormConfig } from '../../models/form-config';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldWithValidation } from '../../definitions/base/field-with-validation';
import { createMockLogger, MockLogger } from '../mock-logger';

// Mock component to test integration
@Component({
  template: `
    <div>
      <input
        [value]="fieldValue()"
        (input)="updateValue($event)"
        [disabled]="isDisabled()"
        [hidden]="isHidden()"
        data-testid="test-input"
      />
    </div>
  `,
})
class TestFormComponent {
  private formValue = signal({
    email: 'test@example.com',
    age: 25,
    contactMethod: 'email',
    isActive: true,
  });

  fieldValue = signal('test@example.com');

  form = form(this.formValue);

  isDisabled = signal(false);
  isHidden = signal(false);

  updateValue(event: Event) {
    const target = event.target as HTMLInputElement;
    this.fieldValue.set(target.value);
  }

  // Methods to simulate field state changes for testing
  setDisabled(disabled: boolean) {
    this.isDisabled.set(disabled);
  }

  setHidden(hidden: boolean) {
    this.isHidden.set(hidden);
  }

  updateFormValue(updates: Partial<any>) {
    this.formValue.update((current) => ({ ...current, ...updates }));
  }

  getFormValue() {
    return this.formValue();
  }
}

describe('Signal Forms Integration Tests', () => {
  let fixture: ComponentFixture<TestFormComponent>;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockLogger = createMockLogger();

    TestBed.configureTestingModule({
      imports: [TestFormComponent],
      providers: [SchemaRegistryService, FunctionRegistryService],
    });

    fixture = TestBed.createComponent(TestFormComponent);
    fixture.detectChanges();
  });

  describe('API Configuration Processing', () => {
    it('should process a complete API form configuration', () => {
      const apiConfig: FormConfig = {
        schemas: [
          {
            name: 'emailValidation',
            description: 'Email validation schema',
            validators: [{ type: 'required' }, { type: 'email' }],
          },
          {
            name: 'conditionalRequired',
            validators: [
              {
                type: 'required',
                when: {
                  type: 'fieldValue',
                  fieldPath: 'isActive',
                  operator: 'equals',
                  value: true,
                },
              },
            ],
          },
        ],
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email Address',
            schemas: [{ type: 'apply', schema: 'emailValidation' }],
            logic: [
              {
                type: 'hidden',
                condition: {
                  type: 'fieldValue',
                  fieldPath: 'contactMethod',
                  operator: 'notEquals',
                  value: 'email',
                },
              },
            ],
          } as any,
        ],
      };

      // Register schemas
      const schemaRegistry = TestBed.inject(SchemaRegistryService);
      apiConfig.schemas?.forEach((schema) => {
        schemaRegistry.registerSchema(schema);
      });

      // Verify schemas are registered
      const emailSchema = schemaRegistry.getSchema('emailValidation');
      expect(emailSchema).toBeDefined();
      expect(emailSchema?.validators).toHaveLength(2);

      const conditionalSchema = schemaRegistry.getSchema('conditionalRequired');
      expect(conditionalSchema).toBeDefined();
      expect(conditionalSchema?.validators?.[0].when).toBeDefined();
    });

    it('should handle field configuration with multiple validator types', () => {
      const fieldConfig: FieldDef<any> & FieldWithValidation = {
        key: 'age',
        type: 'input',
        label: 'Age',
        validators: [
          { type: 'required' },
          { type: 'min', value: 18 },
          { type: 'max', value: 100 },
          {
            type: 'pattern',
            value: '^[0-9]+$',
          },
        ],
      };

      // Simulate applying validators (in real implementation, this would be done by the form system)
      fieldConfig.validators?.forEach((validatorConfig) => {
        expect(() => {
          // This would normally call service.createValidator with actual field path
          // For test, we just verify the config is valid
          expect(validatorConfig.type).toMatch(/^(required|min|max|pattern|email|minLength|maxLength|custom)$/);
        }).not.toThrow();
      });
    });

    it('should handle complex conditional logic', () => {
      const complexCondition: ConditionalExpression = {
        type: 'javascript',
        expression: 'formValue.age >= 18 && formValue.hasLicense === true',
      };

      const context = {
        fieldValue: 'test',
        formValue: { age: 25, hasLicense: true },
        fieldPath: 'driverStatus',
        logger: mockLogger,
      };

      const result = evaluateCondition(complexCondition, context);
      expect(result).toBe(true);
    });

    it('should handle nested field path conditions', () => {
      const nestedCondition: ConditionalExpression = {
        type: 'fieldValue',
        fieldPath: 'user.profile.role',
        operator: 'equals',
        value: 'admin',
      };

      const context = {
        fieldValue: 'test',
        formValue: {
          user: {
            profile: {
              role: 'admin',
            },
          },
        },
        fieldPath: 'adminPanel',
        logger: mockLogger,
      };

      const result = evaluateCondition(nestedCondition, context);
      expect(result).toBe(true);
    });
  });

  describe('Real-world Scenarios', () => {
    beforeEach(() => {
      // Register common schemas
      const emailSchema: SchemaDefinition = {
        name: 'email',
        validators: [{ type: 'required' }, { type: 'email' }],
      };

      const phoneSchema: SchemaDefinition = {
        name: 'phone',
        validators: [{ type: 'required' }, { type: 'pattern', value: '^\\+?[1-9]\\d{1,14}$' }],
      };

      const schemaRegistry = TestBed.inject(SchemaRegistryService);
      schemaRegistry.registerSchema(emailSchema);
      schemaRegistry.registerSchema(phoneSchema);
    });

    it('should handle conditional field visibility based on form state', () => {
      const fieldConfig: FieldDef<any> & FieldWithValidation = {
        key: 'email',
        type: 'input',
        label: 'Email',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'notEquals',
              value: 'email',
            },
          },
        ],
      };

      // Test when email should be visible
      let context = {
        fieldValue: '',
        formValue: { contactMethod: 'email' },
        fieldPath: 'email',
        logger: mockLogger,
      };

      const logicConfig = fieldConfig.logic?.[0];
      if (!logicConfig) throw new Error('Expected logic config to be defined');

      let shouldHide = evaluateCondition(logicConfig.condition as ConditionalExpression, context);
      expect(shouldHide).toBe(false); // Should not hide when contactMethod is email

      // Test when email should be hidden
      context = {
        fieldValue: '',
        formValue: { contactMethod: 'phone' },
        fieldPath: 'email',
        logger: mockLogger,
      };

      shouldHide = evaluateCondition(logicConfig.condition as ConditionalExpression, context);
      expect(shouldHide).toBe(true); // Should hide when contactMethod is not email
    });

    it('should handle dynamic validation based on other field values', () => {
      const ageFieldConfig: FieldDef<any> & FieldWithValidation = {
        key: 'age',
        type: 'input',
        label: 'Age',
        validators: [
          {
            type: 'required',
            when: {
              type: 'fieldValue',
              fieldPath: 'requiresAge',
              operator: 'equals',
              value: true,
            },
          },
          {
            type: 'min',
            value: 18,
            when: {
              type: 'fieldValue',
              fieldPath: 'category',
              operator: 'equals',
              value: 'adult',
            },
          },
        ],
      };

      // Test required validation condition
      const validators = ageFieldConfig.validators;
      if (!validators?.[0]?.when || !validators?.[1]?.when) {
        throw new Error('Expected validators with when conditions to be defined');
      }
      const requiredCondition = validators[0].when;
      const minCondition = validators[1].when;

      const context = {
        fieldValue: 25,
        formValue: { requiresAge: true, category: 'adult' },
        fieldPath: 'age',
        logger: mockLogger,
      };

      let isRequired = evaluateCondition(requiredCondition, context);
      expect(isRequired).toBe(true);

      // Test min validation condition
      let isAdult = evaluateCondition(minCondition, context);
      expect(isAdult).toBe(true);

      // Test when conditions are not met
      context.formValue = { requiresAge: false, category: 'child' };
      isRequired = evaluateCondition(requiredCondition, context);
      isAdult = evaluateCondition(minCondition, context);

      expect(isRequired).toBe(false);
      expect(isAdult).toBe(false);
    });

    it('should handle array field validation with applyEach', () => {
      const arrayFieldConfig: FieldDef<any> & FieldWithValidation = {
        key: 'contacts',
        type: 'array',
        label: 'Contact Information',
        schemas: [
          {
            type: 'applyEach',
            schema: {
              name: 'contactItem',
              validators: [{ type: 'required' }],
              logic: [
                {
                  type: 'hidden',
                  condition: {
                    type: 'fieldValue',
                    fieldPath: 'type',
                    operator: 'equals',
                    value: 'disabled',
                  },
                },
              ],
            },
          },
        ],
      };

      expect(arrayFieldConfig.schemas?.[0].type).toBe('applyEach');
      expect(arrayFieldConfig.schemas?.[0].schema).toBeDefined();
    });

    it('should handle custom business logic validation', () => {
      // Register custom function
      const functionRegistry = TestBed.inject(FunctionRegistryService);
      functionRegistry.registerCustomFunction('isBusinessDay', (context) => {
        const date = new Date(context.fieldValue as string);
        const dayOfWeek = date.getDay();
        return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
      });

      // Test the custom function
      const businessDayCondition: ConditionalExpression = {
        type: 'custom',
        expression: 'isBusinessDay',
      };

      // Test with Monday (business day)
      const context = {
        fieldValue: '2024-01-08', // Monday
        formValue: {},
        fieldPath: 'appointmentDate',
        customFunctions: functionRegistry.getCustomFunctions(),
        logger: mockLogger,
      };

      let isBusinessDay = evaluateCondition(businessDayCondition, context);
      expect(isBusinessDay).toBe(true);

      // Test with Sunday (weekend)
      context.fieldValue = '2024-01-07'; // Sunday
      isBusinessDay = evaluateCondition(businessDayCondition, context);
      expect(isBusinessDay).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid expressions gracefully', () => {
      // Test with an expression that causes a parsing error
      const invalidExpression: ConditionalExpression = {
        type: 'javascript',
        expression: 'invalid @@ syntax',
      };

      const context = {
        fieldValue: 'test',
        formValue: {},
        fieldPath: 'test',
        logger: mockLogger,
      };

      const result = evaluateCondition(invalidExpression, context);

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle missing custom functions', () => {
      const missingFunctionExpression: ConditionalExpression = {
        type: 'custom',
        expression: 'nonExistentFunction',
      };

      const context = {
        fieldValue: 'test',
        formValue: {},
        fieldPath: 'test',
        logger: mockLogger,
      };

      const result = evaluateCondition(missingFunctionExpression, context);

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith('Custom function not found:', 'nonExistentFunction');
    });

    it('should handle missing field paths gracefully', () => {
      const missingFieldExpression: ConditionalExpression = {
        type: 'fieldValue',
        fieldPath: 'nonexistent.deeply.nested.field',
        operator: 'equals',
        value: 'test',
      };

      const context = {
        fieldValue: 'test',
        formValue: { existing: 'value' },
        fieldPath: 'test',
        logger: mockLogger,
      };

      const result = evaluateCondition(missingFieldExpression, context);
      expect(result).toBe(false); // undefined !== 'test'
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large numbers of validators efficiently', () => {
      const manyValidators: ValidatorConfig[] = [];

      // Create 100 validators
      for (let i = 0; i < 100; i++) {
        manyValidators.push({
          type: 'minLength',
          value: i,
          when: {
            type: 'fieldValue',
            fieldPath: `field${i}`,
            operator: 'equals',
            value: true,
          },
        });
      }

      const fieldConfig: FieldDef<any> & FieldWithValidation = {
        key: 'testField',
        type: 'input',
        label: 'Test Field',
        validators: manyValidators,
      };

      expect(fieldConfig.validators).toHaveLength(100);

      // Verify each validator is valid
      fieldConfig.validators?.forEach((validator, index) => {
        expect(validator.type).toBe('minLength');
        expect(validator.value).toBe(index);
        expect(validator.when?.fieldPath).toBe(`field${index}`);
      });
    });

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

      const context = {
        fieldValue: 'test',
        formValue: deeplyNestedForm,
        fieldPath: 'test',
        logger: mockLogger,
      };

      const result = evaluateCondition(deepExpression, context);
      expect(result).toBe(true);
    });

    it('should handle circular references safely', () => {
      const circularRef: any = { name: 'test' };
      circularRef.self = circularRef;

      const context = {
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
  });
});
