# Critical Security Assessment of Expression Parser Implementation

## Executive Summary

This document provides a critical analysis of the secure expression parser implementation, identifying correctness issues, logic errors, security gaps, and areas that are hard to understand or maintain.

**Overall Assessment**: The implementation successfully prevents the primary attack vector (arbitrary code execution via `new Function()`), but contains several design flaws, misleading tests, and areas of confusion that need to be addressed.

---

## 🔴 Critical Issues

### 1. Contradictory Method Blacklist/Whitelist Design

**Location**: `evaluator.ts:10-116`

**Issue**: The code uses BOTH a whitelist (explicit safe methods) AND a blacklist (UNSAFE_METHODS), which is contradictory and confusing.

```typescript
const UNSAFE_METHODS = new Set<string>(['constructor', 'valueOf', ...]);

const STRING_SAFE_METHODS: ReadonlyArray<keyof string> = ['charAt', 'concat', ...];

const SAFE_METHODS = {
  string: new Set(STRING_SAFE_METHODS.filter((m) => !UNSAFE_METHODS.has(m as string))),
  // ^^^ Why filter if we're already explicitly listing safe methods?
};
```

**Problem**:

- If we're whitelisting, we should ONLY list safe methods
- If we're blacklisting, we should derive methods from types and filter unsafe ones
- Doing both suggests unclear security model

**Impact**: Maintainability issue, confusing for future developers

**Recommendation**: Choose ONE approach:

- **Option A (Whitelist)**: Remove UNSAFE_METHODS entirely, only list safe methods
- **Option B (Blacklist)**: Derive all methods from type, filter out unsafe ones

---

### 2. toLocaleString Contradiction

**Location**: `evaluator.ts:24` and `evaluator.ts:100-105`

**Issue**: `toLocaleString` is marked as unsafe for strings/numbers but safe for dates.

```typescript
const UNSAFE_METHODS = new Set<string>([
  'toLocaleString', // Can expose locale information
]);

const DATE_SAFE_METHODS: ReadonlyArray<keyof Date> = [
  'toLocaleDateString',
  'toLocaleString', // ← Listed as safe here!
  'toLocaleTimeString',
];
```

**Problem**:

- Inconsistent security policy
- The rationale "can expose locale information" is questionable - locale is already exposed via browser APIs
- Will block legitimate use cases like `price.toLocaleString()`

**Recommendation**: Either remove from UNSAFE_METHODS or from DATE_SAFE_METHODS with clear justification

---

### 3. Property Access Allows Information Disclosure

**Location**: `evaluator.ts:168-181`

**Issue**: The evaluator allows reading ANY property on objects, including sensitive prototype properties.

```typescript
private evaluateMemberAccess(node: { object: ASTNode; property: string }): unknown {
  const obj = this.evaluate(node.object);
  if (obj === null || obj === undefined) {
    return undefined;
  }
  // Allows reading ANY property!
  if (typeof obj === 'object' || typeof obj === 'string' || typeof obj === 'number') {
    return (obj as Record<string, unknown>)[node.property];
  }
  return undefined;
}
```

**Attack Vectors**:

```javascript
// An attacker can:
ExpressionParser.evaluate('obj.constructor.name', { obj: {} }); // → "Object"
ExpressionParser.evaluate('str.constructor.name', { str: 'test' }); // → "String"
ExpressionParser.evaluate('obj.__proto__', { obj: {} }); // → Object.prototype
ExpressionParser.evaluate('obj.constructor.prototype', { obj: {} }); // → Object.prototype

// Information leakage about class structure:
class SecretClass {}
const instance = new SecretClass();
ExpressionParser.evaluate('obj.constructor.name', { obj: instance }); // → "SecretClass"
```

**Impact**: Medium severity - Allows information disclosure about application structure

**Recommendation**:

- Add property blacklist for `constructor`, `__proto__`, `prototype`
- Document that property access is unrestricted (if that's intentional)
- Consider restricting property access to own properties only: `Object.hasOwnProperty.call(obj, property)`

---

## 🟡 Logic Errors

### 4. Error Position Always Zero

**Location**: Multiple locations throughout `evaluator.ts`

**Issue**: All errors report position as 0, making debugging impossible.

```typescript
throw new ExpressionParserError(`Unknown binary operator: ${node.operator}`, 0, this.expression);
//                                                                             ↑ Always 0!
```

**Impact**: Poor developer experience, hard to debug complex expressions

**Recommendation**:

- Thread position information through AST nodes
- Use actual token positions from parser
- Or remove position parameter if it can't be implemented correctly

---

### 5. Type Safety is Illusory

**Location**: `evaluator.ts:30-115`

**Issue**: We use `keyof string` for type safety, but immediately cast it away.

```typescript
const STRING_SAFE_METHODS: ReadonlyArray<keyof string> = [...] as const;
//                                        ↑ Type checked!

const SAFE_METHODS = {
  string: new Set(STRING_SAFE_METHODS.filter((m) => !UNSAFE_METHODS.has(m as string)) as string[]),
  //                                                                       ↑ Type safety lost here
};
```

**Problem**:

- The `keyof string` prevents typos at compile time
- But the `as string` cast removes runtime type safety
- The `.filter()` further obscures what methods are actually allowed

**Recommendation**:

```typescript
// Better approach - keep types through to runtime:
const STRING_SAFE_METHODS = [
  'charAt',
  'concat',
  // ...
] as const satisfies ReadonlyArray<keyof string>;

const SAFE_METHODS = {
  string: new Set(STRING_SAFE_METHODS), // No cast needed
  // ...
} as const;
```

---

### 6. Arithmetic Operators Don't Validate Types

**Location**: `evaluator.ts:189-198`

**Issue**: Arithmetic operations blindly cast to numbers without validation.

```typescript
case '+':
  return (left as number) + (right as number);  // What if they're not numbers?
```

**Problem**:

```javascript
ExpressionParser.evaluate('"hello" + "world"', {}); // → "helloworld" (string concat, not addition)
ExpressionParser.evaluate('true + false', {}); // → 1 (coerced to numbers)
ExpressionParser.evaluate('{} + []', {}); // → NaN
```

**Impact**: Unexpected behavior, JavaScript coercion rules apply

**Recommendation**:

- Document that JavaScript coercion rules apply
- OR explicitly validate types and throw errors for non-numbers
- Consider separate string concatenation operator

---

## 🟠 Misleading Security Tests

### 7. Tests Check Scope, Not Parser Security

**Location**: `expression-parser.security.spec.ts:68-463`

**Issue**: Many "security tests" just verify that globals aren't in the scope, not that the parser prevents access.

```typescript
describe('Global Object Access Prevention', () => {
  it('should not allow access to window object', () => {
    const result = ExpressionParser.evaluate('window', {});
    //                                                   ↑ Empty scope, of course window is undefined!
    expect(result).toBeUndefined();
  });
});

describe('Data Theft Attempts', () => {
  it('should prevent cookie theft attempt', () => {
    const result = ExpressionParser.evaluate('document.cookie', {});
    //                                                           ↑ No document in scope!
    expect(result).toBeUndefined();
  });
});
```

**Problem**:

- These tests would pass even with `new Function()` if we pass empty scope
- They're testing scope isolation, not parser security
- Gives false sense of security

**What These Tests Actually Verify**:

- ✅ Empty scope doesn't leak globals
- ❌ Parser prevents access to globals (this is impossible - parser can't know about runtime environment)

**Real Security Tests Should Check**:

```typescript
// GOOD: Tests parser behavior
it('should prevent arbitrary function calls', () => {
  const scope = { dangerousFunc: () => 'hacked' };
  expect(() => ExpressionParser.evaluate('dangerousFunc()', scope)).toThrow();
});

// GOOD: Tests method whitelist
it('should prevent non-whitelisted method calls', () => {
  const scope = { str: 'test' };
  expect(() => ExpressionParser.evaluate('str.link("url")', scope)).toThrow();
});

// BAD: Just tests that variable doesn't exist
it('should prevent window access', () => {
  const result = ExpressionParser.evaluate('window', {});
  expect(result).toBeUndefined(); // Of course! window isn't in scope!
});
```

**Recommendation**:

- Rename these tests to "Scope Isolation Tests" or remove them
- Replace with tests that verify parser behavior
- Add note that application must provide safe scope

---

### 8. SQL/Path Traversal Tests Are Misleading

**Location**: `expression-parser.security.spec.ts:669-742`

**Issue**: These tests claim to test "injection prevention" but just verify string pass-through.

```typescript
describe('SQL Injection Prevention (for backend integration)', () => {
  it('should safely handle SQL-like injection attempts in expressions', () => {
    const scope = { userInput: "'; DROP TABLE users; --" };
    const result = ExpressionParser.evaluate('userInput', scope);
    expect(result).toBe("'; DROP TABLE users; --");
    expect(typeof result).toBe('string');
  });
});
```

**Problem**:

- Parser doesn't (and shouldn't) sanitize strings
- Test title says "SQL Injection Prevention" but it doesn't prevent anything
- Gives false sense of security that parser prevents SQL injection

**Recommendation**:

- Remove these tests OR
- Rename to "String Pass-Through Behavior"
- Add documentation that SQL injection prevention is application's responsibility

---

## 🔵 Code Clarity Issues

### 9. Mixed Responsibilities in Evaluator

**Location**: `evaluator.ts:121-291`

**Issue**: The Evaluator class handles multiple concerns:

- AST evaluation (primary responsibility)
- Security policy enforcement (method whitelisting)
- Type checking/coercion
- Error handling

**Recommendation**: Consider separating concerns:

```typescript
class SecurityPolicy {
  isMethodAllowed(obj: unknown, method: string): boolean { ... }
  isPropertyAllowed(property: string): boolean { ... }
}

class Evaluator {
  constructor(
    private scope: EvaluationScope,
    private securityPolicy: SecurityPolicy
  ) {}
}
```

---

### 10. Magic Strings for Node Type Checking

**Location**: `evaluator.ts:132-157, 248`

**Issue**: Using string literals for type discrimination is fragile.

```typescript
if (node.callee.type !== 'MemberAccess') {  // String literal!
  throw new ExpressionParserError('Only method calls are allowed...
}
```

**Problem**:

- Typos aren't caught by TypeScript
- Refactoring is harder
- Not using TypeScript's discriminated unions

**Recommendation**:

```typescript
// In types.ts, use discriminated unions:
type ASTNode =
  | { kind: 'Literal'; value: unknown }
  | { kind: 'Identifier'; name: string }
  | { kind: 'MemberAccess'; object: ASTNode; property: string };
// ...

// Then use TypeScript's narrowing:
switch (node.kind) {
  case 'Literal':
    return node.value; // TypeScript knows node.value exists
  case 'Identifier':
    return node.name; // TypeScript knows node.name exists
}
```

---

### 11. Inconsistent Null Checking

**Location**: Throughout `evaluator.ts`

**Issue**: Multiple patterns for checking null/undefined:

```typescript
// Pattern 1: Explicit null check
if (obj === null || obj === undefined) { ... }

// Pattern 2: Falsy check
if (!obj) { ... }

// Pattern 3: 'in' operator
if (!(name in this.scope)) { ... }
```

**Recommendation**: Use consistent pattern throughout. Prefer explicit checks:

```typescript
if (obj == null) { ... }  // Checks both null and undefined
```

---

### 12. Confusing Method Call Implementation

**Location**: `evaluator.ts:246-271`

**Issue**: The method call implementation is hard to follow.

```typescript
private evaluateCallExpression(node: { callee: ASTNode; arguments: ASTNode[] }): unknown {
  // Check 1: Must be method call
  if (node.callee.type !== 'MemberAccess') {
    throw new ExpressionParserError('Only method calls are allowed...
  }

  const obj = this.evaluate(node.callee.object);
  const methodName = node.callee.property;

  // Check 2: Method must be whitelisted
  if (!this.isMethodSafe(obj, methodName)) {
    throw new ExpressionParserError(`Method "${methodName}" is not allowed...
  }

  const args = node.arguments.map((arg) => this.evaluate(arg));

  // Check 3: Property must be a function
  const method = (obj as Record<string, unknown>)[methodName];
  if (typeof method === 'function') {
    return (method as (...args: unknown[]) => unknown).call(obj, ...args);
  }

  return undefined;  // What does this mean?
}
```

**Problems**:

1. Why check if method is whitelisted BEFORE checking if it's a function?
2. Returning `undefined` when property isn't a function is silent failure
3. Too many casts, obscures logic

**Recommendation**: Reorder and clarify:

```typescript
private evaluateCallExpression(node: CallExpressionNode): unknown {
  if (node.callee.kind !== 'MemberAccess') {
    throw new ExpressionParserError('Only method calls are allowed (not standalone functions)');
  }

  const obj = this.evaluate(node.callee.object);
  const methodName = node.callee.property;

  // Get the method first to check if it exists
  const method = this.getProperty(obj, methodName);

  if (typeof method !== 'function') {
    throw new ExpressionParserError(`Property "${methodName}" is not a function`);
  }

  if (!this.isMethodAllowed(obj, methodName)) {
    throw new ExpressionParserError(`Method "${methodName}" is not in the safe methods whitelist`);
  }

  const args = node.arguments.map(arg => this.evaluate(arg));
  return method.call(obj, ...args);
}
```

---

## 📋 Missing Documentation

### 13. No Clear Definition of "Safe"

**Issue**: The code doesn't document what makes a method "safe" vs "unsafe".

**Questions Not Answered**:

- Why is `valueOf` unsafe?
- Why is `toLocaleString` unsafe for strings but safe for dates?
- What criteria determine if a method is safe?

**Recommendation**: Add comprehensive documentation:

```typescript
/**
 * Security Model for Expression Parser
 *
 * A method is considered SAFE if it meets ALL criteria:
 * 1. Pure data access/transformation (no side effects)
 * 2. No code execution capabilities
 * 3. No global state modification
 * 4. No prototype chain modification
 * 5. No information disclosure about system internals
 *
 * UNSAFE methods include:
 * - constructor: Could enable code execution via Function constructor
 * - valueOf: Could enable prototype pollution
 * - __proto__, __defineGetter__, etc: Direct prototype manipulation
 * - hasOwnProperty, isPrototypeOf: Leak object structure information
 */
```

---

### 14. Missing Usage Examples and Limitations

**Issue**: No documentation about what expressions are supported/not supported.

**Should Document**:

```typescript
/**
 * Supported Features:
 * - Property access: `obj.prop`, `user.name`
 * - Method calls: `str.toUpperCase()`, `arr.map()`
 * - Arithmetic: `+`, `-`, `*`, `/`, `%`
 * - Comparison: `==`, `===`, `!=`, `!==`, `>`, `<`, `>=`, `<=`
 * - Logical: `&&`, `||`, `!`
 * - Typeof: `typeof x`
 * - Array literals: `[1, 2, 3]`
 *
 * NOT Supported:
 * - Object literals: `{}`
 * - Array indexing: `arr[0]`
 * - Assignment: `x = 5`
 * - Function declarations: `function() {}`
 * - Arrow functions: `() => {}`
 * - Ternary operator: `a ? b : c`
 * - Optional chaining: `obj?.prop`
 * - Nullish coalescing: `a ?? b`
 * - Spread operator: `...arr`
 * - Template literals: `` `hello ${name}` ``
 */
```

---

## 🎯 Recommendations Summary

### High Priority (Fix Now)

1. **Resolve blacklist/whitelist contradiction** - Choose one approach
2. **Fix toLocaleString contradiction** - Decide if it's safe or not
3. **Rename misleading security tests** - Don't claim to prevent SQL injection
4. **Document limitations** - What expressions are/aren't supported

### Medium Priority (Fix Soon)

5. **Add property access restrictions** - Prevent constructor.name leakage
6. **Fix error positions** - Thread position through AST or remove parameter
7. **Improve error messages** - Make them actionable
8. **Separate concerns** - Extract security policy from evaluator

### Low Priority (Technical Debt)

9. **Use discriminated unions** - Replace magic strings
10. **Consistent null checking** - Pick one pattern
11. **Add comprehensive docs** - Document security model
12. **Improve type safety** - Keep types through to runtime

---

## ✅ What Works Well

Despite the issues above, the implementation successfully:

1. ✅ **Prevents arbitrary code execution** - Core goal achieved
2. ✅ **Blocks dangerous methods** - constructor, eval, etc. can't be called
3. ✅ **Maintains backward compatibility** - All legitimate expressions work
4. ✅ **Good test coverage** - 478 tests, though some are mislabeled
5. ✅ **Performance optimization** - AST caching implemented
6. ✅ **Type-checked method names** - Using `keyof` prevents typos

---

## Conclusion

The expression parser implementation **successfully prevents the primary security vulnerability** (code injection via `new Function()`), but has several design flaws and misleading documentation that should be addressed.

**Security Rating**: 🟢 **Secure for intended use case**

- ✅ Prevents code injection
- ✅ Blocks dangerous methods
- ⚠️ Minor information disclosure risk (property access)
- ⚠️ Misleading test names suggest broader protection than provided

**Code Quality Rating**: 🟡 **Needs improvement**

- Contradictory design decisions
- Poor error messages
- Missing documentation
- Some misleading tests

**Recommendation**: The code is safe to use in production, but should undergo refactoring to address the clarity and maintainability issues identified above.
