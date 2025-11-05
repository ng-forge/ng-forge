Dynamic forms use expressions for conditional logic and dynamic values. When you use JavaScript expressions with `type: 'javascript'`, the expression parser evaluates them safely, preventing code injection attacks while maintaining the flexibility you need.

## How JavaScript Expressions Work

When you configure JavaScript expressions in your form:

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
        expression: 'formValue.age >= 18 && formValue.needsTransport === true'
      },
      errorMessage: 'Driver license required for adults needing transport'
    }
  ]
}
```

The expression `'formValue.age >= 18 && formValue.needsTransport === true'` is evaluated by the parser, which has access to:

```typescript
{
  fieldValue: currentFieldValue,
  formValue: { age: 25, needsTransport: true, ... },
  fieldPath: 'driverLicense'
}
```

## Security Model

The parser uses different rules for methods and properties:

### Methods: Whitelist Only

Only safe methods can be called in expressions:

```typescript
// ✅ Works - safe string methods
{
  type: 'hidden',
  condition: {
    type: 'javascript',
    expression: 'formValue.email.includes("@company.com")'
  }
}

// ✅ Works - safe array methods
{
  type: 'hidden',
  condition: {
    type: 'javascript',
    expression: 'formValue.roles.some((role) => role === "admin")'
  }
}

// ❌ Blocked - not whitelisted
{
  type: 'hidden',
  condition: {
    type: 'javascript',
    expression: 'formValue.text.link("url")' // Error: Method "link" is not allowed
  }
}
```

Common safe methods: `toUpperCase`, `toLowerCase`, `includes`, `startsWith`, `slice`, `map`, `filter`, `some`, `every`, `toFixed`

### Properties: Open Access (Except Dangerous Ones)

All properties in the form data are accessible, except prototype properties:

```typescript
// ✅ Works - access any form field
expression: 'formValue.firstName';
expression: 'formValue._internalFlag';
expression: 'formValue.nested.deeply.property';

// ❌ Blocked - prototype pollution risks
expression: 'formValue.constructor'; // Error: Property "constructor" is not accessible
expression: 'formValue.__proto__'; // Error: Property "__proto__" is not accessible
```

**Why?** Dynamic forms need to access any field name you define. The parser blocks only the dangerous properties that could break security.

## What Data is Exposed

When the parser evaluates expressions, it has access to the scope you provide. For dynamic forms, this typically includes:

```typescript
{
  fieldValue: 'current field value',
  formValue: { /* entire form state */ },
  fieldPath: 'fieldName',
  customFunctions: { /* your custom validators */ }
}
```

**Important**: Anything you put in `formValue` or `customFunctions` is accessible in expressions.

## Form Configuration Best Practices

### ✅ Safe Form Configuration

```typescript
// GOOD - Normal form fields
const config = {
  fields: [
    { key: 'username', type: 'input', value: '' },
    { key: 'age', type: 'input', value: 0 },
    { key: 'country', type: 'select', value: '' },
  ],
};

// GOOD - Custom validation functions
const customFunctions = {
  isValidEmail: (ctx) => ctx.fieldValue.includes('@'),
  isAdult: (ctx) => ctx.formValue.age >= 18,
};
```

### ❌ Unsafe Form Configuration

```typescript
// BAD - Exposing sensitive data in formValue
const formValue = {
  username: 'john',
  sessionToken: 'secret123', // Don't put this in form state!
  _apiKey: 'key', // Also accessible in expressions
};

// BAD - Functions with side effects
const customFunctions = {
  saveToDb: (ctx) => {
    api.save(ctx.fieldValue); // Side effect!
    return true;
  },
};

// BAD - User-controlled RegExp
const customFunctions = {
  matchPattern: (ctx) => {
    const pattern = new RegExp(ctx.formValue.userPattern); // ReDoS risk!
    return pattern.test(ctx.fieldValue);
  },
};
```

## Common Form Use Cases

### Dynamic Visibility

```typescript
{
  key: 'companyName',
  type: 'input',
  value: '',
  label: 'Company Name',
  // Show only if user selects "Employed"
  logic: [
    {
      type: 'hidden',
      condition: {
        type: 'javascript',
        expression: 'formValue.employmentStatus !== "employed"'
      }
    }
  ]
}
```

### Conditional Required

```typescript
{
  key: 'taxId',
  type: 'input',
  value: '',
  label: 'Tax ID',
  // Required only for business accounts
  logic: [
    {
      type: 'required',
      condition: {
        type: 'javascript',
        expression: 'formValue.accountType === "business"'
      },
      errorMessage: 'Tax ID is required for business accounts'
    }
  ]
}
```

### Complex Conditions

```typescript
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
        expression: 'formValue.membershipLevel !== "vip" || formValue.annualIncome < 100000'
      }
    }
  ]
}
```

### String Methods in Expressions

```typescript
{
  key: 'discountCode',
  type: 'input',
  value: '',
  label: 'Discount Code',
  logic: [
    {
      type: 'required',
      condition: {
        type: 'javascript',
        expression: 'formValue.email.endsWith("@company.com")'
      },
      errorMessage: 'Discount code required for company emails'
    }
  ]
}
```

## What the Parser Prevents

For dynamic forms, the parser prevents:

- ✅ **Code Injection**: Can't execute `Function()`, `eval()`, or create new code
- ✅ **Prototype Pollution**: Can't access `constructor` or `__proto__`
- ✅ **Unsafe Operations**: Can't call methods that modify state or access globals

## What You Must Handle

The parser only protects expressions from code injection. When you submit the form, you still need to validate and sanitize the data:

```typescript
// When the form is submitted
onSubmit(formValue: any) {
  // ✅ Validate the data
  if (!this.isValidEmail(formValue.email)) {
    throw new Error('Invalid email');
  }

  // ✅ Send to your API
  this.api.createUser(formValue).subscribe(...);

  // Your backend should also validate and use parameterized queries
}
```

**Remember**: The expression parser prevents malicious code in expressions like `formValue.age >= 18`. It doesn't validate that the age value itself is reasonable or that the email is properly formatted.

## Custom Functions

When providing custom functions for use in expressions, register them with the FunctionRegistryService:

```typescript
// ✅ GOOD - Pure functions
import { FunctionRegistryService } from '@ng-forge/dynamic-form';

const functionRegistry = inject(FunctionRegistryService);

functionRegistry.registerFunction('isValidEmail', (ctx) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ctx.fieldValue);
});

functionRegistry.registerFunction('isAdult', (ctx) => {
  return ctx.formValue.age >= 18;
});
```

Then use them with `type: 'custom'`:

```typescript
{
  key: 'adultContent',
  type: 'checkbox',
  value: false,
  label: 'Access Adult Content',
  logic: [
    {
      type: 'hidden',
      condition: {
        type: 'custom',
        expression: 'isAdult'
      }
    }
  ]
}
```

**Important**: Only provide pure functions without side effects:

```typescript
// ❌ BAD - Side effects
functionRegistry.registerFunction('logValue', (ctx) => {
  console.log(ctx.fieldValue); // Side effect!
  trackAnalytics(ctx); // Side effect!
  return true;
});
```

## Quick Checklist for Form Security

- [ ] Form fields contain only user data (no tokens, keys, or sensitive info)
- [ ] Custom functions are pure (no side effects)
- [ ] RegExp patterns are hardcoded (not from form values)
- [ ] Form data is validated before database operations
- [ ] Form data is sanitized before HTML rendering

## Supported Expression Features

In JavaScript expressions (`type: 'javascript'`), you can use:

**Basic Operations**: Property access (`formValue.name`), comparisons (`===`, `!==`, `>`, `<`), logical operators (`&&`, `||`, `!`)

**String Methods**: `toUpperCase`, `toLowerCase`, `includes`, `startsWith`, `endsWith`, `slice`, `trim`

**Array Methods**: `map`, `filter`, `some`, `every`, `find`, `includes`, `join`

**Example**:

```typescript
expression: 'formValue.age >= 18 && formValue.email.includes("@example.com")';
```

**Not Supported**: Object literals `{}`, ternary `a ? b : c`, assignment `x = 5`

## Summary

The expression parser lets you write flexible conditional logic and dynamic values while preventing code injection attacks. For dynamic forms:

1. **Form state is accessible** - Any field in `formValue` can be read
2. **Custom functions can execute** - Only provide pure functions
3. **Methods are restricted** - Only safe, non-mutating methods allowed
4. **Prototype is protected** - Can't access dangerous properties

**Key Principle**: The parser prevents code injection. You're responsible for validating/sanitizing data when you use it outside the form (databases, APIs, HTML).
