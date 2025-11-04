# Building Custom Integrations

Create custom UI integrations for ng-forge using any component library or design system.

## Integration Architecture

UI integrations in ng-forge:

1. Register field type implementations using `provideField()`
2. Map field types to your UI components
3. Pass configuration via `props`

## Basic Integration

### 1. Create Field Component

Implement your UI component:

```typescript
import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseFieldComponent } from '@ng-forge/dynamic-form';

@Component({
  selector: 'custom-input',
  imports: [ReactiveFormsModule],
  template: `
    <div class="custom-field">
      <label [for]="field().key">{{ field().label }}</label>
      <input
        [id]="field().key"
        [formControl]="control()"
        [type]="field().props?.type || 'text'"
        [placeholder]="field().props?.placeholder"
      />
      @if (control().invalid && control().touched) {
      <span class="error">{{ getErrorMessage() }}</span>
      }
    </div>
  `,
  styles: [
    `
      .custom-field {
        margin: 1rem 0;
      }
      label {
        display: block;
        margin-bottom: 0.5rem;
      }
      input {
        width: 100%;
        padding: 0.5rem;
      }
      .error {
        color: red;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class CustomInputComponent extends BaseFieldComponent {}
```

### 2. Register Field Type

Create provider function:

```typescript
import { provideField } from '@ng-forge/dynamic-form';

export function withCustomFields() {
  return [
    provideField('input', CustomInputComponent),
    provideField('select', CustomSelectComponent),
    provideField('checkbox', CustomCheckboxComponent),
  ];
}
```

### 3. Configure App

Register in app config:

```typescript
// app.config.ts
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withCustomFields } from './custom-fields';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(withCustomFields())],
};
```

## BaseFieldComponent

Extend `BaseFieldComponent` for automatic wiring:

```typescript
export abstract class BaseFieldComponent {
  // Inputs
  field = input.required<FieldConfig>(); // Field configuration
  control = input.required<FormControl>(); // Form control instance

  // Methods
  getErrorMessage(): string; // Get validation error message
}
```

## Field Props

Access UI-specific props via `field().props`:

```typescript
@Component({
  template: `
    <input
      [placeholder]="field().props?.placeholder"
      [disabled]="field().props?.disabled"
      [readonly]="field().props?.readonly"
      [attr.aria-label]="field().props?.ariaLabel"
    />
  `,
})
export class CustomInputComponent extends BaseFieldComponent {}
```

## Validation Display

Show validation errors:

```typescript
@Component({
  template: `
    @if (control().invalid && control().touched) {
    <div class="errors">
      @for (error of getErrors(); track error.key) {
      <span class="error">{{ error.message }}</span>
      }
    </div>
    }
  `,
})
export class CustomFieldComponent extends BaseFieldComponent {
  getErrors() {
    const errors = this.control().errors || {};
    return Object.keys(errors).map((key) => ({
      key,
      message: this.getErrorMessage(key),
    }));
  }
}
```

## Custom Field Types

Register entirely new field types:

```typescript
// color-picker.component.ts
@Component({
  selector: 'custom-color-picker',
  template: ` <input type="color" [formControl]="control()" [value]="control().value || '#000000'" /> `,
})
export class ColorPickerComponent extends BaseFieldComponent {}

// Register
export function withCustomColorPicker() {
  return provideField('color-picker', ColorPickerComponent);
}
```

Use in config:

```typescript
{
  key: 'brandColor',
  type: 'color-picker',
  label: 'Brand Color',
}
```

## Complex Components

### Select with Custom Rendering

```typescript
@Component({
  selector: 'custom-select',
  template: `
    <select [formControl]="control()">
      <option value="">{{ field().props?.placeholder || 'Select...' }}</option>
      @for (option of field().options; track option.value) {
      <option [value]="option.value">
        {{ option.label }}
        @if (option.description) {
        <span class="desc">- {{ option.description }}</span>
        }
      </option>
      }
    </select>
  `,
})
export class CustomSelectComponent extends BaseFieldComponent {}
```

### Datepicker Integration

```typescript
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'custom-datepicker',
  imports: [ReactiveFormsModule, MatDatepickerModule],
  template: `
    <mat-form-field>
      <mat-label>{{ field().label }}</mat-label>
      <input matInput [matDatepicker]="picker" [formControl]="control()" [min]="field().props?.minDate" [max]="field().props?.maxDate" />
      <mat-datepicker-toggle matSuffix [for]="picker" />
      <mat-datepicker #picker />
    </mat-form-field>
  `,
})
export class CustomDatepickerComponent extends BaseFieldComponent {}
```

## Styling Strategies

### Component Styles

Isolate styles within components:

```typescript
@Component({
  styles: [`
    :host { display: block; margin: 1rem 0; }
    .field-wrapper { /* styles */ }
  `],
})
```

### Theme Integration

Use CSS custom properties:

```typescript
@Component({
  styles: [`
    input {
      border-color: var(--primary-color, #1976d2);
      border-radius: var(--border-radius, 4px);
    }
  `],
})
```

### Global Styles

Coordinate with global theme:

```scss
// styles.scss
:root {
  --field-spacing: 1rem;
  --field-border-color: #ccc;
  --field-focus-color: #1976d2;
}
```

## Best Practices

**Extend BaseFieldComponent:**

- Automatic control/field wiring
- Consistent error handling
- Less boilerplate

**Keep components focused:**

- One field type per component
- Extract shared logic to services
- Use composition for complex fields

**Support all field props:**

- `disabled`
- `readonly`
- `placeholder`
- `hint`
- Accessibility attributes

**Handle validation:**

- Show errors on touch/blur
- Clear, actionable messages
- Support async validation

## Reference Implementations

See complete integrations:

- [Material Design](../reference/material)
- [Bootstrap](../reference/bootstrap)
- [PrimeNG](../reference/primeng)
- [Ionic](../reference/ionic)
