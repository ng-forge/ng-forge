import { TestBed } from '@angular/core/testing';
import { vi, beforeAll } from 'vitest';
import { ConditionalExpression, evaluateCondition, FunctionRegistryService, SchemaDefinition, SchemaRegistryService } from '../../core';
import { FormConfig, FIELD_REGISTRY, FieldTypeDefinition } from '../../models';
import { FieldDef } from '../../definitions';
import { DynamicForm } from '../../dynamic-form.component';
import { SimpleTestUtils, TestFormConfig, TestInputHarnessComponent, TestCheckboxHarnessComponent } from '../index';
import { BUILT_IN_FIELDS } from '../../providers/built-in-fields';
import { valueFieldMapper, checkboxFieldMapper } from '../../mappers';

// Test field type definitions
const TEST_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: 'input',
    loadComponent: () => Promise.resolve({ default: TestInputHarnessComponent }),
    mapper: valueFieldMapper,
    valueHandling: 'include',
  },
  {
    name: 'checkbox',
    loadComponent: () => Promise.resolve({ default: TestCheckboxHarnessComponent }),
    mapper: checkboxFieldMapper,
    valueHandling: 'include',
  },
];

describe('Signal Forms Integration Tests', () => {
  // Pre-load all components to cache dynamic imports
  beforeAll(async () => {
    const loadPromises = [...BUILT_IN_FIELDS, ...TEST_FIELD_TYPES].map((field) => field.loadComponent());
    await Promise.all(loadPromises);
  }, 10000);

  beforeEach(async () => {
    const registry = new Map<string, FieldTypeDefinition>();
    BUILT_IN_FIELDS.forEach((fieldType) => registry.set(fieldType.name, fieldType));
    TEST_FIELD_TYPES.forEach((fieldType) => registry.set(fieldType.name, fieldType));

    await TestBed.configureTestingModule({
      imports: [DynamicForm, TestInputHarnessComponent, TestCheckboxHarnessComponent],
      providers: [SchemaRegistryService, FunctionRegistryService, { provide: FIELD_REGISTRY, useValue: registry }],
    }).compileComponents();
  });

  describe('Real DynamicForm Integration', () => {
    it('should render form with fields and track values', () => {
      const config: TestFormConfig = {
        fields: [
          { key: 'email', type: 'input', label: 'Email', value: 'test@example.com' },
          { key: 'name', type: 'input', label: 'Name', value: 'John' },
        ],
      };

      const { component } = SimpleTestUtils.createComponent(config);

      expect(component).toBeDefined();
      expect(component.formValue()).toEqual({
        email: 'test@example.com',
        name: 'John',
      });
    });

    it('should update form value when initial value is provided', () => {
      const config: TestFormConfig = {
        fields: [
          { key: 'firstName', type: 'input', label: 'First Name' },
          { key: 'lastName', type: 'input', label: 'Last Name' },
        ],
      };

      const initialValue = { firstName: 'Jane', lastName: 'Doe' };
      const { component } = SimpleTestUtils.createComponent(config, initialValue);

      expect(component.formValue()).toEqual(initialValue);
    });

    it('should report form validity state', () => {
      const config: TestFormConfig = {
        fields: [
          {
            key: 'requiredField',
            type: 'input',
            label: 'Required Field',
            validators: [{ type: 'required' }],
          },
        ],
      };

      // Empty value should be invalid
      const { component: invalidComponent } = SimpleTestUtils.createComponent(config, { requiredField: '' });
      expect(invalidComponent.valid()).toBe(false);

      // With value should be valid
      const { component: validComponent } = SimpleTestUtils.createComponent(config, { requiredField: 'has value' });
      expect(validComponent.valid()).toBe(true);
    });

    it('should handle checkbox fields correctly', () => {
      const config: TestFormConfig = {
        fields: [
          { key: 'acceptTerms', type: 'checkbox', label: 'Accept Terms' },
          { key: 'subscribe', type: 'checkbox', label: 'Subscribe', value: true },
        ],
      };

      const { component } = SimpleTestUtils.createComponent(config);

      expect(component.formValue()).toEqual({
        acceptTerms: false,
        subscribe: true,
      });
    });

    it('should expose form signals with correct types', () => {
      const config: TestFormConfig = {
        fields: [{ key: 'test', type: 'input', label: 'Test' }],
      };

      const { component } = SimpleTestUtils.createComponent(config);

      // All properties should be signal functions
      expect(typeof component.config).toBe('function');
      expect(typeof component.formValue).toBe('function');
      expect(typeof component.valid).toBe('function');
      expect(typeof component.invalid).toBe('function');
      expect(typeof component.dirty).toBe('function');
      expect(typeof component.touched).toBe('function');
      expect(typeof component.errors).toBe('function');
      expect(typeof component.defaultValues).toBe('function');
    });
  });

  describe('Schema Registry Integration', () => {
    it('should register and retrieve schemas', () => {
      const schemaRegistry = TestBed.inject(SchemaRegistryService);

      const emailSchema: SchemaDefinition = {
        name: 'emailValidation',
        description: 'Email validation schema',
        validators: [{ type: 'required' }, { type: 'email' }],
      };

      schemaRegistry.registerSchema(emailSchema);

      const retrieved = schemaRegistry.getSchema('emailValidation');
      expect(retrieved).toBeDefined();
      expect(retrieved?.validators).toHaveLength(2);
    });

    it('should handle conditional validators in schemas', () => {
      const schemaRegistry = TestBed.inject(SchemaRegistryService);

      const conditionalSchema: SchemaDefinition = {
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
      };

      schemaRegistry.registerSchema(conditionalSchema);

      const retrieved = schemaRegistry.getSchema('conditionalRequired');
      expect(retrieved?.validators?.[0].when).toBeDefined();
    });

    it('should process complete API form configuration with schemas', () => {
      const schemaRegistry = TestBed.inject(SchemaRegistryService);

      const apiConfig: FormConfig = {
        schemas: [
          {
            name: 'emailValidation',
            validators: [{ type: 'required' }, { type: 'email' }],
          },
          {
            name: 'phoneValidation',
            validators: [{ type: 'required' }, { type: 'pattern', value: '^\\+?[1-9]\\d{1,14}$' }],
          },
        ],
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email',
            schemas: [{ type: 'apply', schema: 'emailValidation' }],
          },
        ],
      };

      // Register schemas from config
      apiConfig.schemas?.forEach((schema) => schemaRegistry.registerSchema(schema));

      expect(schemaRegistry.getSchema('emailValidation')).toBeDefined();
      expect(schemaRegistry.getSchema('phoneValidation')).toBeDefined();
      expect(schemaRegistry.getAllSchemas().size).toBe(2);
    });
  });

  describe('Condition Evaluation Integration', () => {
    it('should evaluate fieldValue conditions', () => {
      const condition: ConditionalExpression = {
        type: 'fieldValue',
        fieldPath: 'contactMethod',
        operator: 'equals',
        value: 'email',
      };

      const context = {
        fieldValue: '',
        formValue: { contactMethod: 'email' },
        fieldPath: 'emailField',
      };

      expect(evaluateCondition(condition, context)).toBe(true);

      context.formValue.contactMethod = 'phone';
      expect(evaluateCondition(condition, context)).toBe(false);
    });

    it('should evaluate javascript expressions', () => {
      const condition: ConditionalExpression = {
        type: 'javascript',
        expression: 'formValue.age >= 18 && formValue.hasLicense === true',
      };

      const context = {
        fieldValue: 'test',
        formValue: { age: 25, hasLicense: true },
        fieldPath: 'driverStatus',
      };

      expect(evaluateCondition(condition, context)).toBe(true);

      context.formValue.age = 16;
      expect(evaluateCondition(condition, context)).toBe(false);
    });

    it('should evaluate nested field paths', () => {
      const condition: ConditionalExpression = {
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
      };

      expect(evaluateCondition(condition, context)).toBe(true);
    });

    it('should handle missing field paths gracefully', () => {
      const condition: ConditionalExpression = {
        type: 'fieldValue',
        fieldPath: 'nonexistent.deeply.nested.field',
        operator: 'equals',
        value: 'test',
      };

      const context = {
        fieldValue: 'test',
        formValue: { existing: 'value' },
        fieldPath: 'test',
      };

      // Should return false when field doesn't exist
      expect(evaluateCondition(condition, context)).toBe(false);
    });
  });

  describe('Custom Function Integration', () => {
    it('should register and evaluate custom functions', () => {
      const functionRegistry = TestBed.inject(FunctionRegistryService);

      functionRegistry.registerCustomFunction('isBusinessDay', (context) => {
        const date = new Date(context.fieldValue as string);
        const dayOfWeek = date.getDay();
        return dayOfWeek >= 1 && dayOfWeek <= 5;
      });

      const condition: ConditionalExpression = {
        type: 'custom',
        expression: 'isBusinessDay',
      };

      // Test with Monday (business day)
      const context = {
        fieldValue: '2024-01-08', // Monday
        formValue: {},
        fieldPath: 'appointmentDate',
        customFunctions: functionRegistry.getCustomFunctions(),
      };

      expect(evaluateCondition(condition, context)).toBe(true);

      // Test with Sunday (weekend)
      context.fieldValue = '2024-01-07';
      expect(evaluateCondition(condition, context)).toBe(false);
    });

    it('should handle missing custom functions gracefully', () => {
      const condition: ConditionalExpression = {
        type: 'custom',
        expression: 'nonExistentFunction',
      };

      const context = {
        fieldValue: 'test',
        formValue: {},
        fieldPath: 'test',
      };

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0);
      const result = evaluateCondition(condition, context);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('[Dynamic Forms] Custom function not found:', 'nonExistentFunction');
      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid javascript expressions gracefully', () => {
      const condition: ConditionalExpression = {
        type: 'javascript',
        expression: 'invalid @@ syntax',
      };

      const context = {
        fieldValue: 'test',
        formValue: {},
        fieldPath: 'test',
      };

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0);
      const result = evaluateCondition(condition, context);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle circular references safely', () => {
      const circularRef: any = { name: 'test' };
      circularRef.self = circularRef;

      const context = {
        fieldValue: 'test',
        formValue: circularRef,
        fieldPath: 'test',
      };

      const condition: ConditionalExpression = {
        type: 'fieldValue',
        fieldPath: 'name',
        operator: 'equals',
        value: 'test',
      };

      expect(() => evaluateCondition(condition, context)).not.toThrow();
    });
  });

  describe('Performance', () => {
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

      const condition: ConditionalExpression = {
        type: 'fieldValue',
        fieldPath: 'level1.level2.level3.level4.level5.deepValue',
        operator: 'equals',
        value: 'found',
      };

      const context = {
        fieldValue: 'test',
        formValue: deeplyNestedForm,
        fieldPath: 'test',
      };

      expect(evaluateCondition(condition, context)).toBe(true);
    });

    it('should handle forms with many fields efficiently', () => {
      const fields: FieldDef<any>[] = [];
      const initialValue: Record<string, string> = {};

      for (let i = 0; i < 50; i++) {
        fields.push({
          key: `field${i}`,
          type: 'input',
          label: `Field ${i}`,
        });
        initialValue[`field${i}`] = `value${i}`;
      }

      const config: TestFormConfig = { fields };
      const { component } = SimpleTestUtils.createComponent(config, initialValue);

      expect(Object.keys(component.formValue() || {}).length).toBe(50);
    });
  });
});
