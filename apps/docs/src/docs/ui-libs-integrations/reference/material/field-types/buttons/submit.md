# Submit Button

Form submission button that's automatically disabled when the form is invalid.

## Live Demo

{{ NgDocActions.demo("ButtonIframeDemoComponent") }}

## Basic Usage

```typescript
{
  type: 'submit',
  key: 'submit',
  label: 'Create Account',
  props: {
    color: 'primary',
  },
}
```

The submit button automatically:
- Disables when the form is invalid
- Emits a `SubmitEvent` when clicked
- Validates all fields before submission

## Using the Helper Function

For better type safety and convenience:

```typescript
import { submitButton } from '@ng-forge/dynamic-form-material';

submitButton({
  key: 'submit',
  label: 'Create Account',
  props: { color: 'primary' },
})
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color |

## Complete Example

```typescript
import { Component, signal } from '@angular/core';
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-form';
import { submitButton } from '@ng-forge/dynamic-form-material';

@Component({
  selector: 'app-registration-form',
  imports: [DynamicForm],
  template: `<dynamic-form [config]="config" (submit)="onSubmit($event)" />`,
})
export class RegistrationFormComponent {
  config = {
    fields: [
      {
        key: 'name',
        type: 'input',
        label: 'Full Name',
        value: '',
        required: true,
        props: { appearance: 'outline' },
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        value: '',
        required: true,
        email: true,
        props: {
          type: 'email',
          appearance: 'outline',
        },
      },
      {
        key: 'terms',
        type: 'checkbox',
        label: 'I accept the terms and conditions',
        required: true,
      },
      submitButton({
        key: 'submit',
        label: 'Create Account',
        props: { color: 'primary' },
      }),
    ],
  } as const satisfies FormConfig;

  onSubmit(value: unknown) {
    console.log('Form submitted:', value);
    // TypeScript infers: { name: string, email: string, terms?: boolean }
  }
}
```

## Button States

The submit button automatically handles these states:

### Disabled When Invalid

```typescript
// Button is disabled until all required fields are valid
{
  fields: [
    { key: 'email', type: 'input', value: '', required: true, email: true },
    { key: 'password', type: 'input', value: '', required: true, minLength: 8 },
    { type: 'submit', key: 'submit', label: 'Sign In' },
  ],
}
```

### Enabled When Valid

Once all validation passes, the button becomes clickable and emits the form value on submission.

## Handling Submission

Listen for the submit event on the `<dynamic-form>` component:

```typescript
@Component({
  template: `<dynamic-form [config]="config" (submit)="onSubmit($event)" />`,
})
export class MyComponent {
  onSubmit(value: unknown) {
    // Handle form submission
    console.log('Submitted:', value);
  }
}
```

## Validation Flow

1. User clicks submit button
2. Form validates all fields
3. If invalid: Show validation errors, button remains disabled
4. If valid: Emit submit event with form value

## Related

- [Navigation Buttons](./navigation) - Next/Previous for multi-step forms
- [Custom Buttons](./custom) - Custom action buttons with events
- [Validation](/core-concepts/validation) - Form validation guide
