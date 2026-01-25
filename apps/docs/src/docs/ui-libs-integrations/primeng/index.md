Beautiful PrimeNG field components for ng-forge dynamic forms, built with the PrimeNG design system.

---

## Installation

Install the package and its peer dependencies:

```bash group="install" name="npm"
npm install @ng-forge/dynamic-forms @ng-forge/dynamic-forms-primeng primeng primeicons
```

```bash group="install" name="yarn"
yarn add @ng-forge/dynamic-forms @ng-forge/dynamic-forms-primeng primeng primeicons
```

```bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-forms @ng-forge/dynamic-forms-primeng primeng primeicons
```

## Quick Start

### 1. Configure Providers

Add PrimeNG field types to your application:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withPrimeNGFields } from '@ng-forge/dynamic-forms-primeng';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(...withPrimeNGFields()),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
  ],
};
```

### 2. Import Theme & Styles

Add PrimeNG icons to your styles:

```scss name="styles.scss"
@import 'primeicons/primeicons.css';
```

PrimeNG theming is now configured via the provider (see step 1). You can customize the theme preset:

```typescript
import Aura from '@primeuix/themes/aura';
import Lara from '@primeuix/themes/lara';
import Nora from '@primeuix/themes/nora';

providePrimeNG({
  theme: {
    preset: Aura, // or Lara, Nora, etc.
  },
});
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
        value: '',
        label: 'Full Name',
        required: true,
        props: {
          variant: 'outlined',
        },
      },
      {
        key: 'email',
        type: 'input',
        value: '',
        label: 'Email',
        required: true,
        email: true,
        props: {
          type: 'email',
          variant: 'outlined',
        },
      },
      {
        key: 'message',
        type: 'textarea',
        value: '',
        label: 'Message',
        required: true,
        minLength: 10,
        props: {
          rows: 4,
        },
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Send Message',
        props: {
          severity: 'primary',
        },
      },
    ],
  } as const satisfies FormConfig;
}
```

## Configuration Options

Configure default props at the library, form, or field level.

Use `PrimeFormConfig` for type-safe form configurations with PrimeNG-specific props.

### Available Options

| Option     | Type                                                                                            | Default      | Description            |
| ---------- | ----------------------------------------------------------------------------------------------- | ------------ | ---------------------- |
| `size`     | `'small' \| 'large'`                                                                            | -            | Component size         |
| `variant`  | `'outlined' \| 'filled'`                                                                        | `'outlined'` | Input visual style     |
| `severity` | `'primary' \| 'secondary' \| 'success' \| 'info' \| 'warn' \| 'danger' \| 'help' \| 'contrast'` | `'primary'`  | Button color           |
| `text`     | `boolean`                                                                                       | `false`      | Text-only button style |
| `outlined` | `boolean`                                                                                       | `false`      | Outlined button style  |
| `raised`   | `boolean`                                                                                       | `false`      | Raised button style    |
| `rounded`  | `boolean`                                                                                       | `false`      | Rounded button style   |

---

## Type Augmentation

Importing this package automatically extends `@ng-forge/dynamic-forms` with PrimeNG-specific field types via TypeScript module augmentation. If you need type safety in a file without importing specific exports, use a bare import:

```typescript
import '@ng-forge/dynamic-forms-primeng';
```

---

## Complete Form Example

Here's a full registration form showcasing multiple PrimeNG field types:

<iframe src="http://localhost:4202/#/examples/complete-form" class="example-frame" title="Complete Form Demo"></iframe>

This example demonstrates:

- Text inputs with validation
- Select dropdowns with search
- Checkboxes and toggles
- Radio buttons
- Date pickers
- Sliders
- Multi-checkbox selections
- Form submission

---

## Field Types Reference

Complete reference for all PrimeNG field types with comprehensive validation, accessibility features, and PrimeNG styling.

### Text Input Fields

Text input fields provide user-friendly text entry with PrimeNG styling.

#### Input

Text input field with HTML5 type support and PrimeNG styling.

**Live Demo:**

<iframe src="http://localhost:4202/#/examples/input" class="example-frame" title="Input Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'email',
  type: 'input',
  value: '',
  label: 'Email Address',
  required: true,
  email: true,
  props: {
    type: 'email',
    variant: 'outlined',
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

**Props (PrimeNG-Specific):**

| Prop         | Type                                                            | Default      | Description             |
| ------------ | --------------------------------------------------------------- | ------------ | ----------------------- |
| `type`       | `'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url'` | `'text'`     | HTML input type         |
| `variant`    | `'outlined' \| 'filled'`                                        | `'outlined'` | Visual style            |
| `size`       | `'small' \| 'large'`                                            | -            | Input size              |
| `hint`       | `string`                                                        | -            | Helper text below input |
| `styleClass` | `string`                                                        | -            | CSS class for input     |

#### Textarea

Multi-line text input field with PrimeNG styling and auto-resize support.

**Live Demo:**

<iframe src="http://localhost:4202/#/examples/textarea" class="example-frame" title="Textarea Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'bio',
  type: 'textarea',
  value: '',
  label: 'Biography',
  placeholder: 'Tell us about yourself',
  required: true,
  minLength: 50,
  maxLength: 500,
  props: {
    rows: 6,
    autoResize: true,
    hint: 'Maximum 500 characters',
  },
}
```

**Props (PrimeNG-Specific):**

| Prop         | Type      | Default | Description                  |
| ------------ | --------- | ------- | ---------------------------- |
| `rows`       | `number`  | `4`     | Number of visible rows       |
| `autoResize` | `boolean` | `false` | Auto-resize based on content |
| `maxlength`  | `number`  | -       | Maximum character limit      |
| `hint`       | `string`  | -       | Help text below field        |
| `styleClass` | `string`  | -       | CSS class for textarea       |

---

### Selection Fields

Selection fields enable users to choose from predefined options.

#### Select

Dropdown selection field with search capability and virtual scrolling support.

**Live Demo:**

<iframe src="http://localhost:4202/#/examples/select" class="example-frame" title="Select Demo"></iframe>

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
    { value: 'au', label: 'Australia' },
  ],
  props: {
    filter: true,
    showClear: true,
    placeholder: 'Select a country',
  },
}
```

**Props (PrimeNG-Specific):**

| Prop          | Type      | Default | Description               |
| ------------- | --------- | ------- | ------------------------- |
| `filter`      | `boolean` | `false` | Enable search/filter      |
| `showClear`   | `boolean` | `false` | Show clear button         |
| `multiple`    | `boolean` | `false` | Enable multiple selection |
| `placeholder` | `string`  | -       | Dropdown placeholder text |
| `hint`        | `string`  | -       | Help text below select    |
| `styleClass`  | `string`  | -       | CSS class for dropdown    |

#### Radio

Radio button group for selecting a single option.

**Live Demo:**

<iframe src="http://localhost:4202/#/examples/radio" class="example-frame" title="Radio Demo"></iframe>

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
  props: {
    hint: 'Choose your preferred size',
  },
}
```

**Props (PrimeNG-Specific):**

| Prop         | Type     | Default | Description                     |
| ------------ | -------- | ------- | ------------------------------- |
| `hint`       | `string` | -       | Help text displayed below group |
| `styleClass` | `string` | -       | CSS class for radio group       |

#### Checkbox

Boolean checkbox control for single true/false selections.

**Live Demo:**

<iframe src="http://localhost:4202/#/examples/checkbox" class="example-frame" title="Checkbox Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'terms',
  type: 'checkbox',
  value: false,
  label: 'I accept the terms and conditions',
  required: true,
  props: {
    binary: true,
  },
}
```

**Props (PrimeNG-Specific):**

| Prop         | Type      | Default | Description                   |
| ------------ | --------- | ------- | ----------------------------- |
| `binary`     | `boolean` | `true`  | Treat as boolean (true/false) |
| `trueValue`  | `any`     | `true`  | Value when checked            |
| `falseValue` | `any`     | `false` | Value when unchecked          |
| `styleClass` | `string`  | -       | CSS class for checkbox        |

#### Multi-Checkbox

Multiple checkbox selection field for choosing multiple options.

**Live Demo:**

<iframe src="http://localhost:4202/#/examples/multi-checkbox" class="example-frame" title="Multi-Checkbox Demo"></iframe>

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
    { value: 'cooking', label: 'Cooking' },
  ],
  props: {
    hint: 'Select all that apply',
  },
}
```

**Props (PrimeNG-Specific):**

| Prop         | Type     | Default | Description                     |
| ------------ | -------- | ------- | ------------------------------- |
| `hint`       | `string` | -       | Help text displayed below group |
| `styleClass` | `string` | -       | CSS class for checkbox group    |

---

### Interactive Fields

Interactive fields provide advanced user input controls.

#### Toggle

Slide toggle switch (InputSwitch) for boolean on/off selections.

**Live Demo:**

<iframe src="http://localhost:4202/#/examples/toggle" class="example-frame" title="Toggle Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'notifications',
  type: 'toggle',
  value: false,
  label: 'Enable email notifications',
  props: {
    hint: 'Receive updates via email',
  },
}
```

**Props (PrimeNG-Specific):**

| Prop         | Type     | Default | Description            |
| ------------ | -------- | ------- | ---------------------- |
| `hint`       | `string` | -       | Help text below toggle |
| `styleClass` | `string` | -       | CSS class for toggle   |

#### Slider

Numeric slider control for selecting values from a range.

**Live Demo:**

<iframe src="http://localhost:4202/#/examples/slider" class="example-frame" title="Slider Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'volume',
  type: 'slider',
  value: 50,
  label: 'Volume',
  minValue: 0,
  maxValue: 100,
  step: 5,
  props: {
    hint: 'Adjust audio volume',
  },
}
```

**Field Properties:**

| Property   | Type     | Default | Description    |
| ---------- | -------- | ------- | -------------- |
| `minValue` | `number` | `0`     | Minimum value  |
| `maxValue` | `number` | `100`   | Maximum value  |
| `step`     | `number` | `1`     | Increment step |

**Props (PrimeNG-Specific):**

| Prop          | Type                         | Default        | Description                 |
| ------------- | ---------------------------- | -------------- | --------------------------- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Slider orientation          |
| `range`       | `boolean`                    | `false`        | Enable range mode (2 knobs) |
| `hint`        | `string`                     | -              | Help text below slider      |
| `styleClass`  | `string`                     | -              | CSS class for slider        |

#### Datepicker

Date selection field with calendar popup (p-calendar).

**Live Demo:**

<iframe src="http://localhost:4202/#/examples/datepicker" class="example-frame" title="Datepicker Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'birthdate',
  type: 'datepicker',
  value: null,
  label: 'Date of Birth',
  required: true,
  minDate: new Date('1900-01-01'),
  maxDate: new Date(),
  props: {
    dateFormat: 'mm/dd/yy',
    showIcon: true,
    showButtonBar: true,
    hint: 'Select your birth date',
  },
}
```

**Field Properties:**

| Property  | Type                     | Description             |
| --------- | ------------------------ | ----------------------- |
| `minDate` | `Date \| string \| null` | Minimum selectable date |
| `maxDate` | `Date \| string \| null` | Maximum selectable date |

**Props (PrimeNG-Specific):**

| Prop            | Type                                | Default      | Description              |
| --------------- | ----------------------------------- | ------------ | ------------------------ |
| `dateFormat`    | `string`                            | `'mm/dd/yy'` | Date format string       |
| `showIcon`      | `boolean`                           | `false`      | Show calendar icon       |
| `showButtonBar` | `boolean`                           | `false`      | Show today/clear buttons |
| `inline`        | `boolean`                           | `false`      | Display calendar inline  |
| `selectionMode` | `'single' \| 'multiple' \| 'range'` | `'single'`   | Date selection mode      |
| `view`          | `'date' \| 'month' \| 'year'`       | `'date'`     | Initial calendar view    |
| `touchUI`       | `boolean`                           | `false`      | Touch-optimized UI       |
| `hint`          | `string`                            | -            | Help text below field    |
| `styleClass`    | `string`                            | -            | CSS class for datepicker |

---

### Buttons & Actions

Action buttons provide form submission and navigation controls.

#### Submit Button

Form submission button that's automatically disabled when the form is invalid.

**Live Demo:**

<iframe src="http://localhost:4202/#/examples/button" class="example-frame" title="Button Demo"></iframe>

**Basic Usage:**

```typescript
{
  type: 'submit',
  key: 'submit',
  label: 'Create Account',
  props: {
    severity: 'primary',
    icon: 'pi pi-check',
    iconPos: 'right',
  },
}
```

The submit button automatically:

- Disables when the form is invalid
- Emits a `SubmitEvent` when clicked
- Validates all fields before submission

**Props:**

| Prop       | Type                                                                                            | Default     | Description     |
| ---------- | ----------------------------------------------------------------------------------------------- | ----------- | --------------- |
| `severity` | `'primary' \| 'secondary' \| 'success' \| 'info' \| 'warn' \| 'help' \| 'danger' \| 'contrast'` | `'primary'` | Button theme    |
| `outlined` | `boolean`                                                                                       | `false`     | Outlined style  |
| `text`     | `boolean`                                                                                       | `false`     | Text-only style |
| `raised`   | `boolean`                                                                                       | `false`     | Raised style    |
| `rounded`  | `boolean`                                                                                       | `false`     | Rounded style   |
| `icon`     | `string`                                                                                        | -           | Icon class      |
| `iconPos`  | `'left' \| 'right' \| 'top' \| 'bottom'`                                                        | `'left'`    | Icon position   |

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
        { key: 'step1Title', type: 'text', label: 'Personal Information', props: { elementType: 'h3' } },
        { key: 'step1Desc', type: 'text', label: 'Tell us about yourself' },
        { key: 'firstName', type: 'input', value: '', label: 'First Name', required: true },
        { key: 'lastName', type: 'input', value: '', label: 'Last Name', required: true },
        {
          type: 'next',
          key: 'next',
          label: 'Continue',
          props: { severity: 'primary', icon: 'pi pi-arrow-right', iconPos: 'right' },
        },
      ],
    },
    {
      key: 'step2',
      type: 'page',
      fields: [
        { key: 'step2Title', type: 'text', label: 'Contact Information', props: { elementType: 'h3' } },
        { key: 'email', type: 'input', value: '', label: 'Email', required: true, email: true },
        { key: 'phone', type: 'input', value: '', label: 'Phone', props: { type: 'tel' } },
        {
          key: 'navigation',
          type: 'row',
          fields: [
            { type: 'previous', key: 'back', label: 'Back', props: { icon: 'pi pi-arrow-left' } },
            { type: 'submit', key: 'submit', label: 'Complete', props: { severity: 'primary' } },
          ],
        },
      ],
    },
  ],
}
```

**Button Types:**

- **Next Button**: Navigates to the next page. Automatically disabled when current page has validation errors.
- **Previous Button**: Navigates to the previous page. Always enabled to allow users to go back.

#### Custom Action Button

Generic button for custom events. Use this for application-specific actions.

**Basic Usage:**

```typescript
import { FormEvent } from '@ng-forge/dynamic-forms';

// Define your custom event
class SaveDraftEvent implements FormEvent {
  readonly type = 'save-draft' as const;
}

const config = {
  fields: [
    { key: 'title', type: 'input', value: '', label: 'Document Title', required: true },
    { key: 'content', type: 'textarea', value: '', label: 'Content' },
    {
      key: 'actions',
      type: 'row',
      fields: [
        {
          type: 'button',
          key: 'saveDraft',
          label: 'Save as Draft',
          event: SaveDraftEvent,
          props: {
            severity: 'secondary',
            icon: 'pi pi-save',
          },
        },
        {
          type: 'submit',
          key: 'publish',
          label: 'Publish',
          props: {
            severity: 'primary',
            icon: 'pi pi-upload',
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

Then listen for the event in your component:

```typescript
import { EventBus } from '@ng-forge/dynamic-forms';

class MyComponent {
  private eventBus = inject(EventBus);

  ngOnInit() {
    this.eventBus.on<SaveDraftEvent>('SaveDraft').subscribe(() => {
      console.log('Save draft clicked', this.form.value);
      // Handle draft saving logic
    });
  }
}
```

---

## Theming

PrimeNG supports extensive theming through CSS variables and theme presets. Customize your theme using the provider:

```typescript
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import Lara from '@primeuix/themes/lara';
import Nora from '@primeuix/themes/nora';

providePrimeNG({
  theme: {
    preset: Aura, // or Lara, Nora, etc.
    options: {
      darkModeSelector: '.dark-mode',
    },
  },
});
```

### Severity Colors

Control button and component colors using the `severity` prop:

```typescript
{
  type: 'submit',
  key: 'submit',
  label: 'Submit',
  props: {
    severity: 'primary', // 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast'
  },
}
```

### Size Variants

Adjust component sizes using the `size` prop:

```typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  props: {
    size: 'small', // 'small' | 'large' | undefined (default/medium)
  },
}
```

### Custom Styling

Add custom CSS classes to any component:

```typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  props: {
    styleClass: 'my-custom-input',
  },
}
```

For more information, see the [PrimeNG Theming Guide](https://primeng.org/theming).

## Accessibility

All PrimeNG components include:

- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Error announcements

PrimeNG components are designed with accessibility in mind and follow WAI-ARIA standards.

## Next Steps

- Check out [Examples & Patterns](../../../examples/) for real-world use cases
- Learn about [Validation](../../validation/basics/) for form validation
- See [Type Safety](../../advanced/type-safety/basics/) for TypeScript integration
- Explore [Conditional Logic](../../dynamic-behavior/conditional-logic/overview/) for dynamic field behavior
