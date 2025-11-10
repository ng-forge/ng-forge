# Field Types Reference

Complete reference for all Material Design field types in ng-forge. Each field type provides comprehensive validation, accessibility features, and Material Design styling.

---

## Text Input Fields

Text input fields provide user-friendly text entry with Material Design styling. These fields support both single-line and multi-line text input with comprehensive validation and HTML5 type support.

### Input

Text input field with Material Design styling and HTML5 type support.

#### Live Demo

{{ NgDocActions.demo("InputIframeDemoComponent") }}

#### Basic Usage

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

#### Field Properties

These properties are set at the field level (not in `props`):

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

#### Props (UI-Specific)

These properties go inside the `props` object:

| Prop              | Type                                                            | Default   | Description               |
| ----------------- | --------------------------------------------------------------- | --------- | ------------------------- |
| `type`            | `'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url'` | `'text'`  | HTML input type           |
| `appearance`      | `'fill' \| 'outline'`                                           | `'fill'`  | Material form field style |
| `hint`            | `string`                                                        | -         | Helper text below input   |
| `subscriptSizing` | `'fixed' \| 'dynamic'`                                          | `'fixed'` | Error/hint spacing        |

#### Examples

**Email Input with Validation:**

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
    placeholder: 'user@example.com',
    hint: 'We will never share your email',
  },
}
```

**Password Input:**

```typescript
{
  key: 'password',
  type: 'input',
  label: 'Password',
  value: '',
  required: true,
  minLength: 8,
  pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
  props: {
    type: 'password',
    appearance: 'outline',
    hint: 'At least 8 characters with uppercase, lowercase, and number',
  },
}
```

### Textarea

Multi-line text input field with Material Design styling.

#### Live Demo

{{ NgDocActions.demo("TextareaIframeDemoComponent") }}

#### Basic Usage

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

#### Props (Material-Specific)

| Prop              | Type                                             | Default      | Description               |
| ----------------- | ------------------------------------------------ | ------------ | ------------------------- |
| `appearance`      | `'fill' \| 'outline'`                            | `'outline'`  | Visual style              |
| `rows`            | `number`                                         | `4`          | Number of visible rows    |
| `cols`            | `number`                                         | -            | Number of visible columns |
| `resize`          | `'none' \| 'both' \| 'horizontal' \| 'vertical'` | `'vertical'` | Resize behavior           |
| `subscriptSizing` | `'fixed' \| 'dynamic'`                           | `'fixed'`    | Error/hint sizing         |
| `hint`            | `string`                                         | -            | Help text below field     |

---

## Selection Fields

Selection fields enable users to choose from predefined options using various Material Design controls.

### Select

Dropdown selection field with Material Design styling. Supports both single and multi-select modes.

#### Live Demo

{{ NgDocActions.demo("SelectIframeDemoComponent") }}

#### Basic Usage

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

#### Props (Material-Specific)

| Prop              | Type                   | Default     | Description           |
| ----------------- | ---------------------- | ----------- | --------------------- |
| `appearance`      | `'fill' \| 'outline'`  | `'outline'` | Visual style          |
| `multiple`        | `boolean`              | `false`     | Enable multi-select   |
| `hint`            | `string`               | -           | Help text below field |
| `subscriptSizing` | `'fixed' \| 'dynamic'` | `'fixed'`   | Error/hint sizing     |

### Radio

Radio button group for selecting a single option from multiple choices.

#### Live Demo

{{ NgDocActions.demo("RadioIframeDemoComponent") }}

#### Basic Usage

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

#### Props (Material-Specific)

| Prop            | Type                              | Default     | Description               |
| --------------- | --------------------------------- | ----------- | ------------------------- |
| `color`         | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color      |
| `labelPosition` | `'before' \| 'after'`             | `'after'`   | Position of option labels |

### Checkbox

Boolean checkbox control with Material Design styling for single true/false selections.

#### Live Demo

{{ NgDocActions.demo("CheckboxIframeDemoComponent") }}

#### Basic Usage

```typescript
{
  key: 'terms',
  type: 'checkbox',
  checked: false,
  label: 'I accept the terms and conditions',
  required: true,
}
```

#### Props (Material-Specific)

| Prop            | Type                              | Default     | Description            |
| --------------- | --------------------------------- | ----------- | ---------------------- |
| `color`         | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color   |
| `labelPosition` | `'before' \| 'after'`             | `'after'`   | Position of label text |

### Multi-Checkbox

Multiple checkbox selection field for choosing multiple options.

#### Live Demo

{{ NgDocActions.demo("MultiCheckboxIframeDemoComponent") }}

#### Basic Usage

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

## Interactive Fields

Interactive fields provide advanced user input controls with Material Design styling.

### Toggle

Slide toggle switch with Material Design styling for boolean on/off selections.

#### Live Demo

{{ NgDocActions.demo("ToggleIframeDemoComponent") }}

#### Basic Usage

```typescript
{
  key: 'notifications',
  type: 'toggle',
  checked: false,
  label: 'Enable notifications',
}
```

#### Props (Material-Specific)

| Prop            | Type                              | Default     | Description            |
| --------------- | --------------------------------- | ----------- | ---------------------- |
| `color`         | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color   |
| `labelPosition` | `'before' \| 'after'`             | `'after'`   | Position of label text |

### Slider

Numeric slider control with Material Design styling for selecting values from a range.

#### Live Demo

{{ NgDocActions.demo("SliderIframeDemoComponent") }}

#### Basic Usage

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

#### Props (Material-Specific)

| Prop                            | Type                              | Default     | Description                  |
| ------------------------------- | --------------------------------- | ----------- | ---------------------------- |
| `thumbLabel` / `showThumbLabel` | `boolean`                         | `false`     | Show value tooltip on thumb  |
| `tickInterval`                  | `number \| 'auto'`                | -           | Show tick marks at intervals |
| `color`                         | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color         |
| `hint`                          | `string`                          | -           | Help text below slider       |

### Datepicker

Date selection field with Material Design calendar popup for choosing dates.

#### Live Demo

{{ NgDocActions.demo("DatepickerIframeDemoComponent") }}

#### Basic Usage

```typescript
{
  key: 'birthdate',
  type: 'datepicker',
  value: null,
  label: 'Date of Birth',
  required: true,
}
```

#### Props (Material-Specific)

| Prop              | Type                                | Default     | Description                 |
| ----------------- | ----------------------------------- | ----------- | --------------------------- |
| `appearance`      | `'fill' \| 'outline'`               | `'outline'` | Visual style                |
| `color`           | `'primary' \| 'accent' \| 'warn'`   | `'primary'` | Material theme color        |
| `startView`       | `'month' \| 'year' \| 'multi-year'` | `'month'`   | Initial calendar view       |
| `touchUi`         | `boolean`                           | `false`     | Touch-optimized calendar UI |
| `subscriptSizing` | `'fixed' \| 'dynamic'`              | `'fixed'`   | Error/hint sizing           |
| `hint`            | `string`                            | -           | Help text below field       |

---

## Buttons & Actions

Action buttons provide form submission and navigation controls with Material Design styling.

### Submit Button

Form submission button that's automatically disabled when the form is invalid.

#### Live Demo

{{ NgDocActions.demo("ButtonIframeDemoComponent") }}

#### Basic Usage

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

#### Props

| Prop    | Type                              | Default     | Description          |
| ------- | --------------------------------- | ----------- | -------------------- |
| `color` | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Material theme color |

### Navigation Buttons

Navigation buttons for multi-step (paged) forms with Material Design styling.

#### Basic Usage

```typescript
{
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
}
```

#### Button Types

**Next Button**: Navigates to the next page. Automatically disabled when current page has validation errors.

```typescript
{
  type: 'next',
  key: 'nextButton',
  label: 'Continue',
  props: { color: 'primary' },
}
```

**Previous Button**: Navigates to the previous page. Always enabled to allow users to go back.

```typescript
{
  type: 'previous',
  key: 'backButton',
  label: 'Back',
}
```

---

## Related

- [Overview & Setup](../overview-setup) - Getting started with Material Design integration
- [Validation](../../../../../core/validation/) - Form validation guide
- [Type Safety](../../../../../core/type-safety/) - TypeScript integration
- [Conditional Logic](../../../../../core/conditional-logic/) - Dynamic field behavior
