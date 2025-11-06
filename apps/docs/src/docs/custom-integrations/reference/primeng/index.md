# PrimeNG Integration

> **Status: Experimental** ⚠️
> PrimeNG integration has partial Angular 21 compatibility. See [compatibility notes](#compatibility-status) below.

Beautiful PrimeNG implementation for ng-forge dynamic forms.

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

### 2. Configure Providers

Use component-level providers for isolation:

```typescript
import { Component } from '@angular/core';
import { DynamicForm, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withPrimeNGFields } from '@ng-forge/dynamic-form-primeng';

@Component({
  selector: 'app-my-form',
  imports: [DynamicForm],
  providers: [provideDynamicForm(...withPrimeNGFields())],
  template: `<dynamic-form [config]="config" />`,
})
export class MyFormComponent {
  // Your form config...
}
```

## Examples

### Input Field

{{ NgDocActions.demo("InputDemoComponent") }}

## Compatibility Status

**Current Status:** Partial compatibility with Angular 21.0.0-next.9 and PrimeNG 20.3.0

### ✅ Fully Working Components

- **Input** - All text input variants
- **Button** - All button types

### ⚠️ Known Issues

The following components encounter `NG0600` errors in tests due to PrimeNG's signal handling:

- Checkbox, Radio, Toggle, Select, Slider, Textarea, Multi-Checkbox, Datepicker

**Root Cause:** PrimeNG 20.3.0 writes to signals during template rendering, which violates Angular 21's stricter rules. This is a PrimeNG framework issue.

### Recommendations

- **Wait for PrimeNG 21** - Full Angular 21 compatibility coming soon
- **Use Material** - `@ng-forge/dynamic-form-material` is fully compatible
- **Production Use** - May work despite test failures (untested)

For more details, see the [library README](https://github.com/ng-forge/ng-forge/tree/main/packages/dynamic-form-primeng).
