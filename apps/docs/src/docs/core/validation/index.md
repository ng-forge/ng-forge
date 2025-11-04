# Validation

ng-forge integrates with Angular's reactive forms validation system. Configure validators directly in field config.

## Built-in Validators

### required

Field must have a value.

```typescript
{
  key: 'username',
  type: 'input',
  label: 'Username',
  required: true,  // Shorthand
}
```

Custom error message:

```typescript
{
  key: 'username',
  type: 'input',
  label: 'Username',
  required: 'Username is required',
}
```

### email

Validates email format.

```typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  email: true,
}
```

### minLength / maxLength

String length validation.

```typescript
{
  key: 'password',
  type: 'input',
  label: 'Password',
  minLength: 8,
  maxLength: 128,
  props: { type: 'password' },
}
```

### min / max

Numeric range validation.

```typescript
{
  key: 'age',
  type: 'input',
  label: 'Age',
  min: 18,
  max: 120,
  props: { type: 'number' },
}
```

### pattern

Regular expression validation.

```typescript
{
  key: 'zipCode',
  type: 'input',
  label: 'ZIP Code',
  pattern: '^[0-9]{5}$',
}
```

With custom message:

```typescript
{
  key: 'zipCode',
  type: 'input',
  label: 'ZIP Code',
  pattern: { value: '^[0-9]{5}$', message: 'ZIP must be 5 digits' },
}
```

## Multiple Validators

Combine validators on a single field:

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

## Custom Validators

### Synchronous Validators

Create validators using Angular's `ValidatorFn`:

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

function forbiddenNameValidator(forbidden: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.toLowerCase();
    return value?.includes(forbidden.toLowerCase()) ? { forbiddenName: { value: control.value, forbidden } } : null;
  };
}
```

Register with field:

```typescript
import { provideValidator } from '@ng-forge/dynamic-form';

// In app.config.ts
providers: [provideValidator('forbiddenName', forbiddenNameValidator)];
```

Use in field config:

```typescript
{
  key: 'username',
  type: 'input',
  label: 'Username',
  validators: {
    forbiddenName: 'admin',
  }
}
```

### Async Validators

Async validators return `Observable<ValidationErrors | null>`:

```typescript
import { inject } from '@angular/core';
import { AsyncValidatorFn } from '@angular/forms';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

function uniqueUsernameValidator(): AsyncValidatorFn {
  const http = inject(HttpClient);

  return (control: AbstractControl) => {
    if (!control.value) {
      return of(null);
    }

    return http.get(`/api/check-username/${control.value}`).pipe(
      map((exists: boolean) => (exists ? { usernameTaken: true } : null)),
      catchError(() => of(null))
    );
  };
}
```

Register:

```typescript
providers: [provideAsyncValidator('uniqueUsername', uniqueUsernameValidator)];
```

Use:

```typescript
{
  key: 'username',
  type: 'input',
  label: 'Username',
  asyncValidators: {
    uniqueUsername: true,
  }
}
```

## Cross-Field Validation

Validate multiple fields together using form-level validators:

```typescript
import { FormGroup, ValidationErrors } from '@angular/forms';

function passwordMatchValidator(group: FormGroup): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;

  return password === confirm ? null : { passwordMismatch: true };
}
```

Apply to form:

```typescript
config = {
  fields: [
    {
      key: 'password',
      type: 'input',
      label: 'Password',
      props: { type: 'password' },
    },
    {
      key: 'confirmPassword',
      type: 'input',
      label: 'Confirm Password',
      props: { type: 'password' },
    },
  ],
  validators: [passwordMatchValidator],
};
```

## Conditional Validation

Apply validators based on other field values:

```typescript
{
  key: 'phone',
  type: 'input',
  label: 'Phone',
  required: { condition: (model) => model.contactMethod === 'phone' },
  pattern: { value: '^[0-9-]+$', condition: (model) => !!model.phone },
}
```

## Error Messages

### Default Messages

ng-forge provides default error messages:

```typescript
{
  required: 'This field is required',
  email: 'Invalid email address',
  minLength: 'Minimum length is {requiredLength}',
  maxLength: 'Maximum length is {requiredLength}',
  min: 'Value must be at least {min}',
  max: 'Value must be at most {max}',
  pattern: 'Invalid format',
}
```

### Custom Messages

Override per field:

```typescript
{
  key: 'age',
  type: 'input',
  label: 'Age',
  min: { value: 18, message: 'You must be 18 or older' },
  max: { value: 120, message: 'Please enter a valid age' },
}
```

### Global Message Configuration

Configure messages globally:

```typescript
import { provideValidationMessages } from '@ng-forge/dynamic-form';

providers: [
  provideValidationMessages({
    required: 'Field is required',
    email: 'Enter a valid email',
    minLength: 'Too short (min: {requiredLength})',
  }),
];
```

## Validation Timing

### On Blur (Default)

Validate when field loses focus:

```typescript
{
  key: 'email',
  type: 'input',
  label: 'Email',
  email: true,
  props: {
    updateOn: 'blur',  // Default
  }
}
```

### On Change

Validate on every keystroke:

```typescript
{
  key: 'username',
  type: 'input',
  label: 'Username',
  required: true,
  props: {
    updateOn: 'change',
  }
}
```

### On Submit

Validate only on form submission:

```typescript
{
  key: 'notes',
  type: 'textarea',
  label: 'Notes',
  props: {
    updateOn: 'submit',
  }
}
```

## Accessing Form State

Access validation state in component:

```typescript
import { viewChild } from '@angular/core';
import { DynamicFormComponent } from '@ng-forge/dynamic-form';

@Component({...})
export class MyFormComponent {
  form = viewChild.required(DynamicFormComponent);

  checkValidity() {
    const formRef = this.form().formGroup;

    console.log('Valid:', formRef.valid);
    console.log('Invalid:', formRef.invalid);
    console.log('Errors:', formRef.errors);
    console.log('Touched:', formRef.touched);

    // Field-level validation
    const emailField = formRef.get('email');
    console.log('Email errors:', emailField?.errors);
  }
}
```

## Best Practices

**Validate early, clearly:**

```typescript
// ✓ Clear, immediate feedback
{ key: 'email', type: 'input', required: true, email: true }

// ✗ Delayed, unclear
{ key: 'email', type: 'input', props: { updateOn: 'submit' } }
```

**Provide helpful messages:**

```typescript
// ✓ Specific, actionable
{ pattern: { value: '^[A-Z]', message: 'Must start with uppercase letter' } }

// ✗ Generic
{ pattern: '^[A-Z]' }
```

**Use async validators sparingly:**

- Debounce user input
- Cache results
- Provide loading indicators
- Handle errors gracefully
