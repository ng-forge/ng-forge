The expression parser evaluates dynamic expressions in conditional logic and dynamic values. It replaces JavaScript's unsafe `new Function()` and `eval()` with a secure evaluation engine that prevents code injection attacks.

## What It Does

The parser safely evaluates expressions against a provided scope:

```typescript
ExpressionParser.evaluate("user.name === 'John'", { user: { name: 'John' } });
// Returns: true
```

**Key Feature**: Expressions cannot execute arbitrary code - the parser only performs safe data operations.

## Security Model

The parser uses different rules for methods and properties:

### Methods: Whitelist Only

Only approved methods can be called:

```typescript
// ✅ Allowed - safe methods
user.name.toUpperCase();
items.filter(fn);
items.map(fn);
date.toISOString();

// ❌ Blocked - not whitelisted
str.link();
obj.toString(); // Only for primitives
arr.push(); // Mutating methods blocked
```

Safe methods include common string operations (`toUpperCase`, `slice`, `split`), array transformations (`map`, `filter`, `reduce`), number formatting (`toFixed`), and date getters.

### Properties: Open Access (with Exceptions)

All properties in scope are accessible except dangerous ones:

```typescript
// ✅ Allowed
user.name;
user._internal;
formData.value;

// ❌ Blocked - prototype pollution risks
obj.constructor;
obj.__proto__;
obj.prototype;
```

## Scope is Your Security Boundary

**Critical**: The scope you provide is fully accessible. Only include safe data.

### ✅ Safe Scope

```typescript
// GOOD - Only expose what's needed
const scope = {
  userName: user.name,
  userAge: user.age,
  isAdmin: user.roles.includes('admin'),
};
```

### ❌ Unsafe Scope

```typescript
// BAD - Exposing sensitive data
const scope = {
  user: {
    name: 'John',
    sessionToken: 'secret123', // Accessible in expressions!
    _privateKey: 'key', // Also accessible!
  },
};

// BAD - Functions with side effects
const scope = {
  items: [1, 2, 3],
  saveToDb: (x) => db.save(x), // Can be called via items.map(saveToDb)!
};

// BAD - User-controlled RegExp
const scope = {
  text: 'test',
  pattern: new RegExp(userInput), // ReDoS vulnerability!
};
```

## What the Parser Prevents

✅ **Code Injection**: Blocks `Function()`, `eval()`, `setTimeout()`
✅ **Prototype Pollution**: Blocks `constructor`, `__proto__`, `prototype`
✅ **Unsafe Methods**: Only whitelisted methods can be called

## What You Must Handle

The parser only prevents code injection. Your application must handle:

❌ **SQL Injection**: Use parameterized queries, not raw expression results
❌ **XSS**: Sanitize HTML before rendering
❌ **Path Traversal**: Validate file paths
❌ **Command Injection**: Sanitize shell commands

```typescript
// ❌ WRONG: SQL injection vulnerability
const name = ExpressionParser.evaluate('userName', scope);
db.query(`SELECT * FROM users WHERE name = '${name}'`); // Unsafe!

// ✅ CORRECT: Use parameterized queries
const name = ExpressionParser.evaluate('userName', scope);
db.query('SELECT * FROM users WHERE name = ?', [name]);
```

## Scope Guidelines

1. **Only expose necessary data** - Don't pass entire objects
2. **No sensitive values** - No tokens, keys, or internal data
3. **Pure functions only** - No side effects or global access
4. **Hardcoded RegExp only** - Never from user input
5. **Validate in development**:

```typescript
function createScope(data: any) {
  if (process.env.NODE_ENV === 'development') {
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'function') {
        console.warn(`Function in scope: "${key}" - can be executed via array methods`);
      }
      if (value instanceof RegExp) {
        console.warn(`RegExp in scope: "${key}" - ensure it's safe from ReDoS`);
      }
      if (key.startsWith('_')) {
        console.warn(`Private property in scope: "${key}" - consider renaming`);
      }
    }
  }
  return data;
}
```

## Common Pitfalls

### Pitfall 1: Assuming Complete Security

The parser prevents **code injection only**. You still need to sanitize outputs and validate inputs.

### Pitfall 2: Exposing Entire Objects

```typescript
// ❌ Wrong
const scope = { user: getCurrentUser() };

// ✅ Correct
const scope = {
  userName: user.name,
  userRole: user.role,
};
```

### Pitfall 3: Functions in Scope

Array methods can execute functions from scope:

```typescript
const scope = {
  items: [1, 2, 3],
  process: (x) => {
    sendAnalytics(x);
    return x;
  }, // Side effect!
};

// This executes the function:
ExpressionParser.evaluate('items.map(process)', scope);
```

Only include pure functions without side effects.

## Supported Features

**Expressions**: Property access, method calls, arithmetic (`+`, `-`, `*`, `/`), comparison (`===`, `>`, `<`), logical (`&&`, `||`, `!`), `typeof`

**Not Supported**: Object literals `{}`, array indexing `arr[0]`, assignment `x = 5`, arrow functions `() => {}`, ternary `a ? b : c`, optional chaining `obj?.prop`

## Quick Checklist

Before deploying:

- [ ] Scope contains only data user should access
- [ ] No sensitive data in scope (tokens, keys, internal IDs)
- [ ] Functions in scope are pure (no side effects)
- [ ] RegExp objects are hardcoded and safe
- [ ] SQL uses parameterized statements
- [ ] HTML output is sanitized
- [ ] File paths are validated

## Summary

The expression parser provides **strong protection against code injection** but requires **careful scope management**. Think of scope as your security boundary - only include values that are safe to expose in expressions.

**Remember**: The parser is one layer of defense. Use proper sanitization, validation, and access controls throughout your application.
