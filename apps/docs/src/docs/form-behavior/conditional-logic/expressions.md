---
title: Expressions
route: expressions
keyword: ConditionalLogicExpressionsPage
---

Complete guide to conditional expression types, operators, and combining conditions.

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

## Related

- **[Conditional Logic](../)** - Getting started
- **[Examples](../examples/)** - Real-world patterns
- **[Validation](../../core/validation/)** - Conditional validation
- **[Type Safety](../../deep-dive/type-safety/)** - TypeScript integration
