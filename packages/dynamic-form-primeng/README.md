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
