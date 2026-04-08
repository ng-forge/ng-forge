---
title: API-Driven Forms
slug: api-driven-forms
description: 'Build dynamic forms from API responses — fetching configs at runtime, typing form values, and hydrating client-side features.'
---

When your form schema lives on a server and is fetched at runtime, you don't need `as const satisfies FormConfig`. The plain `FormConfig` type works out of the box.

## Basic Pattern

Create a form component that accepts a `FormConfig` input:

```typescript
@Component({
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config()"></form>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormComponent {
  config = input.required<FormConfig>();
}
```

Then fetch your config from an API and pass it in:

```typescript
@Component({
  imports: [DynamicFormComponent],
  template: `
    @if (formConfig(); as config) {
      <app-dynamic-form [config]="config" />
    } @else {
      <p>Loading form...</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyPageComponent {
  private http = inject(HttpClient);

  formConfig = toSignal(this.http.get<FormConfig>('/api/forms/registration'));
}
```

No `as const`, no `satisfies` — the `FormConfig` interface accepts any valid field configuration at its default generic parameters.

## What's Serializable

Not every `FormConfig` property can come from a JSON API. Some require runtime code:

| Property                    | Serializable | Notes                                                                       |
| --------------------------- | ------------ | --------------------------------------------------------------------------- |
| `fields`                    | Yes          | Core form structure — field types, keys, values, options, validators, logic |
| `options`                   | Yes          | Disabled state, button behavior, value exclusion                            |
| `schemas`                   | Yes          | Reusable validation schemas                                                 |
| `defaultValidationMessages` | Yes          | Fallback error messages                                                     |
| `defaultProps`              | Yes          | Default UI props (appearance, sizing)                                       |
| `submission`                | No           | Requires an `action` function                                               |
| `customFnConfig`            | No           | Custom validators, derivation functions, condition functions                |
| `externalData`              | No           | Angular `Signal` instances                                                  |
| `schema`                    | No           | Standard Schema objects (Zod, Valibot, etc.)                                |

The serializable properties cover the vast majority of form configuration. The non-serializable ones are for advanced features that inherently require client-side code.

## Hydrating Runtime Features

When you need both API-driven structure and client-side behavior, merge them:

```typescript
@Component({...})
export class OrderFormPage {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private orderService = inject(OrderService);

  private apiConfig = toSignal(
    this.http.get<FormConfig>('/api/forms/order')
  );

  // Merge API config with client-side code
  formConfig = computed(() => {
    const api = this.apiConfig();
    if (!api) return undefined;

    return {
      ...api,
      submission: {
        action: async (form) => {
          await this.orderService.submit(form().value());
          return undefined;
        },
      },
      externalData: {
        userRole: computed(() => this.authService.currentRole()),
      },
      customFnConfig: {
        validators: {
          checkStock: (ctx) => {
            const qty = ctx.value() as number;
            return qty > 100 ? { kind: 'maxStock', message: 'Max 100 items' } : null;
          },
        },
      },
    } satisfies FormConfig;
  });
}
```

This pattern keeps your form structure server-driven while attaching client-side behavior where needed.

## Typing Form Values

With API-driven configs, TypeScript can't infer the form value shape at compile time (since the config isn't a constant). You have two options:

### Manual Interface

Define the expected shape yourself:

```typescript
interface RegistrationForm {
  email: string;
  password: string;
  name?: string;
}

function onSubmit(value: unknown) {
  const data = value as RegistrationForm;
  console.log(data.email);
}
```

### Runtime Validation

For stronger guarantees, validate at runtime with a schema library:

```typescript
import { z } from 'zod';

const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

function onSubmit(value: unknown) {
  const result = registrationSchema.safeParse(value);
  if (!result.success) {
    console.error(result.error);
    return;
  }
  // result.data is fully typed
  console.log(result.data.email);
}
```

> For static configs where compile-time inference is possible, see [Type Safety](/recipes/type-safety).

## Related

- **[Configuration](/configuration)** — Global form setup and provider options
- **[Type Safety](/recipes/type-safety)** — Compile-time type inference with `as const satisfies`
- **[Form Submission](/dynamic-behavior/submission)** — Submission handlers and server error mapping
