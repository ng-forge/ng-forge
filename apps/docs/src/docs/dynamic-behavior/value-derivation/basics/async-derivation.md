---
title: Async
route: async
---

Derive field values from HTTP responses or custom async functions. Async derivations are ideal for server-driven computed values, address/zip lookups, exchange rates, and any value that requires a network call.

## HTTP Derivations

Use `source: 'http'` to derive a field value from an HTTP response. The request fires when declared dependencies change, with automatic debouncing and in-flight request cancellation.

### Basic Example

```typescript
{
  key: 'exchangeRate',
  type: 'input',
  label: 'Exchange Rate',
  readonly: true,
  logic: [{
    type: 'derivation',
    source: 'http',
    http: {
      url: '/api/exchange-rate',
      method: 'GET',
      queryParams: {
        currency: 'formValue.currency',
      },
    },
    responseExpression: 'response.rate',
    dependsOn: ['currency'],
  }],
}
```

When `currency` changes, a GET request is sent and `response.rate` becomes the new field value.

### HttpRequestConfig

| Property                  | Type                      | Required | Description                                                                 |
| ------------------------- | ------------------------- | -------- | --------------------------------------------------------------------------- |
| `url`                     | `string`                  | Yes      | Request URL. Use `:key` placeholders for path parameters                    |
| `method`                  | `string`                  | No       | HTTP method. Defaults to `'GET'`                                            |
| `params`                  | `Record<string, string>`  | No       | Path parameters. Values are expressions evaluated against the form context  |
| `queryParams`             | `Record<string, string>`  | No       | Query parameters. Values are expressions evaluated against the form context |
| `body`                    | `Record<string, unknown>` | No       | Request body (for POST/PUT/PATCH)                                           |
| `evaluateBodyExpressions` | `boolean`                 | No       | When `true`, top-level string values in `body` are treated as expressions   |
| `headers`                 | `Record<string, string>`  | No       | Request headers                                                             |

### Path Parameters

Use `:key` placeholders in the URL and provide values via `params`. Values are expressions evaluated against the form context, then `encodeURIComponent`-encoded:

```typescript
http: {
  url: '/api/users/:userId/orders/:orderId',
  params: {
    userId: 'formValue.userId',
    orderId: 'formValue.orderId',
  },
}
```

### Query Params as Expressions

Values in `queryParams` are evaluated as expressions, giving you dynamic request parameters built from form values:

```typescript
http: {
  url: '/api/shipping-estimate',
  queryParams: {
    fromZip: 'formValue.originZip',
    toZip: 'formValue.destinationZip',
    weight: 'formValue.packageWeight',
  },
}
```

### POST with Dynamic Body

For `POST` requests, use `evaluateBodyExpressions: true` to build the body from form values:

```typescript
http: {
  url: '/api/calculate-tax',
  method: 'POST',
  body: {
    subtotal: 'formValue.subtotal',
    state: 'formValue.state',
    items: 'formValue.lineItems',
  },
  evaluateBodyExpressions: true,
},
```

Top-level string values in `body` are evaluated as expressions. Nested objects are passed through as-is.

### Extracting the Response Value

`responseExpression` is evaluated with `{ response }` in scope and extracts the derived value:

```typescript
responseExpression: 'response.rate'; // Simple property
responseExpression: 'response.data.price'; // Nested property
responseExpression: 'response.items[0].value'; // Array access
```

### Required Fields

`source: 'http'` enforces two fields at the TypeScript level:

- **`dependsOn: string[]`** — Explicit field dependencies. The request only re-fires when these fields change.
- **`responseExpression: string`** — Expression to extract the derived value from the response body.

### Controlling Request Timing

Use `trigger` and `debounceMs` to control when requests fire:

```typescript
{
  type: 'derivation',
  source: 'http',
  http: {
    url: '/api/username-suggest',
    queryParams: { q: 'formValue.companyName' },
  },
  responseExpression: 'response.suggestion',
  dependsOn: ['companyName'],
  trigger: 'debounced',
  debounceMs: 400,
}
```

The request waits 400ms after the user stops typing before firing.

### Conditional HTTP Derivation

Add a `condition` to only send the request when certain criteria are met:

```typescript
{
  key: 'suggestedPrice',
  type: 'input',
  readonly: true,
  logic: [{
    type: 'derivation',
    source: 'http',
    http: {
      url: '/api/price-suggest',
      queryParams: { productId: 'formValue.productId' },
    },
    responseExpression: 'response.suggestedPrice',
    dependsOn: ['productId'],
    condition: {
      type: 'fieldValue',
      fieldPath: 'productId',
      operator: 'notEquals',
      value: '',
    },
  }],
}
```

## Async Function Derivations

Use `source: 'asyncFunction'` when you need custom logic — Angular service injection, complex transformations, or any async computation not expressible as a plain HTTP config. Functions receive the full evaluation context and can return a `Promise` or `Observable`.

### Basic Example

```typescript
// 1. Define and register the function in customFnConfig
const formConfig = {
  customFnConfig: {
    asyncDerivations: {
      lookupCity: async (context) => {
        const response = await fetch(`/api/geocode?zip=${context.formValue.zipCode}`);
        const data = await response.json();
        return data.city;
      },
    },
  },

  // 2. Reference it on the target field
  fields: [
    {
      key: 'city',
      type: 'input',
      label: 'City',
      readonly: true,
      logic: [
        {
          type: 'derivation',
          source: 'asyncFunction',
          asyncFunctionName: 'lookupCity',
          dependsOn: ['zipCode'],
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

### Using RxJS Observables

Functions can return an `Observable` instead of a `Promise`, which is useful when using Angular services:

```typescript
customFnConfig: {
  asyncDerivations: {
    fetchAddress: (context) => {
      return inject(AddressService)
        .lookup(context.formValue.zipCode as string)
        .pipe(map(result => result.formattedAddress));
    },
  },
},
```

### Available Context

Async derivation functions receive the full `EvaluationContext`:

| Variable                | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `context.formValue`     | All current form field values                    |
| `context.fieldValue`    | The current value of the target field            |
| `context.externalData`  | External data passed to the form (if configured) |
| `context.rootFormValue` | Entire form value when inside array fields       |

### Conditional Async Derivation

Combine with `condition` to only run the function when needed:

```typescript
{
  key: 'city',
  type: 'input',
  label: 'City',
  readonly: true,
  logic: [{
    type: 'derivation',
    source: 'asyncFunction',
    asyncFunctionName: 'lookupCity',
    dependsOn: ['zipCode'],
    condition: {
      type: 'fieldValue',
      fieldPath: 'enableLookup',
      operator: 'equals',
      value: true,
    },
  }],
}
```

The async function is only called when `enableLookup === true`.

### Required Fields

`source: 'asyncFunction'` requires:

- **`asyncFunctionName: string`** — Name of the function registered in `customFnConfig.asyncDerivations`.
- **`dependsOn: string[]`** — Explicit field dependencies. Without this, the function would re-run on every form change.

## Stop On User Override

`stopOnUserOverride` turns a derivation into a "smart default" — the field is auto-filled initially, but derivation stops once the user manually edits it.

### Basic Example

```typescript
{
  key: 'displayName',
  type: 'input',
  label: 'Display Name',
  logic: [{
    type: 'derivation',
    expression: 'formValue.firstName + " " + formValue.lastName',
    stopOnUserOverride: true,
  }],
}
```

The display name is auto-filled from first and last name. Once the user changes it directly, auto-fill stops.

### Re-Engaging on Dependency Change

Use `reEngageOnDependencyChange: true` to clear the user override when a dependency changes. The derivation respects user edits, but re-engages if the underlying data changes:

```typescript
{
  key: 'phonePrefix',
  type: 'input',
  label: 'Phone Prefix',
  logic: [
    {
      type: 'derivation',
      value: '+1',
      condition: { type: 'fieldValue', fieldPath: 'country', operator: 'equals', value: 'US' },
      stopOnUserOverride: true,
      reEngageOnDependencyChange: true,
      dependsOn: ['country'],
    },
    {
      type: 'derivation',
      value: '+44',
      condition: { type: 'fieldValue', fieldPath: 'country', operator: 'equals', value: 'UK' },
      stopOnUserOverride: true,
      reEngageOnDependencyChange: true,
      dependsOn: ['country'],
    },
  ],
}
```

When the user changes the country, the phone prefix is auto-filled again — overriding any previous manual edit.

**Without** `reEngageOnDependencyChange`: once the user edits the field, the derivation never runs again for that field instance.

**With** `reEngageOnDependencyChange`: the user override is cleared when a declared dependency changes, and the derivation re-fires.

### Works with All Sources

`stopOnUserOverride` and `reEngageOnDependencyChange` work across all derivation sources:

```typescript
// HTTP derivation with user override
{
  type: 'derivation',
  source: 'http',
  http: {
    url: '/api/suggest-price',
    queryParams: { category: 'formValue.category' },
  },
  responseExpression: 'response.suggestedPrice',
  dependsOn: ['category'],
  stopOnUserOverride: true,
  reEngageOnDependencyChange: true,
}

// Async function derivation with user override
{
  type: 'derivation',
  source: 'asyncFunction',
  asyncFunctionName: 'fetchDefaultTitle',
  dependsOn: ['template'],
  stopOnUserOverride: true,
}
```

## DerivationLogicConfig Reference (Async)

### HTTP Derivation Fields

```typescript
{
  type: 'derivation';
  source: 'http';         // Required — identifies HTTP mode

  http: HttpRequestConfig; // Required — request configuration
  dependsOn: string[];     // Required — explicit field dependencies
  responseExpression: string; // Required — expression to extract value from response

  // Shared optional fields
  trigger?: 'onChange' | 'debounced'; // Default: 'onChange'
  debounceMs?: number;                // Default: 500 (when trigger: 'debounced')
  condition?: ConditionalExpression | boolean;
  stopOnUserOverride?: boolean;
  reEngageOnDependencyChange?: boolean;
  debugName?: string;
}
```

### Async Function Derivation Fields

```typescript
{
  type: 'derivation';
  source: 'asyncFunction'; // Required — identifies async function mode

  asyncFunctionName: string; // Required — name in customFnConfig.asyncDerivations
  dependsOn: string[];       // Required — explicit field dependencies

  // Shared optional fields
  trigger?: 'onChange' | 'debounced';
  debounceMs?: number;
  condition?: ConditionalExpression | boolean;
  stopOnUserOverride?: boolean;
  reEngageOnDependencyChange?: boolean;
  debugName?: string;
}
```

## Related

- **[Values](./)** — Expression, static value, and function-based derivations
- **[Properties](./property-derivation)** — Derive component properties from form values
- **[HTTP Conditions](../../conditional-logic/overview/)** — HTTP-driven field visibility and state
- **[Custom Validators](../../../validation/custom-validators/)** — Async and HTTP validation
