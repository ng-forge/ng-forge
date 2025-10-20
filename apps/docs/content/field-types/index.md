# Field Types

ng-forge provides a comprehensive set of core field types out of the box, designed to be UI framework agnostic. These field types work with any UI library through our provider system.

## Core Concepts

All field types share a common configuration structure:

```typescript
interface FieldConfig {
  key: string;           // Form field key/name
  type: string;          // Field type identifier  
  props: any;           // Field-specific properties
  validators?: any;     // Validation rules
}
```

## Input Field

Text input with various type variants including text, email, password, and number.

```typescript
{
  key: 'email',
  type: 'input',
  props: {
    label: 'Email Address',
    type: 'email',
    placeholder: 'user@example.com'
  }
}
```

### Interactive Example

Try different input field configurations:

```typescript playground:InputExample
```

## Select Field  

Dropdown selection with single or multiple options.

```typescript
{
  key: 'country',
  type: 'select', 
  props: {
    label: 'Country',
    placeholder: 'Select your country',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'ca', label: 'Canada' }
    ]
  }
}
```

### Interactive Example

Explore different select configurations:

```typescript playground:SelectExample
```

## Checkbox Field

Boolean checkbox input for single values or nested object properties.

```typescript
{
  key: 'subscribe',
  type: 'checkbox',
  props: {
    label: 'Subscribe to newsletter',
    hint: 'Get updates about new features'
  }
}
```

### Interactive Example

See checkboxes with validation and nested properties:

```typescript playground:CheckboxExample
```

## Submit Button

Action button for form submission. Available through UI framework integrations.

```typescript
// Example with a UI library integration
import { submitButton } from '@ng-forge/dynamic-form-material';

const field = submitButton({
  label: 'Create Account',
  color: 'primary'
});
```

## UI Framework Integrations

These core field types can be styled and enhanced through UI framework integrations:

- **[Material Design](../material)** - Beautiful Material Design components
- **PrimeNG** - Coming soon
- **Bootstrap** - Coming soon
- **Custom** - Create your own field implementations

Each integration provides enhanced styling, additional props, and framework-specific features while maintaining the same core field configuration API.
