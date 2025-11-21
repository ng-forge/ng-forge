<p align="center">
  <img src="https://raw.githubusercontent.com/ng-forge/ng-forge/main/logo-light.svg" alt="ng-forge logo" width="400"/>
</p>

# @ng-forge/dynamic-forms-ionic

Beautiful Ionic implementation for ng-forge dynamic forms.

[![npm version](https://img.shields.io/npm/v/@ng-forge/dynamic-forms-ionic.svg)](https://www.npmjs.com/package/@ng-forge/dynamic-forms-ionic)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`@ng-forge/dynamic-forms-ionic` provides a complete set of Ionic field components for ng-forge. Built with Ionic Framework, these components offer beautiful, mobile-first, and production-ready form controls.

## Features

- 📱 **Mobile-First** - Optimized for mobile and tablet interfaces
- 🎨 **Ionic Design** - Beautiful, native-feeling UI components
- ♿ **Accessible** - WCAG compliant with proper ARIA support
- 🎯 **Complete** - All common field types included
- 🔧 **Customizable** - Full Ionic theming support
- ⚡ **Performant** - Lazy-loaded components
- 🌍 **Cross-Platform** - Works great on iOS, Android, and web

## Installation

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

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';
import { provideIonicAngular } from '@ionic/angular/standalone';

export const appConfig: ApplicationConfig = {
  providers: [
    provideIonicAngular({ mode: 'md' }), // 'ios' or 'md'
    provideDynamicForm(...withIonicFields()),
  ],
};
```

### 2. Import Ionic Styles

In your `styles.scss`:

```scss
@import '@ionic/angular/css/core.css';
@import '@ionic/angular/css/normalize.css';
@import '@ionic/angular/css/structure.css';
@import '@ionic/angular/css/typography.css';
```

### 3. Create a Form

```typescript
import { Component } from '@angular/core';
import { DynamicForm, type FormConfig, type ExtractFormValue } from '@ng-forge/dynamic-forms';

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
          fill: 'outline',
          labelPlacement: 'stacked',
          helperText: 'Enter your full name',
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
          fill: 'outline',
          labelPlacement: 'stacked',
          type: 'email',
          clearInput: true,
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
          fill: 'outline',
          labelPlacement: 'stacked',
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

  onSubmit(value: ExtractFormValue<typeof this.config>) {
    // TypeScript infers: { name: string, email: string, message: string }
    console.log('Form submitted:', value);
  }
}
```

## Global Configuration

You can configure default props for all Ionic form fields using the global configuration option:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';
import { provideIonicAngular } from '@ionic/angular/standalone';

export const appConfig: ApplicationConfig = {
  providers: [
    provideIonicAngular({ mode: 'md' }),
    provideDynamicForm(
      ...withIonicFields({
        fill: 'outline',
        labelPlacement: 'floating',
        color: 'primary',
      }),
    ),
  ],
};
```

### Configuration Options

| Option           | Type                                                                                                            | Default     | Description                                        |
| ---------------- | --------------------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------- |
| `fill`           | `'solid' \| 'outline'`                                                                                          | `'solid'`   | Default fill style for form inputs                 |
| `shape`          | `'round'`                                                                                                       | `undefined` | Default shape for form controls                    |
| `labelPlacement` | `'start' \| 'end' \| 'fixed' \| 'stacked' \| 'floating'`                                                        | `'start'`   | Default label placement for inputs                 |
| `color`          | `'primary' \| 'secondary' \| 'tertiary' \| 'success' \| 'warning' \| 'danger' \| 'light' \| 'medium' \| 'dark'` | `'primary'` | Default color theme                                |
| `size`           | `'small' \| 'default' \| 'large'`                                                                               | `'default'` | Default size for buttons                           |
| `expand`         | `'full' \| 'block'`                                                                                             | `undefined` | Default expand behavior for buttons                |
| `buttonFill`     | `'clear' \| 'outline' \| 'solid' \| 'default'`                                                                  | `'solid'`   | Default fill style for buttons                     |
| `strong`         | `boolean`                                                                                                       | `false`     | Whether buttons should be strong (bold) by default |

These settings will be applied to all Ionic form fields unless overridden by individual field props.

## Customization

### Using with Multiple UI Libraries

### CSS Variables

All field components use customizable CSS variables for consistent styling:

```scss
:root {
  // Field layout
  --df-ionic-field-gap: 0.5rem; // Gap between label, input, and hint

  // Label styling
  --df-ionic-label-font-weight: 500; // Label font weight
  --df-ionic-label-font-size: 1rem; // Label font size
  --df-ionic-label-color: var(--ion-text-color, #000);

  // Hint text styling
  --df-ionic-hint-color: var(--ion-color-medium, #92949c);
  --df-ionic-hint-font-size: 0.875rem;
  --df-ionic-hint-line-height: 1.25rem;
}
```

### Component-Specific Styling

You can further customize the appearance using these CSS classes:

- `.df-ionic-field` - Wrapper div for field layout
- `.df-ionic-label` - Label element styling
- `.df-ionic-hint` - Hint text element styling

Example:

```scss
.df-ionic-field {
  --df-ionic-field-gap: 1rem; // Increase spacing
}

.df-ionic-label {
  --df-ionic-label-font-weight: 600;
  text-transform: uppercase;
}
```

## Available Field Types

### Text Input

Standard text input with Ionic styling:

```typescript
{
  key: 'username',
  type: 'input',
  value: '',
  label: 'Username',
  required: true,
  props: {
    fill: 'outline',           // 'solid' | 'outline'
    labelPlacement: 'stacked', // 'start' | 'end' | 'fixed' | 'stacked' | 'floating'
    color: 'primary',          // Ionic color
    clearInput: true,          // Show clear button
    helperText: 'Choose a unique username',
    type: 'text',              // HTML input type
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
    fill: 'outline',
    labelPlacement: 'stacked',
    rows: 4,
    autoGrow: true,          // Auto-expand as user types
    maxlength: 500,
    counter: true,           // Show character counter
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
    fill: 'outline',
    labelPlacement: 'stacked',
    interface: 'action-sheet',  // 'action-sheet' | 'popover' | 'alert'
    options: [
      { label: 'United States', value: 'US' },
      { label: 'Canada', value: 'CA' },
      { label: 'Mexico', value: 'MX' },
    ],
    multiple: false,
    okText: 'Select',
    cancelText: 'Cancel',
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
    labelPlacement: 'end',
    justify: 'start',
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
    labelPlacement: 'end',
  },
}
```

### Toggle

Toggle switch:

```typescript
{
  key: 'notifications',
  type: 'toggle',
  value: true,
  label: 'Enable Notifications',
  props: {
    color: 'success',
    enableOnOffLabels: true,
    labelPlacement: 'start',
  },
}
```

### Datepicker

Date selection with Ionic datetime:

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
    presentation: 'date',         // 'date' | 'date-time' | 'time' | 'month' | 'year'
    showDefaultButtons: true,
    doneText: 'Done',
    cancelText: 'Cancel',
    color: 'primary',
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
    pin: true,                   // Show pin above knob
    ticks: true,                 // Show tick marks
    snaps: true,                 // Snap to steps
    color: 'primary',
  },
}
```

### Multi-Checkbox

Multiple selections with checkboxes:

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
      { label: 'Technology', value: 'tech' },
    ],
    color: 'primary',
    labelPlacement: 'end',
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
    color: 'primary',      // Ionic color
    expand: 'block',       // 'full' | 'block'
    fill: 'solid',         // 'clear' | 'outline' | 'solid' | 'default'
    shape: 'round',        // 'round'
    size: 'default',       // 'small' | 'default' | 'large'
  },
}
```

Using helper function:

```typescript
import { submitButton } from '@ng-forge/dynamic-forms-ionic';

submitButton({
  key: 'submit',
  label: 'Create Account',
  props: { color: 'primary', expand: 'block' },
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
  props: { color: 'primary', expand: 'block' },
}

// Previous button
{
  type: 'previous',
  key: 'backToStep1',
  label: 'Back',
  props: { fill: 'outline' },
}
```

Using helper functions:

```typescript
import { nextPageButton, previousPageButton } from '@ng-forge/dynamic-forms-ionic';

nextPageButton({ key: 'next', label: 'Continue' });
previousPageButton({ key: 'back', label: 'Back' });
```

### Action Button

Custom event button:

```typescript
import { FormEvent } from '@ng-forge/dynamic-forms';

class SaveDraftEvent extends FormEvent {
  static override readonly eventName = 'SaveDraft';
}

{
  type: 'button',
  key: 'saveDraft',
  label: 'Save as Draft',
  event: SaveDraftEvent,
  props: { color: 'medium', fill: 'outline' },
}
```

## Ionic Props

All Ionic field types support these common props:

```typescript
interface IonicFieldProps {
  fill?: 'solid' | 'outline';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked' | 'floating';
  helperText?: string;
  errorText?: string;
}
```

## Theming

Ionic components can be themed using CSS variables:

```scss
:root {
  --ion-color-primary: #3880ff;
  --ion-color-secondary: #3dc2ff;
  --ion-color-tertiary: #5260ff;
  --ion-color-success: #2dd36f;
  --ion-color-warning: #ffc409;
  --ion-color-danger: #eb445a;
}
```

## Complete Example

Here's a full registration form with Ionic:

```typescript
import { Component } from '@angular/core';
import { DynamicForm, type FormConfig, type ExtractFormValue } from '@ng-forge/dynamic-forms';
import { submitButton } from '@ng-forge/dynamic-forms-ionic';

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
            key: 'firstName',
            type: 'input',
            value: '',
            label: 'First Name',
            required: true,
            props: { fill: 'outline', labelPlacement: 'stacked' },
          },
          {
            key: 'lastName',
            type: 'input',
            value: '',
            label: 'Last Name',
            required: true,
            props: { fill: 'outline', labelPlacement: 'stacked' },
          },
          {
            key: 'birthdate',
            type: 'datepicker',
            value: null,
            label: 'Date of Birth',
            required: true,
            props: { presentation: 'date' },
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
              fill: 'outline',
              labelPlacement: 'stacked',
              type: 'email',
              clearInput: true,
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
              fill: 'outline',
              labelPlacement: 'stacked',
              type: 'password',
              helperText: 'At least 8 characters',
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
        props: { color: 'primary', expand: 'block' },
      }),
    ],
  } as const satisfies FormConfig;

  onSubmit(value: ExtractFormValue<typeof this.config>) {
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
- `toggle` - Toggle switch
- `datepicker` - Date picker
- `slider` - Numeric slider
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
- [Ionic Integration Guide](https://ng-forge.github.io/ng-forge/custom-integrations/reference/ionic)
- [Field Types](https://ng-forge.github.io/ng-forge/core/field-types)
- [Examples](https://ng-forge.github.io/ng-forge/examples)

## Requirements

- Angular 21+
- Ionic Angular 8+
- @ng-forge/dynamic-forms

## License

MIT © ng-forge

## Support

- 🐛 [Issue Tracker](https://github.com/ng-forge/ng-forge/issues)
- 💡 [Discussions](https://github.com/ng-forge/ng-forge/discussions)
- 📚 [Documentation](https://ng-forge.github.io/ng-forge)
