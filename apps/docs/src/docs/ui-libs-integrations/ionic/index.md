Mobile-first Ionic field components for ng-forge dynamic forms, optimized for iOS and Android with native platform styling.

---

## Installation

Install the package and its peer dependencies:

```bash group="install" name="npm"
npm install @ng-forge/dynamic-forms @ng-forge/dynamic-forms-ionic @ionic/angular
```

```bash group="install" name="yarn"
yarn add @ng-forge/dynamic-forms @ng-forge/dynamic-forms-ionic @ionic/angular
```

```bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-forms @ng-forge/dynamic-forms-ionic @ionic/angular
```

## Quick Start

### 1. Configure Providers

Add Ionic field types to your application:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withIonicFields())],
};
```

### 2. Import Ionic Styles

Add Ionic core styles to your application:

```scss name="styles.scss"
@import '@ionic/angular/css/core.css';
@import '@ionic/angular/css/normalize.css';
@import '@ionic/angular/css/structure.css';
@import '@ionic/angular/css/typography.css';

// Optional: Additional Ionic utility styles
@import '@ionic/angular/css/padding.css';
@import '@ionic/angular/css/float-elements.css';
@import '@ionic/angular/css/text-alignment.css';
@import '@ionic/angular/css/text-transformation.css';
@import '@ionic/angular/css/flex-utils.css';
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
        value: '',
        required: true,
        props: {
          placeholder: 'Enter your name',
        },
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
          placeholder: 'your@email.com',
        },
      },
      {
        key: 'message',
        type: 'textarea',
        label: 'Message',
        value: '',
        required: true,
        minLength: 10,
        props: {
          placeholder: 'Your message here...',
          rows: 4,
          autoGrow: true,
        },
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Send Message',
        props: {
          color: 'primary',
          expand: 'block',
        },
      },
    ],
  } as const satisfies FormConfig;
}
```

## Configuration Options

Configure default props at the library, form, or field level.

Use `IonicFormConfig` for type-safe form configurations with Ionic-specific props.

### Available Options

| Option           | Type                                                                                                            | Default     | Description              |
| ---------------- | --------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------ |
| `fill`           | `'solid' \| 'outline'`                                                                                          | `'solid'`   | Input fill style         |
| `shape`          | `'round'`                                                                                                       | -           | Rounded shape for inputs |
| `labelPlacement` | `'start' \| 'end' \| 'fixed' \| 'stacked' \| 'floating'`                                                        | `'start'`   | Label position           |
| `color`          | `'primary' \| 'secondary' \| 'tertiary' \| 'success' \| 'warning' \| 'danger' \| 'light' \| 'medium' \| 'dark'` | `'primary'` | Ionic color theme        |
| `size`           | `'small' \| 'default' \| 'large'`                                                                               | `'default'` | Button size              |
| `expand`         | `'full' \| 'block'`                                                                                             | -           | Button expand behavior   |
| `buttonFill`     | `'clear' \| 'outline' \| 'solid' \| 'default'`                                                                  | `'solid'`   | Button fill style        |
| `strong`         | `boolean`                                                                                                       | `false`     | Bold button text         |

---

## Type Augmentation

Importing this package automatically extends `@ng-forge/dynamic-forms` with Ionic-specific field types via TypeScript module augmentation. If you need type safety in a file without importing specific exports, use a bare import:

```typescript
import '@ng-forge/dynamic-forms-ionic';
```

---

## Complete Form Example

Here's a full registration form showcasing multiple Ionic field types optimized for mobile:

<iframe src="http://localhost:4203/#/examples/complete-form" class="example-frame" title="Complete Form Demo"></iframe>

This example demonstrates:

- Text inputs with mobile keyboard optimization
- Select dropdowns with native action sheets
- Checkboxes and toggles with Ionic styling
- Radio buttons
- Date/time pickers with native selectors
- Range sliders with pin display
- Multi-checkbox selections
- Form submission

---

## Field Types Reference

Complete reference for all Ionic field types with mobile-first design, native platform styling, and comprehensive validation.

### Text Input Fields

Text input fields provide mobile-optimized text entry with platform-specific keyboards.

#### Input

Text input field with mobile keyboard optimization and platform-adaptive styling.

**Live Demo:**

<iframe src="http://localhost:4203/#/examples/input" class="example-frame" title="Input Field Demo"></iframe>

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
    placeholder: 'your@email.com',
    clearInput: true,
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

**Props (Ionic-Specific):**

| Prop             | Type                                                                           | Default   | Description             |
| ---------------- | ------------------------------------------------------------------------------ | --------- | ----------------------- |
| `type`           | `'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url'`                | `'text'`  | HTML input type         |
| `placeholder`    | `string`                                                                       | -         | Placeholder text        |
| `clearInput`     | `boolean`                                                                      | `false`   | Show clear button       |
| `fill`           | `'solid' \| 'outline'`                                                         | `'solid'` | Input fill style        |
| `shape`          | `'round'`                                                                      | -         | Rounded input shape     |
| `labelPlacement` | `'start' \| 'end' \| 'fixed' \| 'stacked' \| 'floating'`                       | `'start'` | Position of the label   |
| `color`          | `'primary' \| 'secondary' \| 'tertiary' \| 'success' \| 'warning' \| 'danger'` | -         | Ionic theme color       |
| `helperText`     | `string`                                                                       | -         | Helper text below input |
| `counter`        | `boolean`                                                                      | `false`   | Show character counter  |

#### Textarea

Multi-line text input field with auto-grow support for mobile devices.

**Live Demo:**

<iframe src="http://localhost:4203/#/examples/textarea" class="example-frame" title="Textarea Field Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'bio',
  type: 'textarea',
  value: '',
  label: 'Biography',
  placeholder: 'Tell us about yourself',
  required: true,
  maxLength: 500,
  props: {
    rows: 4,
    autoGrow: true,
  },
}
```

**Props (Ionic-Specific):**

| Prop             | Type                                                                           | Default   | Description                  |
| ---------------- | ------------------------------------------------------------------------------ | --------- | ---------------------------- |
| `rows`           | `number`                                                                       | `4`       | Number of visible rows       |
| `autoGrow`       | `boolean`                                                                      | `false`   | Auto-resize based on content |
| `placeholder`    | `string`                                                                       | -         | Placeholder text             |
| `fill`           | `'solid' \| 'outline'`                                                         | `'solid'` | Textarea fill style          |
| `labelPlacement` | `'start' \| 'end' \| 'fixed' \| 'stacked' \| 'floating'`                       | `'start'` | Position of the label        |
| `color`          | `'primary' \| 'secondary' \| 'tertiary' \| 'success' \| 'warning' \| 'danger'` | -         | Ionic theme color            |
| `helperText`     | `string`                                                                       | -         | Helper text below field      |
| `counter`        | `boolean`                                                                      | `false`   | Show character counter       |

---

### Selection Fields

Selection fields enable users to choose from predefined options with mobile-optimized interfaces.

#### Select

Dropdown selection field with native action sheets on mobile devices.

**Live Demo:**

<iframe src="http://localhost:4203/#/examples/select" class="example-frame" title="Select Field Demo"></iframe>

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
    interface: 'action-sheet',
  },
}
```

**Props (Ionic-Specific):**

| Prop             | Type                                                                           | Default          | Description           |
| ---------------- | ------------------------------------------------------------------------------ | ---------------- | --------------------- |
| `interface`      | `'action-sheet' \| 'alert' \| 'popover'`                                       | `'action-sheet'` | Mobile selection UI   |
| `multiple`       | `boolean`                                                                      | `false`          | Enable multi-select   |
| `placeholder`    | `string`                                                                       | -                | Placeholder text      |
| `cancelText`     | `string`                                                                       | `'Cancel'`       | Cancel button text    |
| `okText`         | `string`                                                                       | `'OK'`           | OK button text        |
| `fill`           | `'solid' \| 'outline'`                                                         | `'solid'`        | Select fill style     |
| `labelPlacement` | `'start' \| 'end' \| 'fixed' \| 'stacked' \| 'floating'`                       | `'start'`        | Position of the label |
| `color`          | `'primary' \| 'secondary' \| 'tertiary' \| 'success' \| 'warning' \| 'danger'` | -                | Ionic theme color     |

#### Radio

Radio button group for selecting a single option with mobile-friendly spacing.

**Live Demo:**

<iframe src="http://localhost:4203/#/examples/radio" class="example-frame" title="Radio Field Demo"></iframe>

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

**Props (Ionic-Specific):**

| Prop             | Type                                                                           | Default | Description               |
| ---------------- | ------------------------------------------------------------------------------ | ------- | ------------------------- |
| `labelPlacement` | `'start' \| 'end' \| 'fixed' \| 'stacked'`                                     | `'end'` | Position of option labels |
| `justify`        | `'start' \| 'end' \| 'space-between'`                                          | -       | Layout justification      |
| `color`          | `'primary' \| 'secondary' \| 'tertiary' \| 'success' \| 'warning' \| 'danger'` | -       | Ionic theme color         |

#### Checkbox

Boolean checkbox control optimized for touch interaction.

**Live Demo:**

<iframe src="http://localhost:4203/#/examples/checkbox" class="example-frame" title="Checkbox Field Demo"></iframe>

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

**Props (Ionic-Specific):**

| Prop             | Type                                                                           | Default | Description            |
| ---------------- | ------------------------------------------------------------------------------ | ------- | ---------------------- |
| `labelPlacement` | `'start' \| 'end' \| 'fixed' \| 'stacked'`                                     | `'end'` | Position of label text |
| `justify`        | `'start' \| 'end' \| 'space-between'`                                          | -       | Layout justification   |
| `color`          | `'primary' \| 'secondary' \| 'tertiary' \| 'success' \| 'warning' \| 'danger'` | -       | Ionic theme color      |

#### Multi-Checkbox

Multiple checkbox selection field for choosing multiple options.

**Live Demo:**

<iframe src="http://localhost:4203/#/examples/multi-checkbox" class="example-frame" title="Multi-Checkbox Field Demo"></iframe>

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

**Props (Ionic-Specific):**

| Prop             | Type                                                                           | Default | Description          |
| ---------------- | ------------------------------------------------------------------------------ | ------- | -------------------- |
| `labelPlacement` | `'start' \| 'end' \| 'fixed' \| 'stacked'`                                     | `'end'` | Position of labels   |
| `justify`        | `'start' \| 'end' \| 'space-between'`                                          | -       | Layout justification |
| `color`          | `'primary' \| 'secondary' \| 'tertiary' \| 'success' \| 'warning' \| 'danger'` | -       | Ionic theme color    |

---

### Interactive Fields

Interactive fields provide advanced user input controls optimized for mobile interaction.

#### Toggle

Slide toggle switch for boolean on/off selections with smooth animations.

**Live Demo:**

<iframe src="http://localhost:4203/#/examples/toggle" class="example-frame" title="Toggle Field Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'notifications',
  type: 'toggle',
  value: false,
  label: 'Enable notifications',
}
```

**Props (Ionic-Specific):**

| Prop                | Type                                                                           | Default | Description            |
| ------------------- | ------------------------------------------------------------------------------ | ------- | ---------------------- |
| `labelPlacement`    | `'start' \| 'end' \| 'fixed' \| 'stacked'`                                     | `'end'` | Position of label text |
| `justify`           | `'start' \| 'end' \| 'space-between'`                                          | -       | Layout justification   |
| `enableOnOffLabels` | `boolean`                                                                      | `false` | Show on/off labels     |
| `color`             | `'primary' \| 'secondary' \| 'tertiary' \| 'success' \| 'warning' \| 'danger'` | -       | Ionic theme color      |

#### Slider

Range slider control with pin display and snap-to-tick support.

**Live Demo:**

<iframe src="http://localhost:4203/#/examples/slider" class="example-frame" title="Slider Field Demo"></iframe>

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
    pin: true,
    ticks: true,
  },
}
```

**Field Properties:**

| Property   | Type     | Default | Description          |
| ---------- | -------- | ------- | -------------------- |
| `minValue` | `number` | `0`     | Minimum slider value |
| `maxValue` | `number` | `100`   | Maximum slider value |
| `step`     | `number` | `1`     | Value increment step |

**Props (Ionic-Specific):**

| Prop             | Type                                                                           | Default   | Description                    |
| ---------------- | ------------------------------------------------------------------------------ | --------- | ------------------------------ |
| `pin`            | `boolean`                                                                      | `false`   | Show value pin above knob      |
| `pinFormatter`   | `(value: number) => string \| number`                                          | -         | Custom formatter for pin value |
| `ticks`          | `boolean`                                                                      | `false`   | Show tick marks                |
| `snaps`          | `boolean`                                                                      | `false`   | Snap to tick marks             |
| `dualKnobs`      | `boolean`                                                                      | `false`   | Enable dual knob mode          |
| `color`          | `'primary' \| 'secondary' \| 'tertiary' \| 'success' \| 'warning' \| 'danger'` | -         | Ionic theme color              |
| `labelPlacement` | `'start' \| 'end' \| 'fixed' \| 'stacked'`                                     | `'start'` | Position of label              |

#### Datepicker

Date and time selection with native mobile pickers for iOS and Android.

**Live Demo:**

<iframe src="http://localhost:4203/#/examples/datepicker" class="example-frame" title="Datepicker Field Demo"></iframe>

**Basic Usage:**

```typescript
{
  key: 'birthdate',
  type: 'datepicker',
  value: null,
  label: 'Date of Birth',
  required: true,
  props: {
    presentation: 'date',
  },
}
```

**Field Properties:**

| Property  | Type                     | Description             |
| --------- | ------------------------ | ----------------------- |
| `minDate` | `Date \| string \| null` | Minimum selectable date |
| `maxDate` | `Date \| string \| null` | Maximum selectable date |

**Props (Ionic-Specific):**

| Prop                   | Type                                                                                  | Default    | Description              |
| ---------------------- | ------------------------------------------------------------------------------------- | ---------- | ------------------------ |
| `presentation`         | `'date' \| 'time' \| 'date-time' \| 'time-date' \| 'month' \| 'month-year' \| 'year'` | `'date'`   | Picker type              |
| `showDefaultButtons`   | `boolean`                                                                             | `true`     | Show cancel/done buttons |
| `showDefaultTitle`     | `boolean`                                                                             | -          | Show default title       |
| `showDefaultTimeLabel` | `boolean`                                                                             | -          | Show default time label  |
| `showClearButton`      | `boolean`                                                                             | -          | Show clear button        |
| `cancelText`           | `string`                                                                              | `'Cancel'` | Cancel button text       |
| `doneText`             | `string`                                                                              | `'Done'`   | Done button text         |
| `multiple`             | `boolean`                                                                             | `false`    | Allow multiple selection |
| `preferWheel`          | `boolean`                                                                             | `false`    | Use wheel picker style   |
| `size`                 | `'cover' \| 'fixed'`                                                                  | -          | Picker overlay size      |
| `color`                | `'primary' \| 'secondary' \| 'tertiary' \| 'success' \| 'warning' \| 'danger'`        | -          | Ionic theme color        |

---

### Buttons & Actions

Action buttons provide form submission and navigation controls with Ionic styling.

#### Submit Button

Form submission button that's automatically disabled when the form is invalid.

**Live Demo:**

<iframe src="http://localhost:4203/#/examples/button" class="example-frame" title="Button Field Demo"></iframe>

**Basic Usage:**

```typescript
{
  type: 'submit',
  key: 'submit',
  label: 'Create Account',
  props: {
    color: 'primary',
    expand: 'block',
  },
}
```

The submit button automatically:

- Disables when the form is invalid
- Emits a `SubmitEvent` when clicked
- Validates all fields before submission

**Props:**

| Prop     | Type                                                                                                            | Default     | Description       |
| -------- | --------------------------------------------------------------------------------------------------------------- | ----------- | ----------------- |
| `expand` | `'full' \| 'block'`                                                                                             | -           | Button width      |
| `fill`   | `'clear' \| 'outline' \| 'solid' \| 'default'`                                                                  | `'solid'`   | Button fill style |
| `shape`  | `'round'`                                                                                                       | -           | Rounded button    |
| `size`   | `'small' \| 'default' \| 'large'`                                                                               | -           | Button size       |
| `color`  | `'primary' \| 'secondary' \| 'tertiary' \| 'success' \| 'warning' \| 'danger' \| 'light' \| 'medium' \| 'dark'` | `'primary'` | Ionic theme color |
| `strong` | `boolean`                                                                                                       | `false`     | Use strong font   |

#### Navigation Buttons

Navigation buttons for multi-step (paged) forms with platform-adaptive styling.

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
          props: { color: 'primary', expand: 'block' },
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

Ionic components use CSS variables for theming. Customize colors and styles globally or per-component.

### Color Palette

Ionic provides a comprehensive color system:

```typescript
// Field with custom color
{
  key: 'email',
  type: 'input',
  label: 'Email',
  props: {
    color: 'success', // Uses your theme's success color
  },
}
```

**Available Colors:**

- `'primary'` - Primary brand color
- `'secondary'` - Secondary brand color
- `'tertiary'` - Tertiary brand color
- `'success'` - Success/positive actions
- `'warning'` - Warning states
- `'danger'` - Error/destructive actions
- `'light'` - Light variant
- `'medium'` - Medium gray
- `'dark'` - Dark variant

### Custom Theme Variables

Override Ionic's default colors in your global styles:

```scss name="styles.scss"
:root {
  --ion-color-primary: #3880ff;
  --ion-color-primary-rgb: 56, 128, 255;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-primary-contrast-rgb: 255, 255, 255;
  --ion-color-primary-shade: #3171e0;
  --ion-color-primary-tint: #4c8dff;

  // Customize other colors...
}
```

See [Ionic Theming Guide](https://ionicframework.com/docs/theming/basics) for complete customization options.

## Common Props

All Ionic fields support these common properties:

| Prop    | Type                                                                           | Default     | Description                     |
| ------- | ------------------------------------------------------------------------------ | ----------- | ------------------------------- |
| `color` | `'primary' \| 'secondary' \| 'tertiary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | Ionic theme color               |
| `mode`  | `'ios' \| 'md'`                                                                | -           | Force platform-specific styling |

## Mobile Optimization

All Ionic components are designed for mobile devices:

### Touch Targets

- **Minimum size**: 44x44px touch areas for accessibility
- **Spacing**: Adequate padding for comfortable tapping
- **Visual feedback**: Ripple effects and state changes

### Native Keyboards

Input fields automatically show the appropriate keyboard:

```typescript
{
  key: 'email',
  type: 'input',
  props: {
    type: 'email',      // Shows email keyboard
    inputmode: 'email', // Forces email input mode
  },
}
```

**Inputmode Options:**

- `'text'` - Standard keyboard
- `'decimal'` - Numeric with decimal
- `'numeric'` - Numeric only
- `'tel'` - Telephone keypad
- `'search'` - Search keyboard
- `'email'` - Email keyboard
- `'url'` - URL keyboard

### Platform Styling

Ionic automatically adapts to the platform:

- **iOS**: Native iOS styling with SF Pro font and iOS design patterns
- **Android**: Material Design with Roboto font and MD patterns
- **Automatic detection**: Based on device platform
- **Manual override**: Use `mode` prop to force specific styling

```typescript
{
  key: 'name',
  type: 'input',
  label: 'Name',
  props: {
    mode: 'ios', // Force iOS styling on all platforms
  },
}
```

### Performance

- **Hardware acceleration**: GPU-accelerated animations
- **Virtual scrolling**: Efficient rendering for long lists
- **Lazy loading**: Components load on demand
- **Gesture support**: Native swipe and touch gestures

## Accessibility

All Ionic components include comprehensive accessibility features:

### ARIA Support

- Proper ARIA roles and attributes
- ARIA labels for screen readers
- ARIA-describedby for error messages
- ARIA-invalid for validation states

### Keyboard Navigation

- Full keyboard support for all interactive elements
- Tab navigation with proper focus order
- Enter/Space for button activation
- Arrow keys for option selection

### Screen Readers

- Descriptive labels for all form controls
- Error message announcements
- State change notifications
- Context-aware instructions

### Focus Management

- Visible focus indicators
- Logical focus order
- Focus trap for modals
- Auto-focus on error fields

### High Contrast

- Compatible with high contrast modes
- Sufficient color contrast ratios (WCAG AA)
- Clear visual distinctions
- Icon and text alternatives

## Next Steps

- Check out [Examples & Patterns](../../../examples/) for real-world use cases
- Learn about [Validation](../../validation/basics/) for form validation
- See [Type Safety](../../advanced/type-safety/basics/) for TypeScript integration
- Explore [Conditional Logic](../../dynamic-behavior/conditional-logic/overview/) for dynamic field behavior
