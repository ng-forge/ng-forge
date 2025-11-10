# Buttons & Actions

Action buttons provide form submission and navigation controls with Material Design styling. These buttons handle form completion, multi-step navigation, and user interactions.

---

## Submit Button

Form submission button that's automatically disabled when the form is invalid.

### Live Demo

{{ NgDocActions.demo("ButtonIframeDemoComponent") }}

### Basic Usage

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

### Using the Helper Function

For better type safety and convenience:

```typescript
import { submitButton } from '@ng-forge/dynamic-form-material';

submitButton({
  key: 'submit',
  label: 'Create Account',
  props: { color: 'primary' },
});
```

### Props

| Prop    | Type                              | Default     | Description          |
| ------- | --------------------------------- | ----------- | -------------------- |
| `color` | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color |

### Complete Example

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
        checked: false,
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
    // TypeScript infers: { name: string, email: string, terms: boolean }
  }
}
```

### Button States

The submit button automatically handles these states:

#### Disabled When Invalid

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

#### Enabled When Valid

Once all validation passes, the button becomes clickable and emits the form value on submission.

### Handling Submission

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

### Validation Flow

1. User clicks submit button
2. Form validates all fields
3. If invalid: Show validation errors, button remains disabled
4. If valid: Emit submit event with form value

---

## Navigation Buttons

Navigation buttons for multi-step (paged) forms with Material Design styling. Use `next` and `previous` types for page-to-page navigation in wizards and multi-step workflows.

### Live Demo

{{ NgDocActions.demo("ButtonIframeDemoComponent") }}

### Basic Usage

```typescript
import { FormConfig } from '@ng-forge/dynamic-form';

const config = {
  fields: [
    {
      key: 'step1',
      type: 'page',
      title: 'Step 1',
      fields: [
        { key: 'name', type: 'input', value: '', label: 'Name', required: true },
        {
          type: 'next',
          key: 'next',
          label: 'Continue',
          props: { color: 'primary' },
        },
      ],
    },
    {
      key: 'step2',
      type: 'page',
      title: 'Step 2',
      fields: [
        { key: 'email', type: 'input', value: '', label: 'Email', required: true },
        {
          type: 'previous',
          key: 'back',
          label: 'Back',
        },
        {
          type: 'submit',
          key: 'submit',
          label: 'Submit',
          props: { color: 'primary' },
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

### Button Types

#### Next Button

Navigates to the next page in a multi-step form. Automatically disabled when the current page has validation errors.

```typescript
{
  type: 'next',
  key: 'nextButton',
  label: 'Continue',
  props: {
    color: 'primary',
  },
}
```

#### Previous Button

Navigates to the previous page. Always enabled to allow users to go back.

```typescript
{
  type: 'previous',
  key: 'backButton',
  label: 'Back',
  props: {
    color: 'basic',
  },
}
```

### Field Properties

| Property   | Type                   | Description                 |
| ---------- | ---------------------- | --------------------------- |
| `key`      | `string`               | Unique button identifier    |
| `type`     | `'next' \| 'previous'` | Navigation button type      |
| `label`    | `string`               | Button text                 |
| `disabled` | `boolean`              | Manually disable the button |
| `hidden`   | `boolean`              | Hide the button             |

### Props (Material-Specific)

| Prop    | Type                              | Default                              | Description          |
| ------- | --------------------------------- | ------------------------------------ | -------------------- |
| `color` | `'primary' \| 'accent' \| 'warn'` | `'primary'` (next), basic (previous) | Material theme color |

### Helper Functions

Use helper functions for better type safety:

```typescript
import { nextPageButton, previousPageButton } from '@ng-forge/dynamic-form-material';

nextPageButton({
  key: 'next',
  label: 'Continue',
  props: { color: 'primary' },
});

previousPageButton({
  key: 'back',
  label: 'Back',
});
```

### Examples

#### Basic Two-Step Form

```typescript
const config = {
  fields: [
    {
      key: 'personalInfo',
      type: 'page',
      title: 'Personal Information',
      fields: [
        {
          key: 'firstName',
          type: 'input',
          value: '',
          label: 'First Name',
          required: true,
          props: { appearance: 'outline' },
        },
        {
          key: 'lastName',
          type: 'input',
          value: '',
          label: 'Last Name',
          required: true,
          props: { appearance: 'outline' },
        },
        {
          type: 'next',
          key: 'next1',
          label: 'Continue to Contact Info',
          props: { color: 'primary' },
        },
      ],
    },
    {
      key: 'contactInfo',
      type: 'page',
      title: 'Contact Information',
      fields: [
        {
          key: 'email',
          type: 'input',
          value: '',
          label: 'Email',
          required: true,
          email: true,
          props: { type: 'email', appearance: 'outline' },
        },
        {
          key: 'phone',
          type: 'input',
          value: '',
          label: 'Phone',
          props: { type: 'tel', appearance: 'outline' },
        },
        {
          key: 'navigation',
          type: 'row',
          fields: [
            { type: 'previous', key: 'back1', label: 'Back' },
            { type: 'submit', key: 'submit', label: 'Complete', props: { color: 'primary' } },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

#### Three-Step Wizard

```typescript
const config = {
  fields: [
    {
      key: 'step1',
      type: 'page',
      title: 'Account Details',
      description: 'Create your account',
      fields: [
        { key: 'username', type: 'input', value: '', label: 'Username', required: true },
        { key: 'password', type: 'input', value: '', label: 'Password', required: true, props: { type: 'password' } },
        {
          type: 'next',
          key: 'next1',
          label: 'Next: Profile',
          props: { color: 'primary' },
        },
      ],
    },
    {
      key: 'step2',
      type: 'page',
      title: 'Profile Information',
      description: 'Tell us about yourself',
      fields: [
        { key: 'fullName', type: 'input', value: '', label: 'Full Name', required: true },
        { key: 'bio', type: 'textarea', value: '', label: 'Bio', props: { rows: 4 } },
        {
          key: 'nav2',
          type: 'row',
          fields: [
            { type: 'previous', key: 'back2', label: 'Back' },
            { type: 'next', key: 'next2', label: 'Next: Preferences', props: { color: 'primary' } },
          ],
        },
      ],
    },
    {
      key: 'step3',
      type: 'page',
      title: 'Preferences',
      description: 'Customize your experience',
      fields: [
        { key: 'newsletter', type: 'checkbox', checked: true, label: 'Subscribe to newsletter' },
        { key: 'notifications', type: 'toggle', checked: false, label: 'Enable notifications' },
        {
          key: 'nav3',
          type: 'row',
          fields: [
            { type: 'previous', key: 'back3', label: 'Back' },
            { type: 'submit', key: 'submit', label: 'Create Account', props: { color: 'primary' } },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

#### With Custom Button Text

```typescript
const config = {
  fields: [
    {
      key: 'termsPage',
      type: 'page',
      title: 'Terms and Conditions',
      fields: [
        {
          key: 'terms',
          type: 'textarea',
          value: 'Terms and conditions text...',
          label: 'Please review our terms',
          readonly: true,
          props: { rows: 10 },
        },
        {
          key: 'acceptTerms',
          type: 'checkbox',
          checked: false,
          label: 'I have read and accept the terms',
          required: true,
        },
        {
          type: 'next',
          key: 'acceptAndContinue',
          label: 'Accept & Continue',
          props: { color: 'primary' },
        },
      ],
    },
    {
      key: 'registrationPage',
      type: 'page',
      title: 'Registration',
      fields: [
        { key: 'email', type: 'input', value: '', label: 'Email', required: true, email: true },
        {
          key: 'nav',
          type: 'row',
          fields: [
            { type: 'previous', key: 'reviewTerms', label: 'Review Terms Again' },
            { type: 'submit', key: 'register', label: 'Register', props: { color: 'primary' } },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

### Button Behavior

#### Next Button

- **Automatically disabled** when current page has validation errors
- Validates current page before navigating
- Shows validation errors if page is invalid
- Navigates to next page when current page is valid

#### Previous Button

- **Always enabled** (no validation required)
- Allows users to navigate back to fix errors
- Does not trigger validation
- Preserves form state when going back

### Page Navigation Events

Both buttons emit page navigation events:

- `next` button emits `NextPageEvent`
- `previous` button emits `PreviousPageEvent`

The dynamic form component handles these events automatically to change the active page.

### Best Practices

1. **Always include both buttons** on intermediate pages (except first and last)
2. **Use clear labels** that indicate the action or next step
3. **Place Previous on the left**, Next/Submit on the right
4. **Consider using a Row field** to group navigation buttons
5. **Validate incrementally** - each page should validate before proceeding
6. **Show page progress** in page titles (e.g., "Step 1 of 3")
7. **Allow users to go back** - Previous should never be disabled

### Accessibility

Navigation buttons include:

- Proper button semantics
- Keyboard navigation support
- Screen reader announcements
- Focus management between pages
- Disabled state announcements
- Clear button purpose

---

## Related

- [Text Input Fields](../text-inputs) - Input and textarea fields
- [Selection Fields](../selection-fields) - Select, radio, checkbox options
- [Interactive Fields](../interactive-fields) - Toggle, slider, datepicker
- [Validation](../../../../../core/validation/) - Form validation guide
- [Conditional Logic](../../../../../core/conditional-logic/) - Dynamic field behavior
