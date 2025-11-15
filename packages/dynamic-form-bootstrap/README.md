<p align="center">
  <img src="https://raw.githubusercontent.com/ng-forge/ng-forge/main/logo.svg" alt="ng-forge logo" width="400"/>
</p>

# @ng-forge/dynamic-form-bootstrap

Bootstrap 5 field components for `@ng-forge/dynamic-form` - Build dynamic forms with native HTML elements styled with Bootstrap CSS classes.

## Overview

This library provides 13 field types that integrate Bootstrap 5 styling with the ng-forge dynamic form system. Unlike component libraries (Material, PrimeNG, Ionic), Bootstrap is a CSS framework, so these components use native HTML form elements with Bootstrap CSS classes.

## Features

- ✅ **13 Field Types**: Input, Select, Checkbox, Toggle, Button (4 types), Textarea, Radio, Multi-Checkbox, Datepicker, Slider
- ✅ **Native HTML Elements**: Uses standard form elements with Bootstrap 5 CSS classes
- ✅ **No JavaScript Required**: Most features work with CSS only (except datepicker with ng-bootstrap)
- ✅ **Responsive by Default**: Bootstrap's responsive utilities work out of the box
- ✅ **Grid Integration**: Easy integration with Bootstrap's 12-column grid system
- ✅ **Validation Feedback**: Built-in styles for validation states (.is-invalid, .is-valid)
- ✅ **Floating Labels**: Modern floating label design pattern
- ✅ **Flexible Layouts**: Support for inline, horizontal, and stacked form layouts
- ✅ **Component-Level Providers**: Isolated configurations per component
- ✅ **Type-Safe**: Full TypeScript support with module augmentation

## Installation

```bash group="install" name="npm"
npm install @ng-forge/dynamic-form-bootstrap bootstrap
```

```bash group="install" name="yarn"
yarn add @ng-forge/dynamic-form-bootstrap bootstrap
```

```bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-form-bootstrap bootstrap
```

Optional: For advanced datepicker features

```bash group="install" name="npm"
npm install @ng-bootstrap/ng-bootstrap
```

```bash group="install" name="yarn"
yarn add @ng-bootstrap/ng-bootstrap
```

```bash group="install" name="pnpm"
pnpm add @ng-bootstrap/ng-bootstrap
```

## Setup

### 1. Import Bootstrap styles in your `styles.scss`:

```scss
@import 'bootstrap/dist/css/bootstrap.min.css';
```

### 2. Use component-level providers:

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
export class MyFormComponent {
  config = {
    fields: [
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        props: {
          type: 'email',
          size: 'lg',
          floatingLabel: true,
        },
      },
    ],
  };
}
```

## Field Types

All 13 field types are documented in detail in the main documentation. Here are the available types:

- **Input**: Text-based inputs (text, email, password, number, tel, url, search, date, time, etc.)
- **Select**: Dropdown selection (single or multiple)
- **Checkbox**: Single checkbox for boolean values
- **Toggle**: Switch-style toggle
- **Button**: Action button with custom events
- **Submit**: Form submission button (auto-disabled when form invalid)
- **Next**: Multi-step form next button
- **Previous**: Multi-step form previous button
- **Textarea**: Multi-line text input
- **Radio**: Radio button group for single selection
- **Multi-Checkbox**: Multiple checkboxes for array values
- **Datepicker**: Date selection (native HTML5 or ng-bootstrap)
- **Slider**: Range slider for numeric input

## Bootstrap-Specific Features

### Sizing

Most fields support `size` prop: `'sm'` | `'lg'` | default

### Validation Feedback

Automatic validation styling with `.is-invalid` and `.is-valid` classes.

### Floating Labels

Enable floating labels for input, textarea, and select with `floatingLabel: true`.

### Button Variants

Bootstrap button colors: `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `light`, `dark`, `link`

Use `outline: true` for outline variants.

### Grid System Integration

Use `className` to add Bootstrap grid classes:

```typescript
{
  key: 'firstName',
  type: 'input',
  label: 'First Name',
  className: 'col-md-6'
}
```

## Customization

All field components use customizable CSS variables for consistent styling across your application.

### CSS Variables

```scss
:root {
  // Spacing
  --df-bs-field-gap: 0.5rem; // Gap between label, input, and hint

  // Label styling
  --df-bs-label-font-weight: 500; // Label font weight
  --df-bs-label-color: inherit; // Label text color

  // Hint text styling
  --df-bs-hint-color: #6c757d; // Hint text color (default: Bootstrap secondary)
  --df-bs-hint-font-size: 0.875rem; // Hint text size

  // Error styling
  --df-bs-error-color: #dc3545; // Error text color (default: Bootstrap danger)
  --df-bs-error-font-size: 0.875rem; // Error text size
}
```

### Component-Specific Styling

All Bootstrap field components use these consistent classes:

- `.df-bs-field` - Wrapper div for vertical layout
- `.df-bs-label` - Label element styling
- `.df-bs-hint` - Hint text element

You can override these in your global styles or target specific components:

```scss
// Global customization
.df-bs-field {
  --df-bs-field-gap: 0.75rem;
  margin-bottom: 1.5rem;
}

// Component-specific
df-bs-input {
  --df-bs-label-font-weight: 600;
}
```

## Testing

Import testing utilities from the `/testing` entry point:

```typescript
import { FakeTranslationService, createTestTranslationService, waitForDFInit, delay } from '@ng-forge/dynamic-form-bootstrap/testing';
```

## Running unit tests

Run `nx test dynamic-form-bootstrap` to execute the unit tests.

## License

MIT

## Links

- [Documentation](https://docs.ng-forge.com)
- [GitHub](https://github.com/ng-forge/ng-forge)
- [Bootstrap Documentation](https://getbootstrap.com/docs/5.3/)
