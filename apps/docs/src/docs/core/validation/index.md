ng-forge integrates with Angular's signal forms validation system. Configure validators directly in field config.

## Built-in Validators

### required

Field must have a value.

```typescript
{
  key: 'username',
  type: 'input',
  label: 'Username',
  required: true,  // Shorthand
}
```

Custom error message:

```typescript
{
  key: 'username',
  type: 'input',
  label: 'Username',
  required: true,
  validationMessages: {
    required: 'Username is required',
  },
}
```

### email

Validates email format.

```typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  email: true,
}
```

### minLength / maxLength

String length validation.

```typescript
{
  key: 'password',
  type: 'input',
  label: 'Password',
  minLength: 8,
  maxLength: 128,
  props: { type: 'password' },
}
```

### min / max

Numeric range validation.

```typescript
{
  key: 'age',
  type: 'input',
  label: 'Age',
  min: 18,
  max: 120,
  props: { type: 'number' },
}
```

### pattern

Regular expression validation.

```typescript
{
  key: 'zipCode',
  type: 'input',
  label: 'ZIP Code',
  pattern: '^[0-9]{5}$',
}
```

With custom error message:

```typescript
{
  key: 'zipCode',
  type: 'input',
  label: 'ZIP Code',
  pattern: '^[0-9]{5}$',
  validationMessages: {
    pattern: 'ZIP must be 5 digits',
  },
}
```

## Multiple Validators

Combine validators on a single field:

```typescript
{
  key: 'username',
  type: 'input',
  label: 'Username',
  required: true,
  minLength: 3,
  maxLength: 20,
  pattern: '^[a-zA-Z0-9_]+$',
}
```

## Advanced Validation

### ValidatorConfig Array

For complex validation logic, use the `validators` array:

```typescript
{
  key: 'discount',
  type: 'input',
  label: 'Discount',
  validators: [
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

Apply validators only when a condition is met:

```typescript
{
  key: 'discount',
  type: 'input',
  label: 'Discount',
  validators: [
    {
      type: 'max',
      value: 100,
      when: {
        type: 'fieldValue',
        fieldPath: 'discountType',
        operator: 'equals',
        value: 'percentage',
      },
      errorMessage: 'Percentage discount cannot exceed 100',
    },
  ],
}
```

The validator only applies when `discountType` equals `'percentage'`.
