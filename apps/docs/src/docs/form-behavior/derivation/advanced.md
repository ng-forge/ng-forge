---
title: Advanced
route: advanced
keyword: DerivationAdvancedPage
---

Advanced derivation patterns including array fields, debugging, and bidirectional derivations.

## Array Field Derivations

Derivations support relative paths with `$` for array item siblings:

```typescript
{
  key: 'lineItems',
  type: 'array',
  fields: [
    {
      key: 'itemRow',
      type: 'row',
      fields: [
        { key: 'quantity', type: 'input', label: 'Qty', value: 1 },
        { key: 'unitPrice', type: 'input', label: 'Price', value: 0 },
        {
          key: 'lineTotal',
          type: 'input',
          label: 'Total',
          value: 0,
          readonly: true,
          logic: [{
            type: 'derivation',
            targetField: '$.lineTotal', // Relative to current array item
            expression: 'formValue.quantity * formValue.unitPrice',
          }],
        },
      ],
    },
  ],
}
```

### Path Syntax

| Path                | Description                          |
| ------------------- | ------------------------------------ |
| `$.fieldName`       | Sibling field in the same array item |
| `lineItems.0.total` | Absolute path to specific array item |
| `grandTotal`        | Top-level field outside the array    |

### Accessing Root Form Value

Inside array items, `formValue` refers to the current array item. Use `rootFormValue` to access the entire form:

```typescript
{
  key: 'lineTotal',
  type: 'input',
  label: 'Total',
  readonly: true,
  logic: [{
    type: 'derivation',
    targetField: '$.lineTotal',
    // formValue = current array item { quantity, unitPrice }
    // rootFormValue = entire form { lineItems, discount, ... }
    expression: 'formValue.quantity * formValue.unitPrice * (1 - rootFormValue.discount / 100)',
  }],
}
```

## Debugging Derivations

Enable derivation logging to troubleshoot issues:

### Configuration

Configure derivation logging via `withLoggerConfig`:

```typescript
// In your providers
provideDynamicForm(...withMaterialFields(), withLoggerConfig({ derivations: 'verbose' }));

// Or just summary level
provideDynamicForm(...withMaterialFields(), withLoggerConfig({ derivations: 'summary' }));
```

### Log Levels

| Level     | Output                            |
| --------- | --------------------------------- |
| `none`    | No logging (default)              |
| `summary` | Cycle completion with counts      |
| `verbose` | Individual derivation evaluations |

### Using debugName

Add names to derivations for easier identification in logs:

```typescript
{
  key: 'lineTotal',
  type: 'input',
  label: 'Total',
  readonly: true,
  logic: [{
    type: 'derivation',
    debugName: 'Calculate line total',
    targetField: '$.lineTotal',
    expression: 'formValue.quantity * formValue.unitPrice',
  }],
}
```

**Console output (verbose mode):**

```
Derivation - Starting cycle (onChange) with 5 derivation(s)
Derivation - Iteration 1
Derivation - Applied "Calculate line total" { source: 'quantity', target: '$.lineTotal', newValue: 150 }
Derivation - Skipped: country -> phonePrefix (condition not met)
Derivation - Cycle complete (onChange) { applied: 1, skipped: 4, errors: 0, iterations: 1 }
```

## Bidirectional Derivations

Create two-way bindings between fields:

```typescript
// Celsius to Fahrenheit
{
  key: 'celsius',
  type: 'input',
  value: 0,
  logic: [{
    type: 'derivation',
    targetField: 'fahrenheit',
    expression: 'formValue.celsius * 9 / 5 + 32',
  }],
}

// Fahrenheit to Celsius
{
  key: 'fahrenheit',
  type: 'input',
  value: 32,
  logic: [{
    type: 'derivation',
    targetField: 'celsius',
    expression: '(formValue.fahrenheit - 32) * 5 / 9',
  }],
}
```

### Cycle Detection

The system automatically detects derivation cycles and warns during development:

```
Bidirectional derivation detected: celsius <-> fahrenheit
Bidirectional derivations stabilize via equality check.
```

### Floating-Point Precision

Bidirectional derivations stabilize when the computed value equals the current value. For floating-point operations, consider:

1. **Rounding in expressions:**

   ```typescript
   expression: 'Math.round(formValue.usd * exchangeRate * 100) / 100';
   ```

2. **Using integers:** Store cents instead of dollars
3. **One-way derivation:** If bidirectional isn't required

## Derivation Processing

### Evaluation Order

Derivations are topologically sorted based on dependencies:

```
quantity  ─┐
            ├── subtotal ─┐
unitPrice ─┘              ├── total
                          │
             tax ─────────┘
```

This ensures `subtotal` is computed before `total`.

### Iteration Limits

To prevent infinite loops, derivations are limited to 10 iterations per cycle. If exceeded:

```
Derivation - Max iterations reached (onChange).
This may indicate a loop in derivation logic.
```

## DerivationLogicConfig Interface

```typescript
interface DerivationLogicConfig {
  /** Logic type identifier */
  type: 'derivation';

  /** Optional name for debugging */
  debugName?: string;

  /** Target field to modify */
  targetField: string;

  /** When to evaluate: 'onChange' (default) or 'debounced' */
  trigger?: 'onChange' | 'debounced';

  /** Debounce duration in ms (default: 500) */
  debounceMs?: number;

  /** Static value to set */
  value?: unknown;

  /** JavaScript expression (has access to formValue) */
  expression?: string;

  /** Name of registered custom function */
  functionName?: string;

  /** Explicit field dependencies */
  dependsOn?: string[];

  /** Condition for when derivation applies */
  condition?: ConditionalExpression | boolean;
}
```

## Related

- **[Derivation Basics](../)** - Getting started with derivations
- **[Conditional Logic](../conditional-logic/)** - Control field visibility and state
- **[Array Fields](../../prebuilt/form-arrays/)** - Working with array fields
