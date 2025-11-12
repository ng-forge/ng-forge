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

Use JavaScript expressions to check the entire form state.

```typescript
{
  type: 'formValue',
  expression: 'formValue.hasShipping && formValue.country === "US"',
}
```

**Use when:** Complex logic involving multiple fields

**Example:**

```typescript
{
  key: 'stateProvince',
  type: 'select',
  value: '',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'formValue',
      expression: 'formValue.country !== "US" && formValue.country !== "CA"',
    },
  }],
}
```

### javascript

Custom JavaScript validation on the field value.

```typescript
{
  type: 'javascript',
  expression: 'new Date(fieldValue) > new Date()',
}
```

**Use when:** Custom logic on the current field

**Example:**

```typescript
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
```

### custom

Advanced custom expressions with access to both field and form values.

```typescript
{
  type: 'custom',
  expression: 'fieldValue > formValue.minAge && fieldValue < formValue.maxAge',
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

#### notContains

Check if string/array doesn't contain value.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'username',
  operator: 'notContains',
  value: 'admin',
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

### Array Operators

#### in

Value is in array.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'role',
  operator: 'in',
  value: ['admin', 'moderator', 'owner'],
}
```

#### notIn

Value is not in array.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'status',
  operator: 'notIn',
  value: ['banned', 'suspended', 'deleted'],
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

Better version using `in` operator:

```typescript
{
  key: 'adminPanel',
  type: 'group',
  label: 'Administration',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'role',
      operator: 'notIn',
      value: ['admin', 'owner'],
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
          type: 'fieldValue',
          fieldPath: 'country',
          operator: 'in',
          value: ['US', 'CA'],
        },
      ],
    },
    errorMessage: 'Tax exemption number required for business accounts claiming exemption in US/CA',
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
      type: 'fieldValue',
      fieldPath: 'orderStatus',
      operator: 'in',
      value: ['shipped', 'delivered', 'cancelled'],
    },
  }],
}
```

Order items become read-only once order is shipped, delivered, or cancelled.

## Best Practices

**Use the simplest operator:**

```typescript
// ✅ Good - Simple and clear
{
  type: 'fieldValue',
  fieldPath: 'role',
  operator: 'in',
  value: ['admin', 'owner'],
}

// ❌ Avoid - Unnecessarily complex
{
  type: 'or',
  conditions: [
    { type: 'fieldValue', fieldPath: 'role', operator: 'equals', value: 'admin' },
    { type: 'fieldValue', fieldPath: 'role', operator: 'equals', value: 'owner' },
  ],
}
```

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

**Use descriptive error messages:**

```typescript
// ✅ Good - Clear why field is required
errorMessage: 'Company name is required for business accounts';

// ❌ Avoid - Generic message
errorMessage: 'This field is required';
```

## ConditionalExpression Interface

```typescript
interface ConditionalExpression {
  type: 'fieldValue' | 'formValue' | 'javascript' | 'custom';
  fieldPath?: string;
  operator?:
    | 'equals'
    | 'notEquals'
    | 'greater'
    | 'less'
    | 'greaterOrEqual'
    | 'lessOrEqual'
    | 'contains'
    | 'notContains'
    | 'startsWith'
    | 'endsWith'
    | 'matches'
    | 'in'
    | 'notIn';
  value?: unknown;
  expression?: string;
  conditions?: {
    type: 'and' | 'or';
    expressions: ConditionalExpression[];
  };
}
```

## Related

- **[Conditional Logic Basics](../basics/)** - Getting started
- **[Examples](../examples/)** - Real-world patterns
- **[Validation](../../validation/)** - Conditional validation
- **[Type Safety](../../type-safety/)** - TypeScript integration
