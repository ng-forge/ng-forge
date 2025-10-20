ng-forge provides a flexible and extensible API for defining form fields. The library includes several pre-built field types that serve as both working implementations and examples of how to create custom field types.

## Field Configuration API

All fields in ng-forge follow a consistent configuration structure:

```typescript
interface FieldConfig {
  key: string; // Unique identifier for the form field
  type: string; // Field type identifier used by providers
  props?: Record<string, any>; // Field-specific properties
  validators?: ValidatorConfig; // Validation rules and configuration
}
```

### Key Properties

- **`key`**: The unique identifier that maps to your form model. Supports nested paths like `'user.profile.name'`.
- **`type`**: A string identifier that tells ng-forge which field component to render.
- **`props`**: An object containing field-specific configuration like labels, placeholders, options, etc.
- **`validators`**: Validation rules that can include both built-in and custom validators.

## Pre-built Field Types

ng-forge includes several pre-built field types that work out of the box. These serve as both functional components and examples for creating custom field types.

### Input Field

The `input` field type handles text-based inputs with support for various HTML input types.

**Basic Configuration:**

```json
{
  "key": "email",
  "type": "input",
  "props": {
    "label": "Email Address",
    "type": "email",
    "placeholder": "user@example.com",
    "required": true,
    "hint": "We will never share your email"
  },
  "validators": {
    "required": true,
    "email": true
  }
}
```

**Common Props:**

- `type`: HTML input type (`text`, `email`, `password`, `number`, `tel`, `url`)
- `label`: Field label text
- `placeholder`: Placeholder text
- `hint`: Help text displayed below the field
- `required`: Whether the field is required
- `readonly`: Makes the field read-only
- `disabled`: Disables the field

### Select Field

The `select` field type provides dropdown selection with single or multiple choice options.

**Basic Configuration:**

```json
{
  "key": "country",
  "type": "select",
  "props": {
    "label": "Country",
    "placeholder": "Select your country",
    "multiple": false,
    "options": [
      { "value": "us", "label": "United States" },
      { "value": "uk", "label": "United Kingdom" },
      { "value": "ca", "label": "Canada" }
    ]
  }
}
```

**Option Structure:**

```typescript
interface SelectOption {
  value: any; // The actual value stored in the form
  label: string; // Display text for the option
  description?: string; // Optional additional description
  disabled?: boolean; // Whether this option is disabled
}
```

**Common Props:**

- `options`: Array of `SelectOption` objects
- `multiple`: Enable multi-select mode
- `placeholder`: Placeholder text when no option is selected
- `clearable`: Allow clearing the selection (single-select only)

### Checkbox Field

The `checkbox` field type handles boolean values and can work with nested object properties.

**Basic Configuration:**

```json
{
  "key": "subscribe",
  "type": "checkbox",
  "props": {
    "label": "Subscribe to newsletter",
    "hint": "Get updates about new features",
    "required": true
  },
  "validators": {
    "required": true
  }
}
```

**Nested Properties:**

```json
{
  "key": "preferences.notifications",
  "type": "checkbox",
  "props": {
    "label": "Enable notifications"
  }
}
```

**Common Props:**

- `label`: Checkbox label text
- `hint`: Help text displayed below the checkbox
- `required`: Whether the checkbox must be checked

### Submit Button

Submit buttons are handled differently depending on your UI framework integration. They are typically helper functions that generate field configurations.

**Material Design Example:**

```typescript
import { submitButton } from '@ng-forge/dynamic-form-material';

// Add to your field configuration array
const field = submitButton({
  label: 'Create Account',
  color: 'primary',
  variant: 'raised',
});
```

**Manual Configuration:**

```json
{
  "key": "_submit",
  "type": "submit",
  "props": {
    "label": "Submit Form",
    "disabled": false
  }
}
```

## Extensibility and Customization

The beauty of ng-forge lies in its extensible architecture. You can:

### Use UI Framework Integrations

Pre-built integrations that style and enhance the core field types:

- **[Material Design](../ui-integrations/material)** - Beautiful Material Design components with enhanced styling and props
- **PrimeNG** - Coming soon
- **Bootstrap** - Coming soon

### Create Custom Field Types

Register your own field types with custom components:

```typescript
import { provideField } from '@ng-forge/dynamic-form';

// Register a custom field type
export const provideCustomDatePicker = () => provideField('date-picker', CustomDatePickerComponent);
```

### Extend Existing Field Types

Override or extend existing field types with your own implementations:

```typescript
import { provideField } from '@ng-forge/dynamic-form';

// Override the built-in input field with a custom implementation
export const provideCustomInput = () => provideField('input', CustomInputComponent);
```

### Validation Integration

All field types automatically integrate with Angular's reactive forms validation system:

```json
{
  "key": "username",
  "type": "input",
  "props": { "label": "Username" },
  "validators": {
    "required": true,
    "minLength": 3,
    "maxLength": 20,
    "pattern": "^[a-zA-Z0-9_]+$"
  }
}
```

Each UI framework integration provides enhanced styling, additional props, and framework-specific features while maintaining the same core field configuration API.
