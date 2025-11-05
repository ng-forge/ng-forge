The expression parser is the security-critical component that evaluates dynamic expressions in conditional logic and dynamic values. This deep dive explains how it works, what security guarantees it provides, and how to use it safely.

## Overview

The expression parser replaces JavaScript's unsafe `new Function()` and `eval()` with a secure AST-based evaluation engine. It prevents arbitrary code execution while maintaining backward compatibility for legitimate dynamic form expressions.

**Security Goal**: Prevent code injection attacks while allowing safe data access and transformations.

## How It Works

The parser uses a three-stage pipeline:

### 1. Tokenization (Lexical Analysis)

Converts the expression string into tokens:

```typescript
"user.name === 'John'"
↓
[IDENTIFIER("user"), DOT, IDENTIFIER("name"), EQUAL, STRING("John")]
```

### 2. Parsing (Syntax Analysis)

Builds an Abstract Syntax Tree (AST) using recursive descent parsing:

```typescript
{
  type: 'BinaryOp',
  operator: '===',
  left: { type: 'MemberAccess', object: 'user', property: 'name' },
  right: { type: 'Literal', value: 'John' }
}
```

### 3. Evaluation

Safely evaluates the AST with the provided scope:

```typescript
ExpressionParser.evaluate("user.name === 'John'", { user: { name: 'John' } });
// Returns: true
```

**Key Security Feature**: No JavaScript code is executed. The evaluator only performs safe data operations defined in the AST.

## Security Model

The parser uses a **hybrid whitelist/blacklist approach** with different rules for methods and properties:

### Method Calls: Whitelist (Deny by Default)

Only explicitly approved methods can be called:

```typescript
// ✅ Allowed - whitelisted methods
user.name.toUpperCase()
items.filter(...)
date.toISOString()

// ❌ Blocked - not in whitelist
str.link()           // Not whitelisted
obj.toString()       // Only for primitives, not generic objects
arr.push()           // Mutating method, not whitelisted
```

**Whitelisted Methods by Type:**

**String** (24 methods): `charAt`, `charCodeAt`, `concat`, `endsWith`, `includes`, `indexOf`, `lastIndexOf`, `match`, `padEnd`, `padStart`, `repeat`, `replace`, `search`, `slice`, `split`, `startsWith`, `substring`, `toLowerCase`, `toUpperCase`, `trim`, `trimEnd`, `trimStart`, `toString`

**Number** (4 methods): `toExponential`, `toFixed`, `toPrecision`, `toString`

**Array** (20 methods): `concat`, `every`, `filter`, `find`, `findIndex`, `flat`, `flatMap`, `includes`, `indexOf`, `join`, `lastIndexOf`, `map`, `reduce`, `reduceRight`, `slice`, `some`, `toString`, `entries`, `keys`, `values`

**Date** (24 methods): All `get*` methods, `toDateString`, `toISOString`, `toJSON`, `toString`, `toTimeString`, `toUTCString`

### Property Access: Blacklist with Scope Boundary

All properties are accessible **except** dangerous prototype properties:

```typescript
// ✅ Allowed - normal properties
user.name;
user._internal;
obj.$$private;

// ❌ Blocked - dangerous properties
obj.constructor;
obj.__proto__;
obj.prototype;
obj.__defineGetter__;
obj.__defineSetter__;
obj.__lookupGetter__;
obj.__lookupSetter__;
```

**Why different approaches?**

- **Methods** are execution points → whitelist prevents calling dangerous code
- **Properties** are data access → blacklist allows flexibility while blocking prototype pollution

## What the Parser Prevents

### ✅ Code Injection

Blocks all attempts to create or execute arbitrary code:

```typescript
// All of these throw errors:
Function('return 1')();
eval('alert(1)');
setTimeout('alert(1)', 0);
constructor('return 1')();
```

### ✅ Prototype Pollution

Blocks access to prototype chain manipulation:

```typescript
// All of these throw errors:
obj.constructor;
obj.__proto__;
obj.prototype;
```

### ✅ Unsafe Method Calls

Only whitelisted methods can be called:

```typescript
// Throws error - link() not whitelisted:
str.link('url');

// Throws error - push() modifies array:
arr.push(1);
```

### ✅ Arbitrary Function Calls

Can't call standalone functions, only methods on objects:

```typescript
// Throws error - not a method call:
someFunction();

// ✅ Allowed - method call with whitelisted method:
str.toUpperCase();
```

## What the Parser Does NOT Prevent

The expression parser **only prevents code injection**. The application must handle other security concerns:

### ❌ SQL Injection

The parser passes strings through unchanged:

```typescript
const scope = { userInput: "'; DROP TABLE users; --" };
ExpressionParser.evaluate('userInput', scope);
// Returns: "'; DROP TABLE users; --"
```

**Mitigation**: Application must sanitize SQL queries using parameterized statements.

### ❌ XSS (Cross-Site Scripting)

The parser doesn't sanitize HTML:

```typescript
const scope = { userInput: '<script>alert(1)</script>' };
ExpressionParser.evaluate('userInput', scope);
// Returns: '<script>alert(1)</script>'
```

**Mitigation**: Application must sanitize HTML before rendering to DOM.

### ❌ Path Traversal

The parser doesn't validate file paths:

```typescript
const scope = { path: '../../../etc/passwd' };
ExpressionParser.evaluate('path', scope);
// Returns: '../../../etc/passwd'
```

**Mitigation**: Application must validate and sanitize file paths.

### ❌ Command Injection

The parser doesn't prevent shell command patterns:

```typescript
const scope = { cmd: 'file.txt; rm -rf /' };
ExpressionParser.evaluate('cmd', scope);
// Returns: 'file.txt; rm -rf /'
```

**Mitigation**: Application must sanitize shell commands.

## Scope is the Security Boundary

**Critical Principle**: The scope you provide is fully accessible to expressions. The parser cannot protect you from unsafe scope values.

### Safe Scope Example

```typescript
// ✅ GOOD - Only expose necessary data
const scope = {
  userName: user.name,
  userAge: user.age,
  isAdmin: user.roles.includes('admin'),
};

ExpressionParser.evaluate('userName + " is " + userAge', scope);
```

### Unsafe Scope Examples

```typescript
// ❌ BAD - Exposing sensitive data
const scope = {
  user: {
    name: 'John',
    _sessionToken: 'secret123', // Accessible!
    __privateKey: 'private-key', // Accessible!
  },
};

// ❌ BAD - Exposing dangerous functions
const scope = {
  items: [1, 2, 3],
  logToServer: (x) => {
    fetch('/log', { method: 'POST', body: x }); // Can be executed!
    return x;
  },
};
// Expression: 'items.map(logToServer)' will execute the function!

// ❌ BAD - Exposing RegExp from user input
const scope = {
  text: 'some text',
  pattern: new RegExp(userInput), // ReDoS vulnerability!
};
// Expression: 'text.match(pattern)' could hang
```

## Scope Security Guidelines

### Rule 1: Only Expose What's Needed

```typescript
// ❌ DON'T: Expose entire objects
const scope = { user: userObject };

// ✅ DO: Extract only necessary properties
const scope = {
  userName: userObject.name,
  userEmail: userObject.email,
};
```

### Rule 2: No Sensitive Data in Scope

```typescript
// ❌ DON'T: Include internal/private data
const scope = {
  sessionToken: token,
  apiKey: key,
  _internal: data,
};

// ✅ DO: Only public, safe values
const scope = {
  userName: 'John',
  isLoggedIn: true,
};
```

### Rule 3: Only Pure Functions

```typescript
// ❌ DON'T: Functions with side effects
const scope = {
  saveToDb: (x) => db.save(x),
  logToConsole: (x) => {
    console.log(x);
    return x;
  },
};

// ✅ DO: Pure transformation functions
const scope = {
  double: (x) => x * 2,
  isEven: (x) => x % 2 === 0,
};
```

### Rule 4: No User-Controlled RegExp

```typescript
// ❌ DON'T: RegExp from user input
const scope = {
  pattern: new RegExp(userInput), // ReDoS risk!
};

// ✅ DO: Hardcoded, safe patterns
const scope = {
  emailPattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
};
```

### Rule 5: Validate Scope in Development

Add runtime checks in development mode:

```typescript
function createSafeScope(data: unknown): EvaluationScope {
  if (process.env.NODE_ENV === 'development') {
    for (const [key, value] of Object.entries(data)) {
      // Warn about functions
      if (typeof value === 'function') {
        console.warn(`[Security] Function in scope: "${key}". ` + `Can be executed via array methods.`);
      }

      // Warn about RegExp
      if (value instanceof RegExp) {
        console.warn(`[Security] RegExp in scope: "${key}". ` + `Potential ReDoS risk.`);
      }

      // Warn about private-looking properties
      if (key.startsWith('_') || key.startsWith('$')) {
        console.warn(`[Security] Internal property in scope: "${key}". ` + `Consider renaming to avoid exposing internals.`);
      }
    }
  }

  return data as EvaluationScope;
}
```

## Array Methods and Function Execution

Array methods like `map`, `filter`, and `reduce` can execute functions from scope:

```typescript
const scope = {
  items: [1, 2, 3],
  double: (x) => x * 2,
};

// This works and is intentional:
ExpressionParser.evaluate('items.map(double)', scope);
// Returns: [2, 4, 6]
```

**Why is this allowed?**

- This is by design for dynamic forms (e.g., `items.filter(isValid)`)
- Parser cannot prevent what functions do, only what can be created
- Functions can have side effects and access globals

**Security Implications:**

1. ✅ Cannot create new functions (no `() => {}` syntax)
2. ✅ Cannot call `Function()` constructor
3. ⚠️ CAN execute any function from scope
4. ⚠️ Function could have side effects, access globals, etc.

**Mitigation**: Only put pure, safe functions in scope.

## ReDoS (Regular Expression Denial of Service)

String methods `match()`, `search()`, and `replace()` accept RegExp objects:

```typescript
const scope = {
  text: 'test',
  safePattern: /^[a-z]+$/,
  evilPattern: /(a+)+$/, // Catastrophic backtracking!
};

// Safe:
ExpressionParser.evaluate('text.match(safePattern)', scope);

// Could hang the application:
ExpressionParser.evaluate('text.match(evilPattern)', scope);
```

**Mitigation:**

1. ✅ Parser blocks creating regex literals (no `/pattern/` syntax)
2. ⚠️ If app puts RegExp in scope, they can be used
3. ⚠️ If app constructs RegExp from user input, ReDoS possible
4. **Solution**: Only put hardcoded, safe RegExp objects in scope

## Type Coercion Behavior

Arithmetic operators use JavaScript's standard type coercion:

```typescript
ExpressionParser.evaluate('"5" + "3"', {}); // "53" (string concatenation)
ExpressionParser.evaluate('5 + 3', {}); // 8 (addition)
ExpressionParser.evaluate('true + false', {}); // 1 (booleans → numbers)
ExpressionParser.evaluate('5 + "3"', {}); // "53" (number → string)
```

This follows standard JavaScript semantics. If you need strict typing, validate types in your scope creation.

## Performance and Caching

The parser caches AST trees for repeated expressions:

```typescript
// First call: parses and caches
ExpressionParser.evaluate('user.name', { user: { name: 'John' } });

// Second call: reuses cached AST
ExpressionParser.evaluate('user.name', { user: { name: 'Jane' } });
```

**Cache Details:**

- FIFO eviction with 1000 entry limit
- AST is cached, not results
- Each evaluation uses fresh scope
- No cache poisoning possible

## Supported Expression Features

### ✅ Supported

- Property access: `obj.prop`, `user.name`
- Method calls: `str.toUpperCase()`, `arr.map(fn)`
- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Comparison: `==`, `===`, `!=`, `!==`, `>`, `<`, `>=`, `<=`
- Logical: `&&`, `||`, `!`
- Typeof: `typeof x`
- Array literals: `[1, 2, 3]`
- Chained calls: `str.toUpperCase().toLowerCase()`

### ❌ Not Supported

- Object literals: `{}`
- Array indexing: `arr[0]`
- Assignment: `x = 5`
- Function declarations: `function() {}`
- Arrow functions: `() => {}`
- Ternary operator: `a ? b : c`
- Optional chaining: `obj?.prop`
- Nullish coalescing: `a ?? b`
- Spread operator: `...arr`
- Template literals: `` `hello ${name}` ``
- Regex literals: `/pattern/`
- New operator: `new Date()`

## Security Checklist

Before deploying, verify:

- [ ] Scope contains only data user should access
- [ ] No sensitive data in scope (tokens, keys, internal IDs)
- [ ] Functions in scope are pure (no side effects)
- [ ] RegExp objects in scope are hardcoded and safe
- [ ] No user input used to construct RegExp
- [ ] SQL queries use parameterized statements (not expression results directly)
- [ ] HTML output is sanitized (not expression results directly)
- [ ] File paths are validated (not expression results directly)
- [ ] Shell commands are sanitized (not expression results directly)

## Common Pitfalls

### Pitfall 1: Assuming All Security is Handled

```typescript
// ❌ WRONG: Thinking parser prevents SQL injection
const query = ExpressionParser.evaluate('userInput', scope);
db.query(`SELECT * FROM users WHERE name = '${query}'`); // SQL injection!

// ✅ CORRECT: Use parameterized queries
const name = ExpressionParser.evaluate('userInput', scope);
db.query('SELECT * FROM users WHERE name = ?', [name]);
```

### Pitfall 2: Exposing Entire Objects

```typescript
// ❌ WRONG: Exposing full user object
const scope = { user: getCurrentUser() };
// Expression can access: user._sessionToken, user.__privateKey, etc.

// ✅ CORRECT: Extract only public properties
const scope = {
  userName: user.name,
  userRole: user.role,
};
```

### Pitfall 3: Functions with Side Effects

```typescript
// ❌ WRONG: Function that mutates state
const scope = {
  items: [1, 2, 3],
  processItem: (x) => {
    sendToAnalytics(x); // Side effect!
    return x * 2;
  },
};
// Expression 'items.map(processItem)' triggers analytics

// ✅ CORRECT: Pure function only
const scope = {
  items: [1, 2, 3],
  double: (x) => x * 2,
};
```

## Real-World Examples

### Example 1: Dynamic Form Validation

```typescript
const scope = {
  fieldValue: 42,
  formValue: { age: 42, country: 'US' },
  minAge: 18,
  maxAge: 100,
};

// Validate age range
ExpressionParser.evaluate('fieldValue >= minAge && fieldValue <= maxAge', scope);
// Returns: true

// Conditional required based on country
ExpressionParser.evaluate('formValue.country === "US"', scope);
// Returns: true
```

### Example 2: Conditional Visibility

```typescript
const scope = {
  formValue: {
    hasAccount: true,
    accountType: 'premium',
  },
};

// Show field only for premium accounts
ExpressionParser.evaluate('formValue.hasAccount && formValue.accountType === "premium"', scope);
// Returns: true
```

### Example 3: Dynamic Values with Transformations

```typescript
const scope = {
  formValue: { firstName: 'john', lastName: 'doe' },
  fieldPath: 'fullName',
};

// Compute full name
ExpressionParser.evaluate('formValue.firstName + " " + formValue.lastName', scope);
// Returns: "john doe"

// With transformation
ExpressionParser.evaluate('(formValue.firstName + " " + formValue.lastName).toUpperCase()', scope);
// Returns: "JOHN DOE"
```

## Summary

The expression parser provides **strong protection against code injection** attacks while allowing **flexible data access** for dynamic forms.

**Key Takeaways:**

1. **What it prevents**: Code injection, prototype pollution, unsafe method calls
2. **What it doesn't prevent**: SQL injection, XSS, path traversal, command injection
3. **Security boundary**: The scope you provide must contain only safe values
4. **Hybrid model**: Whitelist for methods, blacklist for properties
5. **App responsibility**: Sanitize outputs, validate inputs, control scope content

**Remember**: The parser is **one layer** of defense. Build defense in depth with proper sanitization, validation, and access controls throughout your application.
