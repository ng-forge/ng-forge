# Test Configuration Patterns Reference

This document catalogs configuration patterns for e2e testing of the dynamic form system. Use this as a reference when creating new test scenarios.

## Field Type Configurations

### Basic Input Fields

```typescript
// Simple input field
{
  key: 'firstName',
  type: 'input',
  label: 'First Name',
  value: 'John'
}

// Required input field
{
  key: 'email',
  type: 'input',
  label: 'Email',
  required: true,
  value: ''
}

// Input with props/attributes
{
  key: 'email',
  type: 'input',
  label: 'Email Address',
  placeholder: 'Enter your email',
  value: 'test@example.com',
  props: {
    type: 'email',
    placeholder: 'Enter email'
  }
}

// Input with custom properties
{
  key: 'email',
  type: 'input',
  label: 'Email Address',
  className: 'email-field',
  tabIndex: 1,
  customAttribute: 'custom-value'
}
```

### Checkbox Fields

```typescript
// Basic checkbox
{
  key: 'isActive',
  type: 'checkbox',
  label: 'Is Active',
  value: false
}

// Required checkbox
{
  key: 'terms',
  type: 'checkbox',
  label: 'Accept Terms',
  required: true,
  value: false
}
```

### Select Fields

```typescript
{
  key: 'country',
  type: 'select',
  label: 'Country',
  options: [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' }
  ],
  props: {}
}
```

### Button Fields

```typescript
{
  key: 'submit',
  type: 'button',
  label: 'Submit',
  props: {}
}
```

## Layout Configuration Patterns

### Row Fields (Horizontal Layout)

```typescript
{
  key: 'personalInfo',
  type: 'row',
  label: 'Personal Information',
  fields: [
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      value: 'John'
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      value: 'Doe'
    }
  ]
}
```

**Form Value Structure**: Row fields flatten their children into the parent form value:

```typescript
// Results in: { firstName: 'John', lastName: 'Doe' }
```

### Group Fields (Nested Object Structure)

```typescript
{
  key: 'address',
  type: 'group',
  label: 'Address Information',
  fields: [
    {
      key: 'street',
      type: 'input',
      label: 'Street',
      value: '123 Main St'
    },
    {
      key: 'city',
      type: 'input',
      label: 'City',
      value: 'New York'
    }
  ]
}
```

**Form Value Structure**: Group fields create nested objects:

```typescript
// Results in: { address: { street: '123 Main St', city: 'New York' } }
```

### Nested Layouts

```typescript
{
  key: 'contact',
  type: 'group',
  label: 'Contact Information',
  fields: [
    {
      key: 'name',
      type: 'row',
      label: 'Name',
      fields: [
        {
          key: 'first',
          type: 'input',
          label: 'First',
          value: 'John'
        },
        {
          key: 'last',
          type: 'input',
          label: 'Last',
          value: 'Doe'
        }
      ]
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      value: 'john.doe@example.com'
    }
  ]
}
```

**Form Value Structure**:

```typescript
// Results in: { contact: { first: 'John', last: 'Doe', email: 'john.doe@example.com' } }
```

### Page Fields (Multi-page Forms)

```typescript
{
  key: 'page1',
  type: 'page',
  title: 'Personal Information',
  fields: [
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      value: ''
    }
  ]
}
```

## Validation Patterns

### Basic Required Validation

```typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  required: true,
  value: ''
}
```

### Complex Validation with Multiple Validators

```typescript
{
  key: 'age',
  type: 'input',
  label: 'Age',
  validators: [
    { type: 'required' },
    { type: 'min', value: 18 },
    { type: 'max', value: 100 },
    {
      type: 'pattern',
      value: '^[0-9]+$',
      errorMessage: 'Please enter a valid number'
    }
  ]
}
```

### Conditional Validation

```typescript
{
  key: 'age',
  type: 'input',
  label: 'Age',
  validators: [
    {
      type: 'required',
      when: {
        type: 'fieldValue',
        fieldPath: 'requiresAge',
        operator: 'equals',
        value: true
      }
    },
    {
      type: 'min',
      value: 18,
      when: {
        type: 'fieldValue',
        fieldPath: 'category',
        operator: 'equals',
        value: 'adult'
      }
    }
  ]
}
```

## Conditional Logic Patterns

### Field Visibility Logic

```typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  logic: [
    {
      type: 'hidden',
      condition: {
        type: 'fieldValue',
        fieldPath: 'contactMethod',
        operator: 'notEquals',
        value: 'email'
      }
    }
  ]
}
```

### JavaScript Expression Conditions

```typescript
{
  type: 'javascript',
  expression: 'formValue.age >= 18 && formValue.hasLicense === true'
}
```

### Nested Field Path Conditions

```typescript
{
  type: 'fieldValue',
  fieldPath: 'user.profile.role',
  operator: 'equals',
  value: 'admin'
}
```

### Custom Function Conditions

```typescript
{
  type: 'custom',
  expression: 'isBusinessDay'
}
```

## Schema Configuration Patterns

### Form Config with Schemas

```typescript
const formConfig: FormConfig = {
  schemas: [
    {
      name: 'emailValidation',
      description: 'Email validation schema',
      validators: [{ type: 'required' }, { type: 'email' }],
    },
    {
      name: 'conditionalRequired',
      validators: [
        {
          type: 'required',
          when: {
            type: 'fieldValue',
            fieldPath: 'isActive',
            operator: 'equals',
            value: true,
          },
        },
      ],
    },
  ],
  fields: [
    {
      key: 'email',
      type: 'input',
      label: 'Email Address',
      schemas: [{ type: 'apply', schema: 'emailValidation' }],
    },
  ],
};
```

### Array Field Schemas

```typescript
{
  key: 'contacts',
  type: 'array',
  label: 'Contact Information',
  schemas: [
    {
      type: 'applyEach',
      schema: {
        name: 'contactItem',
        validators: [{ type: 'required' }],
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'type',
              operator: 'equals',
              value: 'disabled'
            }
          }
        ]
      }
    }
  ]
}
```

## Complete Form Examples

### Simple Contact Form

```typescript
{
  fields: [
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      required: true,
      value: 'John',
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      required: true,
      value: 'Doe',
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      required: true,
      value: 'john.doe@example.com',
    },
    {
      key: 'isActive',
      type: 'checkbox',
      label: 'Is Active',
      value: true,
    },
  ];
}
```

### Mixed Layout Form

```typescript
{
  fields: [
    {
      key: 'username',
      type: 'input',
      label: 'Username',
      value: 'johndoe',
    },
    {
      key: 'personalInfo',
      type: 'row',
      label: 'Personal Info',
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          value: 'John',
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          value: 'Doe',
        },
      ],
    },
    {
      key: 'address',
      type: 'group',
      label: 'Address',
      fields: [
        {
          key: 'street',
          type: 'input',
          label: 'Street',
          value: '123 Main St',
        },
        {
          key: 'city',
          type: 'input',
          label: 'City',
          value: 'New York',
        },
      ],
    },
    {
      key: 'isActive',
      type: 'checkbox',
      label: 'Is Active',
      value: true,
    },
  ];
}
```

## E2E Testing Utilities Available

### Test Scenario Access

Get scenarios from the `scenarios` folder:

```typescript
import { getScenario, getScenariosByCategory, getAllScenarioNames, userProfileConfig, contactFormConfig } from './scenarios';

// Get a specific scenario using helper function
const userProfile = getScenario('userProfile');

// Or import and use directly (better type safety)
import { userProfileConfig } from './scenarios/user-profile';
console.log(userProfileConfig); // Typed as FormConfig

// Get all scenarios in a category
const basicForms = getScenariosByCategory('BASIC_FORMS');

// Get all available scenario names
const allScenarios = getAllScenarioNames();
```

### E2E Form Helper Methods

From `e2e-form-helpers.ts`:

- `fillInput(key, value)` - Fill input field
- `selectOption(key, value)` - Select dropdown option
- `toggleCheckbox(key, checked)` - Toggle checkbox
- `clickButton(key)` - Click button
- `getFieldErrors(key)` - Get field validation errors
- `isFormValid()` - Check form validity
- `getFormValue()` - Get current form value

### Cross-Field Validation Methods

- `validatePasswordMatch(passwordField, confirmField)` - Test password confirmation
- `validateConditionalField(dependentField, triggerField, triggerValue)` - Test conditional visibility

## Key Patterns for E2E Configuration

1. **Default Values**: Always provide meaningful default values for testing
2. **Validation Combinations**: Mix required/optional fields for various test scenarios
3. **Layout Testing**: Use row/group combinations to test layout rendering
4. **Conditional Logic**: Include show/hide scenarios based on other field values
5. **Cross-field Validation**: Test validation that depends on multiple field values
6. **Nested Structures**: Test deeply nested form values with groups
7. **Edge Cases**: Test empty values, special characters, long text, null/undefined
8. **State Management**: Test form validity, dirty state, error handling
