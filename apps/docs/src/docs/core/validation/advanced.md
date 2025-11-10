# Validation Advanced

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
    errorMessage: 'Discount amount is required',
  }, {
    type: 'min',
    value: 0,
    errorMessage: 'Discount cannot be negative',
  }, {
    type: 'max',
    value: 100,
    when: {
      type: 'fieldValue',
      fieldPath: 'discountType',
      operator: 'equals',
      value: 'percentage',
    },
    errorMessage: 'Percentage discount cannot exceed 100%',
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
    errorMessage: 'Percentage cannot exceed 100%',
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
    errorMessage: 'End date is required when "Has end date" is checked',
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
    errorMessage: 'Quantity exceeds maximum',
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
      errorMessage: 'Customer ID is required for existing customers',
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
      errorMessage: 'Customer ID must be 8 alphanumeric characters',
    },
  ],
}
```

## Cross-Field Validation

Validate a field based on another field's value.

### Password Confirmation

```typescript
{
  fields: [
    {
      key: 'password',
      type: 'input',
      value: '',
      required: true,
      minLength: 8,
      props: { type: 'password' },
    },
    {
      key: 'confirmPassword',
      type: 'input',
      value: '',
      required: true,
      validators: [{
        type: 'custom',
        expression: 'fieldValue === formValue.password',
        errorMessage: 'Passwords must match',
      }],
      props: { type: 'password' },
    },
  ],
}
```

### Date Range

```typescript
{
  fields: [
    {
      key: 'startDate',
      type: 'datepicker',
      value: null,
      required: true,
    },
    {
      key: 'endDate',
      type: 'datepicker',
      value: null,
      required: true,
      validators: [{
        type: 'custom',
        expression: 'fieldValue > formValue.startDate',
        errorMessage: 'End date must be after start date',
      }],
    },
  ],
}
```

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
      logic: 'and',
      expressions: [
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
    errorMessage: 'Business email required for team accounts',
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
      validators: [{
        type: 'required',
        when: {
          type: 'fieldValue',
          fieldPath: 'accountType',
          operator: 'equals',
          value: 'business',
        },
        errorMessage: 'Company name is required for business accounts',
      }, {
        type: 'minLength',
        value: 2,
        when: {
          type: 'fieldValue',
          fieldPath: 'accountType',
          operator: 'equals',
          value: 'business',
        },
        errorMessage: 'Company name must be at least 2 characters',
      }],
    },
    {
      key: 'taxId',
      type: 'input',
      value: '',
      validators: [{
        type: 'required',
        when: {
          type: 'fieldValue',
          fieldPath: 'accountType',
          operator: 'equals',
          value: 'business',
        },
        errorMessage: 'Tax ID is required for business accounts',
      }, {
        type: 'pattern',
        value: '^[0-9]{2}-[0-9]{7}$',
        when: {
          type: 'fieldValue',
          fieldPath: 'accountType',
          operator: 'equals',
          value: 'business',
        },
        errorMessage: 'Tax ID must be in format XX-XXXXXXX',
      }],
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
          errorMessage: 'Percentage cannot exceed 100%',
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
          errorMessage: 'Fixed discount cannot exceed order total',
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

**Provide clear error messages:**
```typescript
// ✅ Good - Specific and actionable
errorMessage: 'Tax ID is required for business accounts'

// ❌ Avoid - Generic and unhelpful
errorMessage: 'Invalid value'
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
  logic: 'and',
  expressions: [/* 5 nested conditions */],
}
```

## Related

- **[Validation Basics](/core-concepts/validation/basics)** - Shorthand validators
- **[Validation Reference](/core-concepts/validation/reference)** - Complete API
- **[Conditional Logic](/core-concepts/conditional-logic)** - Field behavior changes
- **[Examples](/examples)** - Real-world patterns
