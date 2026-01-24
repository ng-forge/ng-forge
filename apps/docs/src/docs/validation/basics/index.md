Dynamic Forms provides powerful, type-safe validation that integrates directly with Angular's signal forms. Start with simple shorthand validators and progress to advanced conditional validation as your needs grow.

## Signal Forms Integration

Dynamic Forms validation maps directly to Angular's signal forms validators:

```typescript
// Your configuration
{ key: 'email', type: 'input', value: '', required: true, email: true }

// Becomes
import { required, email } from '@angular/forms/signals';
required(fieldPath);
email(fieldPath);
```

This tight integration means:

- **Zero overhead** - Direct signal forms API usage
- **Familiar patterns** - Same validators you know
- **Full type safety** - TypeScript inference throughout

## Which Validation Approach Should I Use?

Choose based on your validation complexity:

### Shorthand Validators

**Use when:** Simple, always-active validation

```typescript
{
  key: 'email',
  type: 'input',
  value: '',
  required: true,
  email: true,
  minLength: 5,
}
```

**Benefits:**

- Concise and readable
- Perfect for common validations
- Type-safe with full IntelliSense

### Validators Array

**Use when:** Conditional validation or custom messages

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

**Benefits:**

- Conditional validation
- Custom error messages
- Dynamic validator values

### Logic Array

**Use when:** Changing field behavior (hidden/required/disabled)

```typescript
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

**Benefits:**

- Dynamic field behavior
- Conditional required fields
- See [Conditional Logic](../../dynamic-behavior/conditional-logic/overview/) for details

## Shorthand Validators

### required

Mark a field as mandatory:

```typescript
{
  key: 'name',
  type: 'input',
  value: '',
  required: true,
}
```

### email

Validate email format:

```typescript
{
  key: 'email',
  type: 'input',
  value: '',
  required: true,
  email: true,
}
```

### minLength / maxLength

Validate string length:

```typescript
{
  key: 'username',
  type: 'input',
  value: '',
  minLength: 3,
  maxLength: 20,
}
```

### min / max

Validate numeric range:

```typescript
{
  key: 'age',
  type: 'input',
  value: null,
  min: 18,
  max: 120,
  props: { type: 'number' },
}
```

### pattern

Validate with regular expressions:

```typescript
{
  key: 'zipCode',
  type: 'input',
  value: '',
  pattern: '^[0-9]{5}$', // 5-digit US ZIP code
}
```

## Combining Validators

Stack multiple validators on the same field:

```typescript
{
  key: 'password',
  type: 'input',
  value: '',
  required: true,
  minLength: 8,
  maxLength: 128,
  pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
  props: { type: 'password' },
}
```

All validators must pass for the field to be valid.

## Validation Messages

### Default Messages

Each validator has a built-in error message:

```typescript
{
  required: true;
} // → "This field is required"
{
  email: true;
} // → "Please enter a valid email address"
{
  minLength: 8;
} // → "Minimum length is 8 characters"
```

### Custom Messages

Override default messages for better UX:

```typescript
{
  key: 'email',
  type: 'input',
  value: '',
  required: true,
  email: true,
  validationMessages: {
    required: 'Email address is required',
    email: 'Please enter a valid email address',
  },
}
```

### Dynamic Messages

Use signals or observables for i18n:

```typescript
{
  key: 'email',
  type: 'input',
  value: '',
  required: true,
  validationMessages: {
    required: this.transloco.selectTranslate('validation.required'),
    email: this.transloco.selectTranslate('validation.email'),
  },
}
```

## Quick Examples

### User Registration

```typescript
const config = {
  fields: [
    {
      key: 'username',
      type: 'input',
      value: '',
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
    },
    {
      key: 'email',
      type: 'input',
      value: '',
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
      required: true,
      minLength: 8,
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
      validationMessages: {
        required: 'Password is required',
        minLength: 'Password must be at least 8 characters',
        pattern: 'Password must include uppercase, lowercase, and a number',
      },
      props: { type: 'password' },
    },
  ],
} as const satisfies FormConfig;
```

## When Validation Runs

Validation occurs:

- **On blur** - When user leaves a field
- **On change** - As user types (after first blur)
- **On submit** - When form is submitted

Invalid fields prevent form submission and display error messages.

## Next Steps

- **[Validation Advanced](../advanced/)** - Conditional validation, dynamic values
- **[Validation Reference](../reference/)** - Complete validator API
- **[Conditional Logic](../../dynamic-behavior/conditional-logic/overview/)** - Dynamic field behavior
- **[Examples](../../examples/)** - Real-world validation patterns
