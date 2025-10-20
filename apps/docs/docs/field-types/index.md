# Field Types

ng-forge comes with a comprehensive set of field types out of the box, and makes it easy to create your own custom field types.

## Input Field

Text input with various type variants.

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

## Select Field  

Dropdown selection with single or multiple options.

```typescript
{
  key: 'country',
  type: 'select', 
  props: {
    label: 'Country',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom' }
    ]
  }
}
```

## Checkbox Field

Boolean checkbox input.

```typescript
{
  key: 'subscribe',
  type: 'checkbox',
  props: {
    label: 'Subscribe to newsletter'
  }
}
```

## Submit Button

Action button for form submission.

```typescript
import { submitButton } from '@ng-forge/dynamic-form-material';

const field = submitButton({
  label: 'Create Account',
  color: 'primary'
});
```