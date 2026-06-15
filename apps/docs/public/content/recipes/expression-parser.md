---
title: Expression Parser
slug: recipes/expression-parser
description: 'Learn how ng-forge safely evaluates JavaScript expressions for conditional logic, dynamic values, and validations while preventing code injection.'
---

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

### Whitelisted Methods Reference

| Category   | Methods                                                                                                                                                                                                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **String** | `charAt`, `charCodeAt`, `concat`, `endsWith`, `includes`, `indexOf`, `lastIndexOf`, `match`, `padEnd`, `padStart`, `repeat`, `replace`, `search`, `slice`, `split`, `startsWith`, `substring`, `toLowerCase`, `toUpperCase`, `trim`, `trimEnd`, `trimStart`, `toString` |
| **Array**  | `concat`, `every`, `filter`, `find`, `findIndex`, `flat`, `flatMap`, `includes`, `indexOf`, `join`, `lastIndexOf`, `map`, `reduce`, `reduceRight`, `slice`, `some`, `toString`, `entries`, `keys`, `values`                                                             |
| **Number** | `toExponential`, `toFixed`, `toPrecision`, `toString`                                                                                                                                                                                                                   |
| **Date**   | `getDate`, `getDay`, `getFullYear`, `getHours`, `getMilliseconds`, `getMinutes`, `getMonth`, `getSeconds`, `getTime`, `getTimezoneOffset`, the matching `getUTC*` variants, `toDateString`, `toISOString`, `toJSON`, `toString`, `toTimeString`, `toUTCString`          |

These lists mirror the parser's whitelists exactly. No methods are callable on plain objects: property access works, method calls do not.

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

### Safe Member Access (Built-in)

**Important**: Member access is safe by default - accessing properties on `null` or `undefined` returns `undefined` instead of throwing errors:

```typescript
// ✅ All of these work safely, even when intermediate values are null/undefined
expression: 'formValue.user.profile.firstName';
expression: 'formValue.address.city.toLowerCase()';
expression: 'formValue.settings.notifications.email';

// If formValue.user is null, the expression returns undefined (no error thrown)
// If formValue.user.profile is null, the expression returns undefined (no error thrown)
// No manual null checks needed!
```

**This means you don't need to write defensive null checks:**

```typescript
// ❌ Unnecessary - Don't do this
expression: '!formValue.user || !formValue.user.profile || !formValue.user.profile.firstName || fieldValue !== formValue.user.profile.firstName';

// ✅ Better - Safe by default
expression: '!formValue.user.profile.firstName || fieldValue !== formValue.user.profile.firstName';
```

The parser automatically handles null/undefined at every level of property access, making expressions cleaner and more maintainable.

## Available Context Variables

When expressions are evaluated, they have access to:

```typescript
{
  fieldValue: 'current field value',
  formValue: { /* entire form state */ },
  fieldPath: 'fieldName',
  externalData: { /* external application state, if configured */ }
}
```

### External Data

When you configure `externalData` in your FormConfig, it becomes available in expressions:

```typescript
const config = {
  externalData: {
    userRole: computed(() => authService.role()),
    permissions: computed(() => authService.permissions()),
  },
  fields: [
    {
      key: 'adminField',
      type: 'input',
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
  ],
} as const satisfies FormConfig;
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
    }
  ]
}
```

## What the Parser Prevents

For dynamic forms, the parser prevents:

- **Code Injection**: Can't execute arbitrary code or create new code
- **Prototype Pollution**: Can't access `constructor` or `__proto__`
- **Unsafe Operations**: Can't call methods that modify state or access globals

## Custom Functions

Register custom functions on the form config via `customFnConfig.customFunctions`:

```typescript
// ✅ GOOD - Pure functions
const config = {
  customFnConfig: {
    customFunctions: {
      isValidEmail: (ctx) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(ctx.fieldValue)),
      isAdult: (ctx) => ctx.formValue.age >= 18,
    },
  },
  fields: [
    // ...
  ],
} satisfies FormConfig;
```

Then reference them by name with `type: 'custom'` and `functionName`:

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
        functionName: 'isAdult'
      }
    }
  ]
}
```

**Important**: Only provide pure functions without side effects:

```typescript
// ❌ BAD - Side effects
customFnConfig: {
  customFunctions: {
    logValue: (ctx) => {
      console.log(ctx.fieldValue); // Side effect!
      trackAnalytics(ctx); // Side effect!
      return true;
    },
  },
},
```

## Supported Expression Features

In JavaScript expressions (`type: 'javascript'`), you can use:

| Feature               | Examples                                                           |
| --------------------- | ------------------------------------------------------------------ |
| **Property access**   | `formValue.name`, `formValue.user.profile.email`                   |
| **Computed access**   | `items[0]`, `obj["key"]`, `response.items[0].value`                |
| **Optional chaining** | `formValue.user?.name`, `formValue.items?.[0]`, `arr?.map(x => x)` |
| **Ternary**           | `formValue.kind === 'a' ? formValue.x : formValue.y`               |
| **Object literals**   | `{ value: d.id, label: d.name }` (handy inside arrow bodies)       |
| **Arrow functions**   | `arr.map(x => x * 2)`, `arr.filter(x => x.active)`                 |
| **Comparisons**       | `===`, `!==`, `>`, `<`, `>=`, `<=`                                 |
| **Logical operators** | `&&`, `\|\|`, `!`                                                  |
| **Arithmetic**        | `+`, `-`, `*`, `/`, `%`                                            |
| **String methods**    | See [Whitelisted Methods](#whitelisted-methods-reference) above    |
| **Array methods**     | See [Whitelisted Methods](#whitelisted-methods-reference) above    |

**Example**:

```typescript
expression: 'formValue.age >= 18 && formValue.email.includes("@example.com")';
```

**Not Supported**: assignment (`x = 5`, `x++`), `new` keyword, function declarations, class declarations, spread (`[...arr]`), destructuring, template literals, regex literals. Method calls remain whitelist-only; arrow functions can only invoke methods that pass the whitelist (e.g., `.map`, `.filter`, `.reduce`), and the same blocklist (`constructor`, `__proto__`, etc.) applies to both dotted and computed member access.

## Summary

The expression parser lets you write flexible conditional logic while preventing code injection attacks:

1. **Form state is accessible** - Any field in `formValue` can be read
2. **Methods are restricted** - Only safe, non-mutating methods allowed
3. **Prototype is protected** - Can't access dangerous properties
4. **Custom functions supported** - Register pure functions for reusable logic

## Next Steps

- **[Conditional Logic](/dynamic-behavior/conditional-logic)**: Use expressions to control field visibility and state
- **[Type Safety](/recipes/type-safety)**: Leverage TypeScript inference for form values and field types
- **[Value Derivation](/dynamic-behavior/derivation)**: Use expressions to compute field values dynamically
