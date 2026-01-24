Modern Bootstrap 5 field components for ng-forge dynamic forms, built with native HTML elements and Bootstrap CSS.

---

## Installation

Install the package and its peer dependencies:

```bash group="install" name="npm"
npm install @ng-forge/dynamic-forms @ng-forge/dynamic-forms-bootstrap bootstrap
```

```bash group="install" name="yarn"
yarn add @ng-forge/dynamic-forms @ng-forge/dynamic-forms-bootstrap bootstrap
```

```bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-forms @ng-forge/dynamic-forms-bootstrap bootstrap
```

Optional: For advanced datepicker features with calendar UI:

```bash group="install-ng-bootstrap" name="npm"
npm install @ng-bootstrap/ng-bootstrap
```

```bash group="install-ng-bootstrap" name="yarn"
yarn add @ng-bootstrap/ng-bootstrap
```

```bash group="install-ng-bootstrap" name="pnpm"
pnpm add @ng-bootstrap/ng-bootstrap
```

## Quick Start

### 1. Configure Providers

Add Bootstrap field types to your application:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withBootstrapFields } from '@ng-forge/dynamic-forms-bootstrap';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withBootstrapFields())],
};
```

### 2. Import Bootstrap Styles

Add Bootstrap CSS to your application:

```scss name="styles.scss"
@import 'bootstrap/dist/css/bootstrap.min.css';
```

Or include via CDN in your `index.html`:

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
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
          floatingLabel: true,
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
          floatingLabel: true,
        },
      },
      {
        key: 'message',
        type: 'textarea',
        label: 'Message',
        required: true,
        minLength: 10,
        props: {
          floatingLabel: true,
          rows: 4,
        },
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Send Message',
        props: {
          variant: 'primary',
        },
      },
    ],
  } as const satisfies FormConfig;
}
```

## Configuration Options

Configure default props at the library, form, or field level.

Use `BsFormConfig` for type-safe form configurations with Bootstrap-specific props.

### Available Options

| Option          | Type           | Default | Description                  |
| --------------- | -------------- | ------- | ---------------------------- |
| `size`          | `'sm' \| 'lg'` | -       | Bootstrap size class         |
| `floatingLabel` | `boolean`      | `false` | Enable floating label design |

---

## Type Augmentation

Importing this package automatically extends `@ng-forge/dynamic-forms` with Bootstrap-specific field types via TypeScript module augmentation. If you need type safety in a file without importing specific exports, use a bare import:

```typescript
import '@ng-forge/dynamic-forms-bootstrap';
```

---

## Complete Form Example

Here's a full registration form showcasing multiple Bootstrap field types:

<iframe src="http://localhost:4204/#/examples/complete-form" class="example-frame" title="Complete Form Demo"></iframe>

This example demonstrates:

- Text inputs with validation
- Select dropdowns
- Checkboxes and switches
- Radio buttons
- Date inputs
- Range sliders
- Multi-checkbox selections
- Form submission

---

## Field Types Reference

Complete reference for all Bootstrap field types with comprehensive validation, native HTML5 features, and Bootstrap styling.

### Text Input Fields

Text input fields provide user-friendly text entry with Bootstrap form styling.

#### Input

Text input field with HTML5 type support and optional floating labels.

**Live Demo:**

<iframe src="http://localhost:4204/#/examples/input" class="example-frame" title="Input Field Demo"></iframe>

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
    floatingLabel: true,
    placeholder: 'Enter your email',
    hint: 'We will never share your email',
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

**Props (Bootstrap-Specific):**

| Prop              | Type                                                            | Default  | Description                  |
| ----------------- | --------------------------------------------------------------- | -------- | ---------------------------- |
| `type`            | `'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url'` | `'text'` | HTML input type              |
| `size`            | `'sm' \| 'lg'`                                                  | -        | Bootstrap size class         |
| `floatingLabel`   | `boolean`                                                       | `false`  | Enable floating label design |
| `plaintext`       | `boolean`                                                       | `false`  | Render as plaintext          |
| `hint`            | `string`                                                        | -        | Helper text below input      |
| `validFeedback`   | `string`                                                        | -        | Success message when valid   |
| `invalidFeedback` | `string`                                                        | -        | Error message when invalid   |

#### Textarea

Multi-line text input field with Bootstrap form styling.

**Live Demo:**

<iframe src="http://localhost:4204/#/examples/textarea" class="example-frame" title="Textarea Field Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'bio',
  type: 'textarea',
  value: '',
  label: 'Biography',
  placeholder: 'Tell us about yourself',
  required: true,
  props: {
    rows: 4,
    floatingLabel: true,
  },
}
```

**Props (Bootstrap-Specific):**

| Prop            | Type           | Default | Description                  |
| --------------- | -------------- | ------- | ---------------------------- |
| `rows`          | `number`       | `3`     | Number of visible rows       |
| `size`          | `'sm' \| 'lg'` | -       | Bootstrap size class         |
| `floatingLabel` | `boolean`      | `false` | Enable floating label design |
| `hint`          | `string`       | -       | Helper text below textarea   |

---

### Selection Fields

Selection fields enable users to choose from predefined options.

#### Select

Dropdown selection field with native HTML select element. Supports both single and multi-select modes.

**Live Demo:**

<iframe src="http://localhost:4204/#/examples/select" class="example-frame" title="Select Field Demo"></iframe>

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
  props: {
    floatingLabel: true,
  },
}
```

**Props (Bootstrap-Specific):**

| Prop            | Type           | Default | Description                  |
| --------------- | -------------- | ------- | ---------------------------- |
| `multiple`      | `boolean`      | `false` | Enable multi-select          |
| `size`          | `'sm' \| 'lg'` | -       | Bootstrap size class         |
| `floatingLabel` | `boolean`      | `false` | Enable floating label design |
| `hint`          | `string`       | -       | Helper text below select     |

#### Radio

Radio button group for selecting a single option with optional button group styling.

**Live Demo:**

<iframe src="http://localhost:4204/#/examples/radio" class="example-frame" title="Radio Field Demo"></iframe>

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

**Props (Bootstrap-Specific):**

| Prop          | Type           | Default | Description                               |
| ------------- | -------------- | ------- | ----------------------------------------- |
| `inline`      | `boolean`      | `false` | Display options inline                    |
| `reverse`     | `boolean`      | `false` | Reverse label and input position          |
| `buttonGroup` | `boolean`      | `false` | Render as Bootstrap button group          |
| `buttonSize`  | `'sm' \| 'lg'` | -       | Button size (when buttonGroup is enabled) |
| `hint`        | `string`       | -       | Helper text below radio group             |

#### Checkbox

Boolean checkbox control for single true/false selections.

**Live Demo:**

<iframe src="http://localhost:4204/#/examples/checkbox" class="example-frame" title="Checkbox Field Demo"></iframe>

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

**Props (Bootstrap-Specific):**

| Prop      | Type      | Default | Description                      |
| --------- | --------- | ------- | -------------------------------- |
| `switch`  | `boolean` | `false` | Render as Bootstrap switch       |
| `inline`  | `boolean` | `false` | Inline layout                    |
| `reverse` | `boolean` | `false` | Reverse label and input position |

#### Multi-Checkbox

Multiple checkbox selection field for choosing multiple options.

**Live Demo:**

<iframe src="http://localhost:4204/#/examples/multi-checkbox" class="example-frame" title="Multi-Checkbox Field Demo"></iframe>

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

**Props (Bootstrap-Specific):**

| Prop      | Type      | Default | Description                      |
| --------- | --------- | ------- | -------------------------------- |
| `switch`  | `boolean` | `false` | Render checkboxes as switches    |
| `inline`  | `boolean` | `false` | Display options inline           |
| `reverse` | `boolean` | `false` | Reverse label and input position |
| `hint`    | `string`  | -       | Helper text below checkbox group |

---

### Interactive Fields

Interactive fields provide advanced user input controls.

#### Toggle

Slide toggle switch for boolean on/off selections (renders as Bootstrap switch).

**Live Demo:**

<iframe src="http://localhost:4204/#/examples/toggle" class="example-frame" title="Toggle Field Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'notifications',
  type: 'toggle',
  value: false,
  label: 'Enable notifications',
}
```

**Props (Bootstrap-Specific):**

| Prop      | Type      | Default | Description                      |
| --------- | --------- | ------- | -------------------------------- |
| `inline`  | `boolean` | `false` | Inline layout                    |
| `reverse` | `boolean` | `false` | Reverse label and input position |

#### Slider

Native HTML5 range input for selecting values from a numeric range.

**Live Demo:**

<iframe src="http://localhost:4204/#/examples/slider" class="example-frame" title="Slider Field Demo"></iframe>

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
  props: {
    showValue: true,
  },
}
```

**Props (Bootstrap-Specific):**

| Prop        | Type      | Default | Description              |
| ----------- | --------- | ------- | ------------------------ |
| `showValue` | `boolean` | `false` | Display current value    |
| `hint`      | `string`  | -       | Helper text below slider |

#### Datepicker

Native HTML5 date input with Bootstrap styling.

**Live Demo:**

<iframe src="http://localhost:4204/#/examples/datepicker" class="example-frame" title="Datepicker Field Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'birthdate',
  type: 'datepicker',
  value: null,
  label: 'Date of Birth',
  required: true,
  props: {
    min: '1900-01-01',
    max: '2025-12-31',
  },
}
```

**Field Properties:**

| Property  | Type                     | Description             |
| --------- | ------------------------ | ----------------------- |
| `minDate` | `Date \| string \| null` | Minimum selectable date |
| `maxDate` | `Date \| string \| null` | Maximum selectable date |

**Props (Bootstrap-Specific):**

| Prop              | Type                                   | Default | Description                                |
| ----------------- | -------------------------------------- | ------- | ------------------------------------------ |
| `size`            | `'sm' \| 'lg'`                         | -       | Bootstrap size class                       |
| `floatingLabel`   | `boolean`                              | `false` | Enable floating label design               |
| `hint`            | `string`                               | -       | Helper text below field                    |
| `validFeedback`   | `string`                               | -       | Success message when valid                 |
| `invalidFeedback` | `string`                               | -       | Error message when invalid                 |
| `useNgBootstrap`  | `boolean`                              | -       | Use ng-bootstrap datepicker                |
| `displayMonths`   | `number`                               | -       | Number of months to display (ng-bootstrap) |
| `navigation`      | `'select' \| 'arrows' \| 'none'`       | -       | Navigation style (ng-bootstrap)            |
| `outsideDays`     | `'visible' \| 'collapsed' \| 'hidden'` | -       | How to display outside days (ng-bootstrap) |
| `showWeekNumbers` | `boolean`                              | -       | Show week numbers (ng-bootstrap)           |

---

### Buttons & Actions

Action buttons provide form submission and navigation controls.

#### Submit Button

Form submission button that's automatically disabled when the form is invalid.

**Live Demo:**

<iframe src="http://localhost:4204/#/examples/button" class="example-frame" title="Button Field Demo"></iframe>

**Basic Usage:**

```typescript
{
  type: 'submit',
  key: 'submit',
  label: 'Create Account',
  props: {
    variant: 'primary',
    size: 'lg',
  },
}
```

The submit button automatically:

- Disables when the form is invalid
- Emits a `SubmitEvent` when clicked
- Validates all fields before submission

**Props:**

| Prop      | Type                                                                                                      | Default     | Description            |
| --------- | --------------------------------------------------------------------------------------------------------- | ----------- | ---------------------- |
| `variant` | `'primary' \| 'secondary' \| 'success' \| 'danger' \| 'warning' \| 'info' \| 'light' \| 'dark' \| 'link'` | `'primary'` | Bootstrap button color |
| `outline` | `boolean`                                                                                                 | `false`     | Use outline variant    |
| `size`    | `'sm' \| 'lg'`                                                                                            | -           | Button size            |
| `block`   | `boolean`                                                                                                 | `false`     | Full-width button      |
| `active`  | `boolean`                                                                                                 | `false`     | Active state styling   |
| `type`    | `'button' \| 'submit' \| 'reset'`                                                                         | `'submit'`  | HTML button type       |

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
        { key: 'name', type: 'input', value: '', label: 'Name', required: true },
        {
          type: 'next',
          key: 'next',
          label: 'Continue',
          props: { variant: 'primary' },
        },
      ],
    },
    {
      key: 'step2',
      type: 'page',
      fields: [
        { key: 'email', type: 'input', value: '', label: 'Email', required: true },
        { type: 'previous', key: 'back', label: 'Back', props: { variant: 'secondary' } },
        { type: 'submit', key: 'submit', label: 'Submit', props: { variant: 'primary' } },
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

Bootstrap components use standard Bootstrap CSS classes. Customize appearance using Bootstrap's CSS variables or custom themes:

```typescript
// Field with custom variant
{
  key: 'submitBtn',
  type: 'submit',
  label: 'Save Changes',
  props: {
    variant: 'success', // Bootstrap color variant
    size: 'lg',
    outline: true,
  },
}
```

### Custom Bootstrap Theme

Customize Bootstrap variables before importing:

```scss name="styles.scss"
// Override Bootstrap variables
$primary: #007bff;
$secondary: #6c757d;
$success: #28a745;
$danger: #dc3545;

// Import Bootstrap
@import 'bootstrap/dist/css/bootstrap.min.css';
```

### Component CSS Variables

Customize field spacing and styling with CSS variables:

```scss
:root {
  --df-bs-field-gap: 0.75rem;
  --df-bs-label-font-weight: 600;
  --df-bs-hint-color: #6c757d;
  --df-bs-error-color: #dc3545;
}
```

## Common Props

All Bootstrap fields support these common properties:

| Prop   | Type           | Default | Description                       |
| ------ | -------------- | ------- | --------------------------------- |
| `size` | `'sm' \| 'lg'` | -       | Bootstrap size class              |
| `hint` | `string`       | -       | Helper text displayed below field |

## Bootstrap-Specific Features

### Floating Labels

Enable modern floating label design for input, select, and textarea fields:

```typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  props: {
    floatingLabel: true,
  },
}
```

### Grid System Integration

Use the `col` property for responsive grid layouts:

```typescript
{
  key: 'nameRow',
  type: 'row',
  fields: [
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      value: '',
      col: 6, // 50% width
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      value: '',
      col: 6, // 50% width
    },
  ],
}
```

Or use `className` for custom Bootstrap grid classes:

```typescript
{
  key: 'firstName',
  type: 'input',
  label: 'First Name',
  className: 'col-md-6 col-lg-4',
}
```

### Validation States

Bootstrap validation classes (`.is-invalid`, `.is-valid`) are automatically applied based on form state:

- Fields show errors only after being touched
- Valid fields can show success feedback with `validFeedback` prop
- Error messages automatically display below invalid fields

### Switch Styling

Checkboxes and multi-checkboxes can render as Bootstrap switches:

```typescript
{
  key: 'notifications',
  type: 'checkbox',
  label: 'Enable notifications',
  props: {
    switch: true,
  },
}
```

### Button Groups

Radio buttons can render as Bootstrap button groups:

```typescript
{
  key: 'size',
  type: 'radio',
  label: 'Size',
  options: [
    { value: 's', label: 'S' },
    { value: 'm', label: 'M' },
    { value: 'l', label: 'L' },
  ],
  props: {
    buttonGroup: true,
    buttonSize: 'lg',
  },
}
```

## Accessibility

All Bootstrap components include:

- Proper semantic HTML5 elements
- ARIA attributes for screen readers
- Keyboard navigation support
- Focus management
- Associated labels and descriptions
- Error announcements via `aria-describedby`

Bootstrap's native HTML elements provide excellent baseline accessibility that's enhanced by ng-forge's form integration.

## Next Steps

- Check out [Examples & Patterns](../../../examples/) for real-world use cases
- Learn about [Validation](../../validation/basics/) for form validation
- See [Type Safety](../../advanced/type-safety/basics/) for TypeScript integration
- Explore [Conditional Logic](../../dynamic-behavior/conditional-logic/overview/) for dynamic field behavior
