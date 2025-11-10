Field types define form control behavior and rendering. All fields use the `FieldConfig` interface:

```typescript
interface FieldConfig {
  key: string; // Form model property
  type: string; // Field type identifier
  label?: string; // Field label
  required?: boolean; // Required validation
  props?: Record<string, any>; // Type-specific properties
  validators?: ValidatorConfig; // Validation rules
  options?: SelectOption[]; // Options for select/radio fields
}
```

**Note**: For nested form structures, use [group fields](../field-types#group) instead of dot notation in keys.

## Core Field Types

### input

Text-based input with HTML5 type support.

```typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  required: true,
  email: true,
  props: {
    type: 'email',              // 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
    placeholder: 'user@example.com',
    hint: 'Enter a valid email address',
  }
}
```

**Props:**

- `type`: HTML input type
- `placeholder`: Input placeholder
- `hint`: Help text
- `readonly`: Read-only state
- `disabled`: Disabled state

### select

Single or multi-select dropdown.

```typescript
{
  key: 'country',
  type: 'select',
  label: 'Country',
  required: true,
  options: [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
  ],
  props: {
    placeholder: 'Select country',
    multiple: false,
    clearable: true,
  }
}
```

**Option structure:**

```typescript
interface SelectOption {
  value: any;
  label: string;
  description?: string;
  disabled?: boolean;
}
```

### checkbox

Boolean toggle control.

```typescript
{
  key: 'newsletter',
  type: 'checkbox',
  label: 'Subscribe to newsletter',
  props: {
    hint: 'Get weekly updates',
  }
}
```

### radio

Single selection from multiple options.

```typescript
{
  key: 'plan',
  type: 'radio',
  label: 'Subscription Plan',
  required: true,
  options: [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro - $10/month' },
    { value: 'enterprise', label: 'Enterprise - $50/month' },
  ]
}
```

### textarea

Multi-line text input.

```typescript
{
  key: 'bio',
  type: 'textarea',
  label: 'Biography',
  props: {
    placeholder: 'Tell us about yourself',
    rows: 4,
    maxLength: 500,
  }
}
```

### datepicker

Date selection control (requires UI integration).

```typescript
{
  key: 'birthDate',
  type: 'datepicker',
  label: 'Birth Date',
  required: true,
  minDate: new Date(1900, 0, 1),
  maxDate: new Date(),
  props: {
    placeholder: 'Select your birth date',
  }
}
```

### slider

Numeric range selection (requires UI integration).

```typescript
{
  key: 'volume',
  type: 'slider',
  label: 'Volume',
  minValue: 0,
  maxValue: 100,
  step: 5,
}
```

## Custom Field Types

Register custom field types using `FieldTypeDefinition` with `provideDynamicForm`:

```typescript
import { FieldTypeDefinition, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';
import { CustomDatePickerComponent } from './custom-date-picker';
import type { CustomDatePickerField } from './custom-date-picker';

export const CustomDatePickerType: FieldTypeDefinition<CustomDatePickerField> = {
  name: 'custom-datepicker',
  component: CustomDatePickerComponent,
};

// In app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withMaterialFields(), CustomDatePickerType)],
};
```

See [Type Safety & Inference](../type-safety) for the complete custom field type workflow including type definitions and module augmentation.

## Validation

Fields integrate with Angular's signal forms validation system. ng-forge provides shorthand syntax for common validators (e.g., `required: true`) with comprehensive customizability via the `validators` property. See [Validation](../validation) for details.

```typescript
{
  key: 'username',
  type: 'input',
  label: 'Username',
  required: true,
  minLength: 3,
  maxLength: 20,
  pattern: '^[a-zA-Z0-9_]+$',
}
```

## UI Integrations

UI framework integrations extend field types with framework-specific styling and features while maintaining the same configuration API.

- [Material Design](../../ui-libs-integrations/reference/material) - Material Design components
- [Bootstrap](../../ui-libs-integrations/reference/bootstrap) - Bootstrap styling
- [PrimeNG](../../ui-libs-integrations/reference/primeng) - PrimeNG components
- [Ionic](../../ui-libs-integrations/reference/ionic) - Ionic mobile components
