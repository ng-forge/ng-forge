---
title: Custom Validators
route: custom-validators
keyword: ValidationCustomValidatorsPage
---

> **⚠️ DOCUMENTATION UPDATE IN PROGRESS**
> This page references an older API. For the current unified validator API, see:
>
> - [Custom Validators Example](/examples/custom-validators) - Live demo with updated API
> - Package README - Updated validator documentation

Custom validation functions for complex validation logic that goes beyond built-in validators.

## Overview

> **Note:** The API shown below is being updated. The current API uses a unified `CustomValidator` type with `AsyncCustomValidator` and `HttpCustomValidator` for async operations.

ng-forge supports three levels of custom validators, each designed for specific validation scenarios:

1. **Simple Validators** - Basic validation using field value and form value (⚠️ API Updated - now uses `CustomValidator`)
2. **Context-Aware Validators** - Advanced validation with full Angular FieldContext (⚠️ API Updated - now uses `CustomValidator`)
3. **Tree Validators** - Cross-field validation with error targeting (⚠️ API Updated - now uses `CustomValidator`)

**Key Principle:** Validators should focus on validation logic, NOT presentation. Return only the error `kind` and configure messages at field level for proper i18n support.

## Message Resolution (STRICT)

All error messages MUST be explicitly configured. The framework enforces this strictly:

1. **Field-level `validationMessages[kind]`** (highest priority - per-field customization)
2. **Form-level `defaultValidationMessages[kind]`** (fallback for common messages)
3. **No message configured = Console warning + error NOT displayed**

**Important:** Validator-returned messages are NOT used as fallbacks. This enforces proper separation of concerns and i18n patterns.

You can define messages at the form level for common validation errors:

```typescript
{
  defaultValidationMessages: {
    noSpaces: 'Spaces are not allowed',
    passwordMismatch: 'Passwords must match'
  },
  fields: [/* ... */]
}
```

## Simple Validators

Best for validation that only needs field value and form value.

### Basic Example

```typescript
import { SimpleCustomValidator } from '@ng-forge/dynamic-form';

// ✅ RECOMMENDED: Return only kind
const noSpaces: SimpleCustomValidator<string> = (value) => {
  if (typeof value === 'string' && value.includes(' ')) {
    return { kind: 'noSpaces' }; // No hardcoded message
  }
  return null;
};

// Configure in form
const config = {
  fields: [
    {
      key: 'username',
      type: 'input',
      value: '',
      label: 'Username',
      validators: [{ type: 'custom', functionName: 'noSpaces' }],
      validationMessages: {
        noSpaces: 'Spaces are not allowed', // Message at field level
      },
    },
  ],
  signalFormsConfig: {
    simpleValidators: {
      noSpaces, // Register validator
    },
  },
};
```

### Cross-Field Validation

```typescript
// Validator that checks password confirmation
const passwordMatch: SimpleCustomValidator<string> = (value, formValue) => {
  const form = formValue as Record<string, unknown>;
  if (form.password && value !== form.password) {
    return { kind: 'passwordMismatch' };
  }
  return null;
};

// Use in field configuration
{
  key: 'confirmPassword',
  type: 'input',
  value: '',
  label: 'Confirm Password',
  validators: [{ type: 'custom', functionName: 'passwordMatch' }],
  validationMessages: {
    passwordMismatch: 'Passwords must match'
  },
  props: { type: 'password' }
}
```

## Context-Aware Validators

Best for validation that needs field state or access to other fields in the form hierarchy.

### Basic Example

```typescript
import { ContextAwareValidator } from '@ng-forge/dynamic-form';

// ✅ RECOMMENDED: Return only kind
const lessThanField: ContextAwareValidator<number> = (ctx, params) => {
  const value = ctx.value();
  const otherFieldName = params?.field as string;
  const rootValue = ctx.root()().value() as Record<string, unknown>;
  const otherValue = rootValue[otherFieldName];

  if (otherValue !== undefined && value >= otherValue) {
    return { kind: 'notLessThan' }; // No hardcoded message
  }
  return null;
};

// Configure with parameters and parameterized messages
const config = {
  fields: [
    { key: 'minAge', type: 'input', value: 0, label: 'Min Age' },
    {
      key: 'maxAge',
      type: 'input',
      value: 0,
      label: 'Max Age',
      validators: [
        {
          type: 'custom',
          functionName: 'lessThanField',
          params: { field: 'minAge' }, // Pass parameters
        },
      ],
      validationMessages: {
        notLessThan: 'Must be less than {{field}}', // Interpolates params!
      },
    },
  ],
  signalFormsConfig: {
    contextValidators: {
      lessThanField,
    },
  },
};
```

### Parameter Interpolation

Messages can use `{{paramName}}` syntax to interpolate validator parameters:

```typescript
// Validator receives params
const minLengthValidator: ContextAwareValidator<string> = (ctx, params) => {
  const value = ctx.value();
  const minLength = (params?.minLength as number) || 0;

  if (typeof value === 'string' && value.length < minLength) {
    return { kind: 'minLength' };
  }
  return null;
};

// Message interpolates params
{
  validators: [{
    type: 'custom',
    functionName: 'minLength',
    params: { minLength: 8 }
  }],
  validationMessages: {
    minLength: 'Must be at least {{minLength}} characters'  // → "Must be at least 8 characters"
  }
}
```

## Tree Validators

Best for validating relationships between multiple fields in a form or group.

### Single Error Example

```typescript
import { TreeValidator } from '@ng-forge/dynamic-form';

// ✅ RECOMMENDED: Return only kind
const passwordsMatch: TreeValidator = (ctx) => {
  const formValue = ctx.value() as Record<string, unknown>;
  const password = formValue.password;
  const confirmPassword = formValue.confirmPassword;

  if (password && confirmPassword && password !== confirmPassword) {
    return { kind: 'passwordMismatch' };  // No hardcoded message
  }
  return null;
};

// Apply at group level
{
  key: 'credentials',
  type: 'group',
  label: 'Create Password',
  validators: [{ type: 'customTree', functionName: 'passwordsMatch' }],
  validationMessages: {
    passwordMismatch: 'Passwords must match'  // Message at group level
  },
  fields: [
    {
      key: 'password',
      type: 'input',
      value: '',
      label: 'Password',
      props: { type: 'password' }
    },
    {
      key: 'confirmPassword',
      type: 'input',
      value: '',
      label: 'Confirm Password',
      props: { type: 'password' }
    },
  ],
}
```

### Multiple Errors Example

Tree validators can return arrays of errors:

```typescript
const validateAddress: TreeValidator = (ctx) => {
  const form = ctx.value() as Record<string, unknown>;
  const errors: ValidationError[] = [];

  if (!form.street) errors.push({ kind: 'streetRequired' });
  if (!form.city) errors.push({ kind: 'cityRequired' });
  if (!form.zipCode) errors.push({ kind: 'zipRequired' });

  return errors.length > 0 ? errors : null;
};

// Configure messages for all error kinds
{
  validationMessages: {
    streetRequired: 'Street address is required',
    cityRequired: 'City is required',
    zipRequired: 'ZIP code is required'
  }
}
```

## Conditional Custom Validators

Custom validators support `when` conditions just like built-in validators:

```typescript
const businessEmailValidator: SimpleCustomValidator<string> = (value) => {
  if (typeof value === 'string' && !value.endsWith('@company.com')) {
    return { kind: 'businessEmail' };
  }
  return null;
};

const config = {
  fields: [
    { key: 'accountType', type: 'select', value: 'personal' },
    {
      key: 'email',
      type: 'input',
      value: '',
      label: 'Email',
      validators: [
        { type: 'required' },
        { type: 'email' },
        {
          type: 'custom',
          functionName: 'businessEmail',
          when: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'business',
          },
        },
      ],
      validationMessages: {
        businessEmail: 'Must use company email',
      },
    },
  ],
  signalFormsConfig: {
    simpleValidators: {
      businessEmail: businessEmailValidator,
    },
  },
};
```

## Complete Examples

### User Registration Form

```typescript
import { FormConfig, SimpleCustomValidator } from '@ng-forge/dynamic-form';

// Custom validators
const noSpaces: SimpleCustomValidator<string> = (value) => {
  return typeof value === 'string' && value.includes(' ') ? { kind: 'noSpaces' } : null;
};

const passwordMatch: SimpleCustomValidator<string> = (value, formValue) => {
  const form = formValue as Record<string, unknown>;
  return form.password && value !== form.password ? { kind: 'passwordMismatch' } : null;
};

// Form configuration
const registrationForm: FormConfig = {
  fields: [
    {
      key: 'username',
      type: 'input',
      value: '',
      label: 'Username',
      required: true,
      minLength: 3,
      maxLength: 20,
      validators: [{ type: 'custom', functionName: 'noSpaces' }],
      validationMessages: {
        required: 'Username is required',
        minLength: 'Username must be at least 3 characters',
        maxLength: 'Username cannot exceed 20 characters',
        noSpaces: 'Username cannot contain spaces',
      },
    },
    {
      key: 'email',
      type: 'input',
      value: '',
      label: 'Email',
      required: true,
      email: true,
      validationMessages: {
        required: 'Email is required',
        email: 'Please enter a valid email address',
      },
    },
    {
      key: 'password',
      type: 'input',
      value: '',
      label: 'Password',
      required: true,
      minLength: 8,
      props: { type: 'password' },
      validationMessages: {
        required: 'Password is required',
        minLength: 'Password must be at least 8 characters',
      },
    },
    {
      key: 'confirmPassword',
      type: 'input',
      value: '',
      label: 'Confirm Password',
      required: true,
      validators: [{ type: 'custom', functionName: 'passwordMatch' }],
      props: { type: 'password' },
      validationMessages: {
        required: 'Please confirm your password',
        passwordMismatch: 'Passwords must match',
      },
    },
  ],
  signalFormsConfig: {
    simpleValidators: {
      noSpaces,
      passwordMatch,
    },
  },
};
```

### Age Range Validator

```typescript
const withinAgeRange: ContextAwareValidator<number> = (ctx, params) => {
  const value = ctx.value();
  const minField = params?.minField as string;
  const maxField = params?.maxField as string;

  const form = ctx.root()().value() as Record<string, unknown>;
  const min = form[minField] as number;
  const max = form[maxField] as number;

  if (min !== undefined && value < min) {
    return { kind: 'belowMin' };
  }
  if (max !== undefined && value > max) {
    return { kind: 'aboveMax' };
  }
  return null;
};

// Use with parameters
{
  key: 'age',
  type: 'input',
  value: 0,
  validators: [{
    type: 'custom',
    functionName: 'withinAgeRange',
    params: { minField: 'minAge', maxField: 'maxAge' }
  }],
  validationMessages: {
    belowMin: 'Age must be at least {{minField}}',
    aboveMax: 'Age cannot exceed {{maxField}}'
  }
}
```

## i18n Support

Custom validators work seamlessly with i18n by using Observables or Signals for messages:

```typescript
import { inject } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

@Component({...})
export class MyFormComponent {
  private transloco = inject(TranslocoService);

  config = {
    fields: [
      {
        key: 'username',
        type: 'input',
        value: '',
        validators: [{ type: 'custom', functionName: 'noSpaces' }],
        validationMessages: {
          noSpaces: this.transloco.selectTranslate('validation.noSpaces')  // Observable
        }
      }
    ],
    signalFormsConfig: {
      simpleValidators: {
        noSpaces: (value) => value.includes(' ') ? { kind: 'noSpaces' } : null
      }
    }
  };
}
```

## Best Practices

**✅ Return only error kind:**

```typescript
// ✅ Good - Separation of concerns
return { kind: 'noSpaces' };

// ❌ Avoid - Mixes logic with presentation
return { kind: 'noSpaces', message: 'No spaces allowed' };
```

**✅ Configure messages at field level:**

```typescript
// ✅ Good - Supports i18n
validationMessages: {
  noSpaces: this.i18n.translate('errors.noSpaces');
}

// ❌ Avoid - Hardcoded in validator
return { kind: 'noSpaces', message: 'No spaces' };
```

**✅ Use parameters for reusable validators:**

```typescript
// ✅ Good - Reusable
const minLength: ContextAwareValidator = (ctx, params) => {
  const min = params?.minLength as number;
  return ctx.value().length < min ? { kind: 'minLength' } : null;
};

// ❌ Avoid - Single purpose
const minLength8 = (value) => (value.length < 8 ? { kind: 'minLength8' } : null);
```

**✅ Choose the right validator level:**

```typescript
// ✅ Simple: Only needs field/form value
const noSpaces: SimpleCustomValidator = (value) => ...

// ✅ Context-Aware: Needs other fields or params
const lessThanField: ContextAwareValidator = (ctx, params) => ...

// ✅ Tree: Cross-field validation
const passwordsMatch: TreeValidator = (ctx) => ...
```

## Debugging

If validator errors are not displaying:

1. **Check console for warnings** - The framework warns when messages are missing
2. **Verify validator is registered** - Check `signalFormsConfig.simpleValidators/contextValidators/treeValidators`
3. **Confirm functionName matches** - Case-sensitive matching
4. **Add validationMessages** - All error kinds need configured messages

```typescript
// Console warning example:
// [DynamicForm] No validation message configured for error kind "noSpaces".
// Please add a message to the field's validationMessages property.
// This error will not be displayed to the user.
```

## Related

- **[Validation Basics](../basics/)** - Shorthand validators
- **[Advanced Validation](../advanced/)** - Conditional validators
- **[Validation Reference](../reference/)** - Complete API
- **[Conditional Logic](../../conditional-logic/)** - Field behavior
