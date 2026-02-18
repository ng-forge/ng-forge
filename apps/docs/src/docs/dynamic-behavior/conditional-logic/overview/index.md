Control field behavior dynamically based on form state. Dynamic forms provides a declarative API for conditional visibility, required state, and readonly state that maps directly to Angular's signal forms.

## Signal Forms Integration

The library integrates with Angular's signal forms logic functions:

```typescript
import { hidden, readonly, required } from '@angular/forms/signals';
```

All conditional logic configuration is applied using these functions, providing:

- **Reactive updates** when form state changes
- **Type-safe** conditional expressions
- **Automatic re-evaluation** on dependencies
- **Integration** with form validation state

## Static Properties

Use simple boolean properties for fields with fixed states.

### hidden

Hide a field from view (field still participates in form state):

```typescript
{
  key: 'internalId',
  type: 'input',
  value: '',
  label: 'Internal ID',
  hidden: true,
}
```

The field is hidden from the UI but still included in the form value.

### disabled

Disable user interaction:

```typescript
{
  key: 'systemField',
  type: 'input',
  value: 'auto-generated',
  label: 'System Field',
  disabled: true,
}
```

**Note:** The `disabled` property is handled at the component level and does not use signal forms logic functions. It's a static UI property that prevents user interaction.

### readonly

Make a field read-only (displays value but prevents modification):

```typescript
{
  key: 'createdAt',
  type: 'input',
  value: '2024-01-15',
  label: 'Created Date',
  readonly: true,
}
```

## Dynamic Conditional Logic

For conditional behavior based on form state, use the `logic` array with `LogicConfig` objects.

```typescript
interface LogicConfig {
  /** Logic type */
  type: 'hidden' | 'readonly' | 'disabled' | 'required';

  /** Boolean expression, static value, or form state condition */
  condition: ConditionalExpression | boolean | FormStateCondition;
}
```

`FormStateCondition` values (`'formInvalid'`, `'formSubmitting'`, `'pageInvalid'`) are primarily used for button disabled logic.

### Conditional Visibility (hidden)

Show or hide fields based on other field values.

#### Show Email When Contact Method is Email

```typescript
{
  key: 'contactMethod',
  type: 'select',
  value: '',
  options: [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
  ],
}
{
  key: 'email',
  type: 'input',
  value: '',
  label: 'Email Address',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'contactMethod',
      operator: 'notEquals',
      value: 'email',
    },
  }],
}
```

When `contactMethod !== 'email'`, the email field is hidden.

### Conditional Required

Make fields required based on conditions.

#### Tax ID Required for Business Accounts

```typescript
{
  key: 'accountType',
  type: 'radio',
  value: 'personal',
  options: [
    { value: 'personal', label: 'Personal' },
    { value: 'business', label: 'Business' },
  ],
}
{
  key: 'taxId',
  type: 'input',
  value: '',
  label: 'Tax ID',
  logic: [{
    type: 'required',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'equals',
      value: 'business',
    },
  }],
}
```

### Conditional Readonly

Make fields read-only based on conditions.

#### Lock Field After Submission

```typescript
{
  key: 'status',
  type: 'select',
  value: 'draft',
  options: [
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
  ],
}
{
  key: 'documentNumber',
  type: 'input',
  value: '',
  label: 'Document Number',
  logic: [{
    type: 'readonly',
    condition: {
      type: 'fieldValue',
      fieldPath: 'status',
      operator: 'equals',
      value: 'submitted',
    },
  }],
}
```

Once status is "submitted", the document number becomes read-only.

## Basic Conditional Expression

The most common conditional expression checks a specific field's value:

```typescript
{
  type: 'fieldValue',
  fieldPath: 'fieldKey',
  operator: 'equals',
  value: 'expectedValue',
}
```

**Components:**

- `type: 'fieldValue'` - Check a specific field
- `fieldPath` - The field key to check
- `operator` - Comparison operator (see [All Operators](#all-operators))
- `value` - Value to compare against

## Quick Example

Show a field only when another field has a specific value:

```typescript
{
  key: 'email',
  type: 'input',
  value: '',
  label: 'Email Address',
  logic: [
    {
      type: 'hidden',
      condition: {
        type: 'fieldValue',
        fieldPath: 'contactMethod',
        operator: 'notEquals',
        value: 'email',
      },
    },
    {
      type: 'required',
      condition: {
        type: 'fieldValue',
        fieldPath: 'contactMethod',
        operator: 'equals',
        value: 'email',
      },
    },
  ],
}
```

This field is hidden unless `contactMethod === 'email'`, and required when visible. See the [Examples](/examples) page for complete form implementations.

## When Logic Runs

Conditional logic is evaluated:

- **On form value change** - Any time a dependent field changes
- **On initialization** - When the form is created
- **Reactively** - Uses Angular's signal forms for automatic updates

### Evaluation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    LOGIC EVALUATION FLOW                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Form Value Changes                                         │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────┐                                       │
│  │ Signal Updates  │◄──── Angular's reactive system        │
│  └────────┬────────┘                                       │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                       │
│  │ Evaluate logic  │                                       │
│  │    conditions   │                                       │
│  └────────┬────────┘                                       │
│           │                                                 │
│     ┌─────┴─────┐                                          │
│     ▼           ▼                                          │
│  ┌──────┐   ┌──────┐                                       │
│  │ true │   │false │                                       │
│  └──┬───┘   └──┬───┘                                       │
│     │          │                                            │
│     ▼          ▼                                            │
│  Apply      Remove                                          │
│  effect     effect                                          │
│  (hide,     (show,                                          │
│  require,   optional,                                       │
│  readonly)  editable)                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Expression Types

### fieldValue

Check a specific field's value - the most common expression type.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'accountType',
  operator: 'equals',
  value: 'business',
}
```

**Use when:** Checking a single field's value

**Example:**

```typescript
{
  key: 'companyName',
  type: 'input',
  value: '',
  logic: [{
    type: 'required',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'equals',
      value: 'business',
    },
  }],
}
```

### formValue

Compare the entire form value object against a specific value using operators.

```typescript
{
  type: 'formValue',
  operator: 'equals',
  value: { status: 'active', role: 'admin' },
}
```

**Use when:** Checking if the entire form matches a specific state

**Note:** This type is rarely useful in practice — deep equality on an entire form object is an unusual requirement. For conditions that involve multiple specific fields, use `javascript` or `custom` expressions instead (e.g. `formValue.status === 'active' && formValue.role === 'admin'`).

### javascript

JavaScript expressions with access to `fieldValue` (current field) and `formValue` (entire form).

```typescript
{
  type: 'javascript',
  expression: 'new Date(fieldValue) > new Date()',
}
```

**Use when:** Custom logic on field value or complex multi-field conditions

**Examples:**

```typescript
// Check current field value
{
  key: 'eventDate',
  type: 'datepicker',
  value: null,
  logic: [{
    type: 'readonly',
    condition: {
      type: 'javascript',
      expression: 'new Date(fieldValue) < new Date()',
    },
  }],
}

// Check multiple form fields (replaces old formValue expression pattern)
{
  key: 'stateProvince',
  type: 'select',
  value: '',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'javascript',
      expression: 'formValue.country !== "US" && formValue.country !== "CA"',
    },
  }],
}
```

**Safe member access:** Accessing nested properties on `null` or `undefined` returns `undefined` (no errors thrown):

```typescript
{
  type: 'javascript',
  // Safe even when user, profile, or preferences is null/undefined
  expression: 'formValue.user.profile.preferences.notifications === true',
}
```

### custom

Advanced custom expressions with access to both field and form values.

```typescript
{
  type: 'custom',
  expression: 'fieldValue > formValue.minAge && fieldValue < formValue.maxAge',
}
```

**Safe member access:** Like `formValue` expressions, nested property access is safe:

```typescript
{
  type: 'custom',
  // Safe even when nested values are null/undefined
  expression: 'fieldValue !== formValue.user.profile.firstName',
}
```

### Field State in Expressions

`javascript` and `custom` expressions have access to two additional variables for querying field interaction state:

- **`fieldState`** — the current field's own state
- **`formFieldState`** — state of any field in the form, by key

#### fieldState

Use `fieldState` to react to the current field's own interaction state:

```typescript
// Lock the field as soon as the user edits it
{
  key: 'accountNumber',
  type: 'input',
  logic: [{
    type: 'readonly',
    condition: {
      type: 'javascript',
      expression: 'fieldState.dirty',
    },
  }],
}
```

**Available properties:**

| Property   | Type      | Description                         |
| ---------- | --------- | ----------------------------------- |
| `touched`  | `boolean` | User has focused and left the field |
| `dirty`    | `boolean` | User has changed the field value    |
| `pristine` | `boolean` | Equivalent to `!dirty`              |
| `valid`    | `boolean` | Field has no validation errors      |
| `invalid`  | `boolean` | Field has validation errors         |
| `pending`  | `boolean` | Async validation is in progress     |
| `hidden`   | `boolean` | Field is currently hidden           |
| `readonly` | `boolean` | Field is currently readonly         |
| `disabled` | `boolean` | Field is currently disabled         |

#### formFieldState

Use `formFieldState` to react to another field's state. Access by field key:

```typescript
// Make a field readonly once a related field has been touched
{
  key: 'billingAddress',
  type: 'input',
  logic: [{
    type: 'readonly',
    condition: {
      type: 'javascript',
      expression: 'formFieldState.shippingAddress.dirty',
    },
  }],
}
```

`formFieldState` has the same properties as `fieldState`, keyed by field name.

**Example — show a confirmation field only after the primary field is dirty:**

```typescript
{
  key: 'confirmEmail',
  type: 'input',
  label: 'Confirm Email',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'javascript',
      expression: '!formFieldState.email.dirty',
    },
  }],
}
```

### http

Evaluate a condition by sending an HTTP request and inspecting the response. The request fires automatically when declared query params change, with built-in debouncing.

```typescript
{
  type: 'http',
  http: {
    url: '/api/permissions',
    queryParams: {
      role: 'formValue.userRole',
    },
  },
  responseExpression: 'response.canEdit',
  pendingValue: false,
}
```

**Use when:** Field visibility or state must be determined server-side (permissions, feature flags, country-specific rules).

**Full example — hide an admin panel based on server permissions:**

```typescript
{
  key: 'adminPanel',
  type: 'input',
  label: 'Admin Panel Access Code',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'http',
      http: {
        url: '/api/permissions',
        queryParams: {
          role: 'formValue.userRole',
        },
      },
      responseExpression: 'response.hideAdminPanel',
      pendingValue: true, // Hide while checking
    },
  }],
}
```

**HTTP condition properties:**

| Property             | Type                | Required | Default      | Description                                                              |
| -------------------- | ------------------- | -------- | ------------ | ------------------------------------------------------------------------ |
| `type`               | `'http'`            | Yes      | —            | Identifies this as an HTTP condition                                     |
| `http`               | `HttpRequestConfig` | Yes      | —            | Request configuration (see below)                                        |
| `responseExpression` | `string`            | No       | `!!response` | Expression evaluated with `{ response }` in scope. Must return a boolean |
| `pendingValue`       | `boolean`           | No       | `false`      | Value returned while the request is in-flight                            |
| `cacheDurationMs`    | `number`            | No       | `30000`      | How long to cache responses (ms)                                         |
| `debounceMs`         | `number`            | No       | `300`        | Debounce delay before re-sending (ms)                                    |

**`HttpRequestConfig` quick reference:**

| Property                  | Description                                                              |
| ------------------------- | ------------------------------------------------------------------------ |
| `url`                     | Request URL                                                              |
| `method`                  | HTTP method. Defaults to `'GET'`                                         |
| `queryParams`             | Key/value map. Values are expressions evaluated against form context     |
| `body`                    | Request body for POST/PUT/PATCH                                          |
| `evaluateBodyExpressions` | When `true`, top-level `body` string values are evaluated as expressions |
| `headers`                 | Request headers                                                          |

**HTTP condition on `required` — server-driven required fields:**

```typescript
{
  key: 'taxId',
  type: 'input',
  logic: [{
    type: 'required',
    condition: {
      type: 'http',
      http: {
        url: '/api/tax-rules',
        queryParams: { country: 'formValue.country' },
      },
      responseExpression: 'response.taxIdRequired',
      pendingValue: false, // Optional while checking
    },
  }],
}
```

### async

Evaluate a condition using a custom async function registered in `customFnConfig.asyncConditions`. Functions receive the full form context and must return a `Promise<boolean>` or `Observable<boolean>`.

```typescript
{
  type: 'async',
  asyncFunctionName: 'checkPermission',
  pendingValue: false,
}
```

**Use when:** Condition logic involves Angular service injection, complex async operations, or anything that `http` conditions cannot express directly.

> **Why `inject()` works here:** `customFnConfig` functions are called within an Angular injection context, so Angular's `inject()` API is available — the same way it works in a constructor or field initializer. Import `inject` from `@angular/core` as usual.

**Registration and usage:**

```typescript
import { inject } from '@angular/core';

const formConfig = {
  customFnConfig: {
    asyncConditions: {
      checkReadonly: (context) => {
        return inject(PermissionsService).canEdit(context.formValue.resourceId as string);
      },
    },
  },

  fields: [
    {
      key: 'salary',
      type: 'input',
      label: 'Salary',
      logic: [
        {
          type: 'readonly',
          condition: {
            type: 'async',
            asyncFunctionName: 'checkReadonly',
            pendingValue: false, // Editable while checking
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

**Async condition properties:**

| Property            | Type      | Required | Default | Description                                         |
| ------------------- | --------- | -------- | ------- | --------------------------------------------------- |
| `type`              | `'async'` | Yes      | —       | Identifies this as an async condition               |
| `asyncFunctionName` | `string`  | Yes      | —       | Name registered in `customFnConfig.asyncConditions` |
| `pendingValue`      | `boolean` | No       | `false` | Value returned while the function is resolving      |
| `debounceMs`        | `number`  | No       | `300`   | Debounce delay before re-evaluating (ms)            |

**Choosing `pendingValue`:**

The right `pendingValue` depends on the logic type and desired UX:

| Logic type | `pendingValue: false`   | `pendingValue: true`    |
| ---------- | ----------------------- | ----------------------- |
| `hidden`   | Visible while checking  | Hidden while checking   |
| `required` | Optional while checking | Required while checking |
| `readonly` | Editable while checking | Readonly while checking |
| `disabled` | Enabled while checking  | Disabled while checking |

## All Operators

### Equality Operators

#### equals

Exact match comparison.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'status',
  operator: 'equals',
  value: 'active',
}
```

#### notEquals

Not equal to comparison.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'status',
  operator: 'notEquals',
  value: 'archived',
}
```

### Comparison Operators

#### greater

Greater than comparison (numbers/dates).

```typescript
{
  type: 'fieldValue',
  fieldPath: 'age',
  operator: 'greater',
  value: 18,
}
```

#### less

Less than comparison.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'quantity',
  operator: 'less',
  value: 100,
}
```

#### greaterOrEqual

Greater than or equal to.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'age',
  operator: 'greaterOrEqual',
  value: 21,
}
```

#### lessOrEqual

Less than or equal to.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'discount',
  operator: 'lessOrEqual',
  value: 100,
}
```

### String Operators

#### contains

Check if string/array contains value.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'email',
  operator: 'contains',
  value: '@company.com',
}
```

#### startsWith

Check if string starts with value.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'url',
  operator: 'startsWith',
  value: 'https://',
}
```

#### endsWith

Check if string ends with value.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'email',
  operator: 'endsWith',
  value: '.gov',
}
```

#### matches

Regular expression match.

```typescript
{
  type: 'fieldValue',
  fieldPath: 'zipCode',
  operator: 'matches',
  value: '^[0-9]{5}$',
}
```

## Combining Conditions

### AND Logic

All conditions must be true.

```typescript
{
  type: 'and',
  conditions: [
    {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'equals',
      value: 'business',
    },
    {
      type: 'fieldValue',
      fieldPath: 'hasTeam',
      operator: 'equals',
      value: true,
    },
    {
      type: 'fieldValue',
      fieldPath: 'teamSize',
      operator: 'greater',
      value: 5,
    },
  ],
}
```

**Use case:** Field required when all conditions are met.

```typescript
{
  key: 'enterpriseFeatures',
  type: 'checkbox',
  label: 'Enable Enterprise Features',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'and',
      conditions: [
        {
          type: 'fieldValue',
          fieldPath: 'accountType',
          operator: 'equals',
          value: 'business',
        },
        {
          type: 'fieldValue',
          fieldPath: 'plan',
          operator: 'equals',
          value: 'enterprise',
        },
      ],
    },
  }],
}
```

### OR Logic

At least one condition must be true.

```typescript
{
  type: 'or',
  conditions: [
    {
      type: 'fieldValue',
      fieldPath: 'role',
      operator: 'equals',
      value: 'admin',
    },
    {
      type: 'fieldValue',
      fieldPath: 'role',
      operator: 'equals',
      value: 'owner',
    },
  ],
}
```

**Use case:** Show field for multiple roles — hide unless role is `admin` or `owner`.

```typescript
// Hide the panel when role is neither 'admin' nor 'owner'
// (i.e. hidden when notEquals 'admin' AND notEquals 'owner')
{
  key: 'adminPanel',
  type: 'group',
  label: 'Administration',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'and',
      conditions: [
        {
          type: 'fieldValue',
          fieldPath: 'role',
          operator: 'notEquals',
          value: 'admin',
        },
        {
          type: 'fieldValue',
          fieldPath: 'role',
          operator: 'notEquals',
          value: 'owner',
        },
      ],
    },
  }],
}
```

### Nested Logic

Combine AND/OR logic for complex conditions.

```typescript
{
  type: 'and',
  conditions: [
    {
      type: 'fieldValue',
      fieldPath: 'country',
      operator: 'equals',
      value: 'US',
    },
    {
      type: 'or',
      conditions: [
        {
          type: 'fieldValue',
          fieldPath: 'age',
          operator: 'greaterOrEqual',
          value: 21,
        },
        {
          type: 'fieldValue',
          fieldPath: 'hasParentalConsent',
          operator: 'equals',
          value: true,
        },
      ],
    },
  ],
}
```

This means: "Country must be US AND (age >= 21 OR has parental consent)"

## Practical Examples

### Show Field Based on Multiple Conditions

```typescript
{
  key: 'internationalShipping',
  type: 'checkbox',
  label: 'Enable International Shipping',
  logic: [{
    type: 'hidden',
    condition: {
      type: 'or',
      conditions: [
        {
          type: 'fieldValue',
          fieldPath: 'accountType',
          operator: 'equals',
          value: 'free',
        },
        {
          type: 'fieldValue',
          fieldPath: 'verified',
          operator: 'equals',
          value: false,
        },
      ],
    },
  }],
}
```

Hidden for free accounts OR unverified accounts.

### Required Field with Complex Logic

```typescript
{
  key: 'taxExemptionNumber',
  type: 'input',
  value: '',
  label: 'Tax Exemption Number',
  logic: [{
    type: 'required',
    condition: {
      type: 'and',
      conditions: [
        {
          type: 'fieldValue',
          fieldPath: 'accountType',
          operator: 'equals',
          value: 'business',
        },
        {
          type: 'fieldValue',
          fieldPath: 'claimsTaxExemption',
          operator: 'equals',
          value: true,
        },
        {
          type: 'or',
          conditions: [
            {
              type: 'fieldValue',
              fieldPath: 'country',
              operator: 'equals',
              value: 'US',
            },
            {
              type: 'fieldValue',
              fieldPath: 'country',
              operator: 'equals',
              value: 'CA',
            },
          ],
        },
      ],
    },
  }],
}
```

### Dynamic Read-Only Based on Status

```typescript
{
  key: 'orderItems',
  type: 'group',
  label: 'Order Items',
  logic: [{
    type: 'readonly',
    condition: {
      type: 'or',
      conditions: [
        {
          type: 'fieldValue',
          fieldPath: 'orderStatus',
          operator: 'equals',
          value: 'shipped',
        },
        {
          type: 'fieldValue',
          fieldPath: 'orderStatus',
          operator: 'equals',
          value: 'delivered',
        },
        {
          type: 'fieldValue',
          fieldPath: 'orderStatus',
          operator: 'equals',
          value: 'cancelled',
        },
      ],
    },
  }],
}
```

Order items become read-only once order is shipped, delivered, or cancelled.

## Best Practices

**Keep conditions readable:**

```typescript
// ✅ Good - Easy to understand
{
  type: 'fieldValue',
  fieldPath: 'accountType',
  operator: 'equals',
  value: 'business',
}

// ❌ Avoid - Hard to maintain
{
  type: 'formValue',
  expression: 'formValue.accountType === "business" && formValue.country !== null && formValue.hasTeam',
}
```

## ConditionalExpression Interface

`ConditionalExpression` is a discriminated union of all expression types:

```typescript
// Sync expressions
type ConditionalExpression =
  | { type: 'fieldValue'; fieldPath: string; operator: Operator; value: unknown }
  | { type: 'formValue'; operator: Operator; value: unknown }
  | { type: 'javascript'; expression: string }
  | { type: 'custom'; expression: string }
  | { type: 'and'; conditions: ConditionalExpression[] }
  | { type: 'or'; conditions: ConditionalExpression[] }
  // Async expressions
  | HttpCondition
  | AsyncCondition;

type Operator =
  | 'equals'
  | 'notEquals'
  | 'greater'
  | 'less'
  | 'greaterOrEqual'
  | 'lessOrEqual'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'matches';

interface HttpCondition {
  type: 'http';
  http: HttpRequestConfig;
  responseExpression?: string; // Evaluated with { response }. Defaults to !!response
  pendingValue?: boolean; // Default: false
  cacheDurationMs?: number; // Default: 30000
  debounceMs?: number; // Default: 300
}

interface AsyncCondition {
  type: 'async';
  asyncFunctionName: string;
  pendingValue?: boolean; // Default: false
  debounceMs?: number; // Default: 300
}
```

**Expression types summary:**

| Type         | Sync/Async | Key properties                   | Purpose                                                               |
| ------------ | ---------- | -------------------------------- | --------------------------------------------------------------------- |
| `fieldValue` | Sync       | `fieldPath`, `operator`, `value` | Compare a specific field's value                                      |
| `formValue`  | Sync       | `operator`, `value`              | Compare entire form object                                            |
| `javascript` | Sync       | `expression`                     | Custom JS with `fieldValue`/`formValue`/`fieldState`/`formFieldState` |
| `custom`     | Sync       | `expression`                     | Inline expression with `fieldValue`/`formValue` (safe member access)  |
| `and`/`or`   | Sync       | `conditions`                     | Combine multiple conditions                                           |
| `http`       | Async      | `http`, `responseExpression`     | Server-driven condition via HTTP request                              |
| `async`      | Async      | `asyncFunctionName`              | Custom async function registered in config                            |

## Common Patterns

### Show/Hide Field Pattern

```typescript
logic: [
  {
    type: 'hidden',
    condition: {
      /* when to hide */
    },
  },
];
```

### Conditional Required Pattern

```typescript
logic: [
  {
    type: 'hidden',
    condition: {
      /* when to hide */
    },
  },
  {
    type: 'required',
    condition: {
      /* when to require */
    },
  },
];
```

### Multiple Conditions Pattern

```typescript
logic: [
  {
    type: 'hidden',
    condition: {
      type: 'and', // or 'or'
      conditions: [
        {
          /* condition 1 */
        },
        {
          /* condition 2 */
        },
      ],
    },
  },
];
```

## External Data in Conditions

Access external application state (user roles, permissions, feature flags) in conditions using `externalData`:

```typescript
const config = {
  externalData: {
    userRole: computed(() => authService.role()),
    featureFlags: computed(() => ({
      advancedMode: featureService.isAdvanced(),
    })),
  },
  fields: [
    {
      key: 'adminNotes',
      type: 'textarea',
      label: 'Admin Notes',
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
    {
      key: 'advancedSettings',
      type: 'input',
      label: 'Advanced Settings',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'javascript',
            expression: 'externalData.featureFlags.advancedMode !== true',
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

**Key points:**

- Each property in `externalData` must be a Signal (`signal()` or `computed()`)
- Changes to external signals automatically re-evaluate conditions
- Access values via `externalData.propertyName` in JavaScript expressions

## Related

- **[Value Derivation](../value-derivation/basics/)** — Computed field values
- **[Async Derivation](../value-derivation/async/)** — HTTP and async function derivations, stopOnUserOverride
- **[Validation](../../validation/basics/)** — Conditional validation
- **[Custom Validators](../../validation/custom-validators/)** — Async and HTTP validators
- **[Type Safety](../../advanced/type-safety/basics/)** — TypeScript integration
- **[Examples](/examples)** — Real-world form patterns
