<p align="center">
  <img src="https://raw.githubusercontent.com/ng-forge/ng-forge/main/logo-light.svg" alt="ng-forge logo" width="400"/>
</p>

# @ng-forge/dynamic-form-primeng

Beautiful PrimeNG implementation for ng-forge dynamic forms.

[![npm version](https://img.shields.io/npm/v/@ng-forge/dynamic-form-primeng.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-form-primeng)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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

```bash group="install" name="npm"
npm install @ng-forge/dynamic-form @ng-forge/dynamic-form-primeng primeng primeicons
```

```bash group="install" name="yarn"
yarn add @ng-forge/dynamic-form @ng-forge/dynamic-form-primeng primeng primeicons
```

```bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-form @ng-forge/dynamic-form-primeng primeng primeicons
```

## Quick Start

### 1. Import PrimeNG Styles

Add PrimeNG styles to your `styles.scss`:

```scss
@import 'primeng/resources/themes/lara-light-blue/theme.css';
@import 'primeng/resources/primeng.css';
@import 'primeicons/primeicons.css';
```

### 2. Configure Providers in App Config

Add the dynamic form providers to your application configuration:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withPrimeNGFields } from '@ng-forge/dynamic-form-primeng';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withPrimeNGFields())],
};
```

### 3. Use in Components

```typescript
import { Component } from '@angular/core';
import { DynamicForm, type FormConfig, type ExtractFormValue } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-contact-form',
  imports: [DynamicForm],
  template: `<dynamic-form [config]="config" (submit)="onSubmit($event)" />`,
})
export class ContactFormComponent {
  config = {
    fields: [
      {
        key: 'email',
        type: 'input',
        value: '',
        label: 'Email',
        required: true,
        email: true,
      },
    ],
  } as const satisfies FormConfig;

  onSubmit(value: ExtractFormValue<typeof this.config>) {
    // TypeScript knows: { email: string }
    console.log('Form submitted:', value);
  }
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
