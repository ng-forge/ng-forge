ng-forge dynamic forms gives you declarative, type-safe forms powered by Angular 21's signal forms. Define your structure once, get validation, conditional logic, and beautiful UI automatically.

### Quick Example

```typescript
import { Component } from '@angular/core';
import { DynamicForm, type FormConfig, type ExtractFormValue } from '@ng-forge/dynamic-form';

@Component({
  selector: 'app-registration',
  imports: [DynamicForm],
  template: `<dynamic-form [config]="config" (submit)="onSubmit($event)" />`,
})
export class RegistrationComponent {
  config = {
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
        key: 'accountType',
        type: 'select',
        value: 'personal' as const,
        label: 'Account Type',
        props: {
          options: [
            { label: 'Personal', value: 'personal' },
            { label: 'Business', value: 'business' },
          ],
        },
      },
      {
        key: 'companyName',
        type: 'input',
        value: '',
        label: 'Company Name',
        logic: [
          {
            type: 'required',
            condition: {
              type: 'fieldValue',
              fieldPath: 'accountType',
              operator: 'equals',
              value: 'business',
            },
          },
        ],
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Create Account',
        props: { color: 'primary' },
      },
    ],
  } as const satisfies FormConfig;

  onSubmit(value: ExtractFormValue<typeof this.config>) {
    // TypeScript knows: { email: string, password: string, accountType: 'personal' | 'business', companyName: string }
    console.log('Account created:', value);
  }
}
```

**What you get:**

- ✅ Real-time validation with custom error messages
- ✅ Conditional required fields (companyName only required for business)
- ✅ Full TypeScript type inference - no manual type definitions
- ✅ Beautiful Material Design UI
- ✅ Zero subscriptions or cleanup needed
- ✅ Built-in accessibility

## Full Type Safety with Zero Type Annotations

The killer feature: **TypeScript infers your entire form's type from the config.** No manual type definitions. No type assertions. Just pure inference.

```typescript
const config = {
  fields: [
    { key: 'username', type: 'input', value: '' },
    { key: 'age', type: 'input', value: 0 },
    { key: 'active', type: 'checkbox', value: false },
    { key: 'role', type: 'select', value: 'user' as const },
    {
      key: 'profile',
      type: 'group',
      fields: [
        { key: 'bio', type: 'textarea', value: '' },
        { key: 'website', type: 'input', value: '' },
      ],
    },
  ],
} as const satisfies FormConfig;

// TypeScript automatically infers:
type FormValue = {
  username: string;
  age: number;
  active: boolean;
  role: 'user';
  profile: {
    bio: string;
    website: string;
  };
};

// In your submit handler:
onSubmit(value: ExtractFormValue<typeof this.config>) {
  // TypeScript knows the exact structure!
  value.username.toUpperCase(); // ✓ Valid
  value.age.toFixed(2);         // ✓ Valid
  value.active ? 'yes' : 'no';  // ✓ Valid
  value.role === 'user';        // ✓ Valid - literal type
  value.profile.bio.length;     // ✓ Valid - nested objects work

  // And catches errors at compile time:
  value.username.toFixed(2);    // ✗ Compile error: toFixed doesn't exist on string
  value.age.toUpperCase();      // ✗ Compile error: toUpperCase doesn't exist on number
  value.invalid;                // ✗ Compile error: property doesn't exist
}
```

### Autocomplete Everywhere

Your IDE knows your form structure:

```typescript
config = {
  fields: [
    { key: 'email', type: 'input', value: '', required: true, email: true },
    { key: 'password', type: 'input', value: '', required: true, minLength: 8 },
  ],
} as const satisfies FormConfig;

onSubmit(value: ExtractFormValue<typeof this.config>) {
  value. // ← TypeScript autocomplete shows: email, password
  value.email. // ← Shows: string methods (charAt, substring, toLowerCase, ...)
  value.password. // ← Shows: string methods
}
```

### Type-Safe Conditional Logic

Even your conditional expressions are type-checked:

```typescript
{
  key: 'discount',
  type: 'input',
  value: 0,
  validators: [{
    type: 'max',
    value: 100, // TypeScript knows this should be a number because 'discount' has value: 0
    when: {
      type: 'fieldValue',
      fieldPath: 'discountType', // ← Autocomplete suggests valid field paths
      operator: 'equals',        // ← Autocomplete suggests valid operators
      value: 'percentage',       // ← TypeScript checks against discountType's type
    },
  }],
}
```

## Why It's a Game-Changer

### ⚡ Native Signal Forms Integration

Not a wrapper or polyfill - true integration with Angular 21's signal forms API. ng-forge dynamic forms maps your config directly to `required()`, `email()`, `min()`, `hidden()`, and other signal form validators.

```typescript
// Your config
{ key: 'email', type: 'input', value: '', required: true, email: true }

// Becomes (under the hood)
import { required, email } from '@angular/forms/signals';
required(fieldPath);
email(fieldPath);
```

### 🎨 Any UI Framework, Same Forms

Write once, use anywhere. Switch from Material to Bootstrap? Change one line:

```typescript
// Material Design
provideDynamicForm(...withMaterialFields());

// Switch to Bootstrap - same form config!
provideDynamicForm(...withBootstrapFields());

// Or use your custom components
provideDynamicForm(withFieldTypes([{ name: 'my-input', loadComponent: () => MyCustomInput }]));
```

### 🔥 Complex Features, Simple API

**Conditional Validation** - Validators that activate based on other fields:

```typescript
{
  key: 'discount',
  type: 'input',
  value: 0,
  validators: [{
    type: 'max',
    value: 100,
    when: {
      type: 'fieldValue',
      fieldPath: 'discountType',
      operator: 'equals',
      value: 'percentage',
    },
  }],
}
```

**Conditional Required** - Fields that become required dynamically:

```typescript
{
  key: 'taxId',
  type: 'input',
  value: '',
  logic: [{
    type: 'required',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'equals',
      value: 'business',
    },
  }],
}
```

**Multi-Step Forms** - Complex wizards in minutes:

```typescript
{
  fields: [
    { key: 'step1', type: 'page', title: 'Personal Info', fields: [...] },
    { key: 'step2', type: 'page', title: 'Payment', fields: [...] },
  ],
}
```

**Full i18n Support** - Observables and Signals for labels:

```typescript
{
  key: 'email',
  type: 'input',
  value: '',
  label: transloco.selectTranslate('form.email'), // Observable
  // or: label: computed(() => this.translations().email), // Signal
}
```

### 🚀 Zero `ControlValueAccessor` Implementation

Traditional Angular requires implementing `ControlValueAccessor` for every custom form control. ng-forge dynamic forms handles all of that automatically with signals:

```typescript
// Traditional: ~50 lines of ControlValueAccessor boilerplate
// ng-forge dynamic forms: Just use input() and model()
@Component({...})
export class MyField {
  value = model<string>(''); // That's it!
}
```

## See It In Action

{{ NgDocActions.playground("DemoFormPlayground") }}

## Real-World Example: E-Commerce Checkout

Here's a production-ready, multi-step checkout flow - **fully typed, validated, and beautiful** - in under 60 lines:

```typescript
@Component({
  selector: 'app-checkout',
  imports: [DynamicForm],
  template: `<dynamic-form [config]="config" (submit)="processOrder($event)" />`,
})
export class CheckoutComponent {
  config = {
    fields: [
      {
        key: 'customer',
        type: 'page',
        title: 'Customer Information',
        fields: [
          { key: 'email', type: 'input', value: '', label: 'Email', required: true, email: true },
          {
            key: 'name',
            type: 'row',
            fields: [
              { key: 'firstName', type: 'input', value: '', label: 'First Name', required: true },
              { key: 'lastName', type: 'input', value: '', label: 'Last Name', required: true },
            ],
          },
          { type: 'next', key: 'next1', label: 'Continue to Shipping' },
        ],
      },
      {
        key: 'shipping',
        type: 'page',
        title: 'Shipping Address',
        fields: [
          { key: 'address', type: 'input', value: '', label: 'Street Address', required: true },
          { key: 'city', type: 'input', value: '', label: 'City', required: true },
          {
            key: 'region',
            type: 'row',
            fields: [
              { key: 'state', type: 'select', value: '', label: 'State', required: true, props: { options: STATES } },
              { key: 'zip', type: 'input', value: '', label: 'ZIP', required: true, pattern: '^[0-9]{5}$' },
            ],
          },
          {
            key: 'nav',
            type: 'row',
            fields: [
              { type: 'previous', key: 'back1', label: 'Back' },
              { type: 'next', key: 'next2', label: 'Continue to Payment' },
            ],
          },
        ],
      },
      {
        key: 'payment',
        type: 'page',
        title: 'Payment Details',
        fields: [
          { key: 'cardNumber', type: 'input', value: '', label: 'Card Number', required: true },
          {
            key: 'cardInfo',
            type: 'row',
            fields: [
              { key: 'expiry', type: 'input', value: '', label: 'MM/YY', required: true },
              { key: 'cvv', type: 'input', value: '', label: 'CVV', required: true },
            ],
          },
          {
            key: 'nav',
            type: 'row',
            fields: [
              { type: 'previous', key: 'back2', label: 'Back' },
              { type: 'submit', key: 'submit', label: 'Complete Purchase', props: { color: 'primary' } },
            ],
          },
        ],
      },
    ],
  } as const satisfies FormConfig;

  processOrder(order: ExtractFormValue<typeof this.config>) {
    // TypeScript automatically infers:
    // {
    //   customer: { email: string, name: { firstName: string, lastName: string } },
    //   shipping: { address: string, city: string, region: { state: string, zip: string } },
    //   payment: { cardNumber: string, cardInfo: { expiry: string, cvv: string } }
    // }

    // Full autocomplete and type safety!
    order.customer.email.toLowerCase();
    order.shipping.region.state;
    order.payment.cardInfo.cvv;

    console.log('Processing order:', order);
  }
}
```

**What you get:**

- ✅ 3-page wizard with navigation
- ✅ Complete validation (email, patterns, required)
- ✅ Row layouts for compact fields
- ✅ Full type inference for nested structure
- ✅ Back/Next navigation
- ✅ **Zero** subscriptions, **zero** cleanup

## Extend with Custom Field Types

Need a custom control? Create one in minutes with no `ControlValueAccessor` boilerplate:

{% raw %}

```typescript
// 1. Create your field component
@Component({
  selector: 'app-star-rating',
  template: `
    <label>{{ label() }}</label>
    <div class="stars">
      @for (star of [1,2,3,4,5]; track star) {
        <button (click)="rating.set(star)" type="button">
          {{ star <= rating() ? '⭐' : '☆' }}
        </button>
      }
    </div>
  `,
  styles: `
    .stars button { border: none; background: none; font-size: 24px; cursor: pointer; }
  `,
})
export class StarRatingComponent {
  label = input<string>();
  rating = model<number>(0); // That's it! No ControlValueAccessor needed
}

// 2. Register it
provideDynamicForm(
  withFieldTypes([
    { name: 'star-rating', loadComponent: () => StarRatingComponent }
  ])
);

// 3. Use it in your forms
{
  key: 'experience',
  type: 'star-rating',
  value: 0,
  label: 'How was your experience?',
}
```

{% endraw %}

**No** `writeValue()`, **no** `registerOnChange()`, **no** `registerOnTouched()`. Just signals.

## Choose Your UI Framework

| Framework           | Package                            | Status              |
| ------------------- | ---------------------------------- | ------------------- |
| **Material Design** | `@ng-forge/dynamic-form-material`  | ✅ Production Ready |
| **Bootstrap**       | `@ng-forge/dynamic-form-bootstrap` | 🚧 Coming Soon      |
| **PrimeNG**         | `@ng-forge/dynamic-form-primeng`   | 🚧 Coming Soon      |
| **Ionic**           | `@ng-forge/dynamic-form-ionic`     | 🚧 Coming Soon      |
| **Custom**          | Build your own                     | ✅ Full Support     |

**Material Design** integration is production-ready with complete documentation. Other UI framework integrations are in development - see individual pages for details and alternatives.

## Performance Features

- **🚀 Lazy Loading** - Components load only when needed
- **⚡ Signal-Based** - Fine-grained reactivity, minimal re-renders
- **📦 Tree-Shakeable** - Bundle only what you use
- **🎯 OnPush Change Detection** - Optimized throughout
- **💪 SSR Compatible** - Works with Angular Universal

## Related Topics

### Core Concepts

- **[Field Types](../../core/field-types)** - All available field types and their properties
- **[Validation](../../core/validation)** - Validation strategies with decision matrix
- **[Conditional Logic](../../core/conditional-logic)** - Show/hide fields dynamically
- **[Type Safety](../../core/type-safety)** - Advanced TypeScript inference patterns

### UI Implementations

- **[Material Design](../../custom-integrations/reference/material)** - Production-ready Material integration
- **[Custom Integration Guide](../../custom-integrations/guide)** - Build your own UI integration

### Advanced Topics

- **[i18n Setup](../../i18n/setup)** - Multi-language support
- **[Events](../../core/events)** - Form event bus and custom events

---

## Join the Community

- 📖 **[Documentation](../../)** - Comprehensive guides and examples
- 💬 **[GitHub Discussions](https://github.com/ng-forge/ng-forge/discussions)** - Ask questions, share tips
- 🐛 **[Issue Tracker](https://github.com/ng-forge/ng-forge/issues)** - Report bugs, request features
- ⭐ **[Star on GitHub](https://github.com/ng-forge/ng-forge)** - Support the project

---

**Ready to transform your Angular forms?** Check out the [Installation](../installation) guide to get started!
