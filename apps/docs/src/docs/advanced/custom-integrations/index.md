> Prerequisites: [Installation](../../installation), [Field Types](../schema-fields/field-types), [Type Safety](../type-safety)

Create custom UI integrations for ng-forge dynamic forms using any component library or design system.

## Package Structure

The `@ng-forge/dynamic-forms` package is organized into multiple entrypoints to keep the core abstract and provide specialized utilities for integration authors:

| Entrypoint                            | Purpose                                                    |
| ------------------------------------- | ---------------------------------------------------------- |
| `@ng-forge/dynamic-forms`             | Core types, components, and configuration (for all users)  |
| `@ng-forge/dynamic-forms/integration` | Field types, mappers, and utilities for UI library authors |

When building a custom integration, you'll primarily import from the `/integration` entrypoint:

```typescript
// Core types (used by everyone)
import { DynamicForm, provideDynamicForm, FormConfig, DynamicText } from '@ng-forge/dynamic-forms';

// Integration utilities (for UI library authors)
import {
  InputField,
  SelectField,
  CheckboxField,
  valueFieldMapper,
  checkboxFieldMapper,
  createResolvedErrorsSignal,
} from '@ng-forge/dynamic-forms/integration';
```

## Integration Overview

UI integrations map field types to your components using `FieldTypeDefinition` objects. Each definition specifies the field type name, component loader, and mapper function.

## Basic Steps

### 1. Define Field Type Interface

Create a type interface extending the base field type:

```typescript
import { ValueFieldComponent, DynamicText } from '@ng-forge/dynamic-forms';
import { InputField } from '@ng-forge/dynamic-forms/integration';

// Define your custom props
export interface CustomInputProps extends Record<string, unknown> {
  appearance?: 'outline' | 'fill';
  hint?: DynamicText;
  type?: 'text' | 'email' | 'password' | 'number';
}

// Extend the base InputField with your props
export type CustomInputField = InputField<CustomInputProps>;

// Define the component interface (used for type checking)
export type CustomInputComponent = ValueFieldComponent<CustomInputField>;
```

### 2. Create Field Component

Implement the component using Angular's signal forms:

```typescript
import { Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { CustomInputComponent, CustomInputProps } from './custom-input.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'custom-input',
  imports: [Field, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <div class="custom-field" [class.custom-outline]="props()?.appearance === 'outline'">
      @if (label()) {
      <label [for]="key() + '-input'">{% raw %}{{ label() | dynamicText | async }}{% endraw %}</label>
      }

      <input
        [id]="key() + '-input'"
        [field]="f"
        [type]="props()?.type || 'text'"
        [placeholder]="{% raw %}(placeholder() | dynamicText | async) ?? ''{% endraw %}"
        [disabled]="f().disabled()"
        [attr.tabindex]="tabIndex()"
      />

      @if (props()?.hint; as hint) {
      <div class="hint">{% raw %}{{ hint | dynamicText | async }}{% endraw %}</div>
      } @if (f().touched() && f().invalid()) {
      <div class="error">{% raw %}{{ f().errors() | json }}{% endraw %}</div>
      }
    </div>
  `,
  host: {
    '[id]': '`${key()}`',
    '[class]': 'className()',
  },
})
export default class CustomInputFieldComponent implements CustomInputComponent {
  // Required inputs
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  // Standard inputs
  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  // Custom props
  readonly props = input<CustomInputProps>();
}
```

### 3. Create Field Type Definition

Define the field type registration:

```typescript
import { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import { valueFieldMapper } from '@ng-forge/dynamic-forms/integration';

export const CustomInputType: FieldTypeDefinition = {
  name: 'input',
  loadComponent: () => import('./custom-input.component'),
  mapper: valueFieldMapper,
};
```

### 4. Create Provider Function

Export a function that returns all your field type definitions:

```typescript
import { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import { CustomInputType } from './fields/input';
import { CustomSelectType } from './fields/select';
import { CustomCheckboxType } from './fields/checkbox';

export function withCustomFields(): FieldTypeDefinition[] {
  return [
    CustomInputType,
    CustomSelectType,
    CustomCheckboxType,
    // ... more field types
  ];
}
```

### 5. Configure App

Add your fields to the app configuration:

```typescript name="app.config.ts"
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withCustomFields } from './custom-fields';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withCustomFields())],
};
```

## Component Interface Types

ng-forge provides component interface types for different field categories:

### ValueFieldComponent

For fields that collect user input (input, select, textarea, datepicker, radio, slider):

```typescript
import { ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { InputField } from '@ng-forge/dynamic-forms/integration';

export type CustomInputComponent = ValueFieldComponent<CustomInputField>;
```

The component must implement these inputs:

- `field: FieldTree<TValue>` - The form field from Angular's signal forms
- `key: string` - Unique field identifier
- `label?: DynamicText` - Field label
- `placeholder?: DynamicText` - Placeholder text
- `className?: string` - CSS classes
- `tabIndex?: number` - Tab order
- `props?: TProps` - Custom field-specific props
- `meta?: FieldMeta` - Native HTML attributes (data-_, aria-_, autocomplete, etc.)

### CheckedFieldComponent

For checkbox and toggle fields:

```typescript
import { CheckedFieldComponent } from '@ng-forge/dynamic-forms';
import { CheckboxField } from '@ng-forge/dynamic-forms/integration';

export type CustomCheckboxComponent = CheckedFieldComponent<CustomCheckboxField>;
```

Similar to ValueFieldComponent but specifically for boolean checkbox fields.

## Field Binding with [field]

The key to connecting your component to Angular's signal forms is the `[field]` binding. Import `Field` and `FieldTree` from Angular's signal forms package:

```typescript
import { Field, FieldTree } from '@angular/forms/signals';
```

Then use the `[field]` directive on form controls:

```typescript
<input [field]="f" ... />
<mat-checkbox [field]="f" ... />
<select [field]="f" ... />
```

This directive automatically:

- Binds the form control value
- Handles value changes
- Manages validation state
- Syncs disabled/readonly states

## Field Mappers

Mappers convert field definitions to component input bindings. ng-forge provides built-in mappers:

### valueFieldMapper

For standard value-bearing fields:

```typescript
import { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import { valueFieldMapper } from '@ng-forge/dynamic-forms/integration';

export const CustomInputType: FieldTypeDefinition = {
  name: 'input',
  loadComponent: () => import('./custom-input.component'),
  mapper: valueFieldMapper, // Maps value fields
};
```

### checkboxFieldMapper

For checkbox/toggle fields:

```typescript
import { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import { checkboxFieldMapper } from '@ng-forge/dynamic-forms/integration';

export const CustomCheckboxType: FieldTypeDefinition = {
  name: 'checkbox',
  loadComponent: () => import('./custom-checkbox.component'),
  mapper: checkboxFieldMapper, // Maps checkbox fields
};
```

### Custom Mappers

For specialized fields (like buttons), create custom mappers:

```typescript
import { Binding, inputBinding } from '@angular/core';
import { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import { ButtonField } from '@ng-forge/dynamic-forms/integration';

export function buttonFieldMapper(fieldDef: ButtonField<unknown, unknown>): Binding[] {
  return [
    inputBinding('key', () => fieldDef.key),
    inputBinding('label', () => fieldDef.label),
    inputBinding('disabled', () => fieldDef.disabled ?? false),
    inputBinding('event', () => fieldDef.event),
    inputBinding('props', () => fieldDef.props),
    inputBinding('className', () => fieldDef.className),
  ];
}

export const CustomButtonType: FieldTypeDefinition = {
  name: 'button',
  loadComponent: () => import('./custom-button.component'),
  mapper: buttonFieldMapper,
  valueHandling: 'exclude', // Buttons don't contribute to form value
};
```

## Value Handling

The `valueHandling` property controls whether a field contributes to the form value:

- `'include'` (default) - Field value included in form data
- `'exclude'` - Field excluded from form data (for buttons, text fields, etc.)

```typescript
export const ButtonType: FieldTypeDefinition = {
  name: 'button',
  loadComponent: () => import('./button.component'),
  mapper: buttonFieldMapper,
  valueHandling: 'exclude', // Buttons don't have values
};
```

## Type Safety with Module Augmentation

Register your field types with TypeScript for full type inference:

```typescript
// In your field types file
declare module '@ng-forge/dynamic-forms' {
  interface FieldRegistryLeaves {
    input: CustomInputField;
    select: CustomSelectField;
    checkbox: CustomCheckboxField;
  }
}
```

This enables:

- IntelliSense for field properties
- Type checking in form configurations
- Compile-time validation of field definitions

## Handling Meta Attributes

`meta` attributes are native HTML attributes that should be applied to the underlying form element. They differ from `props` (which control UI library behavior). See [Props vs Meta](../schema-fields/field-types#props-vs-meta) for detailed usage guidance.

### Props vs Meta Summary

| Attribute Type     | Example                 | Use `props` | Use `meta` |
| ------------------ | ----------------------- | ----------- | ---------- |
| UI appearance      | `appearance: 'outline'` | ✅          | ❌         |
| Component behavior | `multiple: true`        | ✅          | ❌         |
| Browser autofill   | `autocomplete: 'email'` | ❌          | ✅         |
| Testing IDs        | `data-testid: 'email'`  | ❌          | ✅         |
| Accessibility      | `aria-describedby`      | ❌          | ✅         |

### Using setupMetaTracking

ng-forge provides the `setupMetaTracking` utility to apply meta attributes to native elements. This uses Angular's `afterRenderEffect` for efficient DOM updates.

```typescript
import { Component, ElementRef, inject, input } from '@angular/core';
import { FieldMeta, setupMetaTracking } from '@ng-forge/dynamic-forms/integration';

@Component({
  template: ` <input [field]="f" /> `,
})
export default class CustomInputComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  readonly meta = input<FieldMeta>();

  constructor() {
    // Apply meta attributes to the native input element
    setupMetaTracking(this.elementRef, this.meta, { selector: 'input' });
  }
}
```

**Parameters:**

- `elementRef`: Reference to the host element
- `meta`: Signal containing the meta attributes
- `options.selector`: CSS selector to find the target element(s) within the host

### Components with Dynamic Options

For components with dynamic options (radio groups, multi-checkbox), pass a `dependents` array to ensure meta updates when options change:

```typescript
@Component({
  template: `
    @for (option of options(); track option.value) {
      <label>
        <input type="radio" [value]="option.value" />
        {% raw %}{{ option.label }}{% endraw %}
      </label>
    }
  `,
})
export default class CustomRadioComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  readonly meta = input<FieldMeta>();
  readonly options = input<Option[]>([]);

  constructor() {
    // Re-apply meta when options change (new inputs are rendered)
    setupMetaTracking(this.elementRef, this.meta, {
      selector: 'input[type="radio"]',
      dependents: [this.options],
    });
  }
}
```

### Shadow DOM Considerations

For components using Shadow DOM (like Ionic), you cannot access the internal input. Apply meta to the host element by omitting the `selector`:

```typescript
@Component({
  template: `
    <ion-checkbox [checked]="value()">
      {% raw %}{{ label() }}{% endraw %}
    </ion-checkbox>
  `,
})
export default class IonicCheckboxComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  readonly meta = input<FieldMeta>();

  constructor() {
    // No selector: applies meta to the host element itself
    setupMetaTracking(this.elementRef, this.meta);
  }
}
```

## Best Practices

**Use proper component interfaces:**

- Implement `ValueFieldComponent<T>` for value fields
- Implement `CheckedFieldComponent<T>` for checkboxes/toggles
- Define clear prop interfaces

**Handle meta attributes:**

- All components must accept a `meta` input
- Use `setupMetaTracking` with a selector for native elements
- Pass `dependents` for components with dynamic options
- Omit selector for Shadow DOM components (applies to host)

**Leverage [field] binding:**

- Use `[field]="f"` on form controls
- Automatic value and validation handling
- No manual form control management needed

**Support DynamicText:**

- Accept `DynamicText` for labels, hints, placeholders
- Use `DynamicTextPipe` for rendering
- Enables i18n with any translation library

**Handle validation state:**

- Show errors when `f().touched() && f().invalid()`
- Display validation messages from `f().errors()`
- Clear, accessible error presentation

**Accessibility:**

- Proper ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader support

**Lazy loading:**

- Use dynamic imports in `loadComponent`
- Keeps initial bundle size small
- Components load on-demand

## Reference Implementations

See complete integrations:

- [Material Design](../../ui-libs-integrations/material) - Full Material implementation with 12+ field types
- [Bootstrap](../../ui-libs-integrations/bootstrap)
- [PrimeNG](../../ui-libs-integrations/primeng)
- [Ionic](../../ui-libs-integrations/ionic)

The Material integration source code is the most comprehensive example of implementing custom field types.

## Related Topics

- **[Material Integration](../../ui-libs-integrations/material)** - Complete reference implementation
- **[Field Types](../schema-fields/field-types)** - Understanding all available field types
- **[Type Safety](../type-safety)** - Module augmentation for custom types
- **[Validation](../validation/basics)** - Displaying validation errors in custom fields
