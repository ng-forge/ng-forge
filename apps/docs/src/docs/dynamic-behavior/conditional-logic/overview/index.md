Control field behavior dynamically based on form state. Dynamic forms provides a declarative API for conditional visibility, required state, and readonly state that maps directly to Angular's signal forms.

## Signal Forms Integration

The library integrates with Angular's signal forms logic functions:

```typescript
import { hidden, readonly, required } from '@angular/forms/signals';
```

All conditional logic configuration is applied using these functions, providing:

- **Reactive updates** when form state changes
- **Type-safe** conditional expressions
- **Automatic re-evaluation** on dependencies
- **Integration** with form validation state

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

The field is hidden from the UI but still included in the form value.

### disabled

Disable user interaction:

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

  /** Boolean expression, static value, or form state condition */
  condition: ConditionalExpression | boolean | FormStateCondition;
}
```

`FormStateCondition` values (`'formInvalid'`, `'formSubmitting'`, `'pageInvalid'`) are primarily used for button disabled logic.

### Conditional Visibility (hidden)

Show or hide fields based on other field values.

#### Show Email When Contact Method is Email

```typescript
{
  key: 'contactMethod',
  type: 'select',
  value: '',
  options: [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
  ],
}
{
  key: 'email',
  type: 'input',
  value: '',
  label: 'Email Address',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'contactMethod',
      operator: 'notEquals',
      value: 'email',
    },
  }],
}
```

When `contactMethod !== 'email'`, the email field is hidden.

### Conditional Required

Make fields required based on conditions.

#### Tax ID Required for Business Accounts

```typescript
{
  key: 'accountType',
  type: 'radio',
  value: 'personal',
  options: [
    { value: 'personal', label: 'Personal' },
    { value: 'business', label: 'Business' },
  ],
}
{
  key: 'taxId',
  type: 'input',
  value: '',
  label: 'Tax ID',
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

### Conditional Readonly

Make fields read-only based on conditions.

#### Lock Field After Submission

```typescript
{
  key: 'status',
  type: 'select',
  value: 'draft',
  options: [
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
  ],
}
{
  key: 'documentNumber',
  type: 'input',
  value: '',
  label: 'Document Number',
  logic: [{
    type: 'readonly',
    condition: {
      type: 'fieldValue',
      fieldPath: 'status',
      operator: 'equals',
      value: 'submitted',
    },
  }],
}
```

Once status is "submitted", the document number becomes read-only.

## Basic Conditional Expression

The most common conditional expression checks a specific field's value:

```typescript
{
  type: 'fieldValue',
  fieldPath: 'fieldKey',
  operator: 'equals',
  value: 'expectedValue',
}
```

**Components:**

- `type: 'fieldValue'` - Check a specific field
- `fieldPath` - The field key to check
- `operator` - Comparison operator (see [All Operators](#all-operators))
- `value` - Value to compare against

## Quick Example

Show a field only when another field has a specific value:

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
    {
      type: 'required',
      condition: {
        type: 'fieldValue',
        fieldPath: 'contactMethod',
        operator: 'equals',
        value: 'email',
      },
    },
  ],
}
```

This field is hidden unless `contactMethod === 'email'`, and required when visible. See the [Examples](/docs/examples) page for complete form implementations.

## When Logic Runs

Conditional logic is evaluated:

- **On form value change** - Any time a dependent field changes
- **On initialization** - When the form is created
- **Reactively** - Uses Angular's signal forms for automatic updates

### Evaluation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    LOGIC EVALUATION FLOW                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Form Value Changes                                         │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────┐                                       │
│  │ Signal Updates  │◄──── Angular's reactive system        │
│  └────────┬────────┘                                       │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                       │
│  │ Evaluate logic  │                                       │
│  │    conditions   │                                       │
│  └────────┬────────┘                                       │
│           │                                                 │
│     ┌─────┴─────┐                                          │
│     ▼           ▼                                          │
│  ┌──────┐   ┌──────┐                                       │
│  │ true │   │false │                                       │
│  └──┬───┘   └──┬───┘                                       │
│     │          │                                            │
│     ▼          ▼                                            │
│  Apply      Remove                                          │
│  effect     effect                                          │
│  (hide,     (show,                                          │
│  require,   optional,                                       │
│  readonly)  editable)                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Expression Types

### fieldValue

Check a specific field's value - the most common expression type.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'accountType',
  operator: 'equals',
  value: 'business',
}
```

**Use when:** Checking a single field's value

**Example:**

```typescript
{
  key: 'companyName',
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

### formValue

Compare the entire form value object against a specific value using operators.

```typescript
{
  type: 'formValue',
  operator: 'equals',
  value: { status: 'active', role: 'admin' },
}
```

**Use when:** Checking if the entire form matches a specific state

**Note:** For complex logic involving multiple fields with JavaScript expressions, use `javascript` or `custom` type instead.

### javascript

JavaScript expressions with access to `fieldValue` (current field) and `formValue` (entire form).

```typescript
{
  type: 'javascript',
  expression: 'new Date(fieldValue) > new Date()',
}
```

**Use when:** Custom logic on field value or complex multi-field conditions

**Examples:**

```typescript
// Check current field value
{
  key: 'eventDate',
  type: 'datepicker',
  value: null,
  logic: [{
    type: 'readonly',
    condition: {
      type: 'javascript',
      expression: 'new Date(fieldValue) < new Date()',
    },
  }],
}

// Check multiple form fields (replaces old formValue expression pattern)
{
  key: 'stateProvince',
  type: 'select',
  value: '',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'javascript',
      expression: 'formValue.country !== "US" && formValue.country !== "CA"',
    },
  }],
}
```

**Safe member access:** Accessing nested properties on `null` or `undefined` returns `undefined` (no errors thrown):

```typescript
{
  type: 'javascript',
  // Safe even when user, profile, or preferences is null/undefined
  expression: 'formValue.user.profile.preferences.notifications === true',
}
```

### custom

Advanced custom expressions with access to both field and form values.

```typescript
{
  type: 'custom',
  expression: 'fieldValue > formValue.minAge && fieldValue < formValue.maxAge',
}
```

**Safe member access:** Like `formValue` expressions, nested property access is safe:

```typescript
{
  type: 'custom',
  // Safe even when nested values are null/undefined
  expression: 'fieldValue !== formValue.user.profile.firstName',
}
```

## All Operators

### Equality Operators

#### equals

Exact match comparison.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'status',
  operator: 'equals',
  value: 'active',
}
```

#### notEquals

Not equal to comparison.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'status',
  operator: 'notEquals',
  value: 'archived',
}
```

### Comparison Operators

#### greater

Greater than comparison (numbers/dates).

```typescript
{
  type: 'fieldValue',
  fieldPath: 'age',
  operator: 'greater',
  value: 18,
}
```

#### less

Less than comparison.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'quantity',
  operator: 'less',
  value: 100,
}
```

#### greaterOrEqual

Greater than or equal to.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'age',
  operator: 'greaterOrEqual',
  value: 21,
}
```

#### lessOrEqual

Less than or equal to.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'discount',
  operator: 'lessOrEqual',
  value: 100,
}
```

### String Operators

#### contains

Check if string/array contains value.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'email',
  operator: 'contains',
  value: '@company.com',
}
```

#### startsWith

Check if string starts with value.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'url',
  operator: 'startsWith',
  value: 'https://',
}
```

#### endsWith

Check if string ends with value.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'email',
  operator: 'endsWith',
  value: '.gov',
}
```

#### matches

Regular expression match.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'zipCode',
  operator: 'matches',
  value: '^[0-9]{5}$',
}
```

## Combining Conditions

### AND Logic

All conditions must be true.

```typescript
{
  type: 'and',
  conditions: [
    {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'equals',
      value: 'business',
    },
    {
      type: 'fieldValue',
      fieldPath: 'hasTeam',
      operator: 'equals',
      value: true,
    },
    {
      type: 'fieldValue',
      fieldPath: 'teamSize',
      operator: 'greater',
      value: 5,
    },
  ],
}
```

**Use case:** Field required when all conditions are met.

```typescript
{
  key: 'enterpriseFeatures',
  type: 'checkbox',
  label: 'Enable Enterprise Features',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'and',
      conditions: [
        {
          type: 'fieldValue',
          fieldPath: 'accountType',
          operator: 'equals',
          value: 'business',
        },
        {
          type: 'fieldValue',
          fieldPath: 'plan',
          operator: 'equals',
          value: 'enterprise',
        },
      ],
    },
  }],
}
```

### OR Logic

At least one condition must be true.

```typescript
{
  type: 'or',
  conditions: [
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
      value: 'owner',
    },
  ],
}
```

**Use case:** Show field for multiple roles.

```typescript
{
  key: 'adminPanel',
  type: 'group',
  label: 'Administration',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'or',
      conditions: [
        {
          type: 'fieldValue',
          fieldPath: 'role',
          operator: 'notEquals',
          value: 'admin',
        },
        {
          type: 'fieldValue',
          fieldPath: 'role',
          operator: 'notEquals',
          value: 'owner',
        },
      ],
    },
  }],
}
```

### Nested Logic

Combine AND/OR logic for complex conditions.

```typescript
{
  type: 'and',
  conditions: [
    {
      type: 'fieldValue',
      fieldPath: 'country',
      operator: 'equals',
      value: 'US',
    },
    {
      type: 'or',
      conditions: [
        {
          type: 'fieldValue',
          fieldPath: 'age',
          operator: 'greaterOrEqual',
          value: 21,
        },
        {
          type: 'fieldValue',
          fieldPath: 'hasParentalConsent',
          operator: 'equals',
          value: true,
        },
      ],
    },
  ],
}
```

This means: "Country must be US AND (age >= 21 OR has parental consent)"

## Practical Examples

### Show Field Based on Multiple Conditions

```typescript
{
  key: 'internationalShipping',
  type: 'checkbox',
  label: 'Enable International Shipping',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'or',
      conditions: [
        {
          type: 'fieldValue',
          fieldPath: 'accountType',
          operator: 'equals',
          value: 'free',
        },
        {
          type: 'fieldValue',
          fieldPath: 'verified',
          operator: 'equals',
          value: false,
        },
      ],
    },
  }],
}
```

Hidden for free accounts OR unverified accounts.

### Required Field with Complex Logic

```typescript
{
  key: 'taxExemptionNumber',
  type: 'input',
  value: '',
  label: 'Tax Exemption Number',
  logic: [{
    type: 'required',
    condition: {
      type: 'and',
      conditions: [
        {
          type: 'fieldValue',
          fieldPath: 'accountType',
          operator: 'equals',
          value: 'business',
        },
        {
          type: 'fieldValue',
          fieldPath: 'claimsTaxExemption',
          operator: 'equals',
          value: true,
        },
        {
          type: 'or',
          conditions: [
            {
              type: 'fieldValue',
              fieldPath: 'country',
              operator: 'equals',
              value: 'US',
            },
            {
              type: 'fieldValue',
              fieldPath: 'country',
              operator: 'equals',
              value: 'CA',
            },
          ],
        },
      ],
    },
  }],
}
```

### Dynamic Read-Only Based on Status

```typescript
{
  key: 'orderItems',
  type: 'group',
  label: 'Order Items',
  logic: [{
    type: 'readonly',
    condition: {
      type: 'or',
      conditions: [
        {
          type: 'fieldValue',
          fieldPath: 'orderStatus',
          operator: 'equals',
          value: 'shipped',
        },
        {
          type: 'fieldValue',
          fieldPath: 'orderStatus',
          operator: 'equals',
          value: 'delivered',
        },
        {
          type: 'fieldValue',
          fieldPath: 'orderStatus',
          operator: 'equals',
          value: 'cancelled',
        },
      ],
    },
  }],
}
```

Order items become read-only once order is shipped, delivered, or cancelled.

## Best Practices

**Keep conditions readable:**

```typescript
// ✅ Good - Easy to understand
{
  type: 'fieldValue',
  fieldPath: 'accountType',
  operator: 'equals',
  value: 'business',
}

// ❌ Avoid - Hard to maintain
{
  type: 'formValue',
  expression: 'formValue.accountType === "business" && formValue.country !== null && formValue.hasTeam',
}
```

## ConditionalExpression Interface

```typescript
interface ConditionalExpression {
  /** Expression type - includes 'and' and 'or' for combining conditions */
  type: 'fieldValue' | 'formValue' | 'javascript' | 'custom' | 'and' | 'or';

  /** Field path for fieldValue type */
  fieldPath?: string;

  /**
   * Comparison operator
   * - For 'fieldValue': compares field at fieldPath against value
   * - For 'formValue': compares entire form object against value
   */
  operator?:
    | 'equals'
    | 'notEquals'
    | 'greater'
    | 'less'
    | 'greaterOrEqual'
    | 'lessOrEqual'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'matches';

  /** Value to compare against (for fieldValue/formValue with operator) */
  value?: unknown;

  /**
   * JavaScript expression string
   * - For 'javascript': Has access to fieldValue and formValue
   * - For 'custom': Name of registered custom function
   */
  expression?: string;

  /** Array of sub-conditions for 'and' and 'or' types */
  conditions?: ConditionalExpression[];
}
```

**Expression types summary:**

| Type         | Uses                             | Purpose                                        |
| ------------ | -------------------------------- | ---------------------------------------------- |
| `fieldValue` | `fieldPath`, `operator`, `value` | Compare a specific field's value               |
| `formValue`  | `operator`, `value`              | Compare entire form object                     |
| `javascript` | `expression`                     | Custom JS with `fieldValue`/`formValue` access |
| `custom`     | `expression`                     | Call registered custom function                |
| `and`/`or`   | `conditions`                     | Combine multiple conditions                    |

## Common Patterns

### Show/Hide Field Pattern

```typescript
logic: [
  {
    type: 'hidden',
    condition: {
      /* when to hide */
    },
  },
];
```

### Conditional Required Pattern

```typescript
logic: [
  {
    type: 'hidden',
    condition: {
      /* when to hide */
    },
  },
  {
    type: 'required',
    condition: {
      /* when to require */
    },
  },
];
```

### Multiple Conditions Pattern

```typescript
logic: [
  {
    type: 'hidden',
    condition: {
      type: 'and', // or 'or'
      conditions: [
        {
          /* condition 1 */
        },
        {
          /* condition 2 */
        },
      ],
    },
  },
];
```

## External Data in Conditions

Access external application state (user roles, permissions, feature flags) in conditions using `externalData`:

```typescript
const config = {
  externalData: {
    userRole: computed(() => authService.role()),
    featureFlags: computed(() => ({
      advancedMode: featureService.isAdvanced(),
    })),
  },
  fields: [
    {
      key: 'adminNotes',
      type: 'textarea',
      label: 'Admin Notes',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'javascript',
            expression: "externalData.userRole !== 'admin'",
          },
        },
      ],
    },
    {
      key: 'advancedSettings',
      type: 'input',
      label: 'Advanced Settings',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'javascript',
            expression: 'externalData.featureFlags.advancedMode !== true',
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

**Key points:**

- Each property in `externalData` must be a Signal (`signal()` or `computed()`)
- Changes to external signals automatically re-evaluate conditions
- Access values via `externalData.propertyName` in JavaScript expressions

## Related

- **[Value Derivation](../value-derivation/basics/)** - Computed field values
- **[Validation](../../validation/basics/)** - Conditional validation
- **[Type Safety](../../advanced/type-safety/basics/)** - TypeScript integration
- **[Examples](/docs/examples)** - Real-world form patterns
