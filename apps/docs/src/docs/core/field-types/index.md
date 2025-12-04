Field types define form control behavior and rendering. Each UI integration (Material, Bootstrap, PrimeNG, Ionic) provides implementations for these core field types.

**Note**: For nested form structures, use [group fields](../field-types#group) instead of dot notation in keys.

## Core Field Types

### input

Text-based input with HTML5 type support.

```typescript
{
  key: 'email',
  type: 'input',
  value: '',
  label: 'Email',
  required: true,
  email: true,
  props: {
    type: 'email',              // 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
    placeholder: 'user@example.com',
  }
}
```

**Core Props:**

- `type`: HTML input type (`'text'` | `'email'` | `'password'` | `'number'` | `'tel'` | `'url'`)
- `placeholder`: Input placeholder text

**Note:** UI integrations may extend props with additional features like `hint`, `appearance`, etc. See your specific integration's documentation.

### select

Single or multi-select dropdown.

```typescript
{
  key: 'country',
  type: 'select',
  value: '',
  label: 'Country',
  required: true,
  options: [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
  ],
  props: {
    placeholder: 'Select country',
  }
}
```

**Core Properties:**

- `options`: Array of `{ value: T, label: string }` objects (at field level, not in props)

**Core Props:**

- `placeholder`: Placeholder text when no value selected

**Note:** UI integrations may extend with additional props like `multiple`, `clearable`, etc. Check your specific integration's documentation.

### checkbox

Boolean toggle control.

```typescript
{
  key: 'newsletter',
  type: 'checkbox',
  value: false,
  label: 'Subscribe to newsletter',
}
```

**Note:** UI integrations may extend with additional props like `hint`. The core checkbox has no required props.

### radio

Single selection from multiple options.

```typescript
{
  key: 'plan',
  type: 'radio',
  value: '',
  label: 'Subscription Plan',
  required: true,
  options: [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro - $10/month' },
    { value: 'enterprise', label: 'Enterprise - $50/month' },
  ],
}
```

**Core Properties:**

- `options`: Array of `{ value: string, label: string }` objects (at field level, not in props)

### textarea

Multi-line text input.

```typescript
{
  key: 'bio',
  type: 'textarea',
  value: '',
  label: 'Biography',
  maxLength: 500,
  props: {
    placeholder: 'Tell us about yourself',
    rows: 4,
  }
}
```

**Core Props:**

- `placeholder`: Placeholder text
- `rows`: Number of visible text rows

### datepicker

Date selection control (requires UI integration).

```typescript
{
  key: 'birthDate',
  type: 'datepicker',
  label: 'Birth Date',
  value: null,
  required: true,
  minDate: new Date(1900, 0, 1),  // optional
  maxDate: new Date(),            // optional
  props: {
    placeholder: 'Select your birth date',
  }
}
```

**Core Properties (all optional):**

- `minDate`: Minimum selectable date (at field level) - `Date | string | null`
- `maxDate`: Maximum selectable date (at field level) - `Date | string | null`
- `startAt`: Initial calendar view date - `Date | null`

**Core Props:**

- `placeholder`: Placeholder text
- `format`: Date format string (UI-integration specific)

### slider

Numeric range selection (requires UI integration).

```typescript
{
  key: 'volume',
  type: 'slider',
  label: 'Volume',
  value: 50,
  minValue: 0,    // optional
  maxValue: 100,  // optional
  step: 5,        // optional
}
```

**Core Properties (all optional):**

- `minValue`: Minimum slider value (at field level)
- `maxValue`: Maximum slider value (at field level)
- `step`: Step increment value (at field level)

### toggle

Boolean switch control (requires UI integration). Similar to checkbox but with switch UI.

```typescript
{
  key: 'darkMode',
  type: 'toggle',
  label: 'Enable Dark Mode',
  value: false,
}
```

### multi-checkbox

Multiple selection from a list of checkboxes. Value is an array of selected values.

```typescript
{
  key: 'interests',
  type: 'multi-checkbox',
  label: 'Interests',
  value: [],  // Array of selected values
  options: [
    { value: 'tech', label: 'Technology' },
    { value: 'sports', label: 'Sports' },
    { value: 'music', label: 'Music' },
  ],
}
```

**Core Properties:**

- `options`: Array of `{ value: T, label: string }` objects (at field level, not in props)

### text

Display-only text content (not a form control). Useful for instructions, headers, or dynamic content.

```typescript
{
  key: 'instructions',
  type: 'text',
  label: 'Please fill out all required fields',
  props: {
    elementType: 'p',  // 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span'
  },
}
```

**Core Props:**

- `elementType`: HTML element to render (`'p'` | `'h1'` - `'h6'` | `'span'`)

**Note:** Text fields don't have a `value` - they display the `label` content.

## Validation

Fields integrate with Angular's signal forms validation system. ng-forge provides shorthand syntax for common validators (e.g., `required: true`) with comprehensive customizability via the `validators` property. See [Validation](../validation) for details.

```typescript
{
  key: 'username',
  type: 'input',
  value: '',
  label: 'Username',
  required: true,
  minLength: 3,
  maxLength: 20,
  pattern: '^[a-zA-Z0-9_]+$',
}
```

## UI Integrations

UI framework integrations extend field types with framework-specific styling and features while maintaining the same configuration API.

- [Material Design](../../ui-libs-integrations/material) - Material Design components
- [Bootstrap](../../ui-libs-integrations/bootstrap) - Bootstrap styling
- [PrimeNG](../../ui-libs-integrations/primeng) - PrimeNG components
- [Ionic](../../ui-libs-integrations/ionic) - Ionic mobile components
