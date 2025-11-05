Control field behavior dynamically based on form state using Angular's signal forms logic functions. ng-forge provides a declarative API for conditional visibility, required state, and readonly state that maps directly to signal forms.

## Signal Forms Integration

The library integrates with Angular's signal forms logic functions:

```typescript
import { hidden, readonly, required } from '@angular/forms/signals';
```

All conditional logic configuration is applied using these functions, providing:

- Reactive updates when form state changes
- Type-safe conditional expressions
- Automatic re-evaluation on dependencies
- Integration with form validation state

## Static Properties

Use simple boolean properties for fields with fixed states.

### hidden

Hide a field from view (field still participates in form state):

```typescript
{
  key: 'internalId',
  type: 'input',
  value: '',
  label: 'Internal ID',
  hidden: true,
}
```

### disabled

Disable user interaction (handled at component level, not form model level):

```typescript
{
  key: 'systemField',
  type: 'input',
  value: 'auto-generated',
  label: 'System Field',
  disabled: true,
}
```

**Note:** The `disabled` property is handled at the component level and does not use signal forms logic functions. It's a static UI property that prevents user interaction.

### readonly

Make a field read-only (displays value but prevents modification):

```typescript
{
  key: 'createdAt',
  type: 'input',
  value: '2024-01-15',
  label: 'Created Date',
  readonly: true,
}
```

## Dynamic Conditional Logic

For conditional behavior based on form state, use the `logic` array with `LogicConfig` objects.

```typescript
interface LogicConfig {
  /** Logic type */
  type: 'hidden' | 'readonly' | 'disabled' | 'required';

  /** Boolean expression or static value */
  condition: ConditionalExpression | boolean;

  /** Optional error message for conditional required */
  errorMessage?: string;
}
```

### Conditional Visibility

Show or hide fields based on other field values.

#### Basic Conditional Visibility

```typescript
{
  key: 'email',
  type: 'input',
  value: '',
  label: 'Email Address',
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
}
```

**Signal forms mapping:**

```typescript
const logicFn = createLogicFunction(condition);
hidden(fieldPath, logicFn);
```

**Behavior:** The email field is hidden unless `contactMethod` equals `'email'`.

#### Multiple Conditions

```typescript
{
  key: 'companyDetails',
  type: 'group',
  label: 'Company Details',
  logic: [
    {
      type: 'hidden',
      condition: {
        type: 'fieldValue',
        conditions: {
          logic: 'or',
          expressions: [
            {
              type: 'fieldValue',
              fieldPath: 'accountType',
              operator: 'notEquals',
              value: 'business',
            },
            {
              type: 'fieldValue',
              fieldPath: 'skip',
              operator: 'equals',
              value: true,
            },
          ],
        },
      },
    },
  ],
  fields: [
    { key: 'companyName', type: 'input', value: '', label: 'Company Name' },
    { key: 'taxId', type: 'input', value: '', label: 'Tax ID' },
  ],
}
```

**Behavior:** Company details are hidden if either accountType is not 'business' OR skip is true.

### Conditional Required

Make fields required based on form state.

#### Basic Conditional Required

```typescript
{
  key: 'taxId',
  type: 'input',
  value: '',
  label: 'Tax ID',
  logic: [
    {
      type: 'required',
      condition: {
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
const whenLogic = createLogicFunction(condition);
required(fieldPath, { when: whenLogic });
```

**Behavior:** Tax ID is only required when accountType equals 'business'.

#### Multiple Conditional Required Rules

```typescript
{
  key: 'phone',
  type: 'input',
  value: '',
  label: 'Phone Number',
  logic: [
    {
      type: 'required',
      condition: {
        type: 'fieldValue',
        fieldPath: 'contactMethod',
        operator: 'equals',
        value: 'phone',
      },
      errorMessage: 'Phone number is required when phone is selected as contact method',
    },
  ],
}
```

### Conditional Readonly

Make fields readonly based on form state.

```typescript
{
  key: 'shippingAddress',
  type: 'textarea',
  value: '',
  label: 'Shipping Address',
  logic: [
    {
      type: 'readonly',
      condition: {
        type: 'fieldValue',
        fieldPath: 'sameAsBilling',
        operator: 'equals',
        value: true,
      },
    },
  ],
}
```

**Signal forms mapping:**

```typescript
const logicFn = createLogicFunction(condition);
readonly(fieldPath, logicFn);
```

**Behavior:** Shipping address becomes readonly when sameAsBilling is true.

### Complex Conditional Logic

Use JavaScript expressions for complex conditions.

```typescript
{
  key: 'driverLicense',
  type: 'input',
  value: '',
  label: 'Driver License',
  logic: [
    {
      type: 'required',
      condition: {
        type: 'javascript',
        expression: 'formValue.age >= 18 && formValue.needsTransport === true',
      },
      errorMessage: 'Driver license required for adults needing transport',
    },
  ],
}
```

### Multiple Logic Rules

Apply multiple logic rules to a single field:

```typescript
{
  key: 'managerEmail',
  type: 'input',
  value: '',
  label: 'Manager Email',
  email: true,
  logic: [
    {
      type: 'hidden',
      condition: {
        type: 'fieldValue',
        fieldPath: 'role',
        operator: 'equals',
        value: 'owner',
      },
    },
    {
      type: 'required',
      condition: {
        type: 'fieldValue',
        fieldPath: 'role',
        operator: 'notEquals',
        value: 'owner',
      },
      errorMessage: 'Manager email is required for non-owner roles',
    },
    {
      type: 'readonly',
      condition: {
        type: 'fieldValue',
        fieldPath: 'approved',
        operator: 'equals',
        value: true,
      },
    },
  ],
}
```

**Behavior:**

- Hidden when role is 'owner'
- Required when role is not 'owner'
- Readonly when approved is true

## Conditional Expression Types

### fieldValue Expression

Compare a specific field's value:

```typescript
{
  type: 'fieldValue',
  fieldPath: 'accountType',
  operator: 'equals',
  value: 'business'
}
```

**Available operators:**

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

**Nested field paths:**

```typescript
{
  type: 'fieldValue',
  fieldPath: 'user.profile.role',
  operator: 'equals',
  value: 'admin'
}
```

### formValue Expression

Compare the entire form value:

```typescript
{
  type: 'formValue',
  operator: 'equals',
  value: { status: 'active', verified: true }
}
```

### javascript Expression

Execute JavaScript expression with form context:

```typescript
{
  type: 'javascript',
  expression: 'formValue.age >= 18 && formValue.country === "US"'
}
```

**Available context:**

- `formValue`: The entire form value object
- `fieldValue`: The current field's value
- `fieldPath`: The current field's path

### custom Expression

Call a registered custom function:

```typescript
{
  type: 'custom',
  expression: 'checkEligibility'
}
```

Register the custom function in your application:

```typescript
import { FunctionRegistryService } from '@ng-forge/dynamic-form';

const functionRegistry = inject(FunctionRegistryService);

functionRegistry.registerFunction('checkEligibility', (context) => {
  return context.formValue.age >= 18 && context.formValue.income > 50000;
});
```

### Multiple Conditions with and/or Logic

Combine multiple conditions:

```typescript
{
  type: 'hidden',
  condition: {
    type: 'fieldValue',
    conditions: {
      logic: 'and',
      expressions: [
        {
          type: 'fieldValue',
          fieldPath: 'age',
          operator: 'less',
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

Use `'or'` logic:

```typescript
{
  type: 'hidden',
  condition: {
    type: 'fieldValue',
    conditions: {
      logic: 'or',
      expressions: [
        {
          type: 'fieldValue',
          fieldPath: 'accountType',
          operator: 'equals',
          value: 'guest'
        },
        {
          type: 'fieldValue',
          fieldPath: 'temporary',
          operator: 'equals',
          value: true
        }
      ]
    }
  }
}
```

## Complete Examples

### Contact Form with Dynamic Fields

```typescript
const config = {
  fields: [
    {
      key: 'contactMethod',
      type: 'select',
      value: 'email',
      label: 'Preferred Contact Method',
      required: true,
      props: {
        options: [
          { label: 'Email', value: 'email' },
          { label: 'Phone', value: 'phone' },
          { label: 'Mail', value: 'mail' },
        ],
      },
    },
    {
      key: 'email',
      type: 'input',
      value: '',
      label: 'Email Address',
      email: true,
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
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'contactMethod',
            operator: 'equals',
            value: 'email',
          },
          errorMessage: 'Email is required when email is the contact method',
        },
      ],
    },
    {
      key: 'phone',
      type: 'input',
      value: '',
      label: 'Phone Number',
      props: { type: 'tel' },
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
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'contactMethod',
            operator: 'equals',
            value: 'phone',
          },
          errorMessage: 'Phone is required when phone is the contact method',
        },
      ],
    },
    {
      key: 'mailingAddress',
      type: 'textarea',
      value: '',
      label: 'Mailing Address',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'contactMethod',
            operator: 'notEquals',
            value: 'mail',
          },
        },
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'contactMethod',
            operator: 'equals',
            value: 'mail',
          },
          errorMessage: 'Mailing address is required when mail is the contact method',
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

### Business Account Form

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
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'notEquals',
            value: 'business',
          },
        },
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'business',
          },
          errorMessage: 'Company name is required for business accounts',
        },
      ],
    },
    {
      key: 'taxId',
      type: 'input',
      value: '',
      label: 'Tax ID',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'notEquals',
            value: 'business',
          },
        },
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'business',
          },
          errorMessage: 'Tax ID is required for business accounts',
        },
      ],
    },
    {
      key: 'numberOfEmployees',
      type: 'input',
      value: null,
      label: 'Number of Employees',
      props: { type: 'number' },
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'notEquals',
            value: 'business',
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

### Shipping Form with Same as Billing

```typescript
const config = {
  fields: [
    {
      key: 'billingAddress',
      type: 'group',
      label: 'Billing Address',
      fields: [
        { key: 'street', type: 'input', value: '', label: 'Street', required: true },
        { key: 'city', type: 'input', value: '', label: 'City', required: true },
        { key: 'zipCode', type: 'input', value: '', label: 'ZIP Code', required: true },
      ],
    },
    {
      key: 'sameAsBilling',
      type: 'checkbox',
      value: false,
      label: 'Shipping address is same as billing address',
    },
    {
      key: 'shippingAddress',
      type: 'group',
      label: 'Shipping Address',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'sameAsBilling',
            operator: 'equals',
            value: true,
          },
        },
      ],
      fields: [
        { key: 'street', type: 'input', value: '', label: 'Street', required: true },
        { key: 'city', type: 'input', value: '', label: 'City', required: true },
        { key: 'zipCode', type: 'input', value: '', label: 'ZIP Code', required: true },
      ],
    },
  ],
} as const satisfies FormConfig;
```

### Age-Based Conditional Form

```typescript
const config = {
  fields: [
    {
      key: 'age',
      type: 'input',
      value: null,
      label: 'Age',
      required: true,
      min: 1,
      max: 120,
      props: { type: 'number' },
    },
    {
      key: 'parentName',
      type: 'input',
      value: '',
      label: 'Parent/Guardian Name',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'age',
            operator: 'greaterOrEqual',
            value: 18,
          },
        },
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'age',
            operator: 'less',
            value: 18,
          },
          errorMessage: 'Parent/guardian name is required for minors',
        },
      ],
    },
    {
      key: 'parentPhone',
      type: 'input',
      value: '',
      label: 'Parent/Guardian Phone',
      props: { type: 'tel' },
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'age',
            operator: 'greaterOrEqual',
            value: 18,
          },
        },
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'age',
            operator: 'less',
            value: 18,
          },
          errorMessage: 'Parent/guardian phone is required for minors',
        },
      ],
    },
    {
      key: 'driverLicense',
      type: 'input',
      value: '',
      label: 'Driver License Number',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'age',
            operator: 'less',
            value: 16,
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

### Complex Multi-Condition Form

```typescript
const config = {
  fields: [
    {
      key: 'membershipLevel',
      type: 'select',
      value: 'standard',
      label: 'Membership Level',
      required: true,
      props: {
        options: [
          { label: 'Standard', value: 'standard' },
          { label: 'Premium', value: 'premium' },
          { label: 'VIP', value: 'vip' },
        ],
      },
    },
    {
      key: 'annualIncome',
      type: 'input',
      value: null,
      label: 'Annual Income',
      props: { type: 'number' },
      required: true,
    },
    {
      key: 'personalConcierge',
      type: 'checkbox',
      value: false,
      label: 'Request Personal Concierge Service',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'javascript',
            expression: 'formValue.membershipLevel !== "vip" || formValue.annualIncome < 100000',
          },
        },
      ],
    },
    {
      key: 'conciergePreferences',
      type: 'textarea',
      value: '',
      label: 'Concierge Preferences',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            conditions: {
              logic: 'or',
              expressions: [
                {
                  type: 'fieldValue',
                  fieldPath: 'membershipLevel',
                  operator: 'notEquals',
                  value: 'vip',
                },
                {
                  type: 'fieldValue',
                  fieldPath: 'personalConcierge',
                  operator: 'equals',
                  value: false,
                },
              ],
            },
          },
        },
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            conditions: {
              logic: 'and',
              expressions: [
                {
                  type: 'fieldValue',
                  fieldPath: 'membershipLevel',
                  operator: 'equals',
                  value: 'vip',
                },
                {
                  type: 'fieldValue',
                  fieldPath: 'personalConcierge',
                  operator: 'equals',
                  value: true,
                },
              ],
            },
          },
          errorMessage: 'Please describe your concierge preferences',
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

## Best Practices

### 1. Use Static Properties for Fixed States

```typescript
// ✓ Clear and simple
{
  key: 'internalId',
  type: 'input',
  value: 'AUTO',
  hidden: true
}

// ✗ Unnecessarily complex
{
  key: 'internalId',
  type: 'input',
  value: 'AUTO',
  logic: [
    {
      type: 'hidden',
      condition: true
    }
  ]
}
```

### 2. Keep Conditions Simple and Readable

```typescript
// ✓ Clear, single condition
{
  type: 'hidden',
  condition: {
    type: 'fieldValue',
    fieldPath: 'accountType',
    operator: 'notEquals',
    value: 'business'
  }
}

// ✗ Complex, hard to debug
{
  type: 'hidden',
  condition: {
    type: 'javascript',
    expression: '!(formValue.accountType === "business" && formValue.verified === true && !formValue.suspended)'
  }
}
```

### 3. Combine Related Logic on Same Field

```typescript
// ✓ All logic together
{
  key: 'field',
  type: 'input',
  value: '',
  logic: [
    { type: 'hidden', condition: {...} },
    { type: 'required', condition: {...} },
    { type: 'readonly', condition: {...} }
  ]
}

// ✗ Scattered configuration (not possible with current API)
```

### 4. Use Descriptive Error Messages

```typescript
// ✓ Specific and helpful
{
  type: 'required',
  condition: {...},
  errorMessage: 'Tax ID is required for business accounts'
}

// ✗ Generic and unhelpful
{
  type: 'required',
  condition: {...},
  errorMessage: 'This field is required'
}
```

### 5. Avoid Circular Dependencies

```typescript
// ✗ Circular: A depends on B, B depends on A
{
  key: 'fieldA',
  type: 'input',
  value: '',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'fieldB',
      operator: 'equals',
      value: true
    }
  }]
},
{
  key: 'fieldB',
  type: 'checkbox',
  value: false,
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'fieldA',
      operator: 'equals',
      value: 'something'
    }
  }]
}
```

### 6. Extract Complex Logic to Custom Functions

```typescript
// ✓ Reusable and testable
const functionRegistry = inject(FunctionRegistryService);

functionRegistry.registerFunction('isEligibleForPremium', (context) => {
  const age = context.formValue.age;
  const income = context.formValue.annualIncome;
  const creditScore = context.formValue.creditScore;

  return age >= 21 && income >= 50000 && creditScore >= 700;
});

{
  key: 'premiumFeatures',
  type: 'group',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'custom',
      expression: 'isEligibleForPremium'
    }
  }],
  fields: [...]
}

// ✗ Complex inline expression
{
  key: 'premiumFeatures',
  type: 'group',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'javascript',
      expression: '!(formValue.age >= 21 && formValue.annualIncome >= 50000 && formValue.creditScore >= 700)'
    }
  }],
  fields: [...]
}
```

### 7. Consider User Experience

```typescript
// ✓ Hides field when not relevant
{
  key: 'businessTaxId',
  type: 'input',
  value: '',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'notEquals',
      value: 'business'
    }
  }]
}

// Consider: Does readonly make more sense than hidden?
{
  key: 'approvedAmount',
  type: 'input',
  value: 5000,
  logic: [{
    type: 'readonly',
    condition: {
      type: 'fieldValue',
      fieldPath: 'approved',
      operator: 'equals',
      value: true
    }
  }]
}
```
