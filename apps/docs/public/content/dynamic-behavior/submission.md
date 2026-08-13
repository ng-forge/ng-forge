---
title: Submission
slug: dynamic-behavior/submission
description: 'Handle form submission with automatic loading states and submit button disabling.'
---

Form submission in dynamic forms integrates with Angular Signal Forms' native `submit()` function, providing automatic button disabling and loading states.

## Overview

The submission system provides:

- Async form submission with automatic loading state
- Thrown action errors caught and logged
- Automatic submit button disabling during submission
- Configurable button disabled behavior
- Custom disabled logic via `FormStateCondition`

**Note**: The submission mechanism is **optional** - you can still handle submission manually via the `(submitted)` output if you prefer.

## Basic Usage

Configure form submission with the `submission` property:

```typescript
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FieldTree } from '@angular/forms/signals';
import { FormConfig, InferFormValue } from '@ng-forge/dynamic-forms';

const formFields = {
  fields: [
    { type: 'input', key: 'email', label: 'Email', value: '', required: true, email: true },
    { type: 'input', key: 'password', label: 'Password', value: '', required: true, props: { type: 'password' } },
    { type: 'submit', key: 'submit', label: 'Sign In' },
  ],
} as const satisfies FormConfig;

type LoginForm = InferFormValue<typeof formFields.fields>;

@Component({...})
export class LoginFormComponent {
  private http = inject(HttpClient);

  config = {
    ...formFields,
    submission: {
      action: (form: FieldTree<LoginForm>) => this.http.post('/api/login', form().value()),
    },
  };
}
```

## SubmissionConfig

The `submission.action` function receives the form's `FieldTree` instance and can return an Observable or Promise. Read the current value with `form().value()`.

While the action is executing, the form is in a submitting state, enabling automatic button disabling and loading states. Errors thrown by the action are caught and logged by the library, and the form exits the submitting state.

### Server Error Handling

Return a `TreeValidationResult` from the action to attach server errors to specific fields. Each error names its target through `fieldTree`:

```typescript
import { catchError, of } from 'rxjs';

submission: {
  action: (form) => this.http.post('/api/register', form().value()).pipe(
    catchError((error) => {
      if (error.error?.code === 'EMAIL_EXISTS') {
        return of([{ kind: 'server', message: 'Email already exists', fieldTree: form.email }]);
      }
      throw error; // Unexpected errors are caught and logged by the library
    }),
  ),
}
```

Any other resolved value counts as success, so an action that returns a response body straight from `HttpClient` needs no special handling. Returning `null` or `undefined` also completes the submission successfully.

## Button Disabled Behavior

Submit and next page buttons are automatically disabled based on form state. Configure defaults via `options`:

```typescript
const config: FormConfig = {
  fields: [...],
  options: {
    submitButton: {
      disableWhenInvalid: true,      // Disable when form is invalid (default: true)
      disableWhileSubmitting: true,  // Disable during submission (default: true)
    },
    nextButton: {
      disableWhenPageInvalid: true,  // Disable when current page is invalid (default: true)
      disableWhileSubmitting: true,  // Disable during submission (default: true)
    }
  }
};
```

### SubmitButtonOptions

| Option                   | Type      | Default | Description                    |
| ------------------------ | --------- | ------- | ------------------------------ |
| `disableWhenInvalid`     | `boolean` | `true`  | Disable when form is invalid   |
| `disableWhileSubmitting` | `boolean` | `true`  | Disable during form submission |

### NextButtonOptions

| Option                   | Type      | Default | Description                                  |
| ------------------------ | --------- | ------- | -------------------------------------------- |
| `disableWhenPageInvalid` | `boolean` | `true`  | Disable when current page has invalid fields |
| `disableWhileSubmitting` | `boolean` | `true`  | Disable during form submission               |

## Custom Button Logic

Override form-level defaults on individual buttons using the `logic` array:

```typescript
{
  type: 'submit',
  key: 'submit',
  label: 'Submit',
  logic: [
    { type: 'disabled', condition: 'formInvalid' },
    { type: 'disabled', condition: 'formSubmitting' }
  ]
}
```

**Note:** `type: 'submit'` is a UI-integration convenience type that pre-configures the button with `FormSubmitEvent`. Use `type: 'button'` with `event: FormSubmitEvent` for the core API.

### FormStateCondition

Special condition strings for button logic:

| Condition          | Description                                                  |
| ------------------ | ------------------------------------------------------------ |
| `'formInvalid'`    | Evaluates to `true` when the form is invalid                 |
| `'formSubmitting'` | Evaluates to `true` when form submission is in progress      |
| `'pageInvalid'`    | Evaluates to `true` when the current page has invalid fields |

### Logic Precedence

Button disabled state is determined in this order:

1. **Explicit `disabled: true`** - Always wins
2. **Field-level `logic` array** - If present, overrides form-level defaults
3. **Form-level options** - Default behavior from `options.submitButton` or `options.nextButton`

### Advanced Logic Example

Combine form state conditions with custom expressions:

```typescript
{
  type: 'submit',
  key: 'submit',
  label: 'Submit',
  logic: [
    // Disable when form is invalid
    { type: 'disabled', condition: 'formInvalid' },
    // Disable when submitting
    { type: 'disabled', condition: 'formSubmitting' },
    // Also disable if terms not accepted
    {
      type: 'disabled',
      condition: {
        type: 'fieldValue',
        fieldPath: 'acceptTerms',
        operator: 'equals',
        value: false,
      }
    }
  ]
}
```

## Value Exclusion

By default, field values are excluded from the `(submitted)` output when the field is hidden, disabled, or readonly. This prevents stale or irrelevant data from being submitted.

Value exclusion supports a 3-tier configuration hierarchy: **Field > Form > Global** (the most specific level wins). Internal form state and two-way binding are unaffected.

```typescript
// Disable hidden value exclusion for this form
const config: FormConfig = {
  fields: [...],
  options: {
    excludeValueIfHidden: false,
  }
};
```

See the **Value Exclusion** page under Recipes for full documentation on configuration tiers, per-field overrides, and migration instructions.

## Manual Submission

If you prefer manual control, use the `(submitted)` output instead:

```typescript
@Component({
  template: `<form [dynamic-form]="config" (submitted)="onSubmit($event)"></form>`,
})
export class MyFormComponent {
  onSubmit(value: FormValue) {
    this.http.post('/api/submit', value).subscribe();
  }
}
```

## Next Steps

- **[Events](/recipes/events)**: Dispatch and subscribe to form events from inside or outside the form
- **[Schema Validation](/schema-validation/overview)**: Add cross-field validation rules with Angular schemas or Zod
- **[Value Exclusion](/recipes/value-exclusion)**: Control which field values are included in submission output
