# @ng-forge/dynamic-form-primeng

Beautiful PrimeNG implementation for ng-forge dynamic forms.

[![npm version](https://img.shields.io/npm/v/@ng-forge/dynamic-form-primeng.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-form-primeng)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ⚠️ Angular 21 Compatibility Status

**Current Status:** Partial compatibility with Angular 21.0.0-next.9 and PrimeNG 20.3.0

This library is built against Angular 21's signal-based forms, but PrimeNG 20.3.0 has not yet been fully updated for Angular 21's stricter signal change detection rules. This results in the following compatibility matrix:

### ✅ Fully Working Components

- **Input** - All text input variants (email, password, text, etc.)
- **Button** - All button types (button, submit, next, previous)

### ⚠️ Known Issues

The following components encounter `NG0600: Writing to signals is not allowed while Angular renders the template` errors in tests:

- **Checkbox** - PrimeNG writes to signals during `writeValue()`
- **Radio** - PrimeNG writes to signals during `writeValue()`
- **Toggle** - PrimeNG writes to signals during `writeValue()`
- **Select** - PrimeNG writes to signals during `writeValue()`
- **Slider** - PrimeNG writes to signals during `setDisabledState()`
- **Textarea** - Configuration issue with auto-resize feature
- **Multi-Checkbox** - Partial compatibility
- **Datepicker** - Likely affected (not yet fully tested)

### Root Cause

PrimeNG 20.3.0 components call `writeModelValue()`, `writeControlValue()`, and `setDisabledState()` during template rendering, which violates Angular 21's signal change detection rules. This is a PrimeNG framework issue, not an issue with this library's implementation.

### Recommended Actions

1. **Wait for PrimeNG 21** - PrimeNG maintainers are working on Angular 21 compatibility
2. **Production Use** - The components may work in production despite test failures, but this hasn't been verified
3. **Alternative** - Use `@ng-forge/dynamic-form-material` which is fully compatible with Angular 21

### Tracking

- [PrimeNG Roadmap - Angular 21 Support](https://primeng.org/roadmap)
- [PrimeNG Issue #16546 - Modernize Components for Signals](https://github.com/primefaces/primeng/issues/16546)

## Overview

`@ng-forge/dynamic-form-primeng` provides a complete set of PrimeNG field components for ng-forge. Built with PrimeNG, these components offer beautiful, accessible, and production-ready form controls.

## Features

- 🎨 **PrimeNG Design** - Beautiful, modern UI components
- ♿ **Accessible** - WCAG compliant with proper ARIA support
- 📱 **Responsive** - Mobile-first design
- 🎯 **Complete** - All common field types included
- 🔧 **Customizable** - Full theming support
- ⚡ **Performant** - Lazy-loaded components
- 🎭 **Interactive** - Calendar, slider, multiselect, and more

## Installation

```bash
npm install @ng-forge/dynamic-form @ng-forge/dynamic-form-primeng primeng primeicons
```

## Quick Start

### 1. Import PrimeNG Styles

Add PrimeNG styles to your `styles.scss`:

```scss
@import 'primeng/resources/themes/lara-light-blue/theme.css';
@import 'primeng/resources/primeng.css';
@import 'primeicons/primeicons.css';
```

### 2. Configure Providers (Component-Level)

**Recommended approach** - Use component-level providers for better isolation:

```typescript
import { Component } from '@angular/core';
import { DynamicForm, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withPrimeNGFields } from '@ng-forge/dynamic-form-primeng';

@Component({
  selector: 'app-contact-form',
  imports: [DynamicForm],
  providers: [provideDynamicForm(...withPrimeNGFields())],
  template: `<dynamic-form [config]="config" (submit)="onSubmit($event)" />`,
})
export class ContactFormComponent {
  // Component implementation...
}
```

## Customization

### CSS Variables

All field components use customizable CSS variables for styling. You can override these in your global styles to customize the appearance:

```scss
// In your styles.scss or component styles
:root {
  // Gap between label, input, and hint
  --df-prime-field-gap: 0.75rem; // default: 0.5rem

  // Label font weight
  --df-prime-label-font-weight: 600; // default: 500

  // Hint text color
  --df-prime-hint-color: #999; // default: --p-text-muted-color or #6c757d

  // Hint text size
  --df-prime-hint-font-size: 0.8125rem; // default: 0.875rem
}
```

### Component-Specific Styling

Each field component applies these classes that you can target for further customization:

- `.df-prime-field` - The wrapper div for each field
- `.df-prime-label` - The label element
- `.df-prime-hint` - The hint text element

Example:

```scss
// Custom styling for a specific form
.my-custom-form {
  .df-prime-field {
    margin-bottom: 1.5rem;
  }

  .df-prime-label {
    text-transform: uppercase;
    font-size: 0.875rem;
  }

  .df-prime-hint {
    font-style: italic;
  }
}
```

## Available Field Types

### Text Input (`input`)

```typescript
{
  key: 'username',
  type: 'input',
  value: '',
  label: 'Username',
  props: {
    styleClass: 'w-full',
    size: 'large',
    type: 'email',
  },
}
```

### Textarea (`textarea`)

```typescript
{
  key: 'description',
  type: 'textarea',
  value: '',
  label: 'Description',
  props: {
    rows: 4,
    autoResize: true,
  },
}
```

### Select (`select`)

```typescript
{
  key: 'country',
  type: 'select',
  value: '',
  label: 'Country',
  props: {
    options: [
      { label: 'United States', value: 'US' },
      { label: 'Canada', value: 'CA' },
    ],
    filter: true,
    showClear: true,
  },
}
```

### Checkbox (`checkbox`)

```typescript
{
  key: 'terms',
  type: 'checkbox',
  value: false,
  label: 'I accept the terms',
  props: { binary: true },
}
```

### Toggle (`toggle`)

```typescript
{
  key: 'notifications',
  type: 'toggle',
  value: false,
  label: 'Enable Notifications',
}
```

### Radio Group (`radio`)

```typescript
{
  key: 'plan',
  type: 'radio',
  value: 'basic',
  label: 'Choose Your Plan',
  props: {
    options: [
      { label: 'Basic', value: 'basic' },
      { label: 'Pro', value: 'pro' },
    ],
  },
}
```

### Multi-Checkbox (`multi-checkbox`)

```typescript
{
  key: 'interests',
  type: 'multi-checkbox',
  value: [],
  label: 'Select Your Interests',
  props: {
    options: [
      { label: 'Sports', value: 'sports' },
      { label: 'Music', value: 'music' },
    ],
  },
}
```

### Datepicker (`datepicker`)

```typescript
{
  key: 'birthdate',
  type: 'datepicker',
  value: null,
  label: 'Date of Birth',
  props: {
    showIcon: true,
    dateFormat: 'mm/dd/yy',
  },
}
```

### Slider (`slider`)

```typescript
{
  key: 'rating',
  type: 'slider',
  value: 5,
  label: 'Rating',
  minValue: 1,
  maxValue: 10,
}
```

### Buttons (`button`, `submit`, `next`, `previous`)

```typescript
{
  type: 'submit',
  key: 'submit',
  label: 'Submit',
  props: {
    severity: 'primary',
    raised: true,
    icon: 'pi pi-check',
  },
}
```

## Documentation

**[📖 Full Documentation](https://ng-forge.github.io/ng-forge)**

## Running unit tests

Run `nx test dynamic-form-primeng` to execute the unit tests.

## License

MIT © ng-forge
