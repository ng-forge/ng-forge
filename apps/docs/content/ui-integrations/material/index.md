The `@ng-forge/dynamic-form-material` package provides beautiful Material Design field components that integrate seamlessly with Angular Material.

## Installation

```bash
npm install @ng-forge/dynamic-form-material @angular/material @angular/cdk
```

## Setup

### 1. Configure Providers

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [provideAnimations(), provideDynamicForm(), withMaterialFields()],
};
```

### 2. Import Material Theme

Add to your `styles.scss`:

```scss
@import '@angular/material/prebuilt-themes/indigo-pink.css';
```

## Material Field Components

### Mat Input Field

Enhanced text input with Material Design styling:

```json lines
{
  "key": "email",
  "type": "input",
  "props": {
    "label": "Email Address",
    "type": "email",
    "placeholder": "user@example.com",
    "hint": "We will never share your email",
    "required": true,
    "appearance": "outline"
  },
  "validators": {
    "required": true,
    "email": true
  }
}
```

### Interactive Example

Experience Material Design fields in action:

{{ NgDocActions.playground("MaterialExample") }}

### Mat Select Field

Material dropdown with search and multi-select capabilities:

```json lines
{
  "key": "country",
  "type": "select",
  "props": {
    "label": "Country",
    "placeholder": "Select your country",
    "appearance": "outline",
    "multiple": false,
    "options": [
      { "value": "us", "label": "United States" },
      { "value": "uk", "label": "United Kingdom" },
      { "value": "ca", "label": "Canada" }
    ]
  }
}
```

### Interactive Example

Try different select configurations:

{{ NgDocActions.playground("MaterialSelectExample") }}

### Mat Checkbox Field

Material Design checkboxes with proper spacing and theming:

```json lines
{
  "key": "newsletter",
  "type": "checkbox",
  "props": {
    "label": "Subscribe to newsletter",
    "hint": "Get updates about new features",
    "color": "primary"
  }
}
```

### Interactive Example

See Material checkboxes with different configurations:

{{ NgDocActions.playground("MaterialCheckboxExample") }}

## Material Submit Button

Stylish action buttons with Material Design:

```typescript
import { submitButton } from '@ng-forge/dynamic-form-material';

const field = submitButton({
  label: 'Create Account',
  color: 'primary',
  variant: 'raised', // 'basic' | 'raised' | 'stroked' | 'flat'
  className: 'submit-btn',
});
```

## Theming

Material fields automatically inherit your Angular Material theme. Customize appearance with:

- **color**: `'primary' | 'accent' | 'warn'`
- **appearance**: `'fill' | 'outline'` (for mat-form-field)
- **variant**: `'basic' | 'raised' | 'stroked' | 'flat'` (for buttons)

## Complete Material Form Example

See a comprehensive form using all Material components:

{{ NgDocActions.playground("CompleteMaterialForm") }}

## Advanced Features

- **Form field appearance**: Consistent with Angular Material design system
- **Error handling**: Material-style error messages
- **Accessibility**: Full a11y support with proper ARIA attributes
- **Theming**: Seamless integration with Material color palettes
- **Responsive**: Mobile-first design principles
