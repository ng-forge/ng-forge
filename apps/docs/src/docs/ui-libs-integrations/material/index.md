Beautiful Material Design field components for ng-forge dynamic forms, built with Angular Material.

---

## Installation

Install the package and its peer dependencies:

```bash group="install" name="npm"
npm install @ng-forge/dynamic-forms @ng-forge/dynamic-forms-material @angular/material @angular/cdk
```

```bash group="install" name="yarn"
yarn add @ng-forge/dynamic-forms @ng-forge/dynamic-forms-material @angular/material @angular/cdk
```

```bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-forms @ng-forge/dynamic-forms-material @angular/material @angular/cdk
```

## Quick Start

### 1. Configure Providers

Add Material Design field types to your application:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [provideAnimations(), provideDynamicForm(...withMaterialFields())],
};
```

### 2. Import Material Theme

Add a Material Design theme to your styles:

```scss name="styles.scss"
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
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-contact-form',
  imports: [DynamicForm, JsonPipe],
  template: `
    <form [dynamic-form]="config" [(value)]="formValue"></form>
    @let value = formValue();
    <pre>{% raw %}{{ value | json }}{% endraw %}</pre>
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

## Configuration Options

Configure default props at the library, form, or field level.

Use `MatFormConfig` for type-safe form configurations with Material-specific props.

### Available Options

| Option            | Type                              | Default     | Description                   |
| ----------------- | --------------------------------- | ----------- | ----------------------------- |
| `appearance`      | `'fill' \| 'outline'`             | `'fill'`    | Form field visual style       |
| `subscriptSizing` | `'fixed' \| 'dynamic'`            | `'fixed'`   | Error/hint spacing behavior   |
| `color`           | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Theme color for controls      |
| `labelPosition`   | `'before' \| 'after'`             | `'after'`   | Label position for checkboxes |
| `disableRipple`   | `boolean`                         | `false`     | Disable ripple effect         |

---

## Type Augmentation

Importing this package automatically extends `@ng-forge/dynamic-forms` with Material-specific field types via TypeScript module augmentation. If you need type safety in a file without importing specific exports, use a bare import:

```typescript
import '@ng-forge/dynamic-forms-material';
```

---

## Complete Form Example

Here's a full registration form showcasing multiple Material Design field types:

<iframe src="http://localhost:4201/#/examples/complete-form" class="example-frame" title="Complete Form Demo"></iframe>

This example demonstrates:

- Text inputs with validation
- Select dropdowns
- Checkboxes and toggles
- Radio buttons
- Date pickers
- Sliders
- Multi-checkbox selections
- Form submission

---

## Field Types Reference

Complete reference for all Material Design field types with comprehensive validation, accessibility features, and Material Design styling.

### Text Input Fields

Text input fields provide user-friendly text entry with Material Design styling.

#### Input

Text input field with HTML5 type support.

**Live Demo:**

<iframe src="http://localhost:4201/#/examples/input" class="example-frame" title="Input Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'email',
  type: 'input',
  label: 'Email Address',
  value: '',
  required: true,
  email: true,
  props: {
    type: 'email',
    appearance: 'outline',
    placeholder: 'Enter your email',
  },
}
```

**Field Properties:**

| Property      | Type               | Description                        |
| ------------- | ------------------ | ---------------------------------- |
| `key`         | `string`           | Unique field identifier (required) |
| `type`        | `'input'`          | Field type (required)              |
| `value`       | `string \| number` | Initial value                      |
| `label`       | `string`           | Field label                        |
| `placeholder` | `string`           | Placeholder text                   |
| `required`    | `boolean`          | Mark field as required             |
| `disabled`    | `boolean`          | Disable the field                  |
| `readonly`    | `boolean`          | Make field read-only               |

**Validation Properties:**

| Property    | Type               | Description                       |
| ----------- | ------------------ | --------------------------------- |
| `email`     | `boolean`          | Email format validation           |
| `minLength` | `number`           | Minimum character length          |
| `maxLength` | `number`           | Maximum character length          |
| `min`       | `number`           | Minimum value (for number inputs) |
| `max`       | `number`           | Maximum value (for number inputs) |
| `pattern`   | `string \| RegExp` | RegEx pattern validation          |

**Props (Material-Specific):**

| Prop              | Type                                                            | Default   | Description               |
| ----------------- | --------------------------------------------------------------- | --------- | ------------------------- |
| `type`            | `'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url'` | `'text'`  | HTML input type           |
| `appearance`      | `'fill' \| 'outline'`                                           | `'fill'`  | Material form field style |
| `hint`            | `string`                                                        | -         | Helper text below input   |
| `subscriptSizing` | `'fixed' \| 'dynamic'`                                          | `'fixed'` | Error/hint spacing        |

#### Textarea

Multi-line text input field with Material Design styling.

**Live Demo:**

<iframe src="http://localhost:4201/#/examples/textarea" class="example-frame" title="Textarea Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'bio',
  type: 'textarea',
  value: '',
  label: 'Biography',
  placeholder: 'Tell us about yourself',
  required: true,
}
```

**Props (Material-Specific):**

| Prop              | Type                                             | Default      | Description               |
| ----------------- | ------------------------------------------------ | ------------ | ------------------------- |
| `appearance`      | `'fill' \| 'outline'`                            | `'outline'`  | Visual style              |
| `rows`            | `number`                                         | `4`          | Number of visible rows    |
| `cols`            | `number`                                         | -            | Number of visible columns |
| `resize`          | `'none' \| 'both' \| 'horizontal' \| 'vertical'` | `'vertical'` | Resize behavior           |
| `subscriptSizing` | `'fixed' \| 'dynamic'`                           | `'fixed'`    | Error/hint sizing         |
| `hint`            | `string`                                         | -            | Help text below field     |

---

### Selection Fields

Selection fields enable users to choose from predefined options.

#### Select

Dropdown selection field. Supports both single and multi-select modes.

**Live Demo:**

<iframe src="http://localhost:4201/#/examples/select" class="example-frame" title="Select Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'country',
  type: 'select',
  value: '',
  label: 'Country',
  required: true,
  options: [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
  ],
}
```

**Props (Material-Specific):**

| Prop              | Type                   | Default     | Description           |
| ----------------- | ---------------------- | ----------- | --------------------- |
| `appearance`      | `'fill' \| 'outline'`  | `'outline'` | Visual style          |
| `multiple`        | `boolean`              | `false`     | Enable multi-select   |
| `hint`            | `string`               | -           | Help text below field |
| `subscriptSizing` | `'fixed' \| 'dynamic'` | `'fixed'`   | Error/hint sizing     |

#### Radio

Radio button group for selecting a single option.

**Live Demo:**

<iframe src="http://localhost:4201/#/examples/radio" class="example-frame" title="Radio Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'size',
  type: 'radio',
  value: '',
  label: 'Select Size',
  required: true,
  options: [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ],
}
```

**Props (Material-Specific):**

| Prop            | Type                              | Default     | Description               |
| --------------- | --------------------------------- | ----------- | ------------------------- |
| `color`         | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color      |
| `labelPosition` | `'before' \| 'after'`             | `'after'`   | Position of option labels |

#### Checkbox

Boolean checkbox control for single true/false selections.

**Live Demo:**

<iframe src="http://localhost:4201/#/examples/checkbox" class="example-frame" title="Checkbox Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'terms',
  type: 'checkbox',
  value: false,
  label: 'I accept the terms and conditions',
  required: true,
}
```

**Props (Material-Specific):**

| Prop            | Type                              | Default     | Description            |
| --------------- | --------------------------------- | ----------- | ---------------------- |
| `color`         | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color   |
| `labelPosition` | `'before' \| 'after'`             | `'after'`   | Position of label text |

#### Multi-Checkbox

Multiple checkbox selection field for choosing multiple options.

**Live Demo:**

<iframe src="http://localhost:4201/#/examples/multi-checkbox" class="example-frame" title="Multi-Checkbox Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'interests',
  type: 'multi-checkbox',
  value: [],
  label: 'Select Your Interests',
  required: true,
  options: [
    { value: 'sports', label: 'Sports' },
    { value: 'music', label: 'Music' },
    { value: 'reading', label: 'Reading' },
    { value: 'travel', label: 'Travel' },
  ],
}
```

---

### Interactive Fields

Interactive fields provide advanced user input controls.

#### Toggle

Slide toggle switch for boolean on/off selections.

**Live Demo:**

<iframe src="http://localhost:4201/#/examples/toggle" class="example-frame" title="Toggle Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'notifications',
  type: 'toggle',
  value: false,
  label: 'Enable notifications',
}
```

**Props (Material-Specific):**

| Prop            | Type                              | Default     | Description            |
| --------------- | --------------------------------- | ----------- | ---------------------- |
| `color`         | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color   |
| `labelPosition` | `'before' \| 'after'`             | `'after'`   | Position of label text |

#### Slider

Numeric slider control for selecting values from a range.

**Live Demo:**

<iframe src="http://localhost:4201/#/examples/slider" class="example-frame" title="Slider Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'volume',
  type: 'slider',
  value: 50,
  label: 'Volume',
  minValue: 0,
  maxValue: 100,
  step: 1,
}
```

**Props (Material-Specific):**

| Prop                            | Type                              | Default     | Description                  |
| ------------------------------- | --------------------------------- | ----------- | ---------------------------- |
| `thumbLabel` / `showThumbLabel` | `boolean`                         | `false`     | Show value tooltip on thumb  |
| `tickInterval`                  | `number \| 'auto'`                | -           | Show tick marks at intervals |
| `color`                         | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color         |
| `hint`                          | `string`                          | -           | Help text below slider       |

#### Datepicker

Date selection field with Material Design calendar popup.

**Live Demo:**

<iframe src="http://localhost:4201/#/examples/datepicker" class="example-frame" title="Datepicker Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'birthdate',
  type: 'datepicker',
  value: null,
  label: 'Date of Birth',
  required: true,
}
```

**Props (Material-Specific):**

| Prop              | Type                                | Default     | Description                 |
| ----------------- | ----------------------------------- | ----------- | --------------------------- |
| `appearance`      | `'fill' \| 'outline'`               | `'outline'` | Visual style                |
| `color`           | `'primary' \| 'accent' \| 'warn'`   | `'primary'` | Material theme color        |
| `startView`       | `'month' \| 'year' \| 'multi-year'` | `'month'`   | Initial calendar view       |
| `touchUi`         | `boolean`                           | `false`     | Touch-optimized calendar UI |
| `subscriptSizing` | `'fixed' \| 'dynamic'`              | `'fixed'`   | Error/hint sizing           |
| `hint`            | `string`                            | -           | Help text below field       |

---

### Buttons & Actions

Action buttons provide form submission and navigation controls.

#### Submit Button

Form submission button that's automatically disabled when the form is invalid.

**Live Demo:**

<iframe src="http://localhost:4201/#/examples/button" class="example-frame" title="Button Demo"></iframe>

**Basic Usage:**

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

**Props:**

| Prop    | Type                              | Default     | Description          |
| ------- | --------------------------------- | ----------- | -------------------- |
| `color` | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color |

#### Navigation Buttons

Navigation buttons for multi-step (paged) forms.

**Basic Usage:**

```typescript
{
  fields: [
    {
      key: 'step1',
      type: 'page',
      fields: [
        { key: 'step1Title', type: 'text', label: 'Step 1', props: { elementType: 'h3' } },
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
      fields: [
        { key: 'step2Title', type: 'text', label: 'Step 2', props: { elementType: 'h3' } },
        { key: 'email', type: 'input', value: '', label: 'Email', required: true },
        { type: 'previous', key: 'back', label: 'Back' },
        { type: 'submit', key: 'submit', label: 'Submit', props: { color: 'primary' } },
      ],
    },
  ],
}
```

**Button Types:**

- **Next Button**: Navigates to the next page. Automatically disabled when current page has validation errors.
- **Previous Button**: Navigates to the previous page. Always enabled to allow users to go back.

---

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

- Check out [Examples & Patterns](../../../examples/) for real-world use cases
- Learn about [Validation](../../validation/basics/) for form validation
- See [Type Safety](../../advanced/type-safety/basics/) for TypeScript integration
- Explore [Conditional Logic](../../dynamic-behavior/conditional-logic/overview/) for dynamic field behavior
