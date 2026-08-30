import { describe, it, expect } from 'vitest';
import { MatFormConfigSchema } from '../mat-form-config.schema';
import { MatInputFieldSchema } from '../fields/mat-input-field.schema';
import { MatLeafFieldSchema } from '../mat-leaf-field.schema';

describe('MatFormConfigSchema', () => {
  describe('basic form configs', () => {
    it('should validate a simple form with input field', () => {
      const config = {
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email',
            required: true,
            props: { type: 'email' },
          },
        ],
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate form with multiple field types', () => {
      const config = {
        fields: [
          { key: 'name', type: 'input', label: 'Name' },
          {
            key: 'country',
            type: 'select',
            label: 'Country',
            options: [
              { label: 'USA', value: 'us' },
              { label: 'UK', value: 'uk' },
            ],
          },
          { key: 'agree', type: 'checkbox', label: 'I agree' },
          { key: 'submit', type: 'submit', label: 'Submit' },
        ],
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate form with default props', () => {
      const config = {
        fields: [{ key: 'email', type: 'input', label: 'Email' }],
        defaultProps: {
          appearance: 'outline',
          color: 'primary',
        },
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate form with options', () => {
      const config = {
        fields: [{ key: 'name', type: 'input', label: 'Name' }],
        options: {
          disabled: false,
          maxDerivationIterations: 15,
          submitButton: {
            disableWhenInvalid: true,
            disableWhileSubmitting: true,
          },
        },
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('field with validation', () => {
    it('should validate field with built-in validators', () => {
      const config = {
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email',
            required: true,
            email: true,
            minLength: 5,
            maxLength: 100,
          },
        ],
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate field with advanced validators', () => {
      const config = {
        fields: [
          {
            key: 'username',
            type: 'input',
            label: 'Username',
            validators: [{ type: 'required' }, { type: 'minLength', value: 3 }, { type: 'pattern', value: '^[a-z0-9_]+$' }],
            validationMessages: {
              required: 'Username is required',
              minLength: 'Username must be at least 3 characters',
              pattern: 'Username can only contain lowercase letters, numbers, and underscores',
            },
          },
        ],
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('field with logic', () => {
    it('should validate field with conditional logic', () => {
      const config = {
        fields: [
          {
            key: 'type',
            type: 'select',
            label: 'Type',
            options: [
              { label: 'Personal', value: 'personal' },
              { label: 'Business', value: 'business' },
            ],
          },
          {
            key: 'companyName',
            type: 'input',
            label: 'Company Name',
            logic: [
              {
                type: 'hidden',
                condition: {
                  type: 'fieldValue',
                  fieldPath: 'type',
                  operator: 'notEquals',
                  value: 'business',
                },
              },
              {
                type: 'required',
                condition: {
                  type: 'fieldValue',
                  fieldPath: 'type',
                  operator: 'equals',
                  value: 'business',
                },
              },
            ],
          },
        ],
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('container fields', () => {
    it('should validate form with row container', () => {
      const config = {
        fields: [
          {
            key: 'personalInfo',
            type: 'row',
            fields: [
              { key: 'firstName', type: 'input', label: 'First Name', col: 6 },
              { key: 'lastName', type: 'input', label: 'Last Name', col: 6 },
            ],
          },
        ],
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate form with group container', () => {
      const config = {
        fields: [
          {
            key: 'address',
            type: 'group',
            fields: [
              { key: 'street', type: 'input', label: 'Street' },
              { key: 'city', type: 'input', label: 'City' },
              { key: 'zip', type: 'input', label: 'ZIP Code' },
            ],
          },
        ],
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate form with array container', () => {
      const config = {
        fields: [
          {
            key: 'items',
            type: 'array',
            fields: [
              { key: 'name', type: 'input', label: 'Item Name' },
              { key: 'quantity', type: 'input', label: 'Quantity', props: { type: 'number' } },
            ],
          },
        ],
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('Material-specific props', () => {
    it('should validate field with Material appearance', () => {
      const config = {
        fields: [
          {
            key: 'name',
            type: 'input',
            label: 'Name',
            props: {
              appearance: 'outline',
              subscriptSizing: 'dynamic',
              hint: 'Enter your full name',
            },
          },
        ],
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate datepicker with Material props', () => {
      const config = {
        fields: [
          {
            key: 'birthDate',
            type: 'datepicker',
            label: 'Birth Date',
            props: {
              appearance: 'fill',
              color: 'accent',
              startView: 'year',
              touchUi: true,
            },
          },
        ],
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid configs', () => {
    it('should reject field without key', () => {
      const config = {
        fields: [{ type: 'input', label: 'Name' }],
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it('should reject unknown field type', () => {
      const config = {
        fields: [{ key: 'test', type: 'unknown', label: 'Test' }],
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it('should reject invalid appearance value', () => {
      const config = {
        fields: [
          {
            key: 'name',
            type: 'input',
            label: 'Name',
            props: { appearance: 'invalid' },
          },
        ],
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it('should reject array field with label property', () => {
      const config = {
        fields: [
          {
            key: 'items',
            type: 'array',
            label: 'My Items', // Arrays should NOT have label
            fields: [{ key: 'item', type: 'input', label: 'Item' }],
          },
        ],
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it('should reject group field with label property', () => {
      const config = {
        fields: [
          {
            key: 'address',
            type: 'group',
            label: 'Address', // Groups should NOT have label
            fields: [{ key: 'street', type: 'input', label: 'Street' }],
          },
        ],
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it('should accept array field with template (simplified API)', () => {
      const config = {
        fields: [
          {
            key: 'items',
            type: 'array',
            template: [{ key: 'item', type: 'input', label: 'Item' }],
          },
        ],
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should accept array field with single template field (primitive simplified API)', () => {
      const config = {
        fields: [
          {
            key: 'tags',
            type: 'array',
            template: { key: 'tag', type: 'input', label: 'Tag' },
            value: ['angular', 'typescript'],
          },
        ],
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should reject array field with both fields and template', () => {
      const config = {
        fields: [
          {
            key: 'items',
            type: 'array',
            fields: [{ key: 'item', type: 'input', label: 'Item' }],
            template: [{ key: 'item', type: 'input', label: 'Item' }],
          },
        ],
      };
      const result = MatFormConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });
  });
});

describe('MatInputFieldSchema', () => {
  it('should validate input field with all props', () => {
    const field = {
      key: 'email',
      type: 'input',
      label: 'Email Address',
      placeholder: 'Enter your email',
      required: true,
      email: true,
      props: {
        type: 'email',
        appearance: 'outline',
        subscriptSizing: 'dynamic',
        hint: 'We will never share your email',
        disableRipple: false,
      },
    };
    const result = MatInputFieldSchema.safeParse(field);
    expect(result.success).toBe(true);
  });

  it('should accept nullable:true with value:null and preserve null', () => {
    const field = {
      key: 'middleName',
      type: 'input',
      label: 'Middle Name',
      nullable: true,
      value: null,
    };
    const result = MatInputFieldSchema.safeParse(field);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBeNull();
      expect(result.data.nullable).toBe(true);
    }
  });

  it('should accept nullable:true without an explicit value', () => {
    const field = {
      key: 'middleName',
      type: 'input',
      label: 'Middle Name',
      nullable: true,
    };
    const result = MatInputFieldSchema.safeParse(field);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nullable).toBe(true);
      expect(result.data.value).toBeUndefined();
    }
  });

  it('should accept nullable:true alongside required:true (orthogonal)', () => {
    const field = {
      key: 'middleName',
      type: 'input',
      label: 'Middle Name',
      nullable: true,
      required: true,
    };
    const result = MatInputFieldSchema.safeParse(field);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nullable).toBe(true);
      expect(result.data.required).toBe(true);
    }
  });
});

describe('MatInputFieldSchema - nullable gating (direct parse)', () => {
  it('should reject value:null on the individual schema when nullable is absent', () => {
    const field = {
      key: 'name',
      type: 'input',
      label: 'Name',
      value: null,
    };
    const result = MatInputFieldSchema.safeParse(field);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues[0];
      expect(issue.path).toEqual(['value']);
      expect(issue.message).toMatch(/nullable/);
    }
  });
});

describe('MatLeafFieldSchema - nullable gating', () => {
  it('should reject value:null when nullable is absent', () => {
    const field = {
      key: 'name',
      type: 'input',
      label: 'Name',
      value: null,
    };
    const result = MatLeafFieldSchema.safeParse(field);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues[0];
      expect(issue.path).toEqual(['value']);
      expect(issue.message).toMatch(/nullable/);
    }
  });

  it('should reject value:null when nullable is explicitly false', () => {
    const field = {
      key: 'name',
      type: 'input',
      label: 'Name',
      nullable: false,
      value: null,
    };
    const result = MatLeafFieldSchema.safeParse(field);
    expect(result.success).toBe(false);
  });

  it('should accept value:null when nullable is true', () => {
    const field = {
      key: 'name',
      type: 'input',
      label: 'Name',
      nullable: true,
      value: null,
    };
    const result = MatLeafFieldSchema.safeParse(field);
    expect(result.success).toBe(true);
  });
});
