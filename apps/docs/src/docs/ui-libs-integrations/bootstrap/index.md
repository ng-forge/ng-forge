The `@ng-forge/dynamic-form-bootstrap` package provides Bootstrap 5 field components using native HTML elements with Bootstrap CSS styling.

## Installation

```bash
npm install @ng-forge/dynamic-form-bootstrap bootstrap

# Optional: For advanced datepicker features
npm install @ng-bootstrap/ng-bootstrap
```

## Setup

Configure component-level providers:

```typescript
import { Component } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withBootstrapFields } from '@ng-forge/dynamic-form-bootstrap';

@Component({
  selector: 'app-my-form',
  providers: [provideDynamicForm(...withBootstrapFields())],
  template: `
    <form [dynamicForm]="config">
      <dynamic-form-fields />
    </form>
  `,
})
export class MyFormComponent {}
```

Import Bootstrap styles:

```scss
// styles.scss
@import '../../../../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
```

## Field Components

### Input

Text-based inputs with Bootstrap styling and optional floating labels.

{{ NgDocActions.demo("InputIframeDemoComponent") }}

**Props:**

- `type`: `'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'`
- `size`: `'sm' | 'lg'`
- `floatingLabel`: Enable floating label design
- `plaintext`: Render as plaintext
- `helpText`: Helper text below input
- `validFeedback`: Success message when valid

### Select

Dropdown selection (single or multiple) with Bootstrap form-select styling.

{{ NgDocActions.demo("SelectIframeDemoComponent") }}

**Props:**

- `multiple`: Enable multi-select
- `size`: `'sm' | 'lg'`
- `floatingLabel`: Enable floating label design
- `helpText`: Helper text below select

### Checkbox

Boolean checkbox control with optional switch styling.

{{ NgDocActions.demo("CheckboxIframeDemoComponent") }}

**Props:**

- `switch`: Render as Bootstrap switch
- `inline`: Inline layout
- `reverse`: Reverse label position

### Toggle

Always renders as a Bootstrap switch control (alias for checkbox with switch=true).

{{ NgDocActions.demo("ToggleIframeDemoComponent") }}

**Props:**

- `inline`: Inline layout
- `reverse`: Reverse label position

### Button

Action button with Bootstrap variants and styles.

{{ NgDocActions.demo("ButtonIframeDemoComponent") }}

**Props:**

- `variant`: `'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link'`
- `outline`: Use outline variant
- `size`: `'sm' | 'lg'`
- `block`: Full-width button (w-100)
- `type`: `'button' | 'submit' | 'reset'`

**Button Types:**

- `button`: Custom action button (requires `event` prop)
- `submit`: Form submission button
- `next`: Multi-step form navigation
- `previous`: Multi-step form navigation

### Textarea

Multi-line text input with Bootstrap form-control styling.

{{ NgDocActions.demo("TextareaIframeDemoComponent") }}

**Props:**

- `rows`: Number of visible rows (default: 3)
- `size`: `'sm' | 'lg'`
- `floatingLabel`: Enable floating label design
- `helpText`: Helper text below textarea

### Radio

Radio button group for single selection with optional button group styling.

{{ NgDocActions.demo("RadioIframeDemoComponent") }}

**Props:**

- `inline`: Inline layout
- `reverse`: Reverse label position
- `buttonGroup`: Render as Bootstrap button group
- `buttonSize`: `'sm' | 'lg'` (for button group mode)
- `helpText`: Helper text below radio group

### Multi-Checkbox

Multiple checkbox selection for array values.

{{ NgDocActions.demo("MultiCheckboxIframeDemoComponent") }}

**Props:**

- `switch`: Render checkboxes as switches
- `inline`: Inline layout
- `reverse`: Reverse label position
- `helpText`: Helper text below checkbox group

### Datepicker

Native HTML5 date input with Bootstrap styling.

{{ NgDocActions.demo("DatepickerIframeDemoComponent") }}

**Props:**

- `min`: Minimum date (ISO string)
- `max`: Maximum date (ISO string)
- `size`: `'sm' | 'lg'`
- `helpText`: Helper text below datepicker

### Slider

Range slider for numeric input with value display.

{{ NgDocActions.demo("SliderIframeDemoComponent") }}

**Props:**

- `min`: Minimum value (default: 0)
- `max`: Maximum value (default: 100)
- `step`: Step increment (default: 1)
- `showValue`: Display current value
- `helpText`: Helper text below slider

## Complete Example

A comprehensive form demonstrating all Bootstrap field types together:

{{ NgDocActions.demo("CompleteFormIframeDemoComponent") }}

## Additional Examples

### User Registration Form

Complete user registration form with validation:

{{ NgDocActions.demo("UserRegistrationIframeDemoComponent") }}

## Bootstrap-Specific Features

### Grid System Integration

Use `className` prop to add Bootstrap grid classes:

```typescript
{
  key: 'firstName',
  type: 'input',
  label: 'First Name',
  className: 'col-md-6'
}
```

### Validation States

Bootstrap validation classes (`.is-invalid`, `.is-valid`) are automatically applied based on form state.

### Floating Labels

Enable modern floating label design with `floatingLabel: true` on input, select, and textarea fields.

### Size Variants

Most fields support Bootstrap sizing: `size: 'sm'` or `size: 'lg'`.

### Button Variants

Buttons support all Bootstrap color variants and outline styles.

## Customization

All components support CSS variable customization:

```scss
:root {
  --df-bs-field-gap: 0.75rem;
  --df-bs-label-font-weight: 600;
  --df-bs-hint-color: #999;
}
```

See the [Bootstrap Integration README](https://github.com/ng-forge/ng-forge/tree/main/packages/dynamic-form-bootstrap) for complete customization options.
