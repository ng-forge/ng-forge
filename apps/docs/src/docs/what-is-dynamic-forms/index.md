Declarative, lightweight forms for Angular 21+, powered by signal forms. Build complex forms from simple configuration - with full TypeScript inference when you want it, or JSON configs when you don't. Comes with validation, conditional logic, i18n, and UI adapters for Material, PrimeNG, Bootstrap, and Ionic.

**Key Features:**

- 📦 **Lightweight & Composable** - Small bundle size, tree-shakeable, modular architecture
- 🎯 **Type-Safe or Dynamic** - Full TypeScript inference with `as const`, or load JSON configs at runtime
- ⚡ **Zoneless Ready** - Built for Angular's zoneless future, works with or without Zone.js
- 🔥 **Signal Forms Native** - Direct integration with `@angular/forms/signals`, not a wrapper
- 🌍 **Production Ready** - Comprehensive validation, conditional logic, and i18n support

### Quick Example

```typescript
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DynamicForm, type FormConfig, type InferFormValue } from '@ng-forge/dynamic-forms';

// 1. Define fields config separately for type inference
const formFields = {
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
      value: 'personal',
      label: 'Account Type',
      options: [
        { label: 'Personal', value: 'personal' },
        { label: 'Business', value: 'business' },
      ],
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

// 2. Infer the form value type from fields
type RegistrationForm = InferFormValue<typeof formFields.fields>;

@Component({
  selector: 'app-registration',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config"></form>`,
})
export class RegistrationComponent {
  private http = inject(HttpClient);

  // 3. Compose full config with typed submission handler
  config = {
    ...formFields,
    submission: {
      action: (form: RegistrationForm) => {
        // TypeScript knows: { email: string, password: string, accountType: string, companyName: string }
        return this.http.post('/api/register', form);
      },
    },
  };
}
```

#### Submission Options

There are two ways to handle form submission:

**1. Config-based (recommended)** - Define submission in the config for automatic loading states and server error handling. Supports both Observables and Promises:

```typescript
// Define fields separately for type inference
const formFields = { fields: [...] } as const satisfies FormConfig;
type FormValue = InferFormValue<typeof formFields.fields>;

// Compose with submission - return Observable or Promise
config = {
  ...formFields,
  submission: {
    action: (form: FormValue) => this.http.post('/api/submit', form),
  },
};
```

**2. Output-based** - Use the `(submitted)` output for manual control:

```typescript
template: `<form [dynamic-form]="config" (submitted)="onSubmit($event)"></form>`

onSubmit(value: FormValue) {
  // Handle submission manually
}
```

See **[Submission](../core/submission)** for full documentation on server error handling, button states, and more.

**What you get:**

- ✅ Real-time validation with custom error messages
- ✅ Conditional required fields (companyName only required for business)
- ✅ Full TypeScript type inference - no manual type definitions
- ✅ Beautiful Material Design UI
- ✅ Zero subscriptions or cleanup needed
- ✅ Built-in accessibility

## See It In Action

{{ NgDocActions.demo("DemoFormPlayground", { container: false }) }}

## Full Type Safety with Zero Type Annotations

TypeScript infers your form's type from the config. No manual type definitions or type assertions needed.

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
onSubmit(value: InferFormValue<typeof this.config.fields>) {
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

onSubmit(value: InferFormValue<typeof this.config.fields>) {
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

## Key Capabilities

### ⚡ Native Signal Forms Integration

ng-forge maps your config directly to Angular 21's signal forms API—`required()`, `email()`, `min()`, `hidden()`, and other validators.

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
provideDynamicForm([{ name: 'my-input', loadComponent: () => MyCustomInput }]);
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

**Multi-Step Forms** - Wizard-style forms with page navigation:

```typescript
{
  fields: [
    { key: 'step1', type: 'page', fields: [/* personal info fields */] },
    { key: 'step2', type: 'page', fields: [/* payment fields */] },
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

## Extend with Custom Field Types

Need a custom control? Create one following the same pattern as the built-in field components:

{% raw %}

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import {
  createResolvedErrorsSignal,
  DynamicText,
  DynamicTextPipe,
  shouldShowErrors,
  ValidationMessages,
} from '@ng-forge/dynamic-forms';
import { AsyncPipe } from '@angular/common';

// 1. Create your field component
@Component({
  selector: 'app-star-rating',
  imports: [DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();
    @if (label(); as label) {
      <label>{{ label | dynamicText | async }}</label>
    }
    <div class="stars">
      @for (star of [1, 2, 3, 4, 5]; track star) {
        <button (click)="setRating(star)" type="button">
          {{ star <= f().value() ? '⭐' : '☆' }}
        </button>
      }
    </div>
    @for (error of errorsToDisplay(); track error.kind) {
      <span class="error">{{ error.message }}</span>
    }
  `,
  styles: `
    .stars button { border: none; background: none; font-size: 24px; cursor: pointer; }
    .error { color: red; font-size: 12px; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': 'key()',
    '[attr.data-testid]': 'key()',
  },
})
export default class StarRatingComponent {
  // Required inputs - the form passes these automatically
  readonly field = input.required<FieldTree<number>>();
  readonly key = input.required<string>();

  // Optional inputs for customization
  readonly label = input<DynamicText>();
  readonly className = input<string>('');
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  // Validation handling
  readonly resolvedErrors = createResolvedErrorsSignal(
    this.field,
    this.validationMessages,
    this.defaultValidationMessages
  );
  readonly showErrors = shouldShowErrors(this.field);
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  setRating(rating: number): void {
    this.field()().value.set(rating);
  }
}

// 2. Register it with provideDynamicForm
provideDynamicForm([{ name: 'star-rating', loadComponent: () => StarRatingComponent }]);

// 3. Use it in your forms
{
  key: 'experience',
  type: 'star-rating',
  value: 0,
  label: 'How was your experience?',
}
```

{% endraw %}

Custom fields receive a `FieldTree` signal and interact directly with `field()().value` for reads and writes.

## Choose Your UI Framework

| Framework           | Package                             | Status          |
| ------------------- | ----------------------------------- | --------------- |
| **Material Design** | `@ng-forge/dynamic-forms-material`  | 🧪 Preview      |
| **PrimeNG**         | `@ng-forge/dynamic-forms-primeng`   | 🧪 Preview      |
| **Bootstrap**       | `@ng-forge/dynamic-forms-bootstrap` | 🧪 Preview      |
| **Ionic**           | `@ng-forge/dynamic-forms-ionic`     | 🧪 Preview      |
| **Custom**          | Build your own                      | ✅ Full Support |

**Material Design**, **PrimeNG, Bootstrap, and Ionic** integrations are in preview - functional but APIs may change. See individual pages for details.

## Performance Features

- **🚀 Lazy Loading** - Components load only when needed
- **⚡ Signal-Based** - Fine-grained reactivity, minimal re-renders
- **📦 Tree-Shakeable** - Bundle only what you use
- **🎯 OnPush Change Detection** - Optimized throughout

## Related Topics

### Core Concepts

- **[Field Types](../core/field-types)** - All available field types and their properties
- **[Validation](../core/validation)** - Validation strategies with decision matrix
- **[Conditional Logic](../core/conditional-logic)** - Show/hide fields dynamically
- **[Type Safety](../core/type-safety)** - Advanced TypeScript inference patterns

### UI Implementations

- **[Material Design](../ui-libs-integrations/material)** - Preview Material integration
- **[Custom Integration Guide](../deep-dive/custom-integrations)** - Build your own UI integration

### Advanced Topics

- **[i18n Setup](../core/i18n)** - Multi-language support
- **[Events](../core/events)** - Form event bus and custom events

---

## Join the Community

- 📖 **[Documentation](../)** - Comprehensive guides and examples
- 💬 **[GitHub Discussions](https://github.com/ng-forge/ng-forge/discussions)** - Ask questions, share tips
- 🐛 **[Issue Tracker](https://github.com/ng-forge/ng-forge/issues)** - Report bugs, request features
- ⭐ **[Star on GitHub](https://github.com/ng-forge/ng-forge)** - Support the project

---

See the [Installation](../installation) guide to get started.
