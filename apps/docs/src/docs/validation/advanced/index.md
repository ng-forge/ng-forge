Advanced validation techniques including conditional validators, dynamic values, and cross-field validation.

## Validators Array

The `validators` array provides fine-grained control over validation behavior:

```typescript
{
  key: 'discount',
  type: 'input',
  value: 0,
  validators: [{
    type: 'required',
  }, {
    type: 'min',
    value: 0,
  }, {
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

## Conditional Validators

Activate validators only when conditions are met.

### Based on Field Value

```typescript
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

The max validator only applies when `discountType === 'percentage'`.

### Based on Form Value

Validate against the entire form state:

```typescript
{
  key: 'endDate',
  type: 'datepicker',
  value: null,
  validators: [{
    type: 'required',
    when: {
      type: 'formValue',
      expression: 'formValue.hasEndDate === true',
    },
  }],
}
```

## Dynamic Validator Values

Use JavaScript expressions for dynamic validation:

```typescript
{
  key: 'quantity',
  type: 'input',
  value: 0,
  validators: [{
    type: 'max',
    expression: 'formValue.maxQuantity || 100',
  }],
}
```

The max value comes from `formValue.maxQuantity`, defaulting to 100.

## Multiple Conditional Validators

Combine multiple validators with different conditions:

```typescript
{
  key: 'customerId',
  type: 'input',
  value: '',
  validators: [
    {
      type: 'required',
      when: {
        type: 'fieldValue',
        fieldPath: 'customerType',
        operator: 'equals',
        value: 'existing',
      },
    },
    {
      type: 'pattern',
      value: '^[A-Z0-9]{8}$',
      when: {
        type: 'fieldValue',
        fieldPath: 'customerType',
        operator: 'equals',
        value: 'existing',
      },
    },
  ],
}
```

## Cross-Field Validation

For validators that need to compare multiple fields (like password confirmation or date ranges), use custom validators.

**Quick example using expressions:**

```typescript
{
  key: 'confirmPassword',
  type: 'input',
  validators: [{
    type: 'custom',
    expression: 'fieldValue === formValue.password',
    kind: 'passwordMismatch',
  }],
  validationMessages: {
    passwordMismatch: 'Passwords must match',
  },
}
```

See **[Custom Validators](../custom-validators)** for complete documentation on:

- Expression-based validators (simple, inline expressions)
- Function-based validators (complex, reusable logic)
- Cross-field validation patterns
- FieldContext API for accessing other field values
- Async validators and HTTP validators

## Complex Conditional Logic

Combine multiple conditions with AND/OR logic:

```typescript
{
  key: 'businessEmail',
  type: 'input',
  value: '',
  validators: [{
    type: 'required',
    when: {
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
      ],
    },
  }],
}
```

## Complete Examples

### Conditional Business Form

```typescript
const config = {
  fields: [
    {
      key: 'accountType',
      type: 'radio',
      value: 'personal',
      options: [
        { value: 'personal', label: 'Personal' },
        { value: 'business', label: 'Business' },
      ],
    },
    {
      key: 'companyName',
      type: 'input',
      value: '',
      validators: [
        {
          type: 'required',
          when: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'business',
          },
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
        },
      ],
    },
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
            value: 'business',
          },
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
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

### Dynamic Validation Form

Form where validation rules change based on selections:

```typescript
const config = {
  fields: [
    {
      key: 'discountType',
      type: 'select',
      value: '',
      options: [
        { value: 'percentage', label: 'Percentage' },
        { value: 'fixed', label: 'Fixed Amount' },
      ],
    },
    {
      key: 'discountValue',
      type: 'input',
      value: 0,
      required: true,
      validators: [
        {
          type: 'min',
          value: 0,
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
        },
        {
          type: 'max',
          expression: 'formValue.orderTotal || 1000',
          when: {
            type: 'fieldValue',
            fieldPath: 'discountType',
            operator: 'equals',
            value: 'fixed',
          },
        },
      ],
      props: { type: 'number' },
    },
  ],
} as const satisfies FormConfig;
```

## Best Practices

**Use shorthand when possible:**

```typescript
// ✅ Good - Simple and clear
{ required: true, email: true }

// ❌ Avoid - Unnecessarily complex
{ validators: [{ type: 'required' }, { type: 'email' }] }
```

**Combine shorthand with validators array:**

```typescript
// ✅ Good - Best of both
{
  required: true,
  email: true,
  validators: [{
    type: 'pattern',
    value: '@company\\.com$',
    when: { /* condition */ },
  }],
}
```

**Keep conditions simple:**

```typescript
// ✅ Good - Easy to understand
when: {
  type: 'fieldValue',
  fieldPath: 'accountType',
  operator: 'equals',
  value: 'business',
}

// ❌ Avoid - Overly complex
when: {
  type: 'and',
  conditions: [/* 5 nested conditions */],
}
```

## Related

- **[Validation Basics](../basics/)** - Shorthand validators
- **[Validation Reference](../reference/)** - Complete API
- **[Conditional Logic](../../dynamic-behavior/conditional-logic/overview/)** - Field behavior changes
- **[Examples](../../examples/)** - Real-world patterns
