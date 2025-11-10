# Material Design Overview & Setup

Beautiful Material Design field components for ng-forge dynamic forms, built with Angular Material.

## Installation

Install the package and its peer dependencies:

```bash
npm install @ng-forge/dynamic-form @ng-forge/dynamic-form-material @angular/material @angular/cdk
```

## Quick Start

### 1. Configure Providers

Add Material Design field types to your application:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [provideAnimations(), provideDynamicForm(...withMaterialFields())],
};
```

### 2. Import Material Theme

Add a Material Design theme to your styles:

```scss
// styles.scss
@use '@angular/material' as mat;

@include mat.core();

$my-primary: mat.define-palette(mat.$indigo-palette);
$my-accent: mat.define-palette(mat.$pink-palette);
$my-warn: mat.define-palette(mat.$red-palette);

$my-theme: mat.define-light-theme(
  (
    color: (
      primary: $my-primary,
      accent: $my-accent,
      warn: $my-warn,
    ),
  )
);

@include mat.all-component-themes($my-theme);
```

### 3. Create Your First Form

```typescript
import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-contact-form',
  imports: [DynamicForm, JsonPipe],
  template: `
    <dynamic-form [config]="config" [(value)]="formValue" />
    @let value = formValue();
    <pre>{{ value | json }}</pre>
  `,
})
export class ContactFormComponent {
  formValue = signal({});

  config = {
    fields: [
      {
        key: 'name',
        type: 'input',
        label: 'Full Name',
        required: true,
        props: {
          appearance: 'outline',
        },
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        required: true,
        email: true,
        props: {
          type: 'email',
          appearance: 'outline',
        },
      },
      {
        key: 'message',
        type: 'textarea',
        label: 'Message',
        required: true,
        minLength: 10,
        props: {
          appearance: 'outline',
          rows: 4,
        },
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Send Message',
        props: {
          color: 'primary',
        },
      },
    ],
  } as const satisfies FormConfig;
}
```

## Complete Form Example

Here's a full registration form showcasing multiple Material Design field types:

{{ NgDocActions.demo("CompleteFormIframeDemoComponent") }}

This example demonstrates:

- Text inputs with validation
- Select dropdowns
- Checkboxes and toggles
- Radio buttons
- Date pickers
- Sliders
- Multi-checkbox selections
- Form submission

## Available Field Types

Material Design integration provides all common form field types:

### Text Input Fields

- **[Input](./field-types/text-input/input)** - Text, email, password, number inputs
- **[Textarea](./field-types/text-input/textarea)** - Multi-line text input

### Selection Fields

- **[Select](./field-types/selection/select)** - Dropdown selection (single or multi)
- **[Radio](./field-types/selection/radio)** - Radio button group
- **[Checkbox](./field-types/selection/checkbox)** - Boolean checkbox
- **[Multi-Checkbox](./field-types/selection/multi-checkbox)** - Multiple checkbox selection

### Interactive Fields

- **[Toggle](./field-types/interactive/toggle)** - Slide toggle switch
- **[Slider](./field-types/interactive/slider)** - Numeric slider
- **[Datepicker](./field-types/interactive/datepicker)** - Date selection with calendar

### Buttons & Actions

- **[Submit Button](./field-types/buttons/submit)** - Form submission
- **[Navigation Buttons](./field-types/buttons/navigation)** - Next/Previous for multi-step forms
- **[Custom Buttons](./field-types/buttons/custom)** - Custom action buttons with events

## Theming

Material components automatically inherit your Angular Material theme. Customize colors using Material's theming system:

```typescript
// Field with custom color
{
  key: 'agreeToTerms',
  type: 'checkbox',
  label: 'I agree to the terms and conditions',
  props: {
    color: 'accent', // 'primary' | 'accent' | 'warn'
  },
}
```

## Common Props

All Material fields support these common properties:

| Prop              | Type                              | Default     | Description                       |
| ----------------- | --------------------------------- | ----------- | --------------------------------- |
| `appearance`      | `'fill' \| 'outline'`             | `'fill'`    | Form field appearance style       |
| `color`           | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Theme color                       |
| `hint`            | `string`                          | -           | Helper text displayed below field |
| `subscriptSizing` | `'fixed' \| 'dynamic'`            | `'fixed'`   | Error/hint spacing behavior       |

## Accessibility

All Material Design components include:

- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Error announcements

## Next Steps

- Explore [Field Types](./field-types/text-input/input) for detailed field documentation
- Check out [Examples & Patterns](../../../../examples/) for real-world use cases
- Learn about [Validation](../../../../core/validation/) for form validation
- See [Type Safety](../../../../core/type-safety/) for TypeScript integration
