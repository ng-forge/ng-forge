---
title: Properties
route: property
---

Reactively derive field component properties (like `minDate`, `options`, `label`, `placeholder`) based on form values. While value derivations set a field's form value, property derivations set **component input properties**.

## Quick Start

Property derivations use `type: 'propertyDerivation'` in the `logic` array and are self-targeting: the logic is placed on the field whose property should be derived.

```typescript
{
  key: 'endDate',
  type: 'datepicker',
  label: 'End Date',
  logic: [{
    type: 'propertyDerivation',
    targetProperty: 'minDate',
    expression: 'formValue.startDate',
  }]
}
```

When `startDate` changes, the `minDate` property on `endDate`'s datepicker component is automatically updated.

## Derivation Sources

Property derivations support three mutually exclusive ways to compute a value.

### Expression-Based

Use JavaScript expressions with access to `formValue`:

```typescript
{
  key: 'endDate',
  type: 'datepicker',
  label: 'End Date',
  logic: [{
    type: 'propertyDerivation',
    targetProperty: 'minDate',
    expression: 'formValue.startDate',
  }]
}
```

**Available variables:**

- `formValue` - Object containing all form field values
- `externalData` - External application state (when configured in FormConfig)

### Static Value

Set a constant property value when a condition is met:

```typescript
{
  key: 'phone',
  type: 'input',
  label: 'Phone',
  logic: [{
    type: 'propertyDerivation',
    targetProperty: 'label',
    value: 'Mobile Phone',
    condition: {
      type: 'fieldValue',
      fieldPath: 'contactType',
      operator: 'equals',
      value: 'mobile',
    },
  }]
}
```

### Custom Function

Use a registered function for complex logic:

```typescript
// In form config
customFnConfig: {
  propertyDerivations: {
    getCitiesForCountry: (ctx) => {
      const cities: Record<string, { label: string; value: string }[]> = {
        'US': [{ label: 'New York', value: 'nyc' }, { label: 'LA', value: 'la' }],
        'DE': [{ label: 'Berlin', value: 'berlin' }],
      };
      return cities[ctx.formValue.country as string] ?? [];
    },
  },
},
fields: [
  {
    key: 'city',
    type: 'select',
    label: 'City',
    options: [],
    logic: [{
      type: 'propertyDerivation',
      targetProperty: 'options',
      functionName: 'getCitiesForCountry',
      dependsOn: ['country'],
    }],
  },
],
```

## Target Properties

### Simple Properties

Set any direct component input property:

```typescript
targetProperty: 'minDate'; // Date constraint
targetProperty: 'maxDate'; // Date constraint
targetProperty: 'options'; // Select/radio options
targetProperty: 'label'; // Field label
targetProperty: 'placeholder'; // Input placeholder
targetProperty: 'hint'; // Hint text
targetProperty: 'rows'; // Textarea rows
```

### Nested Properties (Dot Notation)

Set properties nested one level deep using dot notation:

```typescript
targetProperty: 'props.appearance'; // Material appearance
targetProperty: 'props.color'; // Material color
targetProperty: 'meta.autocomplete'; // Custom metadata
```

> **Note:** Maximum nesting depth is 2 levels (one dot). Deeper paths like `props.nested.deep` are not supported.

## Trigger Timing

Control when property derivations evaluate:

| Trigger     | Description                           | Use Case                          |
| ----------- | ------------------------------------- | --------------------------------- |
| `onChange`  | Immediately on value change (default) | Date constraints, dynamic options |
| `debounced` | After value stabilizes                | Expensive lookups, search queries |

### Debounced Property Derivations

Use `trigger: 'debounced'` for expensive operations:

```typescript
{
  key: 'productSearch',
  type: 'select',
  label: 'Product',
  options: [],
  logic: [{
    type: 'propertyDerivation',
    targetProperty: 'options',
    functionName: 'searchProducts',
    trigger: 'debounced',
    debounceMs: 300,
    dependsOn: ['searchQuery'],
  }]
}
```

## Conditional Property Derivations

Only apply property derivations when conditions are met:

```typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  logic: [
    {
      type: 'propertyDerivation',
      targetProperty: 'label',
      value: 'Work Email',
      condition: {
        type: 'fieldValue',
        fieldPath: 'accountType',
        operator: 'equals',
        value: 'business',
      },
    },
    {
      type: 'propertyDerivation',
      targetProperty: 'label',
      value: 'Personal Email',
      condition: {
        type: 'fieldValue',
        fieldPath: 'accountType',
        operator: 'equals',
        value: 'personal',
      },
    },
  ],
}
```

## Dependencies

### Automatic Detection

For expressions, dependencies are automatically extracted:

```typescript
{
  key: 'endDate',
  type: 'datepicker',
  label: 'End Date',
  logic: [{
    type: 'propertyDerivation',
    targetProperty: 'minDate',
    expression: 'formValue.startDate',
    // Automatically depends on: startDate
  }]
}
```

### Explicit Dependencies

For custom functions, specify dependencies explicitly:

```typescript
{
  key: 'city',
  type: 'select',
  label: 'City',
  options: [],
  logic: [{
    type: 'propertyDerivation',
    targetProperty: 'options',
    functionName: 'getCitiesForCountry',
    dependsOn: ['country'],
  }]
}
```

Without `dependsOn`, custom functions re-evaluate on **any** form value change.

## Array Field Property Derivations

Inside arrays, `formValue` is scoped to the current array item:

```typescript
{
  key: 'lineItems',
  type: 'array',
  fields: [
    {
      key: 'item',
      type: 'group',
      fields: [
        { key: 'startDate', type: 'datepicker', label: 'Start' },
        {
          key: 'endDate',
          type: 'datepicker',
          label: 'End',
          logic: [{
            type: 'propertyDerivation',
            targetProperty: 'minDate',
            // formValue is scoped to the current array item
            expression: 'formValue.startDate',
          }]
        },
      ],
    },
  ],
}
```

Each array item independently derives its own `endDate.minDate` from its own `startDate`.

## Complete Example

```typescript
const travelForm = {
  customFnConfig: {
    propertyDerivations: {
      getCitiesForCountry: (ctx) => {
        const cities: Record<string, { label: string; value: string }[]> = {
          US: [
            { label: 'New York', value: 'nyc' },
            { label: 'Los Angeles', value: 'la' },
            { label: 'Chicago', value: 'chi' },
          ],
          DE: [
            { label: 'Berlin', value: 'berlin' },
            { label: 'Munich', value: 'munich' },
          ],
        };
        return cities[ctx.formValue.country as string] ?? [];
      },
    },
  },
  fields: [
    {
      key: 'country',
      type: 'select',
      label: 'Country',
      required: true,
      options: [
        { label: 'USA', value: 'US' },
        { label: 'Germany', value: 'DE' },
      ],
    },
    {
      key: 'city',
      type: 'select',
      label: 'City',
      required: true,
      options: [],
      logic: [
        {
          type: 'propertyDerivation',
          targetProperty: 'options',
          functionName: 'getCitiesForCountry',
          dependsOn: ['country'],
        },
      ],
    },
    { key: 'startDate', type: 'datepicker', label: 'Travel Start', required: true },
    {
      key: 'endDate',
      type: 'datepicker',
      label: 'Travel End',
      required: true,
      logic: [
        {
          type: 'propertyDerivation',
          targetProperty: 'minDate',
          expression: 'formValue.startDate',
        },
      ],
    },
    {
      key: 'notes',
      type: 'textarea',
      label: 'Notes',
      logic: [
        {
          type: 'propertyDerivation',
          targetProperty: 'props.appearance',
          value: 'fill',
          condition: {
            type: 'fieldValue',
            fieldPath: 'country',
            operator: 'equals',
            value: 'DE',
          },
        },
        {
          type: 'propertyDerivation',
          targetProperty: 'props.appearance',
          value: 'outline',
          condition: {
            type: 'fieldValue',
            fieldPath: 'country',
            operator: 'notEquals',
            value: 'DE',
          },
        },
      ],
    },
    { key: 'submit', type: 'submit', label: 'Book Trip' },
  ],
} as const satisfies FormConfig;
```

## Comparison with Value Derivation

| Aspect           | Value Derivation             | Property Derivation                  |
| ---------------- | ---------------------------- | ------------------------------------ |
| Logic type       | `type: 'derivation'`         | `type: 'propertyDerivation'`         |
| Sets             | Field's form value           | Component input property             |
| Target           | Implicit (self)              | `targetProperty: 'minDate'`          |
| Shorthand        | `derivation: 'expr'`         | None (must use logic block)          |
| Chaining         | Topologically sorted         | No chaining (single pass)            |
| Custom functions | `customFnConfig.derivations` | `customFnConfig.propertyDerivations` |
| Max iterations   | Configurable (default 10)    | Single pass                          |

## Debugging

Add `debugName` to property derivations for easier identification in logs:

```typescript
logic: [
  {
    type: 'propertyDerivation',
    debugName: 'endDate minDate constraint',
    targetProperty: 'minDate',
    expression: 'formValue.startDate',
  },
];
```

## PropertyDerivationLogicConfig Interface

```typescript
interface PropertyDerivationLogicConfig {
  /** Logic type identifier */
  type: 'propertyDerivation';

  /** Property to set on the field component */
  targetProperty: string;

  /** Optional name for debugging */
  debugName?: string;

  /** When to evaluate: 'onChange' (default) or 'debounced' */
  trigger?: 'onChange' | 'debounced';

  /** Debounce duration in ms (default: 500) */
  debounceMs?: number;

  /** Static value to set (mutually exclusive) */
  value?: unknown;

  /** JavaScript expression (mutually exclusive) */
  expression?: string;

  /** Name of registered custom function (mutually exclusive) */
  functionName?: string;

  /** Explicit field dependencies */
  dependsOn?: string[];

  /** Condition for when derivation applies (default: true) */
  condition?: ConditionalExpression | boolean;
}
```

## External Data in Property Derivations

Use external application state in property derivation custom functions:

```typescript
const config = {
  externalData: {
    userRegion: computed(() => this.regionService.current()),
  },
  customFnConfig: {
    propertyDerivations: {
      getCurrencyOptions: (ctx) => {
        const optionsByRegion: Record<string, { label: string; value: string }[]> = {
          EU: [
            { label: 'EUR', value: 'eur' },
            { label: 'GBP', value: 'gbp' },
          ],
          US: [
            { label: 'USD', value: 'usd' },
            { label: 'CAD', value: 'cad' },
          ],
        };
        return optionsByRegion[ctx.externalData.userRegion as string] ?? [];
      },
    },
  },
  fields: [
    {
      key: 'currency',
      type: 'select',
      label: 'Currency',
      options: [],
      logic: [
        {
          type: 'propertyDerivation',
          targetProperty: 'options',
          functionName: 'getCurrencyOptions',
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

External data values are reactively tracked - when signals change, property derivations are re-evaluated.

## Related

- **Value Derivation** (see tab above) - Compute field form values
- **[Conditional Logic](../conditional-logic/overview/)** - Control field visibility and state
- **[Array Fields](../../prebuilt/form-arrays/)** - Working with array fields
