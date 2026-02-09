---
title: Values
---

Automatically compute and set field values based on other form values. Derivations enable calculated fields, auto-fill patterns, and value transformations.

## Quick Start

Derivations are defined ON the field that receives the computed value (self-targeting).

### Shorthand Syntax (Preferred)

```typescript
{
  key: 'total',
  type: 'input',
  label: 'Total',
  readonly: true,
  derivation: 'formValue.quantity * formValue.unitPrice',
}
```

### Logic Block Syntax

```typescript
{
  key: 'total',
  type: 'input',
  label: 'Total',
  readonly: true,
  logic: [{
    type: 'derivation',
    expression: 'formValue.quantity * formValue.unitPrice',
  }],
}
```

When `quantity` or `unitPrice` changes, `total` is automatically recalculated.

## Derivation Types

### Expression-Based

Use JavaScript expressions with access to `formValue`:

```typescript
{
  key: 'fullName',
  type: 'input',
  label: 'Full Name',
  readonly: true,
  derivation: '(formValue.firstName || "") + " " + (formValue.lastName || "")',
}
```

**Available variables:**

- `formValue` - Object containing all form field values
- `externalData` - External application state (when configured in FormConfig)

### Static Value

Set a constant value when a condition is met:

```typescript
{
  key: 'phonePrefix',
  type: 'input',
  label: 'Phone Prefix',
  readonly: true,
  logic: [{
    type: 'derivation',
    value: '+1',
    condition: {
      type: 'fieldValue',
      fieldPath: 'country',
      operator: 'equals',
      value: 'USA',
    },
  }],
}
```

### Custom Function

Use a registered function for complex logic:

```typescript
// In form config
customFnConfig: {
  derivations: {
    calculateTax: (ctx) => ctx.formValue.subtotal * getTaxRate(ctx.formValue.state),
  },
},
fields: [
  {
    key: 'tax',
    type: 'input',
    readonly: true,
    logic: [{
      type: 'derivation',
      functionName: 'calculateTax',
      dependsOn: ['subtotal', 'state'],
    }],
  },
],
```

## Trigger Timing

Control when derivations evaluate:

| Trigger     | Description                           | Use Case                              |
| ----------- | ------------------------------------- | ------------------------------------- |
| `onChange`  | Immediately on value change (default) | Computed totals, conditional prefixes |
| `debounced` | After value stabilizes                | Self-transforms, format masking       |

### Debounced Derivations

Use `trigger: 'debounced'` for self-transforming fields to avoid interrupting the user while typing:

```typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  logic: [{
    type: 'derivation',
    expression: 'formValue.email.toLowerCase()',
    trigger: 'debounced',
    debounceMs: 500, // optional, defaults to 500
  }],
}
```

The transformation applies after the user stops typing for 500ms.

## Conditional Derivations

Only apply derivations when conditions are met:

```typescript
{
  key: 'currency',
  type: 'input',
  label: 'Currency',
  readonly: true,
  logic: [
    {
      type: 'derivation',
      value: 'USD',
      condition: {
        type: 'fieldValue',
        fieldPath: 'country',
        operator: 'equals',
        value: 'USA',
      },
    },
    {
      type: 'derivation',
      value: 'EUR',
      condition: {
        type: 'fieldValue',
        fieldPath: 'country',
        operator: 'equals',
        value: 'Germany',
      },
    },
  ],
}
```

Multiple derivations on the same field are evaluated in order.

## Dependencies

### Automatic Detection

For expressions, dependencies are automatically extracted:

```typescript
{
  key: 'total',
  type: 'input',
  label: 'Total',
  readonly: true,
  derivation: 'formValue.quantity * formValue.unitPrice',
  // Automatically depends on: quantity, unitPrice
}
```

### Explicit Dependencies

For custom functions, specify dependencies explicitly:

```typescript
{
  key: 'discount',
  type: 'input',
  label: 'Discount',
  readonly: true,
  logic: [{
    type: 'derivation',
    functionName: 'calculateDiscount',
    dependsOn: ['total', 'memberLevel'],
  }],
}
```

Without `dependsOn`, custom functions re-evaluate on any form change.

## Complete Example

```typescript
const orderForm = {
  fields: [
    {
      key: 'quantity',
      type: 'input',
      value: 1,
      label: 'Quantity',
      props: { type: 'number' },
    },
    {
      key: 'unitPrice',
      type: 'input',
      value: 10,
      label: 'Unit Price',
      props: { type: 'number' },
    },
    {
      key: 'subtotal',
      type: 'input',
      value: 0,
      label: 'Subtotal',
      readonly: true,
      derivation: 'formValue.quantity * formValue.unitPrice',
    },
    {
      key: 'tax',
      type: 'input',
      value: 0,
      label: 'Tax (10%)',
      readonly: true,
      derivation: 'formValue.subtotal * 0.1',
    },
    {
      key: 'total',
      type: 'input',
      value: 0,
      label: 'Total',
      readonly: true,
      derivation: 'formValue.subtotal + formValue.tax',
    },
  ],
} as const satisfies FormConfig;
```

## Array Field Derivations

Inside arrays, `formValue` is scoped to the current array item:

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
          // formValue is scoped to the current array item
          derivation: 'formValue.quantity * formValue.unitPrice',
        },
      ],
    },
  ],
}
```

### Accessing Root Form Value

Inside array items, `formValue` refers to the current array item. Use `rootFormValue` to access the entire form:

```typescript
{
  key: 'lineTotal',
  type: 'input',
  label: 'Total',
  readonly: true,
  // formValue = current array item { quantity, unitPrice }
  // rootFormValue = entire form { lineItems, discount, ... }
  derivation: 'formValue.quantity * formValue.unitPrice * (1 - rootFormValue.discount / 100)',
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
    expression: 'formValue.quantity * formValue.unitPrice',
  }],
}
```

**Console output (verbose mode):**

```
Derivation - Starting cycle (onChange) with 5 derivation(s)
Derivation - Iteration 1
Derivation - Applied "Calculate line total" { field: 'lineTotal', newValue: 150 }
Derivation - Skipped: phonePrefix (condition not met)
Derivation - Cycle complete (onChange) { applied: 1, skipped: 4, errors: 0, iterations: 1 }
```

## Bidirectional Derivations

Create two-way bindings between fields:

```typescript
// Celsius to Fahrenheit
{
  key: 'fahrenheit',
  type: 'input',
  value: 32,
  derivation: 'formValue.celsius * 9 / 5 + 32',
}

// Fahrenheit to Celsius
{
  key: 'celsius',
  type: 'input',
  value: 0,
  derivation: '(formValue.fahrenheit - 32) * 5 / 9',
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
   derivation: 'Math.round(formValue.usd * exchangeRate * 100) / 100';
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

## External Data in Derivations

Use external application state in derivation expressions:

```typescript
const config = {
  externalData: {
    discountRate: computed(() => pricingService.currentDiscount()),
  },
  fields: [
    {
      key: 'discountedPrice',
      type: 'input',
      label: 'Discounted Price',
      readonly: true,
      derivation: 'formValue.price * (1 - externalData.discountRate)',
    },
  ],
} as const satisfies FormConfig;
```

External data values are reactively tracked - when signals change, derivations are re-evaluated.

## Related

- **Property Derivation** (see tab above) - Derive component properties (minDate, options, label) from form values
- **[Conditional Logic](../conditional-logic/overview/)** - Control field visibility and state
- **[Array Fields](../../prebuilt/form-arrays/)** - Working with array fields
- **[Examples](/docs/examples)** - Real-world form patterns
