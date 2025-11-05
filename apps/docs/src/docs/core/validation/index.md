# Validation

> **Difficulty**: 🟡 Intermediate
> **Prerequisites**: [Getting Started](../../getting-started), [Field Types](../field-types) > **Estimated time**: 30 minutes

ng-forge dynamic forms provides comprehensive validation through direct integration with Angular's signal forms validation system. All validators map directly to Angular's built-in validators, ensuring type-safe, reactive validation with minimal configuration.

## Signal Forms Integration

The library maps field validation configuration directly to Angular's signal forms validators:

```typescript
import { required, email, min, max, minLength, maxLength, pattern } from '@angular/forms/signals';
```

Every validator you configure in your field definition is applied using these Angular functions, ensuring:

- Full type safety with TypeScript
- Reactive validation that updates automatically
- Integration with Angular's form state management
- Built-in accessibility features

## Which Validation Approach Should I Use?

ng-forge dynamic forms provides three ways to configure validation. Here's when to use each:

| Approach                 | Use When                                                                         | Example                                                  |
| ------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **Shorthand Validators** | Validation is **always active** and uses **simple, static values**               | `required: true`<br/>`minLength: 8`<br/>`email: true`    |
| **Validators Array**     | Validation depends on **other field values** or uses **dynamic/computed values** | `validators: [{ type: 'max', value: 100, when: {...} }]` |
| **Conditional Logic**    | Field should become **required/readonly/hidden** based on conditions             | `logic: [{ type: 'required', condition: {...} }]`        |

### Decision Tree

```
Do you need to validate this field?
├─ Yes
│  ├─ Is validation always active?
│  │  ├─ Yes → Use Shorthand Validators (required: true, email: true, etc.)
│  │  └─ No, it depends on other fields → Use Validators Array with 'when' condition
│  │
│  └─ Does the field need to change behavior (hidden/readonly/required)?
│     └─ Yes → Use Conditional Logic (logic: [{ type: 'required', condition: {...} }])
│
└─ No → No validators needed
```

### Examples Compared

**Scenario: Username must be between 3-20 characters**

```typescript
// ✅ Use Shorthand (simple, always active)
{
  key: 'username',
  type: 'input',
  value: '',
  minLength: 3,
  maxLength: 20,
}
```

**Scenario: Discount must be ≤ 100 when discount type is "percentage"**

```typescript
// ✅ Use Validators Array (conditional validation)
{
  key: 'discount',
  type: 'input',
  value: 0,
  validators: [{
    type: 'max',
    value: 100,
    when: {
      type: 'fieldValue',
      fieldPath: 'discountType',
      operator: 'equals',
      value: 'percentage',
    },
  }],
}
```

**Scenario: Tax ID required only for business accounts**

```typescript
// ✅ Use Conditional Logic (field behavior changes)
{
  key: 'taxId',
  type: 'input',
  value: '',
  logic: [{
    type: 'required',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'equals',
      value: 'business',
    },
  }],
}
```

> **💡 Tip**: When in doubt, start with Shorthand Validators. Upgrade to Validators Array or Conditional Logic only when you need dynamic behavior.

---

## Shorthand Validators

Configure common validators using simple field properties. These provide the most concise syntax for standard validation scenarios.

### required

Mark a field as required. The field must have a value before the form can be submitted.

```typescript
{
  key: 'username',
  type: 'input',
  value: '',
  label: 'Username',
  required: true,
}
```

**Signal forms mapping:**

```typescript
required(fieldPath);
```

With custom error message:

```typescript
{
  key: 'username',
  type: 'input',
  value: '',
  label: 'Username',
  required: true,
  validationMessages: {
    required: 'Username is required',
  },
}
```

### email

Validate that a string matches email format.

```typescript
{
  key: 'email',
  type: 'input',
  value: '',
  label: 'Email Address',
  email: true,
  required: true,
}
```

**Signal forms mapping:**

```typescript
email(fieldPath as FieldPath<string>);
```

### minLength / maxLength

Validate string length constraints.

```typescript
{
  key: 'password',
  type: 'input',
  value: '',
  label: 'Password',
  required: true,
  minLength: 8,
  maxLength: 128,
  props: { type: 'password' },
  validationMessages: {
    minLength: 'Password must be at least 8 characters',
    maxLength: 'Password cannot exceed 128 characters',
  },
}
```

**Signal forms mapping:**

```typescript
minLength(fieldPath as FieldPath<string>, 8);
maxLength(fieldPath as FieldPath<string>, 128);
```

### min / max

Validate numeric value constraints.

```typescript
{
  key: 'age',
  type: 'input',
  value: null,
  label: 'Age',
  required: true,
  min: 18,
  max: 120,
  props: { type: 'number' },
  validationMessages: {
    min: 'You must be at least 18 years old',
    max: 'Please enter a valid age',
  },
}
```

**Signal forms mapping:**

```typescript
min(fieldPath as FieldPath<number>, 18);
max(fieldPath as FieldPath<number>, 120);
```

### pattern

Validate that a string matches a regular expression.

```typescript
{
  key: 'zipCode',
  type: 'input',
  value: '',
  label: 'ZIP Code',
  pattern: '^[0-9]{5}$',
  validationMessages: {
    pattern: 'ZIP code must be exactly 5 digits',
  },
}
```

**Signal forms mapping:**

```typescript
pattern(fieldPath as FieldPath<string>, /^[0-9]{5}$/);
```

You can also use a RegExp object:

```typescript
{
  key: 'username',
  type: 'input',
  value: '',
  label: 'Username',
  pattern: /^[a-zA-Z0-9_]+$/,
  validationMessages: {
    pattern: 'Username can only contain letters, numbers, and underscores',
  },
}
```

## Combining Validators

Apply multiple validators to a single field:

```typescript
{
  key: 'username',
  type: 'input',
  value: '',
  label: 'Username',
  required: true,
  minLength: 3,
  maxLength: 20,
  pattern: '^[a-zA-Z0-9_]+$',
  validationMessages: {
    required: 'Username is required',
    minLength: 'Username must be at least 3 characters',
    maxLength: 'Username cannot exceed 20 characters',
    pattern: 'Username can only contain letters, numbers, and underscores',
  },
}
```

## Advanced Validation

### ValidatorConfig Array

For complex validation scenarios, use the `validators` array. This provides more control over validation behavior, including conditional validators and dynamic values.

```typescript
interface ValidatorConfig {
  /** Validator type */
  type: 'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern';

  /** Static value for the validator */
  value?: number | string | RegExp;

  /** Dynamic value expression */
  expression?: string;

  /** Custom error message */
  errorMessage?: string;

  /** Conditional logic for when validator applies */
  when?: ConditionalExpression;
}
```

#### Multiple Validators Example

```typescript
{
  key: 'discount',
  type: 'input',
  value: null,
  label: 'Discount Amount',
  validators: [
    {
      type: 'required',
      errorMessage: 'Discount amount is required',
    },
    {
      type: 'min',
      value: 0,
      errorMessage: 'Discount cannot be negative',
    },
    {
      type: 'max',
      value: 100,
      errorMessage: 'Discount cannot exceed 100',
    },
  ],
}
```

### Conditional Validators

Apply validators only when specific conditions are met using the `when` property.

#### Basic Conditional Required

```typescript
{
  key: 'taxId',
  type: 'input',
  value: '',
  label: 'Tax ID',
  validators: [
    {
      type: 'required',
      when: {
        type: 'fieldValue',
        fieldPath: 'accountType',
        operator: 'equals',
        value: 'business',
      },
      errorMessage: 'Tax ID is required for business accounts',
    },
  ],
}
```

**Signal forms mapping:**

```typescript
const whenLogic = createLogicFunction(config.when);
required(fieldPath, { when: whenLogic });
```

#### Multiple Conditional Validators

```typescript
{
  key: 'discount',
  type: 'input',
  value: null,
  label: 'Discount',
  validators: [
    {
      type: 'required',
      errorMessage: 'Discount is required',
    },
    {
      type: 'max',
      value: 100,
      when: {
        type: 'fieldValue',
        fieldPath: 'discountType',
        operator: 'equals',
        value: 'percentage',
      },
      errorMessage: 'Percentage discount cannot exceed 100%',
    },
    {
      type: 'max',
      value: 1000,
      when: {
        type: 'fieldValue',
        fieldPath: 'discountType',
        operator: 'equals',
        value: 'fixed',
      },
      errorMessage: 'Fixed discount cannot exceed $1,000',
    },
  ],
}
```

#### Complex Conditional Logic

Use JavaScript expressions for complex conditions:

```typescript
{
  key: 'driverLicense',
  type: 'input',
  value: '',
  label: 'Driver License Number',
  validators: [
    {
      type: 'required',
      when: {
        type: 'javascript',
        expression: 'formValue.age >= 18 && formValue.needsTransport === true',
      },
      errorMessage: 'Driver license is required for adult members who need transport',
    },
  ],
}
```

#### Nested Field Conditions

```typescript
{
  key: 'managerApproval',
  type: 'input',
  value: '',
  label: 'Manager Approval',
  validators: [
    {
      type: 'required',
      when: {
        type: 'fieldValue',
        fieldPath: 'employee.role',
        operator: 'equals',
        value: 'admin',
      },
      errorMessage: 'Manager approval required for admin access',
    },
  ],
}
```

### Dynamic Validator Values

Use the `expression` property to compute validator values dynamically based on form state.

```typescript
{
  key: 'orderQuantity',
  type: 'input',
  value: null,
  label: 'Order Quantity',
  validators: [
    {
      type: 'required',
      errorMessage: 'Quantity is required',
    },
    {
      type: 'min',
      value: 1,
      errorMessage: 'Minimum order is 1 unit',
    },
    {
      type: 'max',
      expression: 'formValue.availableStock',
      errorMessage: 'Cannot exceed available stock',
    },
  ],
}
```

**Signal forms mapping:**

```typescript
const dynamicMax = createDynamicValueFunction<number, number>('formValue.availableStock');
max(fieldPath as FieldPath<number>, dynamicMax);
```

## Validation Messages

### Static Messages

Provide fixed validation messages:

```typescript
{
  key: 'email',
  type: 'input',
  value: '',
  label: 'Email',
  required: true,
  email: true,
  validationMessages: {
    required: 'Email address is required',
    email: 'Please enter a valid email address',
  },
}
```

### i18n Messages with Observables

Integrate with translation services using Observables:

```typescript
{
  key: 'username',
  type: 'input',
  value: '',
  label: this.transloco.selectTranslate('form.username.label'),
  required: true,
  validationMessages: {
    required: this.transloco.selectTranslate('form.username.required'),
    minLength: this.transloco.selectTranslate('form.username.minLength'),
  },
}
```

### i18n Messages with Signals

Use Angular signals for reactive translation:

```typescript
{
  key: 'password',
  type: 'input',
  value: '',
  label: computed(() => this.translations().password.label),
  required: true,
  minLength: 8,
  validationMessages: {
    required: computed(() => this.translations().password.required),
    minLength: computed(() => this.translations().password.minLength),
  },
}
```

## Shorthand vs Validators Array

You can mix both approaches, though typically you'll use shorthand for simple cases and the validators array for complex scenarios:

```typescript
{
  key: 'email',
  type: 'input',
  value: '',
  label: 'Email',
  required: true,  // Shorthand for always-required
  email: true,     // Shorthand for email validation
  validators: [
    {
      type: 'pattern',
      value: '^[a-zA-Z0-9._%+-]+@company\\.com$',
      when: {
        type: 'fieldValue',
        fieldPath: 'accountType',
        operator: 'equals',
        value: 'corporate',
      },
      errorMessage: 'Corporate accounts must use company email domain',
    },
  ],
}
```

## Conditional Expression Reference

### Expression Types

#### fieldValue

Compare a specific field's value:

```typescript
{
  type: 'fieldValue',
  fieldPath: 'accountType',
  operator: 'equals',
  value: 'business'
}
```

#### formValue

Compare the entire form value:

```typescript
{
  type: 'formValue',
  operator: 'equals',
  value: { status: 'active', verified: true }
}
```

#### javascript

Execute JavaScript expression with access to form context:

```typescript
{
  type: 'javascript',
  expression: 'formValue.age >= 18 && formValue.country === "US"'
}
```

#### custom

Call a registered custom function:

```typescript
{
  type: 'custom',
  expression: 'isEligibleForDiscount'
}
```

### Comparison Operators

Available operators for `fieldValue` and `formValue` expressions:

- `equals`: Exact equality (`===`)
- `notEquals`: Not equal (`!==`)
- `greater`: Greater than (`>`)
- `less`: Less than (`<`)
- `greaterOrEqual`: Greater than or equal (`>=`)
- `lessOrEqual`: Less than or equal (`<=`)
- `contains`: String contains substring or array contains value
- `startsWith`: String starts with substring
- `endsWith`: String ends with substring
- `matches`: String matches regex pattern

### Multiple Conditions

Combine multiple conditions with `and` or `or` logic:

```typescript
{
  type: 'required',
  when: {
    type: 'fieldValue',
    conditions: {
      logic: 'and',
      expressions: [
        {
          type: 'fieldValue',
          fieldPath: 'age',
          operator: 'greaterOrEqual',
          value: 18
        },
        {
          type: 'fieldValue',
          fieldPath: 'country',
          operator: 'equals',
          value: 'US'
        }
      ]
    }
  }
}
```

## Complete Examples

### User Registration Form

```typescript
const config = {
  fields: [
    {
      key: 'username',
      type: 'input',
      value: '',
      label: 'Username',
      required: true,
      minLength: 3,
      maxLength: 20,
      pattern: '^[a-zA-Z0-9_]+$',
      validationMessages: {
        required: 'Username is required',
        minLength: 'Username must be at least 3 characters',
        maxLength: 'Username cannot exceed 20 characters',
        pattern: 'Only letters, numbers, and underscores allowed',
      },
    },
    {
      key: 'email',
      type: 'input',
      value: '',
      label: 'Email',
      required: true,
      email: true,
      validationMessages: {
        required: 'Email is required',
        email: 'Please enter a valid email address',
      },
    },
    {
      key: 'password',
      type: 'input',
      value: '',
      label: 'Password',
      required: true,
      minLength: 8,
      maxLength: 128,
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$',
      props: { type: 'password' },
      validationMessages: {
        required: 'Password is required',
        minLength: 'Password must be at least 8 characters',
        pattern: 'Password must contain uppercase, lowercase, number, and special character',
      },
    },
    {
      key: 'confirmPassword',
      type: 'input',
      value: '',
      label: 'Confirm Password',
      required: true,
      props: { type: 'password' },
      validationMessages: {
        required: 'Please confirm your password',
      },
    },
    {
      key: 'age',
      type: 'input',
      value: null,
      label: 'Age',
      required: true,
      min: 18,
      max: 120,
      props: { type: 'number' },
      validationMessages: {
        required: 'Age is required',
        min: 'You must be at least 18 years old',
        max: 'Please enter a valid age',
      },
    },
  ],
} as const satisfies FormConfig;
```

### Conditional Business Form

```typescript
const config = {
  fields: [
    {
      key: 'accountType',
      type: 'select',
      value: 'personal',
      label: 'Account Type',
      required: true,
      props: {
        options: [
          { label: 'Personal', value: 'personal' },
          { label: 'Business', value: 'business' },
        ],
      },
    },
    {
      key: 'companyName',
      type: 'input',
      value: '',
      label: 'Company Name',
      validators: [
        {
          type: 'required',
          when: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'business',
          },
          errorMessage: 'Company name is required for business accounts',
        },
        {
          type: 'minLength',
          value: 2,
          when: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'business',
          },
          errorMessage: 'Company name must be at least 2 characters',
        },
      ],
    },
    {
      key: 'taxId',
      type: 'input',
      value: '',
      label: 'Tax ID',
      validators: [
        {
          type: 'required',
          when: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'business',
          },
          errorMessage: 'Tax ID is required for business accounts',
        },
        {
          type: 'pattern',
          value: '^[0-9]{2}-[0-9]{7}$',
          when: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'business',
          },
          errorMessage: 'Tax ID must be in format: XX-XXXXXXX',
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

### Dynamic Validation Form

```typescript
const config = {
  fields: [
    {
      key: 'discountType',
      type: 'select',
      value: 'percentage',
      label: 'Discount Type',
      required: true,
      props: {
        options: [
          { label: 'Percentage', value: 'percentage' },
          { label: 'Fixed Amount', value: 'fixed' },
        ],
      },
    },
    {
      key: 'discount',
      type: 'input',
      value: null,
      label: 'Discount Value',
      required: true,
      props: { type: 'number' },
      validators: [
        {
          type: 'min',
          value: 0,
          errorMessage: 'Discount cannot be negative',
        },
        {
          type: 'max',
          value: 100,
          when: {
            type: 'fieldValue',
            fieldPath: 'discountType',
            operator: 'equals',
            value: 'percentage',
          },
          errorMessage: 'Percentage discount cannot exceed 100%',
        },
        {
          type: 'max',
          value: 1000,
          when: {
            type: 'fieldValue',
            fieldPath: 'discountType',
            operator: 'equals',
            value: 'fixed',
          },
          errorMessage: 'Fixed discount cannot exceed $1,000',
        },
      ],
    },
    {
      key: 'membershipLevel',
      type: 'select',
      value: 'standard',
      label: 'Membership Level',
      required: true,
      props: {
        options: [
          { label: 'Standard', value: 'standard' },
          { label: 'Silver', value: 'silver' },
          { label: 'Gold', value: 'gold' },
        ],
      },
    },
    {
      key: 'bonusPoints',
      type: 'input',
      value: null,
      label: 'Bonus Points',
      props: { type: 'number' },
      validators: [
        {
          type: 'required',
          when: {
            type: 'fieldValue',
            fieldPath: 'membershipLevel',
            operator: 'notEquals',
            value: 'standard',
          },
          errorMessage: 'Bonus points required for premium members',
        },
        {
          type: 'min',
          value: 100,
          when: {
            type: 'fieldValue',
            fieldPath: 'membershipLevel',
            operator: 'equals',
            value: 'silver',
          },
          errorMessage: 'Silver members must have at least 100 bonus points',
        },
        {
          type: 'min',
          value: 500,
          when: {
            type: 'fieldValue',
            fieldPath: 'membershipLevel',
            operator: 'equals',
            value: 'gold',
          },
          errorMessage: 'Gold members must have at least 500 bonus points',
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

## Best Practices

### 1. Use Shorthand for Simple Cases

```typescript
// ✓ Clean and concise
{
  key: 'email',
  type: 'input',
  value: '',
  required: true,
  email: true
}

// ✗ Overly verbose for simple case
{
  key: 'email',
  type: 'input',
  value: '',
  validators: [
    { type: 'required' },
    { type: 'email' }
  ]
}
```

### 2. Use Validators Array for Conditional Logic

```typescript
// ✓ Appropriate use of validators array
{
  key: 'taxId',
  type: 'input',
  value: '',
  validators: [
    {
      type: 'required',
      when: {
        type: 'fieldValue',
        fieldPath: 'accountType',
        operator: 'equals',
        value: 'business'
      }
    }
  ]
}
```

### 3. Provide Clear Error Messages

```typescript
// ✓ Specific, actionable message
{
  key: 'password',
  type: 'input',
  value: '',
  minLength: 8,
  validationMessages: {
    minLength: 'Password must be at least 8 characters'
  }
}

// ✗ Generic, unhelpful message
{
  key: 'password',
  type: 'input',
  value: '',
  minLength: 8,
  validationMessages: {
    minLength: 'Invalid'
  }
}
```

### 4. Use i18n for Multilingual Applications

```typescript
// ✓ Supports multiple languages
{
  key: 'username',
  type: 'input',
  value: '',
  label: this.transloco.selectTranslate('form.username'),
  required: true,
  validationMessages: {
    required: this.transloco.selectTranslate('validation.required')
  }
}
```

### 5. Keep Conditional Logic Simple

```typescript
// ✓ Clear, single condition
{
  type: 'required',
  when: {
    type: 'fieldValue',
    fieldPath: 'accountType',
    operator: 'equals',
    value: 'business'
  }
}

// ✗ Complex nested conditions - consider simplifying
{
  type: 'required',
  when: {
    type: 'javascript',
    expression: '((formValue.type === "a" || formValue.type === "b") && formValue.status !== "inactive") || (formValue.override === true && formValue.level > 3)'
  }
}
```

## Related Topics

- **[Conditional Logic](../conditional-logic)** 🟡 - Dynamic field behavior beyond validation
- **[Field Types](../field-types)** 🟢 - Understanding which fields can be validated
- **[Type Safety](../type-safety)** 🔴 - How validation affects TypeScript types
- **[Material Integration](../../custom-integrations/reference/material)** 🟢 - How validation errors are displayed
