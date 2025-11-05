## Stop Writing Repetitive Form Code

Building forms in Angular shouldn't require hundreds of lines of boilerplate. With **ng-forge**, you define your form structure once, and get instant validation, conditional logic, type safety, and beautiful UI - all powered by Angular 21's signal forms.

**From this mess:**

```typescript
// Traditional approach: 50+ lines per field
export class TraditionalFormComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    // ... more fields, more boilerplate
  });

  // Custom validator logic
  // Error message handling
  // Conditional field display
  // Value change subscriptions
  // Manual cleanup in ngOnDestroy
  // Template binding hell...
}
```

**To this simplicity:**

```typescript
// ng-forge approach: Clean, declarative, type-safe
const config = {
  fields: [
    {
      key: 'email',
      type: 'input',
      value: '',
      label: 'Email',
      required: true,
      email: true,
    },
    {
      key: 'password',
      type: 'input',
      value: '',
      label: 'Password',
      required: true,
      minLength: 8,
      props: { type: 'password' },
    },
    {
      type: 'submit',
      key: 'submit',
      label: 'Create Account',
    },
  ],
} as const satisfies FormConfig;
```

**That's it.** Validation, error messages, state management, and UI - all handled automatically.

## Why Developers Choose ng-forge

### ⚡ Built for Angular 21's Signal Forms

Not a wrapper. Not a hack. Native integration with Angular's signal forms architecture. Get automatic reactivity, change detection, and state management out of the box.

### 🎯 Type-Safe from Day One

Full TypeScript support with intelligent autocomplete. Your form config is typed, your values are typed, your validation is typed. Catch errors at compile time, not runtime.

```typescript
const config = {
  fields: [{ key: 'age', type: 'input', value: 0, min: 18, max: 120 }],
} as const satisfies FormConfig;

// TypeScript knows: { age: number }
const formValue = form.value();
console.log(formValue.age.toFixed(2)); // ✓ Valid
console.log(formValue.age.toUpperCase()); // ✗ Compile error
```

### 🎨 UI Library Freedom

Works seamlessly with Material Design, Bootstrap, PrimeNG, Ionic, or your custom components. Switch UI libraries without rewriting forms.

```typescript
// Material Design
import { withMaterialFields } from '@ng-forge/dynamic-form-material';
provideDynamicForm(...withMaterialFields());

// Bootstrap
import { withBootstrapFields } from '@ng-forge/dynamic-form-bootstrap';
provideDynamicForm(...withBootstrapFields());

// Your Custom Components
provideDynamicForm(withFieldTypes([{ name: 'custom-input', loadComponent: () => MyInputComponent }]));
```

### 🔥 Powerful Features, Zero Boilerplate

**Conditional Logic:**

```typescript
{
  key: 'taxId',
  type: 'input',
  value: '',
  label: 'Business Tax ID',
  logic: [{
    type: 'required',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'equals',
      value: 'business',
    },
    errorMessage: 'Tax ID required for business accounts',
  }],
}
```

**Dynamic Validation:**

```typescript
{
  key: 'discount',
  type: 'input',
  value: null,
  label: 'Discount',
  validators: [{
    type: 'max',
    value: 100,
    when: {
      type: 'fieldValue',
      fieldPath: 'discountType',
      operator: 'equals',
      value: 'percentage',
    },
    errorMessage: 'Percentage cannot exceed 100%',
  }],
}
```

**Multi-Step Forms:**

```typescript
{
  fields: [
    {
      key: 'step1',
      type: 'page',
      title: 'Personal Info',
      fields: [/* ... */],
    },
    {
      key: 'step2',
      type: 'page',
      title: 'Contact Details',
      fields: [/* ... */],
    },
  ],
}
```

**i18n Support:**

```typescript
{
  key: 'email',
  type: 'input',
  value: '',
  label: transloco.selectTranslate('form.email'),
  validationMessages: {
    required: transloco.selectTranslate('validation.required'),
  },
}
```

### 🚀 No `ControlValueAccessor` Hell

Forget about implementing `ControlValueAccessor` for every custom component. ng-forge handles all form control logic automatically.

### 📦 Production Ready

- ✅ Fully tested with comprehensive test suite
- ✅ Optimized bundle size with tree-shaking
- ✅ SSR compatible
- ✅ Actively maintained
- ✅ Enterprise-grade documentation

## Quick Start

### Installation

```bash group="install" name="npm"
npm install @ng-forge/dynamic-form @ng-forge/dynamic-form-material
```

```bash group="install" name="yarn"
yarn add @ng-forge/dynamic-form @ng-forge/dynamic-form-material
```

```bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-form @ng-forge/dynamic-form-material
```

### 1. Configure Your App

Add ng-forge to your application configuration:

```typescript name="app.config.ts"
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withMaterialFields())],
};
```

### 2. Create Your First Form

```typescript name="user-registration.component.ts"
import { Component } from '@angular/core';
import { DynamicFormComponent, FormConfig } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-user-registration',
  imports: [DynamicFormComponent],
  template: ` <dynamic-form [config]="config" (submit)="onSubmit($event)" /> `,
})
export class UserRegistrationComponent {
  config = {
    fields: [
      {
        key: 'username',
        type: 'input',
        value: '',
        label: 'Username',
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: '^[a-zA-Z0-9_]+$',
        validationMessages: {
          required: 'Username is required',
          minLength: 'Username must be at least 3 characters',
          pattern: 'Only letters, numbers, and underscores allowed',
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
        key: 'terms',
        type: 'checkbox',
        value: false,
        label: 'I accept the terms and conditions',
        required: true,
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Create Account',
        props: { color: 'primary' },
      },
    ],
  } as const satisfies FormConfig;

  onSubmit(formValue: unknown) {
    console.log('Registration submitted:', formValue);
    // Handle registration logic
  }
}
```

### 3. Run Your App

```bash
ng serve
```

**That's it!** You now have a production-ready registration form with:

- ✅ Real-time validation
- ✅ Custom error messages
- ✅ Type-safe form values
- ✅ Beautiful Material Design UI
- ✅ Automatic disabled state on submit button
- ✅ Full accessibility support

## See It In Action

{{ NgDocActions.playground("DemoFormPlayground") }}

## Real-World Example: Multi-Step Checkout

Here's what a production-grade checkout form looks like with ng-forge:

```typescript
const checkoutConfig = {
  fields: [
    {
      key: 'personalInfo',
      type: 'page',
      title: 'Personal Information',
      fields: [
        { key: 'firstName', type: 'input', value: '', label: 'First Name', required: true },
        { key: 'lastName', type: 'input', value: '', label: 'Last Name', required: true },
        { key: 'email', type: 'input', value: '', label: 'Email', required: true, email: true },
        {
          key: 'navigation',
          type: 'row',
          fields: [{ type: 'next', key: 'nextToShipping', label: 'Continue to Shipping' }],
        },
      ],
    },
    {
      key: 'shipping',
      type: 'page',
      title: 'Shipping Address',
      fields: [
        { key: 'address', type: 'input', value: '', label: 'Street Address', required: true },
        {
          key: 'cityState',
          type: 'row',
          fields: [
            { key: 'city', type: 'input', value: '', label: 'City', required: true },
            { key: 'state', type: 'select', value: '', label: 'State', required: true, props: { options: US_STATES } },
          ],
        },
        { key: 'zipCode', type: 'input', value: '', label: 'ZIP Code', required: true, pattern: '^[0-9]{5}$' },
        {
          key: 'navigation',
          type: 'row',
          fields: [
            { type: 'previous', key: 'backToPersonal', label: 'Back' },
            { type: 'next', key: 'nextToPayment', label: 'Continue to Payment' },
          ],
        },
      ],
    },
    {
      key: 'payment',
      type: 'page',
      title: 'Payment',
      fields: [
        { key: 'cardNumber', type: 'input', value: '', label: 'Card Number', required: true, pattern: '^[0-9]{16}$' },
        {
          key: 'cardDetails',
          type: 'row',
          fields: [
            { key: 'expiry', type: 'input', value: '', label: 'MM/YY', required: true },
            { key: 'cvv', type: 'input', value: '', label: 'CVV', required: true, pattern: '^[0-9]{3,4}$' },
          ],
        },
        {
          key: 'navigation',
          type: 'row',
          fields: [
            { type: 'previous', key: 'backToShipping', label: 'Back' },
            { type: 'submit', key: 'submit', label: 'Complete Order', props: { color: 'primary' } },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

**Result:** A fully functional, validated, multi-step checkout form in less than 100 lines of code.

## What You Get

### Validation Made Simple

Shorthand validators for common cases:

```typescript
{ required: true, email: true, minLength: 8, max: 100 }
```

Advanced validation for complex scenarios:

```typescript
{
  validators: [{
    type: 'max',
    value: 100,
    when: {
      type: 'fieldValue',
      fieldPath: 'discountType',
      operator: 'equals',
      value: 'percentage',
    },
    errorMessage: 'Percentage cannot exceed 100%',
  }],
}
```

### Conditional Logic That Works

Show/hide fields dynamically:

```typescript
{
  logic: [{
    type: 'hidden',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'notEquals',
      value: 'business',
    },
  }],
}
```

### Event-Driven Architecture

Handle custom events with the event bus:

```typescript
class SaveDraftEvent extends FormEvent {
  static override readonly eventName = 'SaveDraft';
}

// In your component
eventBus.on(SaveDraftEvent).subscribe(() => {
  this.saveDraft(form.value());
});
```

### Extensible by Design

Create custom field types in minutes:

```typescript
@Component({
  selector: 'app-rating-field',
  template: `
    <label>{{ label() }}</label>
    <div>
      @for (star of [1,2,3,4,5]; track star) {
        <button (click)="rating.set(star)">
          {{ star <= rating() ? '⭐' : '☆' }}
        </button>
      }
    </div>
  `,
})
export class RatingFieldComponent {
  label = input<string>();
  rating = model<number>(0);
}

// Register it
provideDynamicForm(
  withFieldTypes([
    { name: 'rating', loadComponent: () => RatingFieldComponent }
  ])
);

// Use it
{ key: 'userRating', type: 'rating', value: 0, label: 'Rate your experience' }
```

## Framework Integration

### Material Design (Ready to Use)

```typescript
import { withMaterialFields } from '@ng-forge/dynamic-form-material';
provideDynamicForm(...withMaterialFields());
```

Fields available: input, textarea, select, checkbox, radio, datepicker, slider, autocomplete, and more.

### Bootstrap (Ready to Use)

```typescript
import { withBootstrapFields } from '@ng-forge/dynamic-form-bootstrap';
provideDynamicForm(...withBootstrapFields());
```

### PrimeNG (Ready to Use)

```typescript
import { withPrimeNGFields } from '@ng-forge/dynamic-form-primeng';
provideDynamicForm(...withPrimeNGFields());
```

### Ionic (Ready to Use)

```typescript
import { withIonicFields } from '@ng-forge/dynamic-form-ionic';
provideDynamicForm(...withIonicFields());
```

### Your Custom Library

```typescript
provideDynamicForm(
  withFieldTypes([
    { name: 'my-input', loadComponent: () => MyInputComponent },
    { name: 'my-select', loadComponent: () => MySelectComponent },
  ])
);
```

## Performance

ng-forge is built for performance:

- **Lazy Loading**: Field components load only when needed
- **Signal-Based**: Leverages Angular's fine-grained reactivity
- **Tree-Shakeable**: Only bundle what you use
- **Optimized Change Detection**: OnPush strategy throughout
- **Small Bundle**: Core library is lightweight

## Next Steps

Ready to build amazing forms? Pick your path:

### For Beginners

1. [Core Concepts](../core/field-types) - Understanding field types and structure
2. [Validation](../core/validation) - Master form validation
3. [Conditional Logic](../core/conditional-logic) - Show/hide fields dynamically

### For Advanced Users

1. [Custom Field Types](../custom-integrations/guide) - Build your own fields
2. [Event System](../core/events) - Handle complex interactions
3. [Type Safety](../core/type-safety) - Leverage TypeScript fully

### Choose Your UI Library

- [Material Design Integration](../custom-integrations/reference/material)
- [Bootstrap Integration](../custom-integrations/reference/bootstrap)
- [PrimeNG Integration](../custom-integrations/reference/primeng)
- [Ionic Integration](../custom-integrations/reference/ionic)

### Internationalization

- [i18n Setup](../i18n/setup) - Multi-language form support

## Need Help?

- 📚 [Full Documentation](../) - Comprehensive guides and API reference
- 💬 [GitHub Issues](https://github.com/your-org/ng-forge/issues) - Report bugs or request features
- 🌟 [GitHub Repo](https://github.com/your-org/ng-forge) - Star us if you find ng-forge useful!

---

**Stop writing boilerplate. Start building forms.**

Install ng-forge today and transform how you build Angular forms.
