Dynamic forms use expressions for conditional logic and dynamic values. The expression parser evaluates these expressions safely, preventing code injection attacks while maintaining the flexibility you need.

## How Expressions Work in Forms

When you configure conditional logic or dynamic values in your form:

```typescript
{
  key: 'age',
  type: 'input',
  value: '',
  label: 'Age',
  hidden: hidden((form) => form.value.country !== 'US'),
  required: required((form) => form.value.age >= 18)
}
```

The expressions like `form.value.country !== 'US'` are evaluated by the parser, which has access to:

```typescript
{
  fieldValue: currentFieldValue,
  formValue: { country: 'US', age: 25, ... },
  fieldPath: 'age'
}
```

## Security Model

The parser uses different rules for methods and properties:

### Methods: Whitelist Only

Only safe methods can be called in expressions:

```typescript
// ✅ Works - safe string methods
hidden: hidden((form) => form.value.email.includes('@company.com'));

// ✅ Works - safe array methods
hidden: hidden((form) => form.value.roles.some((role) => role === 'admin'));

// ❌ Blocked - not whitelisted
hidden: hidden((form) => form.value.text.link('url'));
```

Common safe methods: `toUpperCase`, `toLowerCase`, `includes`, `startsWith`, `slice`, `map`, `filter`, `some`, `every`, `toFixed`

### Properties: Open Access (Except Dangerous Ones)

All properties in the form data are accessible, except prototype properties:

```typescript
// ✅ Works - access any form field
form.value.firstName;
form.value._internalFlag;
form.value.nested.deeply.property;

// ❌ Blocked - prototype pollution risks
form.value.constructor;
form.value.__proto__;
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
  hidden: hidden((form) => form.value.employmentStatus !== 'employed')
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
  required: required((form) => form.value.accountType === 'business')
}
```

### Dynamic Values with Transformations

```typescript
{
  key: 'fullName',
  type: 'input',
  value: dynamicValue((ctx) => {
    const first = ctx.formValue.firstName || '';
    const last = ctx.formValue.lastName || '';
    return `${first} ${last}`.trim().toUpperCase();
  }),
  label: 'Full Name'
}
```

### Array Filtering

```typescript
{
  key: 'adminEmails',
  type: 'input',
  value: dynamicValue((ctx) => {
    const users = ctx.formValue.users || [];
    return users
      .filter(u => u.role === 'admin')
      .map(u => u.email)
      .join(', ');
  }),
  label: 'Admin Emails'
}
```

## What the Parser Prevents

For dynamic forms, the parser prevents:

✅ **Code Injection**: Can't execute `Function()`, `eval()`, or create new code
✅ **Prototype Pollution**: Can't access `constructor` or `__proto__`
✅ **Unsafe Operations**: Can't call methods that modify state or access globals

## What You Must Handle

The parser only prevents code injection. If you're using form data elsewhere:

❌ **SQL Queries**: Use parameterized queries
❌ **HTML Rendering**: Sanitize before showing to users
❌ **File Operations**: Validate paths
❌ **API Calls**: Validate/sanitize data

```typescript
// ❌ WRONG: Direct SQL injection risk
const username = form.value.username;
db.query(`SELECT * FROM users WHERE name = '${username}'`);

// ✅ CORRECT: Parameterized query
db.query('SELECT * FROM users WHERE name = ?', [form.value.username]);
```

## Custom Functions

When providing custom functions to forms, only include pure functions:

```typescript
// ✅ GOOD - Pure functions
const customFunctions = {
  isValidEmail: (ctx) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ctx.fieldValue),
  isAdult: (ctx) => ctx.formValue.age >= 18,
  calculateTotal: (ctx) => ctx.formValue.items.reduce((sum, item) => sum + item.price, 0),
};

// ❌ BAD - Side effects
const customFunctions = {
  logValue: (ctx) => {
    console.log(ctx.fieldValue); // Side effect!
    trackAnalytics(ctx); // Side effect!
    return true;
  },
};
```

**Why?** Custom functions can be executed via array methods:

```typescript
// If you have this in customFunctions:
saveToApi: (item) => api.post('/items', item);

// User could trigger it with:
dynamicValue((ctx) => ctx.formValue.items.map(ctx.customFunctions.saveToApi));
```

## Quick Checklist for Form Security

- [ ] Form fields contain only user data (no tokens, keys, or sensitive info)
- [ ] Custom functions are pure (no side effects)
- [ ] RegExp patterns are hardcoded (not from form values)
- [ ] Form data is validated before database operations
- [ ] Form data is sanitized before HTML rendering

## Supported Expression Features

In conditional logic and dynamic values, you can use:

**Basic Operations**: Property access (`form.value.name`), comparisons (`===`, `!==`, `>`, `<`), logical operators (`&&`, `||`, `!`)

**String Methods**: `toUpperCase`, `toLowerCase`, `includes`, `startsWith`, `endsWith`, `slice`, `trim`

**Array Methods**: `map`, `filter`, `some`, `every`, `find`, `includes`, `join`

**Not Supported**: Object literals `{}`, arrow functions `() => {}`, ternary `a ? b : c`, assignment `x = 5`

## Summary

The expression parser lets you write flexible conditional logic and dynamic values while preventing code injection attacks. For dynamic forms:

1. **Form state is accessible** - Any field in `formValue` can be read
2. **Custom functions can execute** - Only provide pure functions
3. **Methods are restricted** - Only safe, non-mutating methods allowed
4. **Prototype is protected** - Can't access dangerous properties

**Key Principle**: The parser prevents code injection. You're responsible for validating/sanitizing data when you use it outside the form (databases, APIs, HTML).
