Form submission in dynamic forms integrates with Angular Signal Forms' native `submit()` function, providing automatic button disabling, loading states, and server error handling.

## Overview

The submission system provides:

- Async form submission with automatic loading state
- Server-side validation error handling
- Automatic submit button disabling during submission
- Configurable button disabled behavior
- Custom disabled logic via `FormStateCondition`

**Note**: The submission mechanism is **optional** - you can still handle submission manually via the `(submitted)` output if you prefer.

## Basic Usage

Configure form submission with the `submission` property:

```typescript
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FormConfig } from '@ng-forge/dynamic-forms';

@Component({...})
export class LoginFormComponent {
  private http = inject(HttpClient);

  config: FormConfig = {
    fields: [
      { type: 'input', key: 'email', label: 'Email', validation: ['required', 'email'] },
      { type: 'input', key: 'password', label: 'Password', props: { type: 'password' }, validation: ['required'] },
      { type: 'button', key: 'submit', label: 'Sign In', buttonType: 'submit' },
    ],
    submission: {
      action: async (form) => {
        const value = form().value();

        try {
          await firstValueFrom(this.http.post('/api/login', value));
          return undefined; // Success - no errors
        } catch (error) {
          // Return server errors to apply to form fields
          const errors = error.error as { field: string; message: string }[];
          return errors.map((e) => ({
            field: form[e.field as keyof typeof form],
            error: { kind: 'server', message: e.message },
          }));
        }
      },
    },
  };
}
```

## SubmissionConfig

The `submission.action` function receives the form's `FieldTree` and returns a Promise:

| Return Value             | Meaning                           |
| ------------------------ | --------------------------------- |
| `undefined` or `null`    | Successful submission             |
| `TreeValidationResult[]` | Array of server validation errors |

While the action is executing, `form().submitting()` is `true`, enabling automatic button disabling and loading states.

### Server Error Handling

Return validation errors to apply them to specific fields:

```typescript
submission: {
  action: async (form) => {
    try {
      await firstValueFrom(this.http.post('/api/register', form().value()));
      return undefined;
    } catch (error) {
      if (error.error?.code === 'EMAIL_EXISTS') {
        return [
          {
            field: form.email,
            error: { kind: 'server', message: 'Email already exists' },
          },
        ];
      }
      throw error; // Re-throw unexpected errors
    }
  },
}
```

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
  type: 'button',
  key: 'submit',
  label: 'Submit',
  buttonType: 'submit',
  logic: [
    { type: 'disabled', condition: 'formInvalid' },
    { type: 'disabled', condition: 'formSubmitting' }
  ]
}
```

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
  type: 'button',
  key: 'submit',
  label: 'Submit',
  buttonType: 'submit',
  logic: [
    // Disable when form is invalid
    { type: 'disabled', condition: 'formInvalid' },
    // Disable when submitting
    { type: 'disabled', condition: 'formSubmitting' },
    // Also disable if terms not accepted
    { type: 'disabled', condition: { '===': [{ var: 'acceptTerms' }, false] } }
  ]
}
```

## Manual Submission

If you prefer manual control, use the `(submitted)` output instead:

```typescript
@Component({
  template: ` <dynamic-form [config]="config" [value]="value" (submitted)="onSubmit($event)" /> `,
})
export class MyFormComponent {
  async onSubmit(event: { form: FieldTree<FormValue>; value: FormValue }) {
    try {
      await this.api.submit(event.value);
    } catch (error) {
      // Handle errors manually
    }
  }
}
```

## Best Practices

**Use submission config for server interactions:**

- Automatic loading state management
- Built-in server error handling
- Button states managed automatically

**Configure form-level defaults:**

- Set defaults in `options.submitButton` for consistent behavior
- Override on specific buttons only when needed

**Handle errors gracefully:**

- Return validation errors for user-correctable issues
- Re-throw unexpected errors for error boundaries

**Keep actions simple:**

```typescript
// Good - focused on submission
action: async (form) => {
  const result = await firstValueFrom(this.http.post<{ errors?: [] }>('/api/submit', form().value()));
  return result.errors ?? undefined;
},

// Avoid - mixing concerns
action: async (form) => {
  analytics.track('submit'); // Side effect
  showLoadingSpinner(); // UI concern
  await firstValueFrom(this.http.post('/api/submit', form().value()));
  redirectToSuccess(); // Navigation
},
```
