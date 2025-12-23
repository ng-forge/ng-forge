import { describe, expect, it } from 'vitest';
import { ValidatorConfig } from '../../models/validation';
import { LogicConfig } from '../../models/logic';
import { SchemaApplicationConfig, SchemaDefinition } from '../../models/schemas';
import { ConditionalExpression, EvaluationContext } from '../../models/expressions';
import { FormConfig } from '../../models/form-config';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldWithValidation } from '../../definitions/base/field-with-validation';
import { createMockLogger } from '../mock-logger';

// Type aliases for the unified field definition
type EnhancedFieldDef = FieldDef<any> & FieldWithValidation;

describe('Signal Forms Integration Types', () => {
  describe('ValidatorConfig', () => {
    it('should create basic required validator config', () => {
      const config: ValidatorConfig = {
        type: 'required',
      };

      expect(config.type).toBe('required');
      expect(config.value).toBeUndefined();
      expect(config.expression).toBeUndefined();
    });

    it('should create min validator with static value', () => {
      const config: ValidatorConfig = {
        type: 'min',
        value: 10,
      };

      expect(config.type).toBe('min');
      expect(config.value).toBe(10);
    });

    it('should create max validator with dynamic expression', () => {
      const config: ValidatorConfig = {
        type: 'max',
        expression: 'formValue.country === "US" ? 65 : 70',
        when: {
          type: 'fieldValue',
          fieldPath: 'active',
          operator: 'equals',
          value: true,
        },
      };

      expect(config.type).toBe('max');
      expect(config.expression).toContain('formValue.country');
      expect(config.when).toBeDefined();
      expect(typeof config.when).toBe('object');
      expect(config.when?.type).toBe('fieldValue');
    });

    it('should create pattern validator with RegExp', () => {
      const pattern = /^[a-zA-Z]+$/;
      const config: ValidatorConfig = {
        type: 'pattern',
        value: pattern,
      };

      expect(config.type).toBe('pattern');
      expect(config.value).toBe(pattern);
    });

    it('should create email validator', () => {
      const config: ValidatorConfig = {
        type: 'email',
      };

      expect(config.type).toBe('email');
    });
  });

  describe('LogicConfig', () => {
    it('should create hidden logic with boolean condition', () => {
      const config: LogicConfig = {
        type: 'hidden',
        condition: true,
      };

      expect(config.type).toBe('hidden');
      expect(config.condition).toBe(true);
    });

    it('should create readonly logic with conditional expression', () => {
      const condition: ConditionalExpression = {
        type: 'fieldValue',
        fieldPath: 'status',
        operator: 'equals',
        value: 'locked',
      };

      const config: LogicConfig = {
        type: 'readonly',
        condition: condition,
      };

      expect(config.type).toBe('readonly');
      expect(config.condition).toBe(condition);
    });

    it('should create conditional required with error message', () => {
      const config: LogicConfig = {
        type: 'required',
        condition: {
          type: 'fieldValue',
          fieldPath: 'employmentStatus',
          operator: 'equals',
          value: 'employed',
        },
      };

      expect(config.type).toBe('required');
    });
  });

  describe('ConditionalExpression', () => {
    it('should create field value expression', () => {
      const expression: ConditionalExpression = {
        type: 'fieldValue',
        fieldPath: 'age',
        operator: 'greater',
        value: 18,
      };

      expect(expression.type).toBe('fieldValue');
      expect(expression.fieldPath).toBe('age');
      expect(expression.operator).toBe('greater');
      expect(expression.value).toBe(18);
    });

    it('should create form value expression', () => {
      const expression: ConditionalExpression = {
        type: 'formValue',
        operator: 'contains',
        value: 'admin',
      };

      expect(expression.type).toBe('formValue');
      expect(expression.operator).toBe('contains');
    });

    it('should create JavaScript expression', () => {
      const expression: ConditionalExpression = {
        type: 'javascript',
        expression: 'formValue.age > 18 && formValue.hasLicense',
      };

      expect(expression.type).toBe('javascript');
      expect(expression.expression).toContain('formValue.age');
    });

    it('should create custom function expression', () => {
      const expression: ConditionalExpression = {
        type: 'custom',
        expression: 'isBusinessEmail',
      };

      expect(expression.type).toBe('custom');
      expect(expression.expression).toBe('isBusinessEmail');
    });

    it('should create complex AND conditions', () => {
      const expression: ConditionalExpression = {
        type: 'fieldValue',
        fieldPath: '',
        conditions: {
          logic: 'and',
          expressions: [
            {
              type: 'fieldValue',
              fieldPath: 'age',
              operator: 'greaterOrEqual',
              value: 18,
            },
            {
              type: 'fieldValue',
              fieldPath: 'hasLicense',
              operator: 'equals',
              value: true,
            },
          ],
        },
      };

      expect(expression.conditions?.logic).toBe('and');
      expect(expression.conditions?.expressions).toHaveLength(2);
    });

    it('should create complex OR conditions', () => {
      const expression: ConditionalExpression = {
        type: 'fieldValue',
        fieldPath: '',
        conditions: {
          logic: 'or',
          expressions: [
            {
              type: 'fieldValue',
              fieldPath: 'role',
              operator: 'equals',
              value: 'admin',
            },
            {
              type: 'fieldValue',
              fieldPath: 'role',
              operator: 'equals',
              value: 'moderator',
            },
          ],
        },
      };

      expect(expression.conditions?.logic).toBe('or');
      expect(expression.conditions?.expressions).toHaveLength(2);
    });
  });

  describe('SchemaDefinition', () => {
    it('should create basic schema definition', () => {
      const schema: SchemaDefinition = {
        name: 'userValidation',
        description: 'Standard user validation rules',
        validators: [{ type: 'required' }, { type: 'minLength', value: 3 }],
      };

      expect(schema.name).toBe('userValidation');
      expect(schema.description).toBe('Standard user validation rules');
      expect(schema.validators).toHaveLength(2);
    });

    it('should create schema with logic and sub-schemas', () => {
      const schema: SchemaDefinition = {
        name: 'complexSchema',
        validators: [{ type: 'required' }],
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'showAdvanced',
              operator: 'equals',
              value: false,
            },
          },
        ],
        subSchemas: [
          {
            type: 'apply',
            schema: 'emailValidation',
          },
        ],
      };

      expect(schema.name).toBe('complexSchema');
      expect(schema.validators).toHaveLength(1);
      expect(schema.logic).toHaveLength(1);
      expect(schema.subSchemas).toHaveLength(1);
    });

    it('should create schema with path pattern', () => {
      const schema: SchemaDefinition = {
        name: 'arrayItemSchema',
        pathPattern: 'items.*',
        validators: [{ type: 'required' }],
      };

      expect(schema.pathPattern).toBe('items.*');
    });
  });

  describe('SchemaApplicationConfig', () => {
    it('should create apply configuration', () => {
      const config: SchemaApplicationConfig = {
        type: 'apply',
        schema: 'emailValidation',
      };

      expect(config.type).toBe('apply');
      expect(config.schema).toBe('emailValidation');
    });

    it('should create conditional apply configuration', () => {
      const config: SchemaApplicationConfig = {
        type: 'applyWhen',
        schema: 'advancedValidation',
        condition: {
          type: 'fieldValue',
          fieldPath: 'isAdvanced',
          operator: 'equals',
          value: true,
        },
      };

      expect(config.type).toBe('applyWhen');
      expect(config.condition).toBeDefined();
      expect(typeof config.condition).toBe('object');
    });

    it('should create type predicate apply configuration', () => {
      const config: SchemaApplicationConfig = {
        type: 'applyWhenValue',
        schema: 'stringValidation',
        typePredicate: 'value && value.type === "text"',
      };

      expect(config.type).toBe('applyWhenValue');
      expect(config.typePredicate).toBe('value && value.type === "text"');
    });

    it('should create array item apply configuration', () => {
      const config: SchemaApplicationConfig = {
        type: 'applyEach',
        schema: 'itemValidation',
      };

      expect(config.type).toBe('applyEach');
    });

    it('should create inline schema application', () => {
      const inlineSchema: SchemaDefinition = {
        name: 'inline',
        validators: [{ type: 'email' }],
      };

      const config: SchemaApplicationConfig = {
        type: 'apply',
        schema: inlineSchema,
      };

      expect(config.schema).toBe(inlineSchema);
      expect(typeof config.schema).toBe('object');
    });
  });

  describe('FieldWithValidation', () => {
    it('should create field config with validators only', () => {
      const config: FieldWithValidation = {
        validators: [{ type: 'required' }, { type: 'email' }],
      };

      expect(config.validators).toHaveLength(2);
      expect(config.logic).toBeUndefined();
      expect(config.schemas).toBeUndefined();
    });

    it('should create field config with logic rules', () => {
      const config: FieldWithValidation = {
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'showEmail',
              operator: 'equals',
              value: false,
            },
          },
        ],
      };

      expect(config.logic).toHaveLength(1);
      expect(config.logic?.[0].type).toBe('hidden');
    });

    it('should create field config with schema applications', () => {
      const config: FieldWithValidation = {
        schemas: [
          { type: 'apply', schema: 'emailValidation' },
          {
            type: 'applyWhen',
            schema: 'advancedValidation',
            condition: { type: 'fieldValue', fieldPath: 'advanced', operator: 'equals', value: true },
          },
        ],
      };

      expect(config.schemas).toHaveLength(2);
    });

    it('should create comprehensive field config', () => {
      const config: FieldWithValidation = {
        validators: [{ type: 'required' }, { type: 'email' }],
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
        schemas: [{ type: 'apply', schema: 'standardEmail' }],
      };

      expect(config.validators).toHaveLength(2);
      expect(config.logic).toHaveLength(1);
      expect(config.schemas).toHaveLength(1);
    });
  });

  describe('EnhancedFieldDef', () => {
    it('should create enhanced field with validation config', () => {
      const field: EnhancedFieldDef = {
        key: 'email',
        type: 'input',
        label: 'Email Address',
        validators: [{ type: 'required' }, { type: 'email' }],
      };

      expect(field.key).toBe('email');
      expect(field.type).toBe('input');
      expect(field.validators).toHaveLength(2);
    });

    it('should support simple validation rules', () => {
      const field: EnhancedFieldDef = {
        key: 'username',
        type: 'input',
        label: 'Username',
        required: true,
        minLength: 3,
        maxLength: 20,
        validators: [{ type: 'required' }, { type: 'minLength', value: 3 }, { type: 'maxLength', value: 20 }],
      };

      expect(field.required).toBe(true);
      expect(field.minLength).toBe(3);
      expect(field.maxLength).toBe(20);
      expect(field.validators).toHaveLength(3);
    });

    it('should support logic rules for dynamic behavior', () => {
      const field: EnhancedFieldDef = {
        key: 'phone',
        type: 'input',
        label: 'Phone Number',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'contactMethod',
              operator: 'notEquals',
              value: 'phone',
            },
          },
        ],
      };

      expect(field.logic).toHaveLength(1);
      expect(field.logic?.[0].type).toBe('hidden');
    });
  });

  describe('FormConfig', () => {
    it('should create form config with global schemas', () => {
      const config: FormConfig = {
        fields: [],
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
      };

      expect(config.schemas).toHaveLength(2);
      expect(config.schemas?.[0].name).toBe('emailValidation');
      expect(config.schemas?.[1].name).toBe('phoneValidation');
    });

    it('should create form config with signal forms settings', () => {
      const config: FormConfig = {
        fields: [],
        customFnConfig: {
          customFunctions: {
            isBusinessEmail: (context) => {
              const email = context.fieldValue as string;
              return email && !email.includes('gmail.com');
            },
          },
        },
      };

      expect(config.customFnConfig?.customFunctions?.['isBusinessEmail']).toBeDefined();
    });

    it('should create complete form configuration', () => {
      const config = {
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email',
            schemas: [{ type: 'apply', schema: 'emailValidation' }],
          },
        ],
        options: {
          disabled: false,
        },
        schemas: [
          {
            name: 'emailValidation',
            validators: [{ type: 'email' }],
          },
        ],
      };

      expect(config.fields).toHaveLength(1);
      expect(config.options?.disabled).toBe(false);
      expect(config.schemas).toHaveLength(1);
    });
  });

  describe('EvaluationContext', () => {
    it('should create evaluation context', () => {
      const context: EvaluationContext = {
        fieldValue: 'test@example.com',
        formValue: {
          email: 'test@example.com',
          name: 'John Doe',
          age: 25,
        },
        fieldPath: 'email',
        customFunctions: {
          isBusinessEmail: (ctx) => !String(ctx.fieldValue).includes('gmail.com'),
        },
        logger: createMockLogger(),
      };

      expect(context.fieldValue).toBe('test@example.com');
      expect(context.formValue.email).toBe('test@example.com');
      expect(context.fieldPath).toBe('email');
      expect(context.customFunctions?.['isBusinessEmail']).toBeDefined();
    });
  });

  describe('Type Safety', () => {
    it('should enforce validator type constraints', () => {
      // This test verifies TypeScript compilation
      const requiredValidator: ValidatorConfig = { type: 'required' };
      const emailValidator: ValidatorConfig = { type: 'email' };
      const minValidator: ValidatorConfig = { type: 'min', value: 10 };

      expect(requiredValidator.type).toBe('required');
      expect(emailValidator.type).toBe('email');
      expect(minValidator.type).toBe('min');
      expect(minValidator.value).toBe(10);
    });

    it('should enforce logic type constraints', () => {
      const hiddenLogic: LogicConfig = { type: 'hidden', condition: true };
      const readonlyLogic: LogicConfig = { type: 'readonly', condition: false };

      expect(hiddenLogic.type).toBe('hidden');
      expect(readonlyLogic.type).toBe('readonly');
    });

    it('should enforce conditional expression type constraints', () => {
      const fieldValueExpr: ConditionalExpression = {
        type: 'fieldValue',
        fieldPath: 'test',
        operator: 'equals',
        value: 'test',
      };

      const jsExpr: ConditionalExpression = {
        type: 'javascript',
        expression: 'formValue.test === true',
      };

      expect(fieldValueExpr.type).toBe('fieldValue');
      expect(jsExpr.type).toBe('javascript');
    });
  });
});
