# Building Custom Integrations

Create custom UI integrations for ng-forge using any component library or design system.

## Integration Overview

UI integrations map field types to your UI components using `provideField()`.

## Basic Steps

### 1. Create Field Component

Extend `BaseFieldComponent`:

```typescript
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseFieldComponent } from '@ng-forge/dynamic-form';

@Component({
  selector: 'custom-input',
  imports: [ReactiveFormsModule],
  template: `
    <div class="custom-field">
      <label>Label here</label>
      <input [formControl]="control()" />
    </div>
  `,
})
export class CustomInputComponent extends BaseFieldComponent {}
```

### 2. Register Field Type

```typescript
import { provideField } from '@ng-forge/dynamic-form';

export function withCustomFields() {
  return [provideField('input', CustomInputComponent), provideField('select', CustomSelectComponent)];
}
```

### 3. Configure App

```typescript
// app.config.ts
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withCustomFields } from './custom-fields';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(withCustomFields())],
};
```

## BaseFieldComponent

Provides automatic wiring:

- `field()` - Field configuration
- `control()` - Form control instance
- `getErrorMessage()` - Validation error message

## Field Props

Access UI-specific props via `field().props`:

- `placeholder`
- `disabled`
- `readonly`
- `hint`

## Best Practices

**Extend BaseFieldComponent:**

- Automatic control/field wiring
- Consistent error handling

**Keep components focused:**

- One field type per component
- Extract shared logic to services

**Support all field props:**

- disabled, readonly, placeholder, hint
- Accessibility attributes

**Handle validation:**

- Show errors on touch/blur
- Clear, actionable messages

## Reference Implementations

See complete integrations:

- [Material Design](../reference/material) - Full Material implementation with 10+ field types
- [Bootstrap](../reference/bootstrap)
- [PrimeNG](../reference/primeng)
- [Ionic](../reference/ionic)
