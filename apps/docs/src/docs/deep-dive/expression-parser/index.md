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

## Available Context Variables

When expressions are evaluated, they have access to:

```typescript
{
  fieldValue: 'current field value',
  formValue: { /* entire form state */ },
  fieldPath: 'fieldName'
}
```

**Note**: Don't store sensitive data (tokens, API keys) in form state since it's accessible in expressions.

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

The expression parser lets you write flexible conditional logic while preventing code injection attacks:

1. **Form state is accessible** - Any field in `formValue` can be read
2. **Methods are restricted** - Only safe, non-mutating methods allowed
3. **Prototype is protected** - Can't access dangerous properties
4. **Custom functions supported** - Register pure functions for reusable logic
