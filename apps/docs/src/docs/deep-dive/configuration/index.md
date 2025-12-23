> Prerequisites: [Installation](../../installation)

Configure ng-forge dynamic forms behavior at the application level using provider features.

## Overview

ng-forge uses a feature-based configuration pattern similar to Angular's `provideRouter()`. Features are optional add-ons that modify the library's behavior globally.

```typescript
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(
      ...withMaterialFields(),
      // Logging is enabled by default
    ),
  ],
};
```

**Two Levels of Configuration:**

| Level        | Scope    | Where                  | Examples                                                 |
| ------------ | -------- | ---------------------- | -------------------------------------------------------- |
| **Provider** | App-wide | `provideDynamicForm()` | `withLoggerConfig()`, future features                    |
| **Form**     | Per-form | `FormConfig`           | `options`, `customFnConfig`, `defaultValidationMessages` |

This page covers **provider-level** features. For form-level configuration, see [Submission](../core/submission), [Custom Validators](../core/validation/custom-validators), and [i18n](../core/i18n).

## Logging

Control how ng-forge logs diagnostic information using `withLoggerConfig()`.

By default, ng-forge logs all messages to the console. No configuration is needed.

```typescript
import { provideDynamicForm, withLoggerConfig } from '@ng-forge/dynamic-forms';

// Disable logging entirely
provideDynamicForm(...withMaterialFields(), withLoggerConfig(false));

// Conditional logging (e.g., only in dev mode)
provideDynamicForm(
  ...withMaterialFields(),
  withLoggerConfig(() => isDevMode()),
);
```

You can also provide your own logger implementation by providing a value for the `DynamicFormLogger` injection token.

## Next Steps

- **[Field Types](../core/field-types)** - Explore available field types
- **[Validation](../core/validation)** - Configure validation rules
- **[Custom Validators](../core/validation/custom-validators)** - Register custom validation functions
