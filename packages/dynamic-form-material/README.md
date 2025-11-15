<p align="center">
  <img src="https://raw.githubusercontent.com/ng-forge/ng-forge/main/logo.svg" alt="ng-forge logo" width="400"/>
</p>

# @ng-forge/dynamic-form-material

Beautiful Material Design implementation for ng-forge dynamic forms.

[![npm version](https://img.shields.io/npm/v/@ng-forge/dynamic-form-material.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-form-material)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`@ng-forge/dynamic-form-material` provides a complete set of Material Design field components for ng-forge. Built with Angular Material, these components offer beautiful, accessible, and production-ready form controls.

## Features

- 🎨 **Material Design** - Beautiful, modern UI components
- ♿ **Accessible** - WCAG compliant with proper ARIA support
- 📱 **Responsive** - Mobile-first design
- 🎯 **Complete** - All common field types included
- 🔧 **Customizable** - Full theming support
- ⚡ **Performant** - Lazy-loaded components
- 🎭 **Interactive** - Autocomplete, datepicker, slider, and more

## Installation

```bash group="install" name="npm"
npm install @ng-forge/dynamic-form @ng-forge/dynamic-form-material @angular/material
```

```bash group="install" name="yarn"
yarn add @ng-forge/dynamic-form @ng-forge/dynamic-form-material @angular/material
```

```bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-form @ng-forge/dynamic-form-material @angular/material
```

## Quick Start

### 1. Configure Providers

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withMaterialFields())],
};
```

### 2. Create a Form

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
        key: 'name',
        type: 'input',
        value: '',
        label: 'Full Name',
        required: true,
        props: {
          appearance: 'outline',
          hint: 'Enter your full name',
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
          appearance: 'outline',
          prefixIcon: 'email',
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
          type: 'raised',
        },
      },
    ],
  } as const satisfies FormConfig;

  onSubmit(value: ExtractFormValue<typeof this.config>) {
    // TypeScript infers: { name: string, email: string, message: string }
    console.log('Form submitted:', value);
  }
}
```

## Available Field Types

### Text Input

Standard text input with Material Design styling:

```typescript
{
  key: 'username',
  type: 'input',
  value: '',
  label: 'Username',
  required: true,
  props: {
    appearance: 'outline',    // 'fill' | 'outline'
    prefixIcon: 'person',     // Material icon name
    suffixIcon: 'clear',
    hint: 'Choose a unique username',
    type: 'text',             // HTML input type
  },
}
```

### Textarea

Multi-line text input:

```typescript
{
  key: 'description',
  type: 'textarea',
  value: '',
  label: 'Description',
  props: {
    appearance: 'outline',
    rows: 4,
    autosize: true,
    maxRows: 10,
  },
}
```

### Select

Dropdown selection:

```typescript
{
  key: 'country',
  type: 'select',
  value: '',
  label: 'Country',
  required: true,
  props: {
    appearance: 'outline',
    options: [
      { label: 'United States', value: 'US' },
      { label: 'Canada', value: 'CA' },
      { label: 'Mexico', value: 'MX' },
    ],
    multiple: false,
    searchable: true,
  },
}
```

### Checkbox

Boolean checkbox:

```typescript
{
  key: 'terms',
  type: 'checkbox',
  value: false,
  label: 'I accept the terms and conditions',
  required: true,
  props: {
    color: 'primary',
  },
}
```

### Radio Group

Single selection from multiple options:

```typescript
{
  key: 'plan',
  type: 'radio',
  value: 'basic',
  label: 'Choose Your Plan',
  required: true,
  props: {
    options: [
      { label: 'Basic - $9/mo', value: 'basic' },
      { label: 'Pro - $29/mo', value: 'pro' },
      { label: 'Enterprise - $99/mo', value: 'enterprise' },
    ],
    color: 'primary',
  },
}
```

### Datepicker

Date selection with calendar:

```typescript
{
  key: 'birthdate',
  type: 'datepicker',
  value: null,
  label: 'Date of Birth',
  required: true,
  minDate: new Date(1900, 0, 1),
  maxDate: new Date(),
  props: {
    appearance: 'outline',
    startView: 'month',      // 'month' | 'year' | 'multi-year'
    touchUi: false,          // Mobile-friendly picker
    hint: 'MM/DD/YYYY',
  },
}
```

### Slider

Numeric value selection:

```typescript
{
  key: 'rating',
  type: 'slider',
  value: 5,
  label: 'Rate Your Experience',
  minValue: 1,
  maxValue: 10,
  step: 1,
  props: {
    showTicks: true,
    thumbLabel: true,
    color: 'primary',
  },
}
```

## Button Types

### Submit Button

Automatically validates and submits the form:

```typescript
{
  type: 'submit',
  key: 'submit',
  label: 'Create Account',
  props: {
    color: 'primary',         // 'primary' | 'accent' | 'warn'
    type: 'raised',           // 'raised' | 'flat' | 'stroked' | 'icon'
  },
}
```

Using helper function:

```typescript
import { submitButton } from '@ng-forge/dynamic-form-material';

submitButton({
  key: 'submit',
  label: 'Create Account',
  props: { color: 'primary' },
});
```

### Next/Previous Buttons

For multi-step forms:

```typescript
// Next button
{
  type: 'next',
  key: 'nextToStep2',
  label: 'Continue',
  props: { color: 'primary' },
}

// Previous button
{
  type: 'previous',
  key: 'backToStep1',
  label: 'Back',
}
```

Using helper functions:

```typescript
import { nextPageButton, previousPageButton } from '@ng-forge/dynamic-form-material';

nextPageButton({ key: 'next', label: 'Continue' });
previousPageButton({ key: 'back', label: 'Back' });
```

### Action Button

Custom event button:

```typescript
import { FormEvent } from '@ng-forge/dynamic-form';

class SaveDraftEvent extends FormEvent {
  static override readonly eventName = 'SaveDraft';
}

{
  type: 'button',
  key: 'saveDraft',
  label: 'Save as Draft',
  event: SaveDraftEvent,
  props: { color: 'accent' },
}
```

Using helper function:

```typescript
import { actionButton } from '@ng-forge/dynamic-form-material';

actionButton({
  key: 'saveDraft',
  label: 'Save as Draft',
  event: SaveDraftEvent,
  props: { color: 'accent' },
});
```

## Material Design Props

All Material Design field types support these common props:

```typescript
interface MaterialFieldProps {
  appearance?: 'fill' | 'outline';
  color?: 'primary' | 'accent' | 'warn';
  hint?: string;
  prefixIcon?: string; // Material icon name
  suffixIcon?: string;
  subscriptSizing?: 'fixed' | 'dynamic';
}
```

## Layout Fields

### Group

Organize fields into sections:

```typescript
{
  key: 'address',
  type: 'group',
  label: 'Address',
  fields: [
    { key: 'street', type: 'input', value: '', label: 'Street' },
    { key: 'city', type: 'input', value: '', label: 'City' },
    { key: 'zipCode', type: 'input', value: '', label: 'ZIP Code' },
  ],
}
```

### Row

Horizontal field layout:

```typescript
{
  key: 'name',
  type: 'row',
  fields: [
    { key: 'firstName', type: 'input', value: '', label: 'First Name' },
    { key: 'lastName', type: 'input', value: '', label: 'Last Name' },
  ],
}
```

### Page

Multi-step form pages:

```typescript
{
  fields: [
    {
      key: 'personalInfo',
      type: 'page',
      title: 'Personal Information',
      description: 'Tell us about yourself',
      fields: [
        { key: 'firstName', type: 'input', value: '', label: 'First Name', required: true },
        { key: 'lastName', type: 'input', value: '', label: 'Last Name', required: true },
        { type: 'next', key: 'next', label: 'Continue' },
      ],
    },
    {
      key: 'contactInfo',
      type: 'page',
      title: 'Contact Information',
      description: 'How can we reach you?',
      fields: [
        { key: 'email', type: 'input', value: '', label: 'Email', required: true, email: true },
        { key: 'phone', type: 'input', value: '', label: 'Phone', props: { type: 'tel' } },
        { type: 'previous', key: 'back', label: 'Back' },
        { type: 'submit', key: 'submit', label: 'Complete' },
      ],
    },
  ],
}
```

## Theming

ng-forge Material components inherit your Angular Material theme:

```typescript
@use '@angular/material' as mat;

$my-primary: mat.define-palette(mat.$indigo-palette);
$my-accent: mat.define-palette(mat.$pink-palette);

$my-theme: mat.define-light-theme((
  color: (
    primary: $my-primary,
    accent: $my-accent,
  )
));

@include mat.all-component-themes($my-theme);
```

## Complete Example

Here's a full registration form with Material Design:

```typescript
import { Component } from '@angular/core';
import { DynamicForm, type FormConfig, type ExtractFormValue } from '@ng-forge/dynamic-form';
import { submitButton } from '@ng-forge/dynamic-form-material';

@Component({
  selector: 'app-registration',
  imports: [DynamicForm],
  template: `<dynamic-form [config]="config" (submit)="onSubmit($event)" />`,
})
export class RegistrationComponent {
  config = {
    fields: [
      {
        key: 'personalInfo',
        type: 'group',
        label: 'Personal Information',
        fields: [
          {
            key: 'name',
            type: 'row',
            fields: [
              {
                key: 'firstName',
                type: 'input',
                value: '',
                label: 'First Name',
                required: true,
                props: { appearance: 'outline' },
              },
              {
                key: 'lastName',
                type: 'input',
                value: '',
                label: 'Last Name',
                required: true,
                props: { appearance: 'outline' },
              },
            ],
          },
          {
            key: 'birthdate',
            type: 'datepicker',
            value: null,
            label: 'Date of Birth',
            required: true,
            props: { appearance: 'outline' },
          },
        ],
      },
      {
        key: 'account',
        type: 'group',
        label: 'Account Details',
        fields: [
          {
            key: 'email',
            type: 'input',
            value: '',
            label: 'Email',
            required: true,
            email: true,
            props: {
              appearance: 'outline',
              prefixIcon: 'email',
            },
          },
          {
            key: 'password',
            type: 'input',
            value: '',
            label: 'Password',
            required: true,
            minLength: 8,
            props: {
              appearance: 'outline',
              type: 'password',
              hint: 'At least 8 characters',
            },
          },
        ],
      },
      {
        key: 'terms',
        type: 'checkbox',
        value: false,
        label: 'I accept the terms and conditions',
        required: true,
        props: { color: 'primary' },
      },
      submitButton({
        key: 'submit',
        label: 'Create Account',
        props: { color: 'primary' },
      }),
    ],
  } as const satisfies FormConfig;

  onSubmit(value: ExtractFormValue<typeof this.config>) {
    // TypeScript infers the complete nested structure
    console.log('Registration submitted:', value);
  }
}
```

## API Reference

### Field Types

- `input` - Text input
- `textarea` - Multi-line text input
- `select` - Dropdown selection
- `checkbox` - Boolean checkbox
- `radio` - Radio group
- `datepicker` - Date picker
- `slider` - Numeric slider
- `toggle` - Toggle switch
- `multi-checkbox` - Multiple checkboxes
- `submit` - Submit button
- `next` - Next page button
- `previous` - Previous page button
- `button` - Custom action button

### Helper Functions

```typescript
// Button helpers
submitButton(config: SubmitButtonConfig): SubmitButtonField
nextPageButton(config: NextButtonConfig): NextButtonField
previousPageButton(config: PreviousButtonConfig): PreviousButtonField
actionButton(config: ActionButtonConfig): ActionButtonField
```

## Documentation

**[📖 Full Documentation](https://ng-forge.github.io/ng-forge)**

- [Getting Started](https://ng-forge.github.io/ng-forge/getting-started)
- [Material Integration Guide](https://ng-forge.github.io/ng-forge/custom-integrations/reference/material)
- [Field Types](https://ng-forge.github.io/ng-forge/core/field-types)
- [Examples](https://ng-forge.github.io/ng-forge/examples)

## Requirements

- Angular 21+
- Angular Material 21+
- @ng-forge/dynamic-form

## License

MIT © ng-forge

## Support

- 🐛 [Issue Tracker](https://github.com/ng-forge/ng-forge/issues)
- 💡 [Discussions](https://github.com/ng-forge/ng-forge/discussions)
- 📚 [Documentation](https://ng-forge.github.io/ng-forge)
